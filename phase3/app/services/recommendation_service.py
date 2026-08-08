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
from app.services.audit_service import get_audit_service
from app.config.config import SESSION_FEATURES_PATH
from app.utils.logger import setup_logger

logger = setup_logger("recommendation_service")


class RecommendationService:
    """Orchestrator connecting Prediction, Explanation, Reason Detection, Business Rules, and Audit Logging."""

    def __init__(self):
        self.prediction_service = get_prediction_service()
        self.explanation_service = get_explanation_service()
        self.reason_service = get_reason_detection_service()
        self.business_rule_engine = get_business_rule_engine()
        self.audit_service = get_audit_service()

    def predict_only(self, session: SessionInput) -> PredictionResponse:
        """Executes risk prediction only (Step 3)."""
        start_time = time.time()
        risk_score, abandonment_prob, purchase_prob, confidence = self.prediction_service.predict_risk(session)
        timestamp = datetime.now(timezone.utc).isoformat()

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
        Executes full AI Cart Rescue Pipeline:
        1. Feature Preparation
        2. Model Risk Prediction
        3. Feature Explanation
        4. Reason Detection
        5. Business Rule Action Recommendation
        6. Audit Logging
        7. Returns JSON RecommendationResponse matching exact format
        """
        start_time = time.time()

        # Step 1-3: Predict Risk & Probabilities
        risk_score, abandonment_prob, purchase_prob, confidence = self.prediction_service.predict_risk(session)

        # Step 4: Explain Prediction
        top_features = self.explanation_service.explain_prediction(session, risk_score)

        # Step 5: Infer Reason
        reason = self.reason_service.detect_reason(session, risk_score)

        # Step 6: Apply Business Rules -> 1 Action
        recommended_action = self.business_rule_engine.determine_action(session, risk_score, reason)

        # Calculate decision latency
        latency_ms = (time.time() - start_time) * 1000.0

        # Step 7: Log Decision
        self.audit_service.log_decision(
            session_id=session.session_id,
            risk_score=risk_score,
            abandonment_probability=abandonment_prob,
            purchase_probability=purchase_prob,
            confidence=confidence,
            reason=reason,
            recommended_action=recommended_action,
            top_features=top_features,
            decision_time_ms=latency_ms
        )

        timestamp = datetime.now(timezone.utc).isoformat()

        # Step 8-9: Return Exact JSON response
        return RecommendationResponse(
            session_id=session.session_id,
            risk_score=risk_score,
            purchase_probability=purchase_prob,
            abandonment_probability=abandonment_prob,
            confidence=confidence,
            reason=reason,
            recommended_action=recommended_action,
            top_features=top_features,
            timestamp=timestamp
        )

    def lookup_session(self, session_id: str) -> RecommendationResponse:
        """
        Looks up pre-computed Phase 2 session or creates session payload for session_id lookup.
        """
        session_id_str = str(session_id).strip()

        if os.path.exists(SESSION_FEATURES_PATH):
            try:
                df = pd.read_csv(SESSION_FEATURES_PATH)

                # Match composite_session_id or session_id
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

        # Default fallback session if not found in CSV
        fallback_session = SessionInput(session_id=session_id_str)
        return self.generate_recommendation(fallback_session)


_recommendation_service_instance = None

def get_recommendation_service() -> RecommendationService:
    global _recommendation_service_instance
    if _recommendation_service_instance is None:
        _recommendation_service_instance = RecommendationService()
    return _recommendation_service_instance
