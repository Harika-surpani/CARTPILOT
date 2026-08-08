from pydantic import BaseModel, Field
from typing import Optional


class BusinessConfig(BaseModel):
    """Pydantic model for configurable business guardrail parameters."""
    max_user_discount: float = Field(default=500.0, ge=0.0, description="Max discount allowed per user across sessions")
    max_campaign_discount: float = Field(default=10000.0, ge=0.0, description="Max total discount budget for campaign")
    coupon_percentage: float = Field(default=0.10, ge=0.0, le=1.0, description="Percentage coupon discount (e.g. 0.10 = 10%)")
    free_shipping_cost: float = Field(default=100.0, ge=0.0, description="Fixed cost to store when offering free shipping")
    estimated_profit_margin: float = Field(default=0.30, ge=0.0, le=1.0, description="Estimated gross profit margin (e.g. 0.30 = 30%)")


class BusinessConfigUpdate(BaseModel):
    """Pydantic model for partial update of business guardrail configuration."""
    max_user_discount: Optional[float] = None
    max_campaign_discount: Optional[float] = None
    coupon_percentage: Optional[float] = None
    free_shipping_cost: Optional[float] = None
    estimated_profit_margin: Optional[float] = None
