import os
import pandas as pd
import numpy as np
from typing import List
from app.config.config import FEATURE_IMPORTANCE_PATH, FEATURE_NAMES
from app.utils.logger import setup_logger
from app.api.models import SessionInput, FeatureExplanationItem

logger = setup_logger("explanation_service")


class ExplanationService:
    """Service that provides structured explanations for model predictions."""

    def __init__(self, feature_importance_path: str = FEATURE_IMPORTANCE_PATH):
        self.feature_importance_path = feature_importance_path
        self.feature_importance_map = {}
        self.load_feature_importance()

    def load_feature_importance(self):
        """Loads feature importance map from Phase 2 CSV output."""
        if os.path.exists(self.feature_importance_path):
            try:
                df = pd.read_csv(self.feature_importance_path)
                self.feature_importance_map = dict(zip(df['feature'], df['importance']))
                logger.info("Loaded feature importances map from Phase 2 CSV.")
            except Exception as e:
                logger.warning(f"Could not load feature importances from {self.feature_importance_path}: {e}")
        
        # Default fallback weights if file missing
        if not self.feature_importance_map:
            self.feature_importance_map = {feat: 1.0 / len(FEATURE_NAMES) for feat in FEATURE_NAMES}

    def explain_prediction(self, session: SessionInput, risk_score: float, top_k: int = 3) -> List[FeatureExplanationItem]:
        """
        Generates top contributing feature explanations for the session prediction.
        Computes impact based on feature value and feature importance weights.
        """
        explanations = []

        # Feature value heuristics
        feature_values = {
            'cart_value': session.cart_value,
            'avg_time_between_events_sec': session.avg_time_between_events_sec,
            'session_duration_sec': session.session_duration_sec,
            'add_to_cart_count': session.add_to_cart_count,
            'num_products': session.num_products,
            'total_events': session.total_events,
            'product_views': session.product_views,
            'clicks': session.clicks,
            'page_views': session.page_views,
            'bounce_indicator': session.bounce_indicator,
            'checkout_started': session.checkout_started
        }

        contributions = []
        for feat, val in feature_values.items():
            base_importance = self.feature_importance_map.get(feat, 0.1)
            
            # Impact multiplier
            multiplier = 1.0
            if feat == 'cart_value' and val > 200:
                multiplier = 1.5
            elif feat == 'avg_time_between_events_sec' and val > 40:
                multiplier = 1.4
            elif feat == 'bounce_indicator' and val == 1:
                multiplier = 1.6
            elif feat == 'checkout_started' and val == 1:
                multiplier = 1.3

            score = base_importance * multiplier
            
            # Human-readable description
            desc = self._get_feature_description(feat, val)
            contributions.append((feat, score, desc))

        # Sort by contribution score descending
        contributions.sort(key=lambda x: x[1], reverse=True)

        for feat, score, desc in contributions[:top_k]:
            explanations.append(FeatureExplanationItem(
                feature=feat,
                importance=round(float(score), 4),
                description=desc
            ))

        return explanations

    def _get_feature_description(self, feature: str, value: float) -> str:
        """Generates natural language description for a feature value."""
        if feature == 'cart_value':
            return f"High Cart Value (${value:.2f})" if value >= 200 else f"Cart Value (${value:.2f})"
        elif feature == 'avg_time_between_events_sec':
            return f"Long Idle Time ({value:.1f}s average between actions)" if value > 30 else f"Pacing ({value:.1f}s between actions)"
        elif feature == 'session_duration_sec':
            return f"Session Duration ({value:.0f}s)"
        elif feature == 'bounce_indicator':
            return "Single Event Bounce" if value == 1 else "Multi-event Engagement"
        elif feature == 'checkout_started':
            return "Checkout Process Initiated" if value == 1 else "Checkout Not Started"
        elif feature == 'add_to_cart_count':
            return f"Added {int(value)} Item(s) to Cart"
        elif feature == 'num_products':
            return f"Browsed {int(value)} Distinct Products"
        elif feature == 'total_events':
            return f"Low Activity ({int(value)} events)" if value <= 3 else f"Session Activity ({int(value)} events)"
        else:
            return f"{feature.replace('_', ' ').title()}: {value}"


# Singleton instance
_explanation_service_instance = None

def get_explanation_service() -> ExplanationService:
    global _explanation_service_instance
    if _explanation_service_instance is None:
        _explanation_service_instance = ExplanationService()
    return _explanation_service_instance
