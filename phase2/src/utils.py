import os
import logging

RANDOM_STATE = 42

# Define paths relative to phase2 root directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
RAW_DATA_PATH = os.path.join(DATA_DIR, "ecommerce_clickstream_transactions.csv")
OUTPUT_DIR = os.path.join(BASE_DIR, "outputs")
FIGURES_DIR = os.path.join(OUTPUT_DIR, "figures")
MODEL_DIR = os.path.join(BASE_DIR, "models")

# Ensure required directories exist
for folder in [DATA_DIR, OUTPUT_DIR, FIGURES_DIR, MODEL_DIR]:
    os.makedirs(folder, exist_ok=True)


def setup_logger(name: str = "cart_rescue_phase2") -> logging.Logger:
    """Configures and returns a production-ready logger."""
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        console_handler = logging.StreamHandler()
        formatter = logging.Formatter(
            "[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)
    return logger
