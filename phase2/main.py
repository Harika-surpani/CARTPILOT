import os
import sys

# Ensure src is in python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.utils import setup_logger
from src.preprocessing import run_preprocessing_pipeline
from src.feature_engineering import run_feature_engineering_pipeline
from src.eda_analysis import perform_eda
from src.train_model import train_and_evaluate_models

logger = setup_logger("main_pipeline")


def run_phase2_pipeline():
    """
    Runs the complete Phase 2 Pipeline for Cart Rescue Cart Abandonment Prediction:
    1. Preprocessing & Dataset Cleaning
    2. Session-Level Feature Engineering
    3. Exploratory Data Analysis & Visualizations
    4. Baseline Model Training (Logistic Regression, Random Forest, XGBoost) & Evaluation
    5. Output Files & Model Artifact Generation
    """
    logger.info("==========================================================")
    logger.info("   STARTING PHASE 2: DATASET ANALYSIS & FEATURE ENGINEERING")
    logger.info("==========================================================")

    # 1. Preprocessing
    logger.info("\n--- STEP 1: PREPROCESSING & CLEANING ---")
    df_clean = run_preprocessing_pipeline()

    # 2. Feature Engineering
    logger.info("\n--- STEP 2: SESSION FEATURE ENGINEERING ---")
    session_df, X_train, X_test, y_train, y_test, feature_cols, scaler = run_feature_engineering_pipeline(df_clean)

    # 3. Exploratory Data Analysis
    logger.info("\n--- STEP 3: EXPLORATORY DATA ANALYSIS ---")
    eda_summary = perform_eda(df_clean, session_df)

    # 4. Model Training & Evaluation
    logger.info("\n--- STEP 4: BASELINE MODEL TRAINING & EVALUATION ---")
    summary_df, best_model, fi_df = train_and_evaluate_models(X_train, X_test, y_train, y_test)

    logger.info("\n==========================================================")
    logger.info("   PHASE 2 PIPELINE COMPLETED SUCCESSFULLY!")
    logger.info("==========================================================")
    logger.info("Generated Outputs:")
    logger.info("- clean_dataset.csv")
    logger.info("- session_features.csv")
    logger.info("- X_train.csv, X_test.csv, y_train.csv, y_test.csv")
    logger.info("- best_model.pkl")
    logger.info("- feature_importance.csv")
    logger.info("- EDA Charts in outputs/figures/")


if __name__ == "__main__":
    run_phase2_pipeline()
