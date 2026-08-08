from typing import Dict, Any, Tuple
from app.models.business_config import BusinessConfig, BusinessConfigUpdate
from app.utils.logger import setup_logger

logger = setup_logger("business_guardrails")

# Standardized Allowed Actions
ACTION_DO_NOTHING = "DO_NOTHING"
ACTION_RETRY_PAYMENT = "RETRY_PAYMENT"
ACTION_OFFER_COUPON = "OFFER_COUPON"
ACTION_OFFER_FREE_SHIPPING = "OFFER_FREE_SHIPPING"
ACTION_SEND_REMINDER = "SEND_REMINDER"

ALLOWED_FINAL_ACTIONS = [
    ACTION_DO_NOTHING,
    ACTION_RETRY_PAYMENT,
    ACTION_OFFER_COUPON,
    ACTION_OFFER_FREE_SHIPPING,
    ACTION_SEND_REMINDER
]

# Action mapping from Phase 3 recommendation engine strings to Phase 5 standard actions
ACTION_MAP = {
    "Offer Coupon": ACTION_OFFER_COUPON,
    "OFFER_COUPON": ACTION_OFFER_COUPON,
    "Offer Free Shipping": ACTION_OFFER_FREE_SHIPPING,
    "OFFER_FREE_SHIPPING": ACTION_OFFER_FREE_SHIPPING,
    "Free Shipping": ACTION_OFFER_FREE_SHIPPING,
    "Retry Payment": ACTION_RETRY_PAYMENT,
    "RETRY_PAYMENT": ACTION_RETRY_PAYMENT,
    "Send Reminder": ACTION_SEND_REMINDER,
    "SEND_REMINDER": ACTION_SEND_REMINDER,
    "Do Nothing": ACTION_DO_NOTHING,
    "DO_NOTHING": ACTION_DO_NOTHING
}


class BusinessGuardrailsEngine:
    """
    Phase 5 Business Decision Layer:
    Enforces per-user discount budgets, per-campaign discount budgets,
    calculates expected incremental margin, and validates economic viability.
    """

    def __init__(self, config: BusinessConfig = None):
        self.config = config or BusinessConfig()
        # In-memory tracking of cumulative discounts awarded
        self.user_discounts: Dict[str, float] = {}
        self.campaign_discounts: Dict[str, float] = {}

    def get_config(self) -> BusinessConfig:
        return self.config

    def update_config(self, update_data: BusinessConfigUpdate) -> BusinessConfig:
        data = update_data.model_dump(exclude_unset=True)
        for key, val in data.items():
            if val is not None:
                setattr(self.config, key, val)
        logger.info(f"Business configuration updated: {self.config}")
        return self.config

    def normalize_action(self, action: str) -> str:
        return ACTION_MAP.get(action, ACTION_DO_NOTHING)

    def calculate_discount_cost(self, action: str, cart_value: float) -> float:
        norm_action = self.normalize_action(action)
        if norm_action == ACTION_OFFER_COUPON:
            return round(cart_value * self.config.coupon_percentage, 2)
        elif norm_action == ACTION_OFFER_FREE_SHIPPING:
            return round(self.config.free_shipping_cost, 2)
        return 0.0

    def calculate_expected_incremental_margin(
        self,
        risk_score: float,
        cart_value: float,
        discount_cost: float
    ) -> float:
        """
        MVP Formula:
        expected_incremental_margin = (expected_recovery_probability * cart_value * profit_margin) - discount_cost
        """
        # Expected recovery probability scaled with risk severity
        expected_recovery_prob = min(0.85, max(0.10, risk_score * 0.50))
        gross_profit = cart_value * self.config.estimated_profit_margin
        expected_incremental_margin = (expected_recovery_prob * gross_profit) - discount_cost
        return round(expected_incremental_margin, 2)

    def evaluate_guardrails(
        self,
        session_id: str,
        risk_score: float,
        cart_value: float,
        predicted_reason: str,
        recommended_action: str,
        user_id: Any = 1000,
        campaign_id: str = "default_campaign"
    ) -> Tuple[str, float, float, str]:
        """
        Evaluates business rules and returns:
        (final_action, discount_cost, expected_incremental_margin, decision_status)
        """
        user_key = str(user_id)
        campaign_key = str(campaign_id)

        target_action = self.normalize_action(recommended_action)
        discount_cost = self.calculate_discount_cost(target_action, cart_value)
        margin = self.calculate_expected_incremental_margin(risk_score, cart_value, discount_cost)

        # 1. Check if action is already DO_NOTHING or non-discount action
        if target_action == ACTION_DO_NOTHING:
            return ACTION_DO_NOTHING, 0.0, margin, "LOW_RISK_NO_INTERVENTION"

        if target_action in (ACTION_RETRY_PAYMENT, ACTION_SEND_REMINDER):
            # Non-monetary interventions always pass budget checks
            return target_action, 0.0, margin, "APPROVED"

        # 2. Per-user discount budget check
        current_user_spent = self.user_discounts.get(user_key, 0.0)
        if (current_user_spent + discount_cost) > self.config.max_user_discount:
            logger.warning(f"User {user_key} exceeded discount budget (${current_user_spent + discount_cost} > ${self.config.max_user_discount})")
            return ACTION_DO_NOTHING, 0.0, margin, "EXCEEDS_USER_DISCOUNT_BUDGET"

        # 3. Per-campaign discount budget check
        current_campaign_spent = self.campaign_discounts.get(campaign_key, 0.0)
        if (current_campaign_spent + discount_cost) > self.config.max_campaign_discount:
            logger.warning(f"Campaign {campaign_key} exceeded discount budget (${current_campaign_spent + discount_cost} > ${self.config.max_campaign_discount})")
            return ACTION_DO_NOTHING, 0.0, margin, "EXCEEDS_CAMPAIGN_DISCOUNT_BUDGET"

        # 4. Expected incremental margin check
        if margin <= 0.0:
            logger.warning(f"Session {session_id} has non-positive incremental margin (${margin}). Rejecting discount.")
            return ACTION_DO_NOTHING, 0.0, margin, "NEGATIVE_INCREMENTAL_MARGIN"

        # 5. Discount Approved -> Record allocated discount
        self.user_discounts[user_key] = round(current_user_spent + discount_cost, 2)
        self.campaign_discounts[campaign_key] = round(current_campaign_spent + discount_cost, 2)

        return target_action, discount_cost, margin, "APPROVED"


# Singleton instance
_business_guardrails_engine = None

def get_business_guardrails_engine() -> BusinessGuardrailsEngine:
    global _business_guardrails_engine
    if _business_guardrails_engine is None:
        _business_guardrails_engine = BusinessGuardrailsEngine()
    return _business_guardrails_engine
