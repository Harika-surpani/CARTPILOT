from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, ConfigDict


class SessionInput(BaseModel):
    """Pydantic input schema for an active shopping session."""
    session_id: str = Field(..., description="Unique session identifier (UserID_SessionID)")
    user_id: Optional[int] = Field(default=1000, description="User ID associated with session")
    total_events: int = Field(default=5, ge=0, description="Total events in session")
    num_products: int = Field(default=2, ge=0, description="Number of unique products interacted with")
    cart_value: float = Field(default=150.0, ge=0.0, description="Total cart dollar value")
    avg_time_between_events_sec: float = Field(default=25.0, ge=0.0, description="Average seconds between actions")
    page_views: int = Field(default=2, ge=0, description="Count of page views")
    product_views: int = Field(default=2, ge=0, description="Count of product view events")
    clicks: int = Field(default=1, ge=0, description="Count of click events")
    add_to_cart_count: int = Field(default=1, ge=0, description="Count of add to cart events")
    logins: int = Field(default=0, ge=0, description="Count of login events")
    logouts: int = Field(default=0, ge=0, description="Count of logout events")
    session_duration_sec: float = Field(default=120.0, ge=0.0, description="Total session duration in seconds")
    start_hour: int = Field(default=14, ge=0, le=23, description="Hour session started (0-23)")
    start_day_of_week: int = Field(default=2, ge=0, le=6, description="Day of week session started (0=Mon, 6=Sun)")
    bounce_indicator: int = Field(default=0, ge=0, le=1, description="1 if single-event bounce, else 0")
    checkout_started: int = Field(default=1, ge=0, le=1, description="1 if checkout process started, else 0")
    last_event_type: Optional[str] = Field(default=None, description="Most recent event type e.g. payment_failed, logout")

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "session_id": "1000_1",
            "total_events": 6,
            "num_products": 3,
            "cart_value": 320.0,
            "avg_time_between_events_sec": 45.0,
            "page_views": 2,
            "product_views": 2,
            "clicks": 1,
            "add_to_cart_count": 1,
            "logins": 0,
            "logouts": 0,
            "session_duration_sec": 220.0,
            "start_hour": 18,
            "start_day_of_week": 3,
            "bounce_indicator": 0,
            "checkout_started": 1,
            "last_event_type": "add_to_cart"
        }
    })


class FeatureExplanationItem(BaseModel):
    """Structured explanation item for a contributing feature."""
    feature: str
    importance: float
    description: str


class PredictionResponse(BaseModel):
    """Pydantic schema for /predict endpoint response."""
    session_id: str
    risk_score: float
    purchase_probability: float
    abandonment_probability: float
    confidence: float
    timestamp: str


class RecommendationResponse(BaseModel):
    """
    Pydantic schema matching the required exact JSON output format for Step 9:
    {
      "session_id": "...",
      "risk_score": 0.91,
      "purchase_probability": 0.09,
      "abandonment_probability": 0.91,
      "confidence": 0.96,
      "reason": "Browsing Only",
      "recommended_action": "Send Reminder",
      "top_features": [...],
      "timestamp": "..."
    }
    """
    session_id: str
    risk_score: float
    purchase_probability: float
    abandonment_probability: float
    confidence: float
    reason: str
    recommended_action: str
    top_features: List[FeatureExplanationItem]
    timestamp: str


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    model_loaded: bool
    model_path: str
    version: str


class MetricsResponse(BaseModel):
    """Analytics and audit metrics response."""
    total_predictions: int
    abandonment_risk_distribution: Dict[str, int]
    action_breakdown: Dict[str, int]
    reason_breakdown: Dict[str, int]
    average_decision_latency_ms: float
