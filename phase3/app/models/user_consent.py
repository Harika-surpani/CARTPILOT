from pydantic import BaseModel, Field
from typing import Optional, List, Any


class UserPreferences(BaseModel):
    """Pydantic model for user communication consent and preferences."""
    user_id: Any = Field(default=1000, description="User ID")
    email_opt_in: bool = Field(default=True, description="Whether user opted in to Email notifications")
    sms_opt_in: bool = Field(default=True, description="Whether user opted in to SMS notifications")
    whatsapp_opt_in: bool = Field(default=True, description="Whether user opted in to WhatsApp notifications")
    dnd_enabled: bool = Field(default=False, description="Do Not Disturb flag (blocks SMS if True)")


class UserPreferencesUpdate(BaseModel):
    """Pydantic model for updating user consent preferences."""
    email_opt_in: Optional[bool] = None
    sms_opt_in: Optional[bool] = None
    whatsapp_opt_in: Optional[bool] = None
    dnd_enabled: Optional[bool] = None


class ConsentEvaluationResult(BaseModel):
    """Pydantic model for channel consent evaluation outcome."""
    selected_channel: str = Field(..., description="Selected channel: WHATSAPP, EMAIL, SMS, or NONE")
    consent_status: str = Field(..., description="Status: APPROVED, PARTIAL, BLOCKED, or NO_CHANNEL")
    blocked_channels: List[str] = Field(default_factory=list, description="List of blocked channel reasons")
