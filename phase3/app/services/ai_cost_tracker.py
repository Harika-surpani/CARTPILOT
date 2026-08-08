from pydantic import BaseModel, Field
from typing import Dict, Any
from app.utils.logger import setup_logger

logger = setup_logger("ai_cost_tracker")


class AICostMetricsResponse(BaseModel):
    """Pydantic model for GET /ai-cost response."""
    total_decisions: int = Field(..., description="Total decisions processed by pipeline")
    total_llm_calls: int = Field(..., description="Total LLM calls executed (0 for routine ML decisions)")
    total_estimated_cost: float = Field(..., description="Cumulative decision inference cost ($)")
    average_cost_per_decision: float = Field(..., description="Mean cost per decision ($)")
    average_latency_ms: float = Field(..., description="Mean decision processing latency (ms)")


class AICostTracker:
    """Tracks decision execution costs, LLM calls, and latency metrics."""

    def __init__(self):
        self.total_decisions: int = 0
        self.total_llm_calls: int = 0
        self.total_cost: float = 0.0
        self.total_latency_ms: float = 0.0

    def record_decision(self, estimated_cost: float = 0.0001, latency_ms: float = 10.0, llm_calls: int = 0):
        self.total_decisions += 1
        self.total_llm_calls += llm_calls
        self.total_cost += estimated_cost
        self.total_latency_ms += latency_ms

    def get_metrics(self) -> AICostMetricsResponse:
        if self.total_decisions == 0:
            return AICostMetricsResponse(
                total_decisions=0,
                total_llm_calls=0,
                total_estimated_cost=0.0,
                average_cost_per_decision=0.0,
                average_latency_ms=0.0
            )

        avg_cost = round(self.total_cost / self.total_decisions, 6)
        avg_latency = round(self.total_latency_ms / self.total_decisions, 2)

        return AICostMetricsResponse(
            total_decisions=self.total_decisions,
            total_llm_calls=self.total_llm_calls,
            total_estimated_cost=round(self.total_cost, 4),
            average_cost_per_decision=avg_cost,
            average_latency_ms=avg_latency
        )


# Singleton instance
_ai_cost_tracker_instance = None

def get_ai_cost_tracker() -> AICostTracker:
    global _ai_cost_tracker_instance
    if _ai_cost_tracker_instance is None:
        _ai_cost_tracker_instance = AICostTracker()
    return _ai_cost_tracker_instance
