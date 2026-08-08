import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure phase3 root is in sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config.config import CORS_ORIGINS
from app.api.endpoints import router as api_router
from app.api.experiment_routes import router as experiment_router
from app.api.websocket_routes import router as websocket_router
from app.api.enterprise_routes import router as enterprise_router
from app.services.prediction_service import get_prediction_service
from app.utils.logger import setup_logger

logger = setup_logger("main_app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Pre-loads Phase 2 ML model into memory on server startup."""
    logger.info("Initializing Cart Rescue Engine...")
    try:
        pred_service = get_prediction_service()
        logger.info("Model initialization complete. Server ready for real-time inference.")
    except Exception as e:
        logger.error(f"Failed to initialize model on startup: {e}")
    yield
    logger.info("Shutting down Cart Rescue Engine...")


app = FastAPI(
    title="CartPilot AI Cart Rescue Engine",
    description="Real-time E-Commerce Cart Abandonment Risk Prediction, Enterprise Decision Layer & Holdout Experiment Engine",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Enable CORS for frontend integration
origins = CORS_ORIGINS if CORS_ORIGINS != ["*"] else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API, Experiment, WebSocket & Enterprise Decision Layer routes
app.include_router(api_router)
app.include_router(experiment_router)
app.include_router(websocket_router)
app.include_router(enterprise_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
