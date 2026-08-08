from fastapi import APIRouter, Depends, HTTPException, status
from app.models.experiment import ExperimentMetricsResponse
from app.models.business_config import BusinessConfig, BusinessConfigUpdate
from app.services.experiment_service import get_experiment_service, ExperimentService
from app.services.business_guardrails import get_business_guardrails_engine, BusinessGuardrailsEngine
from app.utils.logger import setup_logger

logger = setup_logger("experiment_routes")

router = APIRouter(tags=["Business & Experiments"])


@router.get("/experiments", response_model=ExperimentMetricsResponse)
def get_experiment_metrics(
    exp_service: ExperimentService = Depends(get_experiment_service)
):
    """
    GET /experiments: Retrieves holdout experiment performance metrics (Control vs Treatment).
    Returns 'Insufficient sample size' if total session count is below statistical threshold.
    """
    try:
        return exp_service.get_metrics()
    except Exception as e:
        logger.exception(f"Error fetching experiment metrics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Experiment metrics error: {str(e)}"
        )


@router.get("/business-config", response_model=BusinessConfig)
def get_business_config(
    guardrails: BusinessGuardrailsEngine = Depends(get_business_guardrails_engine)
):
    """
    GET /business-config: Retrieves current business guardrails and budget settings.
    """
    try:
        return guardrails.get_config()
    except Exception as e:
        logger.exception(f"Error fetching business config: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Business config error: {str(e)}"
        )


@router.post("/business-config", response_model=BusinessConfig)
def update_business_config(
    update_data: BusinessConfigUpdate,
    guardrails: BusinessGuardrailsEngine = Depends(get_business_guardrails_engine)
):
    """
    POST /business-config: Updates business guardrail limits, discount budgets, and margin targets.
    """
    try:
        return guardrails.update_config(update_data)
    except Exception as e:
        logger.exception(f"Error updating business config: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Update business config error: {str(e)}"
        )
