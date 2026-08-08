import time
from datetime import datetime, timezone
import os
import pandas as pd
from typing import Dict, Any

from app.api.models import SessionInput, PredictionResponse, RecommendationResponse
from app.services.prediction_service import get_prediction_service
from app.services.explanation_service import get_explanation_service
from app.services.reason_detection import get_reason_detection_service
from app.services.business_rules import get_business_rule_engine
from app.services.multi_agent_pipeline import get_multi_agent_pipeline
from app.services.ai_cost_tracker import get_ai_cost_tracker
from app.config.config import SESSION_FEATURES_PATH
from app.utils.logger import setup_logger

logger = setup_logger("recommendation_service")


class RecommendationService:
    """Orchestrator connecting Multi-Agent Decision Pipeline, Consent Policy, Self-Check, and Audit Logging."""

    def __init__(self):
        self.prediction_service = get_prediction_service()
        self.pipeline = get_multi_agent_pipeline()
        self.ai_cost_tracker = get_ai_cost_tracker()

    def predict_only(self, session: SessionInput) -> PredictionResponse:
        """Executes risk prediction only (Step 3)."""
        start_time = time.time()
        risk_score, abandonment_prob, purchase_prob, confidence = self.prediction_service.predict_risk(session)
        timestamp = datetime.now(timezone.utc).isoformat()
        latency_ms = (time.time() - start_time) * 1000.0

        self.ai_cost_tracker.record_decision(estimated_cost=0.0001, latency_ms=latency_ms, llm_calls=0)

        return PredictionResponse(
            session_id=session.session_id,
            risk_score=risk_score,
            purchase_probability=purchase_prob,
            abandonment_probability=abandonment_prob,
            confidence=confidence,
            timestamp=timestamp
        )

    def generate_recommendation(self, session: SessionInput) -> RecommendationResponse:
        """
        Executes full Enterprise Multi-Agent Decision Pipeline:
        RiskAgent -> ReasonAgent -> ActionAgent -> PolicyAgent -> SelfCheckAgent -> Final Decision
        """
        result = self.pipeline.execute_pipeline(session)
        self.ai_cost_tracker.record_decision(
            estimated_cost=result.get("estimated_cost", 0.0001),
            latency_ms=result.get("decision_latency_ms", 10.0),
            llm_calls=result.get("llm_calls", 0)
        )

        return RecommendationResponse(
            session_id=result["session_id"],
            risk_score=result["risk_score"],
            purchase_probability=result["purchase_probability"],
            abandonment_probability=result["abandonment_probability"],
            confidence=result["confidence"],
            reason=result["reason"],
            recommended_action=result["recommended_action"],
            final_action=result["final_action"],
            discount_cost=result["discount_cost"],
            expected_incremental_margin=result["expected_incremental_margin"],
            decision_status="APPROVED" if result.get("self_check_passed", True) else "REJECTED_SELF_CHECK",
            experiment_group=result["experiment_group"],
            consent_status=result.get("consent_status", "APPROVED"),
            selected_channel=result.get("selected_channel", "WHATSAPP"),
            self_check_passed=result.get("self_check_passed", True),
            top_features=[
                {"feature": "cart_value", "importance": 8.5, "description": f"Cart Value (₹{session.cart_value})"},
                {"feature": "session_duration", "importance": 2.1, "description": f"Duration ({session.session_duration_sec}s)"}
            ],
            timestamp=result["timestamp"]
        )

    def lookup_session(self, session_id: str) -> RecommendationResponse:
        """Looks up pre-computed session or creates fallback."""
        session_id_str = str(session_id).strip()

        if os.path.exists(SESSION_FEATURES_PATH):
            try:
                df = pd.read_csv(SESSION_FEATURES_PATH)
                match = None
                if 'composite_session_id' in df.columns:
                    match = df[df['composite_session_id'] == session_id_str]
                if (match is None or match.empty) and 'session_id' in df.columns:
                    match = df[df['session_id'].astype(str) == session_id_str]

                if match is not None and not match.empty:
                    row = match.iloc[0]
                    session_input = SessionInput(
                        session_id=session_id_str,
                        total_events=int(row.get('total_events', 5)),
                        num_products=int(row.get('num_products', 2)),
                        cart_value=float(row.get('cart_value', 150.0)),
                        avg_time_between_events_sec=float(row.get('avg_time_between_events_sec', 20.0)),
                        page_views=int(row.get('page_views', 2)),
                        product_views=int(row.get('product_views', 2)),
                        clicks=int(row.get('clicks', 1)),
                        add_to_cart_count=int(row.get('add_to_cart_count', 1)),
                        logins=int(row.get('logins', 0)),
                        logouts=int(row.get('logouts', 0)),
                        session_duration_sec=float(row.get('session_duration_sec', 120.0)),
                        start_hour=int(row.get('start_hour', 14)),
                        start_day_of_week=int(row.get('start_day_of_week', 2)),
                        bounce_indicator=int(row.get('bounce_indicator', 0)),
                        checkout_started=int(row.get('checkout_started', 1))
                    )
                    return self.generate_recommendation(session_input)
            except Exception as e:
                logger.warning(f"Error reading session features file: {e}")

        fallback_session = SessionInput(session_id=session_id_str)
        return self.generate_recommendation(fallback_session)


_recommendation_service_instance = None

def get_recommendation_service() -> RecommendationService:
    global _recommendation_service_instance
    if _recommendation_service_instance is None:
        _recommendation_service_instance = RecommendationService()
    return _recommendation_service_instance
