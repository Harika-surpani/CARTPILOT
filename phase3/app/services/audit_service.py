import os
import json
import time
from datetime import datetime, timezone
from typing import Dict, Any, List
from collections import Counter

from app.config.config import AUDIT_LOG_PATH
from app.utils.logger import setup_logger

logger = setup_logger("audit_service")


class AuditService:
    """Service that logs prediction decisions to an audit log file and aggregates system metrics."""

    def __init__(self, log_path: str = AUDIT_LOG_PATH):
        self.log_path = log_path
        self.predictions_count = 0
        self.total_latency_ms = 0.0
        self.risk_distribution = {"High Risk (>=0.70)": 0, "Medium Risk (0.40-0.69)": 0, "Low Risk (<0.40)": 0}
        self.action_counts = Counter()
        self.reason_counts = Counter()

    def log_decision(self, session_id: str, risk_score: float, abandonment_probability: float,
                     purchase_probability: float, confidence: float, reason: str,
                     recommended_action: str, top_features: list, decision_time_ms: float,
                     user_id: Any = 1000, final_action: str = None, discount_cost: float = 0.0,
                     expected_incremental_margin: float = 0.0, experiment_group: str = "TREATMENT",
                     consent_status: str = "APPROVED", selected_channel: str = "WHATSAPP",
                     self_check_status: str = "PASSED", model_version: str = "2.0.0-Enterprise",
                     model_used: str = "XGBoost (Phase 2 ML)", estimated_cost: float = 0.0001) -> dict:
        """
        Logs prediction decision event to file and updates in-memory metrics.
        Includes Phase 5 Guardrails, Phase 6 Holdout & Enterprise Decision Layer attributes.
        """
        timestamp = datetime.now(timezone.utc).isoformat()
        resolved_final_action = final_action or recommended_action

        # Extract top human-readable signals
        top_signals = []
        if isinstance(top_features, list):
            for f in top_features:
                if hasattr(f, "description"):
                    top_signals.append(f.description)
                elif isinstance(f, dict) and "description" in f:
                    top_signals.append(f["description"])

        if not top_signals:
            top_signals = ["High abandonment probability", "Cart value threshold", "Idle timeout"]

        audit_entry = {
            "timestamp": timestamp,
            "session_id": session_id,
            "user_id": user_id,
            "risk_score": risk_score,
            "prediction": "Abandoned" if risk_score >= 0.50 else "Purchased",
            "abandonment_probability": abandonment_probability,
            "purchase_probability": purchase_probability,
            "confidence": confidence,
            "top_signals": top_signals,
            "reason": reason,
            "recommended_action": recommended_action,
            "final_action": resolved_final_action,
            "discount_cost": discount_cost,
            "expected_incremental_margin": expected_incremental_margin,
            "experiment_group": experiment_group,
            "consent_status": consent_status,
            "selected_channel": selected_channel,
            "self_check_status": self_check_status,
            "model_version": model_version,
            "model_used": model_used,
            "estimated_cost": estimated_cost,
            "explanation": [f.model_dump() if hasattr(f, "model_dump") else f for f in top_features],
            "decision_latency_ms": round(decision_time_ms, 2)
        }

        # Append to audit log file (JSON lines format)
        try:
            with open(self.log_path, "a", encoding="utf-8") as f:
                f.write(json.dumps(audit_entry) + "\n")
        except Exception as e:
            logger.error(f"Failed to write to audit log file: {e}")

        # Update metrics counters
        self.predictions_count += 1
        self.total_latency_ms += decision_time_ms
        self.action_counts[resolved_final_action] += 1
        self.reason_counts[reason] += 1

        if risk_score >= 0.70:
            self.risk_distribution["High Risk (>=0.70)"] += 1
        elif risk_score >= 0.40:
            self.risk_distribution["Medium Risk (0.40-0.69)"] += 1
        else:
            self.risk_distribution["Low Risk (<0.40)"] += 1

        logger.info(f"Audit Logged -> Session: {session_id} | Risk: {risk_score} | Final: {resolved_final_action} | Channel: {selected_channel}")

        return audit_entry

    def get_metrics(self) -> dict:
        """Returns summary analytics metrics for /metrics endpoint."""
        avg_latency = round(self.total_latency_ms / self.predictions_count, 2) if self.predictions_count > 0 else 0.0

        return {
            "total_predictions": self.predictions_count,
            "abandonment_risk_distribution": dict(self.risk_distribution),
            "action_breakdown": dict(self.action_counts),
            "reason_breakdown": dict(self.reason_counts),
            "average_decision_latency_ms": avg_latency
        }


# Singleton instance
_audit_service_instance = None

def get_audit_service() -> AuditService:
    global _audit_service_instance
    if _audit_service_instance is None:
        _audit_service_instance = AuditService()
    return _audit_service_instance
