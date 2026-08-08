import time
from datetime import datetime, timezone
from typing import Dict, Any, List

from app.api.models import SessionInput
from app.services.prediction_service import get_prediction_service
from app.services.explanation_service import get_explanation_service
from app.services.reason_detection import get_reason_detection_service
from app.services.business_rules import get_business_rule_engine
from app.services.business_guardrails import get_business_guardrails_engine
from app.services.consent_service import get_consent_service
from app.services.experiment_service import get_experiment_service
from app.services.self_check_agent import get_self_check_agent
from app.services.notification_service import get_notification_dispatcher
from app.services.audit_service import get_audit_service
from app.utils.logger import setup_logger

logger = setup_logger("multi_agent_pipeline")


class RiskAgent:
    """Specialized Agent 1: Executes Phase 2 ML model risk prediction."""
    def __init__(self):
        self.pred_service = get_prediction_service()

    def run(self, session: SessionInput):
        return self.pred_service.predict_risk(session)


class ReasonAgent:
    """Specialized Agent 2: Infers contributing features & abandonment intent signals."""
    def __init__(self):
        self.exp_service = get_explanation_service()
        self.reason_service = get_reason_detection_service()

    def run(self, session: SessionInput, risk_score: float):
        top_features = self.exp_service.explain_prediction(session, risk_score)
        reason = self.reason_service.detect_reason(session, risk_score)

        # Convert top features into human-readable top_signals
        top_signals = [f.description for f in top_features if hasattr(f, "description")]
        if not top_signals:
          top_signals = [f"Feature: {f.feature} (Importance: {f.importance})" for f in top_features]

        return top_features, top_signals, reason


class ActionAgent:
    """Specialized Agent 3: Maps risk and intent signals to a candidate rescue action."""
    def __init__(self):
        self.business_rule_engine = get_business_rule_engine()

    def run(self, session: SessionInput, risk_score: float, reason: str):
        return self.business_rule_engine.determine_action(session, risk_score, reason)


class PolicyAgent:
    """Specialized Agent 4: Applies business guardrails, consent policy, priority channel selection, and A/B holdout."""
    def __init__(self):
        self.guardrails_engine = get_business_guardrails_engine()
        self.consent_service = get_consent_service()
        self.experiment_service = get_experiment_service()

    def run(self, session: SessionInput, risk_score: float, reason: str, rec_action: str):
        user_id = session.user_id if session.user_id is not None else 1000

        # 1. Phase 5 Business Guardrails (Discount budget & profit margin validation)
        guardrail_action, discount_cost, expected_margin, decision_status = self.guardrails_engine.evaluate_guardrails(
            session_id=session.session_id,
            risk_score=risk_score,
            cart_value=session.cart_value,
            predicted_reason=reason,
            recommended_action=rec_action,
            user_id=user_id
        )

        # 2. Consent Policy & Communication Channel Selection (WhatsApp -> Email -> SMS)
        consent_res = self.consent_service.evaluate_consent_and_channel(
            user_id=user_id,
            action=guardrail_action
        )

        selected_channel = consent_res.selected_channel
        consent_status = consent_res.consent_status
        blocked_channels = consent_res.blocked_channels

        # If consent is BLOCKED for an action requiring communication, override action to DO_NOTHING
        if consent_status == "BLOCKED" and guardrail_action not in ("DO_NOTHING", "Do Nothing"):
            logger.warning(f"Consent BLOCKED for session {session.session_id}. Overriding action to DO_NOTHING.")
            guardrail_action = "DO_NOTHING"
            discount_cost = 0.0
            selected_channel = "NONE"

        # 3. Phase 6 Holdout Experiment Assignment (10% Control / 90% Treatment with random_state=42)
        group, exp_action, final_discount_cost = self.experiment_service.process_session_experiment(
            session_id=session.session_id,
            recommended_action=rec_action,
            guardrail_action=guardrail_action,
            cart_value=session.cart_value,
            discount_cost=discount_cost
        )

        return exp_action, final_discount_cost, expected_margin, decision_status, selected_channel, consent_status, blocked_channels, group


