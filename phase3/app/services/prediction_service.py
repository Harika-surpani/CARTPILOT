import os
import joblib
import pandas as pd
import numpy as np
from datetime import datetime, timezone
from typing import Dict, Any, Tuple

from app.config.config import MODEL_PATH, FEATURE_NAMES
from app.utils.logger import setup_logger
from app.api.models import SessionInput

logger = setup_logger("prediction_service")


class PredictionService:
    """Service responsible for loading the Phase 2 ML model and predicting cart abandonment risk."""

    def __init__(self, model_path: str = MODEL_PATH):
        self.model_path = model_path
        self.model = None
        self.load_model()

    def load_model(self):
        """Loads serialized best_model.pkl from Phase 2."""
        if not os.path.exists(self.model_path):
            logger.error(f"Model file not found at: {self.model_path}")
            raise FileNotFoundError(f"Trained model not found at {self.model_path}. Complete Phase 2 first.")
        
        try:
            logger.info(f"Loading trained ML model from {self.model_path}...")
            self.model = joblib.load(self.model_path)
            logger.info(f"Successfully loaded model: {type(self.model).__name__}")
        except Exception as e:
            logger.exception(f"Failed to load model from {self.model_path}: {e}")
            raise e

    def prepare_feature_vector(self, session: SessionInput) -> pd.DataFrame:
        """
        Transforms incoming session Pydantic model into the exact 15-feature DataFrame
        expected by the trained Phase 2 model.
        """
        data_dict = {
            'total_events': [session.total_events],
            'num_products': [session.num_products],
            'cart_value': [session.cart_value],
            'avg_time_between_events_sec': [session.avg_time_between_events_sec],
            'page_views': [session.page_views],
            'product_views': [session.product_views],
            'clicks': [session.clicks],
            'add_to_cart_count': [session.add_to_cart_count],
            'logins': [session.logins],
            'logouts': [session.logouts],
            'session_duration_sec': [session.session_duration_sec],
            'start_hour': [session.start_hour],
            'start_day_of_week': [session.start_day_of_week],
            'bounce_indicator': [session.bounce_indicator],
            'checkout_started': [session.checkout_started]
        }
        
        feature_df = pd.DataFrame(data_dict)[FEATURE_NAMES]
        return feature_df

    def predict_risk(self, session: SessionInput) -> Tuple[float, float, float, float]:
        """
        Executes model inference on session features.
        Returns: (risk_score, abandonment_probability, purchase_probability, confidence)
        """
        if self.model is None:
            self.load_model()

        X = self.prepare_feature_vector(session)

        # Get prediction probability
        if hasattr(self.model, "predict_proba"):
            probs = self.model.predict_proba(X)[0]
            # Class 0 = Purchase (Not Abandoned), Class 1 = Abandoned
            # Note: depending on scikit-learn model classes_ order
            classes = list(getattr(self.model, "classes_", [0, 1]))
            if classes == [0, 1]:
                purchase_prob = float(probs[0])
                abandonment_prob = float(probs[1])
            else:
                abandonment_prob = float(probs[0])
                purchase_prob = float(probs[1])
        else:
            # Fallback for models without predict_proba
            pred = int(self.model.predict(X)[0])
            abandonment_prob = 1.0 if pred == 1 else 0.0
            purchase_prob = 1.0 - abandonment_prob

        # Risk score is abandonment probability
        risk_score = round(abandonment_prob, 4)
        purchase_probability = round(purchase_prob, 4)
        abandonment_probability = round(abandonment_prob, 4)

        # Confidence: how decisive the prediction is
        confidence = round(max(purchase_probability, abandonment_probability), 4)

        logger.info(f"Session '{session.session_id}' -> Risk Score: {risk_score}, Purchase Prob: {purchase_probability}, Confidence: {confidence}")

        return risk_score, abandonment_probability, purchase_probability, confidence


# Singleton instance handler
_prediction_service_instance = None

def get_prediction_service() -> PredictionService:
    global _prediction_service_instance
    if _prediction_service_instance is None:
        _prediction_service_instance = PredictionService()
    return _prediction_service_instance
