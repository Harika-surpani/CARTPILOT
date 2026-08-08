import os
import joblib
import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier

from src.utils import setup_logger, MODEL_DIR, OUTPUT_DIR, RANDOM_STATE
from src.evaluate import evaluate_model, plot_confusion_matrix, extract_and_plot_feature_importance

logger = setup_logger("train_model")


def train_and_evaluate_models(X_train: pd.DataFrame, X_test: pd.DataFrame,
                              y_train: pd.Series, y_test: pd.Series,
                              model_dir: str = MODEL_DIR, output_dir: str = OUTPUT_DIR) -> tuple:
    """
    Trains Logistic Regression, Random Forest, and XGBoost baseline classifiers.
    Evaluates metrics, selects the top-performing model, saves best_model.pkl and feature_importance.csv.
    """
    logger.info("Starting baseline ML model training...")

    models = {
        "Logistic Regression": LogisticRegression(random_state=RANDOM_STATE, max_iter=1000),
        "Random Forest": RandomForestClassifier(n_estimators=100, random_state=RANDOM_STATE, max_depth=10),
        "XGBoost": XGBClassifier(n_estimators=100, random_state=RANDOM_STATE, max_depth=6, eval_metric='logloss')
    }

    results = []
    trained_models = {}
    best_model_name = None
    best_roc_auc = -1.0
    best_model_obj = None

    for name, model in models.items():
        logger.info(f"Training model: {name}...")
        model.fit(X_train, y_train)
        trained_models[name] = model

        metrics, y_pred, y_prob = evaluate_model(model, X_test, y_test, model_name=name)
        results.append(metrics)
        plot_confusion_matrix(np.array(metrics['confusion_matrix']), model_name=name)

        if metrics['roc_auc'] > best_roc_auc:
            best_roc_auc = metrics['roc_auc']
            best_model_name = name
            best_model_obj = model

    logger.info(f"=== WINNING MODEL: {best_model_name} (ROC-AUC: {best_roc_auc}) ===")

    # Save best model to best_model.pkl
    best_model_path = os.path.join(model_dir, "best_model.pkl")
    joblib.dump(best_model_obj, best_model_path)
    logger.info(f"Saved best model ({best_model_name}) to: {best_model_path}")

    # Extract feature importance for winning model (or Random Forest if tree-based)
    fi_df = extract_and_plot_feature_importance(best_model_obj, list(X_train.columns), model_name=best_model_name)
    fi_csv_path = os.path.join(output_dir, "feature_importance.csv")
    fi_df.to_csv(fi_csv_path, index=False)
    logger.info(f"Saved feature importances to: {fi_csv_path}")

    # Format summary table
    summary_df = pd.DataFrame(results)[['model_name', 'accuracy', 'precision', 'recall', 'f1_score', 'roc_auc']]
    logger.info("\n" + summary_df.to_string(index=False))

    return summary_df, best_model_obj, fi_df


if __name__ == "__main__":
    from src.preprocessing import run_preprocessing_pipeline
    from src.feature_engineering import run_feature_engineering_pipeline

    df_clean = run_preprocessing_pipeline()
    session_df, X_train, X_test, y_train, y_test, feature_cols, scaler = run_feature_engineering_pipeline(df_clean)
    train_and_evaluate_models(X_train, X_test, y_train, y_test)