class MultiAgentPipeline:
    """
    Final Enterprise Multi-Agent Decision Orchestrator:
    Flow: Session -> RiskAgent -> ReasonAgent -> ActionAgent -> PolicyAgent -> SelfCheckAgent -> Final Decision
    """

    def __init__(self):
        self.risk_agent = RiskAgent()
        self.reason_agent = ReasonAgent()
        self.action_agent = ActionAgent()
        self.policy_agent = PolicyAgent()
        self.self_check_agent = get_self_check_agent()
        self.dispatcher = get_notification_dispatcher()
        self.audit_service = get_audit_service()

    def execute_pipeline(self, session: SessionInput) -> Dict[str, Any]:
        start_time = time.time()
        user_id = session.user_id if session.user_id is not None else 1000

        try:
            # Step 1: RiskAgent
            risk_score, abandonment_prob, purchase_prob, confidence = self.risk_agent.run(session)

            # Step 2: ReasonAgent
            top_features, top_signals, reason = self.reason_agent.run(session, risk_score)

            # Step 3: ActionAgent
            rec_action = self.action_agent.run(session, risk_score, reason)

            # Step 4: PolicyAgent (Guardrails + Consent + Holdout)
            candidate_action, discount_cost, expected_margin, decision_status, selected_channel, consent_status, blocked_channels, group = self.policy_agent.run(
                session=session,
                risk_score=risk_score,
                reason=reason,
                rec_action=rec_action
            )

            # Step 5: SelfCheckAgent (8-Point Critical Safety Verification)
            self_check_passed, self_check_reasons, final_action = self.self_check_agent.evaluate_self_check(
                session_id=session.session_id,
                user_id=user_id,
                risk_score=risk_score,
                final_action=candidate_action,
                discount_cost=discount_cost,
                expected_incremental_margin=expected_margin,
                consent_status=consent_status,
                selected_channel=selected_channel,
                max_user_discount=self.policy_agent.guardrails_engine.config.max_user_discount
            )

            # Step 6: Dispatch Notification (Safe Demo Mode)
            notification_result = None
            if final_action not in ("DO_NOTHING", "Do Nothing") and selected_channel != "NONE":
                try:
                    message_body = f"Rescue Offer [{final_action}] for cart value ₹{session.cart_value:.2f}. Recover your session!"
                    notification_result = self.dispatcher.dispatch(
                        channel=selected_channel,
                        recipient=f"user_{user_id}@demo.com" if selected_channel == "EMAIL" else f"+9198765{user_id:05d}",
                        message=message_body
                    )
                except Exception as n_err:
                    logger.error(f"Notification dispatch failed for session {session.session_id}: {n_err}")
                    notification_result = {"status": "FAILED", "error": str(n_err)}

            latency_ms = round((time.time() - start_time) * 1000.0, 2)
            model_used = "XGBoost (Phase 2 ML) + Multi-Agent Pipeline"
            estimated_cost = 0.0001 # Micro-cost per inference

            # Step 7: Audit Service Extension Logging
            try:
                self.audit_service.log_decision(
                    session_id=session.session_id,
                    risk_score=risk_score,
                    abandonment_probability=abandonment_prob,
                    purchase_probability=purchase_prob,
                    confidence=confidence,
                    reason=reason,
                    recommended_action=rec_action,
                    top_features=top_features,
                    decision_time_ms=latency_ms,
                    user_id=user_id,
                    final_action=final_action,
                    discount_cost=discount_cost if final_action not in ("DO_NOTHING", "Do Nothing") else 0.0,
                    expected_incremental_margin=expected_margin,
                    experiment_group=group,
                    model_version="2.0.0-Enterprise"
                )
            except Exception as a_err:
                logger.error(f"Audit log failed for session {session.session_id}: {a_err}")

            timestamp = datetime.now(timezone.utc).isoformat()

            # Step 8: Return Complete Explainable Decision JSON
            return {
                "session_id": session.session_id,
                "user_id": user_id,
                "risk_score": risk_score,
                "abandonment_probability": abandonment_prob,
                "purchase_probability": purchase_prob,
                "confidence": confidence,
                "top_signals": top_signals,
                "reason": reason,
                "recommended_action": rec_action,
                "final_action": final_action,
                "discount_cost": discount_cost if final_action not in ("DO_NOTHING", "Do Nothing") else 0.0,
                "expected_incremental_margin": expected_margin,
                "consent_status": consent_status,
                "selected_channel": selected_channel,
                "blocked_channels": blocked_channels,
                "self_check_passed": self_check_passed,
                "self_check_reasons": self_check_reasons,
                "experiment_group": group,
                "notification_result": notification_result,
                "model_used": model_used,
                "llm_calls": 0,
                "estimated_cost": estimated_cost,
                "decision_latency_ms": latency_ms,
                "timestamp": timestamp
            }

        except Exception as pipeline_err:
            logger.exception(f"Unhandled error in MultiAgentPipeline for session '{getattr(session, 'session_id', 'unknown')}': {pipeline_err}")
            latency_ms = round((time.time() - start_time) * 1000.0, 2)
            timestamp = datetime.now(timezone.utc).isoformat()
            
            # Graceful Fallback to DO_NOTHING
            return {
                "session_id": getattr(session, "session_id", "fallback_session"),
                "user_id": user_id,
                "risk_score": 0.0,
                "abandonment_probability": 0.0,
                "purchase_probability": 1.0,
                "confidence": 0.5,
                "top_signals": ["System Safety Fallback Activated"],
                "reason": "Pipeline Failure Fallback",
                "recommended_action": "DO_NOTHING",
                "final_action": "DO_NOTHING",
                "discount_cost": 0.0,
                "expected_incremental_margin": 0.0,
                "consent_status": "APPROVED",
                "selected_channel": "NONE",
                "blocked_channels": [],
                "self_check_passed": False,
                "self_check_reasons": [f"FAILED: Pipeline exception - {str(pipeline_err)}"],
                "experiment_group": "CONTROL",
                "notification_result": None,
                "model_used": "Safety Fallback Mode",
                "llm_calls": 0,
                "estimated_cost": 0.0,
                "decision_latency_ms": latency_ms,
                "timestamp": timestamp
            }


# Singleton instance
_multi_agent_pipeline_instance = None

def get_multi_agent_pipeline() -> MultiAgentPipeline:
    global _multi_agent_pipeline_instance
    if _multi_agent_pipeline_instance is None:
        _multi_agent_pipeline_instance = MultiAgentPipeline()
    return _multi_agent_pipeline_instance
