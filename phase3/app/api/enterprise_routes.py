from fastapi import APIRouter, Depends, HTTPException, status
from typing import Any
from app.models.user_consent import UserPreferences, UserPreferencesUpdate
from app.services.consent_service import get_consent_service, ConsentService
from app.services.ai_cost_tracker import get_ai_cost_tracker, AICostTracker, AICostMetricsResponse
from app.utils.logger import setup_logger

logger = setup_logger("enterprise_routes")

router = APIRouter(tags=["Enterprise Consent & AI Cost"])


@router.get("/users/{user_id}/preferences", response_model=UserPreferences)
def get_user_preferences(
    user_id: str,
    consent_service: ConsentService = Depends(get_consent_service)
):
    """
    GET /users/{user_id}/preferences: Retrieves user communication consent and channel preferences.
    """
    try:
        return consent_service.get_preferences(user_id)
    except Exception as e:
        logger.exception(f"Error fetching consent preferences for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"User consent error: {str(e)}"
        )


@router.post("/users/{user_id}/preferences", response_model=UserPreferences)
def update_user_preferences(
    user_id: str,
    update_data: UserPreferencesUpdate,
    consent_service: ConsentService = Depends(get_consent_service)
):
    """
    POST /users/{user_id}/preferences: Updates user communication consent and DND status.
    """
    try:
        return consent_service.update_preferences(user_id, update_data)
    except Exception as e:
        logger.exception(f"Error updating consent preferences for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Update consent error: {str(e)}"
        )


@router.get("/ai-cost", response_model=AICostMetricsResponse)
def get_ai_cost_metrics(
    cost_tracker: AICostTracker = Depends(get_ai_cost_tracker)
):
    """
    GET /ai-cost: Returns AI decision inference cost, LLM calls count, and latency metrics.
    """
    try:
        return cost_tracker.get_metrics()
    except Exception as e:
        logger.exception(f"Error fetching AI cost metrics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI cost metrics error: {str(e)}"
        )
