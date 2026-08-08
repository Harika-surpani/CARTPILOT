import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configurable paths with environment variable fallbacks
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./cartpilot.db")
MODEL_PATH = os.environ.get("MODEL_PATH", os.path.join(BASE_DIR, "models", "best_model.pkl"))
DATA_DIR = os.path.join(BASE_DIR, "data")
SESSION_FEATURES_PATH = os.path.join(DATA_DIR, "session_features.csv")
FEATURE_IMPORTANCE_PATH = os.path.join(DATA_DIR, "feature_importance.csv")
LOG_DIR = os.path.join(BASE_DIR, "logs")
AUDIT_LOG_PATH = os.path.join(LOG_DIR, "audit.log")

# Third-Party API Keys for Safe Demo / Live Delivery
SENDGRID_API_KEY = os.environ.get("SENDGRID_API_KEY", "")
TWILIO_ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN", "")
TWILIO_WHATSAPP_NUMBER = os.environ.get("TWILIO_WHATSAPP_NUMBER", "+14155238886")
TWILIO_SMS_NUMBER = os.environ.get("TWILIO_SMS_NUMBER", "+15005550006")

# CORS Origins
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*").split(",")

# Ensure required directories exist
os.makedirs(LOG_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)

# Risk Thresholds
HIGH_RISK_THRESHOLD = 0.70
MEDIUM_RISK_THRESHOLD = 0.40

# Cart Value Threshold
HIGH_CART_VALUE_THRESHOLD = 250.0

# Feature Names expected by trained Phase 2 ML Model
FEATURE_NAMES = [
    'total_events',
    'num_products',
    'cart_value',
    'avg_time_between_events_sec',
    'page_views',
    'product_views',
    'clicks',
    'add_to_cart_count',
    'logins',
    'logouts',
    'session_duration_sec',
    'start_hour',
    'start_day_of_week',
    'bounce_indicator',
    'checkout_started'
]
