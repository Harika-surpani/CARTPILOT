from fastapi import APIRouter, HTTPException, Depends, status
from typing import Dict, Any

from app.api.models import (
    SessionInput, PredictionResponse, RecommendationResponse,
    HealthResponse, MetricsResponse
)
from app.services.recommendation_service import get_recommendation_service, RecommendationService
from app.services.prediction_service import get_prediction_service
from app.services.audit_service import get_audit_service
from app.config.config import MODEL_PATH
from app.utils.logger import setup_logger

logger = setup_logger("api_endpoints")

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    """
    GET /health: Returns AI Cart Rescue engine health status and model details.
    """
    pred_service = get_prediction_service()
    model_loaded = pred_service.model is not None
    return HealthResponse(
        status="healthy" if model_loaded else "degraded",
        model_loaded=model_loaded,
        model_path=MODEL_PATH,
        version="1.0.0"
    )


@router.post("/predict", response_model=PredictionResponse, tags=["Inference"])
def predict_risk(
    session: SessionInput,
    rec_service: RecommendationService = Depends(get_recommendation_service)
):
    """
    POST /predict: Calculates real-time cart abandonment probability & risk score for an active session.
    """
    try:
        return rec_service.predict_only(session)
    except Exception as e:
        logger.exception(f"Error during risk prediction for session {session.session_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction error: {str(e)}"
        )


@router.post("/recommend", response_model=RecommendationResponse, tags=["Recommendation Engine"])
def recommend_action(
    session: SessionInput,
    rec_service: RecommendationService = Depends(get_recommendation_service)
):
    """
    POST /recommend: Executes full AI Cart Rescue pipeline:
    - Calculates abandonment risk score & probabilities
    - Explains prediction
    - Infers abandonment reason
    - Evaluates business rules to recommend EXACTLY ONE action
    - Logs audit decision
    - Returns JSON response
    """
    try:
        return rec_service.generate_recommendation(session)
    except Exception as e:
        logger.exception(f"Error generating recommendation for session {session.session_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Recommendation error: {str(e)}"
        )


@router.get("/session/{session_id}", response_model=RecommendationResponse, tags=["Session Management"])
def get_session_recommendation(
    session_id: str,
    rec_service: RecommendationService = Depends(get_recommendation_service)
):
    """
    GET /session/{session_id}: Retrieves recommendation & abandonment risk for a specific session ID.
    """
    try:
        return rec_service.lookup_session(session_id)
    except Exception as e:
        logger.exception(f"Error retrieving session {session_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {session_id} lookup error: {str(e)}"
        )


@router.get("/metrics", response_model=MetricsResponse, tags=["Analytics & Audit"])
def get_engine_metrics():
    """
    GET /metrics: Returns system metrics, risk score distributions, and action breakdown.
    """
    try:
        audit_service = get_audit_service()
        metrics = audit_service.get_metrics()
        return MetricsResponse(**metrics)
    except Exception as e:
        logger.exception(f"Error fetching engine metrics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Metrics error: {str(e)}"
        )
