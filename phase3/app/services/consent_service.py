from typing import Dict, Any, Tuple, List
from app.models.user_consent import UserPreferences, UserPreferencesUpdate, ConsentEvaluationResult
from app.utils.logger import setup_logger

logger = setup_logger("consent_service")

# Actions that require external notification delivery
COMMUNICATION_ACTIONS = [
    "SEND_REMINDER",
    "OFFER_COUPON",
    "OFFER_FREE_SHIPPING",
    "RETRY_PAYMENT",
    "Send Reminder",
    "Offer Coupon",
    "Offer Free Shipping",
    "Retry Payment",
    "Free Shipping"
]


class ConsentService:
    """
    Manages user communication consent and selects communication channels in priority order:
    1. WhatsApp
    2. Email
    3. SMS (blocked if DND enabled)
    """

    def __init__(self):
        # In-memory store of user consent preferences
        self.preferences: Dict[str, UserPreferences] = {}

    def get_preferences(self, user_id: Any) -> UserPreferences:
        key = str(user_id)
        if key not in self.preferences:
            self.preferences[key] = UserPreferences(user_id=user_id)
        return self.preferences[key]

    def update_preferences(self, user_id: Any, update_data: UserPreferencesUpdate) -> UserPreferences:
        prefs = self.get_preferences(user_id)
        data = update_data.model_dump(exclude_unset=True)
        for field, value in data.items():
            if value is not None:
                setattr(prefs, field, value)
        logger.info(f"User {user_id} consent preferences updated: {prefs}")
        return prefs

    def evaluate_consent_and_channel(
        self,
        user_id: Any,
        action: str
    ) -> ConsentEvaluationResult:
        """
        Evaluates communication preferences for a given action and returns:
        ConsentEvaluationResult(selected_channel, consent_status, blocked_channels)
        """
        prefs = self.get_preferences(user_id)
        blocked_channels: List[str] = []

        # Check block conditions
        if not prefs.whatsapp_opt_in:
            blocked_channels.append("WhatsApp (Opt-Out)")

        if not prefs.email_opt_in:
            blocked_channels.append("Email (Opt-Out)")

        if prefs.dnd_enabled:
            blocked_channels.append("SMS (DND Enabled)")
        elif not prefs.sms_opt_in:
            blocked_channels.append("SMS (Opt-Out)")

        # Actions like DO_NOTHING do not require external communication
        norm_action = action.upper().replace(" ", "_")
        if norm_action in ("DO_NOTHING", "DO_NOTHING_ACTION"):
            return ConsentEvaluationResult(
                selected_channel="NONE",
                consent_status="APPROVED",
                blocked_channels=blocked_channels
            )

        # Select first valid channel in priority order: WhatsApp -> Email -> SMS
        selected_channel = "NONE"

        if prefs.whatsapp_opt_in:
            selected_channel = "WHATSAPP"
        elif prefs.email_opt_in:
            selected_channel = "EMAIL"
        elif prefs.sms_opt_in and not prefs.dnd_enabled:
            selected_channel = "SMS"

        if selected_channel != "NONE":
            consent_status = "APPROVED" if not blocked_channels else "PARTIAL"
        else:
            consent_status = "BLOCKED"
            logger.warning(f"No valid communication channel available for user {user_id}. Blocked channels: {blocked_channels}")

        return ConsentEvaluationResult(
            selected_channel=selected_channel,
            consent_status=consent_status,
            blocked_channels=blocked_channels
        )


# Singleton instance
_consent_service_instance = None

def get_consent_service() -> ConsentService:
    global _consent_service_instance
    if _consent_service_instance is None:
        _consent_service_instance = ConsentService()
    return _consent_service_instance
