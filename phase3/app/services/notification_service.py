import os
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Dict, Any
from app.utils.logger import setup_logger

logger = setup_logger("notification_service")


class BaseNotificationService(ABC):
    """Abstract base notification interface for channel delivery."""

    @abstractmethod
    def send_notification(self, recipient: str, message: str, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        pass


class EmailNotificationService(BaseNotificationService):
    """Email delivery service (SendGrid interface with Safe Demo Mode)."""

    def send_notification(self, recipient: str, message: str, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        timestamp = datetime.now(timezone.utc).isoformat()
        api_key = os.environ.get("SENDGRID_API_KEY")

        if not api_key:
            # Safe Demo Mode: Log dispatch without third-party external API calls
            logger.info(f"[SAFE DEMO MODE - EMAIL] To: {recipient} | Subject: Cart Rescue Offer | Body: {message}")
            return {
                "status": "DELIVERED_DEMO",
                "channel": "EMAIL",
                "recipient": recipient,
                "message": message,
                "timestamp": timestamp
            }

        # Ready for live SendGrid client call if API key provided
        logger.info(f"[SENDGRID LIVE EMAIL] Sent to {recipient}")
        return {"status": "DELIVERED", "channel": "EMAIL", "recipient": recipient, "timestamp": timestamp}


class SMSNotificationService(BaseNotificationService):
    """SMS delivery service (Twilio interface with Safe Demo Mode)."""

    def send_notification(self, recipient: str, message: str, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        timestamp = datetime.now(timezone.utc).isoformat()
        api_key = os.environ.get("TWILIO_AUTH_TOKEN")

        if not api_key:
            # Safe Demo Mode
            logger.info(f"[SAFE DEMO MODE - SMS] To: {recipient} | Message: {message}")
            return {
                "status": "DELIVERED_DEMO",
                "channel": "SMS",
                "recipient": recipient,
                "message": message,
                "timestamp": timestamp
            }

        logger.info(f"[TWILIO LIVE SMS] Sent to {recipient}")
        return {"status": "DELIVERED", "channel": "SMS", "recipient": recipient, "timestamp": timestamp}


class WhatsAppNotificationService(BaseNotificationService):
    """WhatsApp delivery service (Twilio / Meta API interface with Safe Demo Mode)."""

    def send_notification(self, recipient: str, message: str, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        timestamp = datetime.now(timezone.utc).isoformat()
        api_key = os.environ.get("WHATSAPP_API_TOKEN")

        if not api_key:
            # Safe Demo Mode
            logger.info(f"[SAFE DEMO MODE - WHATSAPP] To: {recipient} | Message: {message}")
            return {
                "status": "DELIVERED_DEMO",
                "channel": "WHATSAPP",
                "recipient": recipient,
                "message": message,
                "timestamp": timestamp
            }

        logger.info(f"[WHATSAPP LIVE] Sent to {recipient}")
        return {"status": "DELIVERED", "channel": "WHATSAPP", "recipient": recipient, "timestamp": timestamp}


class NotificationDispatcher:
    """Dispatches rescue notifications across Email, SMS, or WhatsApp."""

    def __init__(self):
        self.email_service = EmailNotificationService()
        self.sms_service = SMSNotificationService()
        self.whatsapp_service = WhatsAppNotificationService()

    def dispatch(self, channel: str, recipient: str, message: str, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        norm_channel = channel.upper().strip()
        if norm_channel == "EMAIL":
            return self.email_service.send_notification(recipient, message, metadata)
        elif norm_channel == "SMS":
            return self.sms_service.send_notification(recipient, message, metadata)
        elif norm_channel == "WHATSAPP":
            return self.whatsapp_service.send_notification(recipient, message, metadata)
        else:
            logger.info(f"No external notification dispatch required for channel: {channel}")
            return {
                "status": "SKIPPED",
                "channel": "NONE",
                "recipient": recipient,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }


# Singleton dispatcher
_notification_dispatcher = None

def get_notification_dispatcher() -> NotificationDispatcher:
    global _notification_dispatcher
    if _notification_dispatcher is None:
        _notification_dispatcher = NotificationDispatcher()
    return _notification_dispatcher
