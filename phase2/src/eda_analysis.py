import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from src.utils import setup_logger, FIGURES_DIR

logger = setup_logger("eda_analysis")


def perform_eda(df_clean: pd.DataFrame, session_df: pd.DataFrame, figures_dir: str = FIGURES_DIR) -> dict:
    """
    Performs Exploratory Data Analysis on cleaned clickstream & session data,
    prints EDA metrics, and generates visual charts.
    """
    logger.info("Executing Exploratory Data Analysis (EDA)...")
    
    # 1. Dataset size
    total_events = len(df_clean)
    total_sessions = len(session_df)
    total_users = df_clean['UserID'].nunique()
    
    # 2. Event distribution
    event_counts = df_clean['EventType'].value_counts()
    
    # 3. Purchase vs No Purchase (Sessions)
    abandoned_counts = session_df['abandoned'].value_counts()
    purchase_sessions = (session_df['abandoned'] == 0).sum()
    no_purchase_sessions = (session_df['abandoned'] == 1).sum()
    conversion_rate = (purchase_sessions / total_sessions) * 100.0
    abandonment_rate = (no_purchase_sessions / total_sessions) * 100.0
    
    # 4. Session duration stats
    duration_mean = session_df['session_duration_sec'].mean()
    duration_median = session_df['session_duration_sec'].median()
    duration_std = session_df['session_duration_sec'].std()
    
    # 5. Average events per session
    avg_events_per_session = session_df['total_events'].mean()
    
    # 6. Average cart value
    avg_cart_value = session_df[session_df['cart_value'] > 0]['cart_value'].mean()
    
    # 7. Top products
    top_products = df_clean['ProductID'].dropna().value_counts().head(10).to_dict()

    eda_summary = {
        "dataset_size_events": total_events,
        "dataset_size_sessions": total_sessions,
        "dataset_size_users": total_users,
        "event_distribution": event_counts.to_dict(),
        "purchase_sessions": int(purchase_sessions),
        "no_purchase_sessions": int(no_purchase_sessions),
        "conversion_rate_percent": round(conversion_rate, 2),
        "abandonment_rate_percent": round(abandonment_rate, 2),
        "session_duration_mean_sec": round(duration_mean, 2),
        "session_duration_median_sec": round(duration_median, 2),
        "avg_events_per_session": round(avg_events_per_session, 2),
        "avg_cart_value": round(avg_cart_value, 2) if not np.isnan(avg_cart_value) else 0.0,
        "top_10_products": top_products
    }

    logger.info("=== EDA SUMMARY METRICS ===")
    for key, val in eda_summary.items():
        logger.info(f"{key}: {val}")

    # Generate Visualizations
    sns.set_theme(style="whitegrid", palette="muted")
    
    # Chart 1: Event Type Distribution
    plt.figure(figsize=(10, 5))
    ax = sns.barplot(x=event_counts.index, y=event_counts.values, hue=event_counts.index, legend=False, palette="viridis")
    plt.title("Clickstream Event Type Distribution", fontsize=14, fontweight='bold')
    plt.xlabel("Event Type", fontsize=12)
    plt.ylabel("Event Count", fontsize=12)
    for p in ax.patches:
        ax.annotate(f"{int(p.get_height()):,}", (p.get_x() + p.get_width() / 2., p.get_height()),
                    ha='center', va='bottom', fontsize=10, xytext=(0, 3), textcoords='offset points')
    plt.tight_layout()
    chart1_path = os.path.join(figures_dir, "event_distribution.png")
    plt.savefig(chart1_path, dpi=300)
    plt.close()
    
    # Chart 2: Purchase vs No Purchase (Abandonment) Distribution
    plt.figure(figsize=(6, 5))
    ax = sns.barplot(x=['Purchased (0)', 'Abandoned (1)'], y=[purchase_sessions, no_purchase_sessions],
                     hue=['Purchased (0)', 'Abandoned (1)'], legend=False, palette=["#2ecc71", "#e74c3c"])
    plt.title("Session Target Distribution: Purchase vs Abandoned", fontsize=14, fontweight='bold')
    plt.ylabel("Number of Sessions", fontsize=12)
    for p in ax.patches:
        ax.annotate(f"{int(p.get_height()):,} ({p.get_height()/total_sessions*100:.1f}%)",
                    (p.get_x() + p.get_width() / 2., p.get_height()),
                    ha='center', va='bottom', fontsize=11, xytext=(0, 3), textcoords='offset points')
    plt.tight_layout()
    chart2_path = os.path.join(figures_dir, "abandonment_distribution.png")
    plt.savefig(chart2_path, dpi=300)
    plt.close()

    # Chart 3: Session Duration Distribution by Abandonment Status
    plt.figure(figsize=(10, 5))
    sns.boxplot(data=session_df, x='abandoned', y='session_duration_sec', hue='abandoned', palette=["#2ecc71", "#e74c3c"], legend=False)
    plt.title("Session Duration (Seconds) by Cart Abandonment Status", fontsize=14, fontweight='bold')
    plt.xticks([0, 1], ['Purchased', 'Abandoned'])
    plt.xlabel("Status", fontsize=12)
    plt.ylabel("Duration (Seconds)", fontsize=12)
    plt.tight_layout()
    chart3_path = os.path.join(figures_dir, "session_duration_boxplot.png")
    plt.savefig(chart3_path, dpi=300)
    plt.close()

    # Chart 4: Top 10 Interacted Products
    top_prod_series = df_clean['ProductID'].dropna().value_counts().head(10)
    plt.figure(figsize=(10, 5))
    sns.barplot(x=top_prod_series.values, y=top_prod_series.index, hue=top_prod_series.index, legend=False, palette="magma")
    plt.title("Top 10 Interacted Products in Clickstream", fontsize=14, fontweight='bold')
    plt.xlabel("Interaction Count", fontsize=12)
    plt.ylabel("Product ID", fontsize=12)
    plt.tight_layout()
    chart4_path = os.path.join(figures_dir, "top_products.png")
    plt.savefig(chart4_path, dpi=300)
    plt.close()

    logger.info(f"EDA visualizations saved to figures directory: {figures_dir}")
    return eda_summary


if __name__ == "__main__":
    from src.preprocessing import run_preprocessing_pipeline
    from src.feature_engineering import build_session_features
    df_clean = run_preprocessing_pipeline()
    session_df = build_session_features(df_clean)
    perform_eda(df_clean, session_df)
