from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class ExperimentRecord(BaseModel):
    """Pydantic model for individual session holdout experiment log record."""
    experiment_id: str = Field(..., description="Experiment identifier e.g. exp_cart_rescue_v1")
    session_id: str = Field(..., description="Unique session ID")
    group: str = Field(..., description="CONTROL or TREATMENT")
    recommended_action: str = Field(..., description="Action before holdout check")
    final_action: str = Field(..., description="Action executed after holdout check")
    purchase_outcome: bool = Field(default=False, description="Whether session resulted in completed purchase")
    cart_value: float = Field(default=0.0, ge=0.0, description="Session cart monetary value")
    discount_cost: float = Field(default=0.0, ge=0.0, description="Discount cost incurred")
    timestamp: str = Field(..., description="ISO timestamp of assignment")


class ExperimentMetricsResponse(BaseModel):
    """Pydantic model for GET /experiments response."""
    experiment_id: str
    total_sessions: int
    control_sessions: int
    treatment_sessions: int
    control_conversions: int
    treatment_conversions: int
    control_conversion_rate: float
    treatment_conversion_rate: float
    incremental_conversion: float
    control_revenue: float
    treatment_revenue: float
    discount_cost: float
    incremental_revenue: float
    incremental_margin: float
    recovery_rate: float
    status_message: str
