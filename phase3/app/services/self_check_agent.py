from typing import Dict, Any, List, Tuple
from app.services.business_guardrails import ALLOWED_FINAL_ACTIONS
from app.utils.logger import setup_logger

logger = setup_logger("self_check_agent")


class SelfCheckAgent:
    """
    Final Safety Verification Agent.
    Runs 8 critical checks before finalizing any rescue decision.
    If any check fails, overrides final action to DO_NOTHING.
    """

    def evaluate_self_check(
        self,
        session_id: str,
        user_id: Any,
        risk_score: float,
        final_action: str,
        discount_cost: float,
        expected_incremental_margin: float,
        consent_status: str,
        selected_channel: str,
        max_user_discount: float = 500.0
    ) -> Tuple[bool, List[str], str]:
        """
        Runs 8-point safety self-check:
        Returns: (self_check_passed, self_check_reasons, resolved_final_action)
        """
        reasons: List[str] = []
        is_passed = True

        # Check 1: Session ID and User ID present
        if not session_id or user_id is None:
            reasons.append("FAILED: Missing session_id or user_id")
            is_passed = False

        # Check 2: Valid risk score range
        if risk_score is None or not (0.0 <= risk_score <= 1.0):
            reasons.append(f"FAILED: Invalid risk_score ({risk_score})")
            is_passed = False

        # Check 3: Exactly ONE final action provided
        if not final_action or not isinstance(final_action, str):
            reasons.append("FAILED: Final action is not a single valid string")
            is_passed = False

        norm_action = final_action.upper().replace(" ", "_")
        # Map common action names if needed
        action_map = {
            "OFFER_COUPON": "OFFER_COUPON",
            "OFFER_FREE_SHIPPING": "OFFER_FREE_SHIPPING",
            "FREE_SHIPPING": "OFFER_FREE_SHIPPING",
            "RETRY_PAYMENT": "RETRY_PAYMENT",
            "SEND_REMINDER": "SEND_REMINDER",
            "DO_NOTHING": "DO_NOTHING"
        }
        resolved_action = action_map.get(norm_action, "DO_NOTHING")

        # Check 4: Action belongs to allowed actions list
        if resolved_action not in ALLOWED_FINAL_ACTIONS:
            reasons.append(f"FAILED: Action '{final_action}' not in allowed actions list")
            is_passed = False

        # Check 5: Discount cost within budget
        if discount_cost > max_user_discount:
            reasons.append(f"FAILED: Discount cost (${discount_cost}) exceeds budget cap (${max_user_discount})")
            is_passed = False

        # Check 6: Non-negative incremental margin for monetary discount actions
        if resolved_action in ("OFFER_COUPON", "OFFER_FREE_SHIPPING") and expected_incremental_margin < 0.0:
            reasons.append(f"FAILED: Negative incremental margin (${expected_incremental_margin}) for discount action")
            is_passed = False

        # Check 7: Consent status valid
        if consent_status == "BLOCKED" and resolved_action in ("SEND_REMINDER", "OFFER_COUPON", "OFFER_FREE_SHIPPING"):
            reasons.append("FAILED: User consent status is BLOCKED")
            is_passed = False

        # Check 8: Valid channel for communication actions
        if resolved_action in ("SEND_REMINDER", "OFFER_COUPON", "OFFER_FREE_SHIPPING") and selected_channel == "NONE":
            reasons.append("FAILED: No eligible communication channel available")
            is_passed = False

        # Fallback to DO_NOTHING if any critical safety check fails
        if not is_passed:
            logger.warning(f"SelfCheck FAILED for session {session_id}. Reasons: {reasons}. Downgrading to DO_NOTHING.")
            return False, reasons, "DO_NOTHING"

        reasons.append("PASSED: All 8 critical safety guardrails verified")
        return True, reasons, resolved_action


# Singleton instance
_self_check_agent = None

def get_self_check_agent() -> SelfCheckAgent:
    global _self_check_agent
    if _self_check_agent is None:
        _self_check_agent = SelfCheckAgent()
    return _self_check_agent
