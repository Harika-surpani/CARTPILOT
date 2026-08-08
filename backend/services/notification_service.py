import os
import sys
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "phase3"))
from app.services.notification_service import (
    BaseNotificationService, EmailNotificationService,
    SMSNotificationService, WhatsAppNotificationService,
    NotificationDispatcher, get_notification_dispatcher
)
