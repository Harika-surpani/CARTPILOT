import os
import sys
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "phase3"))
from app.models.user_consent import UserPreferences, UserPreferencesUpdate, ConsentEvaluationResult
