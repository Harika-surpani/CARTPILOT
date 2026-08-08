from app.api.models import SessionInput
from app.config.config import HIGH_CART_VALUE_THRESHOLD
from app.utils.logger import setup_logger

logger = setup_logger("reason_detection")

ALLOWED_REASONS = [
    "Payment Issue",
    "Price Sensitive",
    "Browsing Only",
    "Low Engagement",
    "High Cart Value",
    "Checkout Drop",
    "Unknown"
]


class ReasonDetectionService:
    """Service that infers the most likely abandonment reason based on session features."""

    def detect_reason(self, session: SessionInput, risk_score: float) -> str:
        """
        Detects abandonment reason from session behavior metrics.
        Returns one of the ALLOWED_REASONS string.
        """
        # Rule 1: Payment Issue detection
        if session.last_event_type in ["payment_failed", "payment_error", "decline"]:
            return "Payment Issue"

        # Rule 2: Low Engagement
        if session.bounce_indicator == 1 or session.total_events <= 2 or session.avg_time_between_events_sec > 60:
            return "Low Engagement"

        # Rule 3: Checkout Drop
        if session.checkout_started == 1 and session.add_to_cart_count > 0 and session.avg_time_between_events_sec > 20:
            return "Checkout Drop"

        # Rule 4: High Cart Value
        if session.cart_value >= HIGH_CART_VALUE_THRESHOLD:
            return "High Cart Value"

        # Rule 5: Browsing Only
        if session.product_views > 0 and session.add_to_cart_count == 0 and session.checkout_started == 0:
            return "Browsing Only"

        # Rule 6: Price Sensitive (Added items to cart, viewed multiple products, long duration, moderate/high price)
        if session.add_to_cart_count > 0 and session.num_products >= 2:
            return "Price Sensitive"

        # Fallback
        if risk_score < 0.40:
            return "Unknown"

        return "Browsing Only"


_reason_detection_service = None

def get_reason_detection_service() -> ReasonDetectionService:
    global _reason_detection_service
    if _reason_detection_service is None:
        _reason_detection_service = ReasonDetectionService()
    return _reason_detection_service
