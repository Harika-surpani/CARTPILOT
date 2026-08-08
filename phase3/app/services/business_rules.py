from app.api.models import SessionInput
from app.config.config import HIGH_RISK_THRESHOLD, MEDIUM_RISK_THRESHOLD, HIGH_CART_VALUE_THRESHOLD
from app.utils.logger import setup_logger

logger = setup_logger("business_rules")

ALLOWED_ACTIONS = [
    "Do Nothing",
    "Retry Payment",
    "Offer Coupon",
    "Offer Free Shipping",
    "Send Reminder"
]


class BusinessRuleEngine:
    """Configurable Rule Engine that maps risk score, cart value, and session features to EXACTLY ONE action."""

    def determine_action(self, session: SessionInput, risk_score: float, reason: str) -> str:
        """
        Executes business rules:
        - Reason Payment Issue -> Retry Payment
        - High Risk + High Cart Value -> Offer Coupon
        - High Risk + Checkout Started -> Send Reminder
        - Medium Risk -> Offer Free Shipping
        - Low Risk -> Do Nothing
        """
        # Rule 1: Payment Issue -> Retry Payment
        if reason == "Payment Issue":
            return "Retry Payment"

        # Rule 2: Low Risk -> Do Nothing (Protects profit margins & avoids unnecessary discounts)
        if risk_score < MEDIUM_RISK_THRESHOLD:
            return "Do Nothing"

        # Rule 3: High Risk Rules (risk_score >= 0.70)
        if risk_score >= HIGH_RISK_THRESHOLD:
            if session.cart_value >= HIGH_CART_VALUE_THRESHOLD or reason == "High Cart Value" or reason == "Price Sensitive":
                return "Offer Coupon"
            elif session.checkout_started == 1 or reason == "Checkout Drop":
                return "Send Reminder"
            else:
                return "Send Reminder"

        # Rule 4: Medium Risk Rules (0.40 <= risk_score < 0.70)
        if risk_score >= MEDIUM_RISK_THRESHOLD:
            if session.cart_value >= HIGH_CART_VALUE_THRESHOLD:
                return "Offer Coupon"
            else:
                return "Offer Free Shipping"

        return "Do Nothing"


_business_rule_engine = None

def get_business_rule_engine() -> BusinessRuleEngine:
    global _business_rule_engine
    if _business_rule_engine is None:
        _business_rule_engine = BusinessRuleEngine()
    return _business_rule_engine
