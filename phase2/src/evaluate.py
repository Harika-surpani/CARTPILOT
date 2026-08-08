import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, classification_report
)
from src.utils import setup_logger, FIGURES_DIR

logger = setup_logger("evaluate")


def evaluate_model(model, X_test: pd.DataFrame, y_test: pd.Series, model_name: str = "Model") -> dict:
    """
    Evaluates a trained classifier on test set using Accuracy, Precision, Recall, F1, and ROC-AUC.
    """
    y_pred = model.predict(X_test)
    if hasattr(model, "predict_proba"):
        y_prob = model.predict_proba(X_test)[:, 1]
    else:
        y_prob = y_pred

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    roc_auc = roc_auc_score(y_test, y_prob)
    cm = confusion_matrix(y_test, y_pred)

    metrics = {
        "model_name": model_name,
        "accuracy": round(float(acc), 4),
        "precision": round(float(prec), 4),
        "recall": round(float(rec), 4),
        "f1_score": round(float(f1), 4),
        "roc_auc": round(float(roc_auc), 4),
        "confusion_matrix": cm.tolist()
    }

    logger.info(f"=== {model_name.upper()} EVALUATION METRICS ===")
    logger.info(f"Accuracy:  {metrics['accuracy']}")
    logger.info(f"Precision: {metrics['precision']}")
    logger.info(f"Recall:    {metrics['recall']}")
    logger.info(f"F1-Score:  {metrics['f1_score']}")
    logger.info(f"ROC-AUC:   {metrics['roc_auc']}")
    logger.info(f"Confusion Matrix:\n{cm}")

    return metrics, y_pred, y_prob


def plot_confusion_matrix(cm: np.ndarray, model_name: str, figures_dir: str = FIGURES_DIR) -> str:
    """Plots and saves confusion matrix plot."""
    plt.figure(figsize=(6, 5))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=['Purchased (0)', 'Abandoned (1)'],
                yticklabels=['Purchased (0)', 'Abandoned (1)'])
    plt.title(f"Confusion Matrix - {model_name}", fontsize=14, fontweight='bold')
    plt.xlabel("Predicted Label", fontsize=12)
    plt.ylabel("True Label", fontsize=12)
    plt.tight_layout()
    plot_path = os.path.join(figures_dir, f"confusion_matrix_{model_name.lower().replace(' ', '_')}.png")
    plt.savefig(plot_path, dpi=300)
    plt.close()
    return plot_path


def extract_and_plot_feature_importance(model, feature_names: list, model_name: str,
                                         figures_dir: str = FIGURES_DIR) -> pd.DataFrame:
    """
    Extracts feature importances or coefficients, displays them, and saves to DataFrame and plot.
    """
    importances = None
    if hasattr(model, "feature_importances_"):
        importances = model.feature_importances_
    elif hasattr(model, "coef_"):
        importances = np.abs(model.coef_[0])
    
    if importances is None:
        logger.warning(f"Model {model_name} does not expose feature importances.")
        return pd.DataFrame()

    fi_df = pd.DataFrame({
        "feature": feature_names,
        "importance": importances
    }).sort_values(by="importance", ascending=False).reset_index(drop=True)

    logger.info(f"=== {model_name} FEATURE IMPORTANCE ===")
    for idx, row in fi_df.iterrows():
        logger.info(f"{row['feature']}: {row['importance']:.6f}")

    # Plot
    plt.figure(figsize=(10, 6))
    sns.barplot(data=fi_df.head(15), x="importance", y="feature", hue="feature", legend=False, palette="mako")
    plt.title(f"Feature Importance ({model_name})", fontsize=14, fontweight='bold')
    plt.xlabel("Importance / Absolute Coefficient", fontsize=12)
    plt.ylabel("Feature", fontsize=12)
    plt.tight_layout()
    plot_path = os.path.join(figures_dir, "feature_importance_plot.png")
    plt.savefig(plot_path, dpi=300)
    plt.close()

    return fi_df
