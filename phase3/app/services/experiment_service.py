import hashlib
import random
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timezone

from app.models.experiment import ExperimentRecord, ExperimentMetricsResponse
from app.utils.logger import setup_logger

logger = setup_logger("experiment_service")

EXPERIMENT_ID = "exp_cart_rescue_v1"
SEED_RANDOM_STATE = 42


class ExperimentService:
    """
    Phase 6 Holdout Experiment & Impact Validation Engine.
    Uses random_state = 42 to deterministically assign sessions to CONTROL (10%) or TREATMENT (90%).
    """

    def __init__(self, experiment_id: str = EXPERIMENT_ID):
        self.experiment_id = experiment_id
        # In-memory store of experiment records key by session_id
        self.records: Dict[str, ExperimentRecord] = {}
        # Pre-seed random generator for reproducible fallback
        self.random = random.Random(SEED_RANDOM_STATE)

    def assign_group(self, session_id: str) -> str:
        """
        Assigns session to CONTROL (10%) or TREATMENT (90%) using deterministic hashing with SEED_RANDOM_STATE.
        """
        hash_input = f"{SEED_RANDOM_STATE}_{session_id}".encode("utf-8")
        hash_val = int(hashlib.md5(hash_input).hexdigest(), 16)
        percentile = hash_val % 100

        if percentile < 10:
            return "CONTROL"
        return "TREATMENT"

    def process_session_experiment(
        self,
        session_id: str,
        recommended_action: str,
        guardrail_action: str,
        cart_value: float,
        discount_cost: float
    ) -> Tuple[str, str, float]:
        """
        Processes holdout assignment.
        Returns: (group, final_action, final_discount_cost)
        - CONTROL: final_action is forced to DO_NOTHING and discount_cost = 0.0
        - TREATMENT: final_action is guardrail_action
        """
        group = self.assign_group(session_id)

        if group == "CONTROL":
            final_action = "DO_NOTHING"
            final_discount_cost = 0.0
        else:
            final_action = guardrail_action
            final_discount_cost = discount_cost if guardrail_action not in ("DO_NOTHING", "Do Nothing") else 0.0

        timestamp = datetime.now(timezone.utc).isoformat()

        # Save / Update experiment record
        record = ExperimentRecord(
            experiment_id=self.experiment_id,
            session_id=session_id,
            group=group,
            recommended_action=recommended_action,
            final_action=final_action,
            purchase_outcome=False, # Default until purchase completed
            cart_value=cart_value,
            discount_cost=final_discount_cost,
            timestamp=timestamp
        )
        self.records[session_id] = record

        logger.info(f"Session {session_id} assigned to {group} | Recommended: {recommended_action} | Final: {final_action}")
        return group, final_action, final_discount_cost

    def record_outcome(self, session_id: str, purchased: bool):
        """Updates completed purchase status for a session."""
        if session_id in self.records:
            self.records[session_id].purchase_outcome = purchased

    def get_metrics(self) -> ExperimentMetricsResponse:
        """
        Calculates A/B holdout experiment metrics.
        Returns 'Insufficient sample size' if total sessions evaluated < 10.
        """
        all_records = list(self.records.values())
        total_sessions = len(all_records)

        control_group = [r for r in all_records if r.group == "CONTROL"]
        treatment_group = [r for r in all_records if r.group == "TREATMENT"]

        control_count = len(control_group)
        treatment_count = len(treatment_group)

        # Require at least 10 sessions total and non-zero counts in both groups to compute reliable metrics
        if total_sessions < 10 or control_count == 0 or treatment_count == 0:
            return ExperimentMetricsResponse(
                experiment_id=self.experiment_id,
                total_sessions=total_sessions,
                control_sessions=control_count,
                treatment_sessions=treatment_count,
                control_conversions=0,
                treatment_conversions=0,
                control_conversion_rate=0.0,
                treatment_conversion_rate=0.0,
                incremental_conversion=0.0,
                control_revenue=0.0,
                treatment_revenue=0.0,
                discount_cost=0.0,
                incremental_revenue=0.0,
                incremental_margin=0.0,
                recovery_rate=0.0,
                status_message="Insufficient sample size"
            )

        control_conversions = sum(1 for r in control_group if r.purchase_outcome)
        treatment_conversions = sum(1 for r in treatment_group if r.purchase_outcome)

        control_conv_rate = round(control_conversions / control_count, 4)
        treatment_conv_rate = round(treatment_conversions / treatment_count, 4)
        incremental_conv = round(treatment_conv_rate - control_conv_rate, 4)

        control_revenue = round(sum(r.cart_value for r in control_group if r.purchase_outcome), 2)
        treatment_revenue = round(sum(r.cart_value for r in treatment_group if r.purchase_outcome), 2)
        total_discount_cost = round(sum(r.discount_cost for r in treatment_group), 2)

        # Baseline expected revenue without intervention
        scale_factor = treatment_count / control_count
        expected_treatment_revenue_baseline = control_revenue * scale_factor
        incremental_revenue = round(treatment_revenue - expected_treatment_revenue_baseline, 2)
        incremental_margin = round(incremental_revenue - total_discount_cost, 2)

        recovery_rate = round((treatment_conversions / treatment_count) * 100.0, 2)

        return ExperimentMetricsResponse(
            experiment_id=self.experiment_id,
            total_sessions=total_sessions,
            control_sessions=control_count,
            treatment_sessions=treatment_count,
            control_conversions=control_conversions,
            treatment_conversions=treatment_conversions,
            control_conversion_rate=control_conv_rate,
            treatment_conversion_rate=treatment_conv_rate,
            incremental_conversion=incremental_conv,
            control_revenue=control_revenue,
            treatment_revenue=treatment_revenue,
            discount_cost=total_discount_cost,
            incremental_revenue=incremental_revenue,
            incremental_margin=incremental_margin,
            recovery_rate=recovery_rate,
            status_message="Sufficient sample size"
        )


# Singleton instance
_experiment_service_instance = None

def get_experiment_service() -> ExperimentService:
    global _experiment_service_instance
    if _experiment_service_instance is None:
        _experiment_service_instance = ExperimentService()
    return _experiment_service_instance
