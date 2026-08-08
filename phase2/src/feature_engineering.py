import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from src.utils import setup_logger, OUTPUT_DIR, RANDOM_STATE

logger = setup_logger("feature_engineering")


def build_session_features(df_clean: pd.DataFrame) -> pd.DataFrame:
    """
    Aggregates raw event-level clickstream into a clean session-level dataset (1 row per session).
    Engineers Time, Behavior, Cart, and Engagement features supported by dataset schema.
    """
    logger.info("Extracting session-level features from clean event clickstream...")
    df = df_clean.copy()

    # Ensure Timestamp is datetime
    if not pd.api.types.is_datetime64_any_dtype(df['Timestamp']):
        df['Timestamp'] = pd.to_datetime(df['Timestamp'])

    # Ensure sorted by composite_session_id and Timestamp
    df = df.sort_values(by=['composite_session_id', 'Timestamp']).reset_index(drop=True)

    # Calculate consecutive event time difference within session
    df['event_time_diff'] = df.groupby('composite_session_id')['Timestamp'].diff().dt.total_seconds()

    # Create dummy indicators for event types
    event_types = ['page_view', 'product_view', 'click', 'add_to_cart', 'login', 'logout', 'purchase']
    for etype in event_types:
        df[f'is_{etype}'] = (df['EventType'] == etype).astype(int)

    # Vectorized session group aggregations
    agg_dict = {
        'UserID': 'first',
        'SessionID': 'first',
        'Timestamp': ['min', 'max', 'count'],
        'ProductID': 'nunique',
        'Amount': 'sum',
        'event_time_diff': 'mean',
        'is_page_view': 'sum',
        'is_product_view': 'sum',
        'is_click': 'sum',
        'is_add_to_cart': 'sum',
        'is_login': 'sum',
        'is_logout': 'sum',
        'is_purchase': 'sum'
    }

    session_df = df.groupby('composite_session_id').agg(agg_dict)

    # Flatten multi-level columns
    session_df.columns = [
        'user_id', 'session_id',
        'min_timestamp', 'max_timestamp', 'total_events',
        'num_products', 'cart_value', 'avg_time_between_events_sec',
        'page_views', 'product_views', 'clicks', 'add_to_cart_count',
        'logins', 'logouts', 'purchase_count'
    ]

    # Feature Derivations:
    # 1. Time Features
    session_df['session_duration_sec'] = (session_df['max_timestamp'] - session_df['min_timestamp']).dt.total_seconds()
    session_df['start_hour'] = session_df['min_timestamp'].dt.hour
    session_df['start_day_of_week'] = session_df['min_timestamp'].dt.dayofweek

    # 2. Engagement Features
    session_df['avg_time_between_events_sec'] = session_df['avg_time_between_events_sec'].fillna(0.0)
    session_df['bounce_indicator'] = ((session_df['total_events'] == 1) | (session_df['session_duration_sec'] == 0)).astype(int)
    session_df['checkout_started'] = ((session_df['add_to_cart_count'] > 0) | (session_df['logins'] > 0)).astype(int)

    # 3. Target Variable Generation:
    # Purchase = 0 (Not Abandoned), No Purchase = 1 (Abandoned)
    session_df['abandoned'] = (session_df['purchase_count'] == 0).astype(int)

    session_df = session_df.reset_index()

    logger.info(f"Session-level aggregation finished. Total sessions: {len(session_df)}")
    logger.info(f"Target distribution ('abandoned'): {session_df['abandoned'].value_counts().to_dict()}")

    return session_df


def prepare_ml_ready_datasets(session_df: pd.DataFrame, output_dir: str = OUTPUT_DIR) -> tuple:
    """
    Preprocesses engineered features, removes target leakage / identifier columns,
    performs train/test split (80/20, random_state=42), scales numerical features,
    and exports required CSV files.
    """
    logger.info("Preparing ML-ready train/test feature sets...")

    # Drop target leakage columns (purchase_count) and identifiers/timestamps
    cols_to_exclude = [
        'composite_session_id', 'user_id', 'session_id',
        'min_timestamp', 'max_timestamp', 'purchase_count', 'abandoned'
    ]

    feature_cols = [c for c in session_df.columns if c not in cols_to_exclude]
    logger.info(f"Selected {len(feature_cols)} ML predictive features: {feature_cols}")

    X = session_df[feature_cols].copy()
    y = session_df['abandoned'].copy()

    # Split 80% Train, 20% Test with random_state=42
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=RANDOM_STATE, stratify=y
    )

    logger.info(f"Train set shape: X_train={X_train.shape}, y_train={y_train.shape}")
    logger.info(f"Test set shape: X_test={X_test.shape}, y_test={y_test.shape}")

    # Scale numerical features for ML standard input
    scaler = StandardScaler()
    X_train_scaled = pd.DataFrame(scaler.fit_transform(X_train), columns=feature_cols, index=X_train.index)
    X_test_scaled = pd.DataFrame(scaler.transform(X_test), columns=feature_cols, index=X_test.index)

    # Save output CSV files as requested
    session_features_path = os.path.join(output_dir, "session_features.csv")
    X_train_path = os.path.join(output_dir, "X_train.csv")
    X_test_path = os.path.join(output_dir, "X_test.csv")
    y_train_path = os.path.join(output_dir, "y_train.csv")
    y_test_path = os.path.join(output_dir, "y_test.csv")

    session_df.to_csv(session_features_path, index=False)
    X_train_scaled.to_csv(X_train_path, index=False)
    X_test_scaled.to_csv(X_test_path, index=False)
    y_train.to_frame('abandoned').to_csv(y_train_path, index=False)
    y_test.to_frame('abandoned').to_csv(y_test_path, index=False)

    logger.info("Saved all feature datasets (session_features.csv, X_train.csv, X_test.csv, y_train.csv, y_test.csv)")

    return session_df, X_train_scaled, X_test_scaled, y_train, y_test, feature_cols, scaler


def run_feature_engineering_pipeline(df_clean: pd.DataFrame) -> tuple:
    """Executes full feature engineering module."""
    session_df = build_session_features(df_clean)
    res = prepare_ml_ready_datasets(session_df)
    return res


if __name__ == "__main__":
    from src.preprocessing import run_preprocessing_pipeline
    df_clean = run_preprocessing_pipeline()
    run_feature_engineering_pipeline(df_clean)
