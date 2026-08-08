import os
import pandas as pd
import numpy as np
from src.utils import setup_logger, RAW_DATA_PATH, OUTPUT_DIR

logger = setup_logger("preprocessing")


def load_raw_data(data_path: str = RAW_DATA_PATH) -> pd.DataFrame:
    """Loads raw clickstream data from CSV."""
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Raw dataset file not found at: {data_path}")
    logger.info(f"Loading raw dataset from {data_path}...")
    df = pd.read_csv(data_path)
    logger.info(f"Loaded dataset with shape: {df.shape}")
    return df


def inspect_data(df: pd.DataFrame) -> dict:
    """Inspects dataset schema, missing values, duplicates, and column details."""
    logger.info("Inspecting dataset schema and missing values...")
    info = {
        "shape": df.shape,
        "columns": list(df.columns),
        "dtypes": df.dtypes.to_dict(),
        "missing_values": df.isnull().sum().to_dict(),
        "duplicate_rows": df.duplicated().sum(),
        "unique_users": df['UserID'].nunique() if 'UserID' in df else None,
        "unique_sessions_raw": df['SessionID'].nunique() if 'SessionID' in df else None,
        "event_types": df['EventType'].value_counts().to_dict() if 'EventType' in df else None,
        "outcomes": df['Outcome'].value_counts(dropna=False).to_dict() if 'Outcome' in df else None
    }
    logger.info(f"Dataset summary: Rows={info['shape'][0]}, Cols={info['shape'][1]}, Duplicates={info['duplicate_rows']}")
    logger.info(f"Missing values breakdown: {info['missing_values']}")
    return info


def clean_and_prepare_dataset(df: pd.DataFrame) -> pd.DataFrame:
    """
    Cleans raw clickstream dataset:
    - Removes duplicate rows
    - Converts Timestamp to datetime
    - Creates composite session identifier (UserID_SessionID)
    - Sorts events chronologically per session
    - Cleans invalid records
    """
    logger.info("Starting dataset cleaning and preprocessing...")
    df_clean = df.copy()

    # Step 1: Remove duplicate rows
    num_dupes = df_clean.duplicated().sum()
    if num_dupes > 0:
        logger.info(f"Removing {num_dupes} duplicate rows...")
        df_clean = df_clean.drop_duplicates().reset_index(drop=True)
    else:
        logger.info("No duplicate rows found.")

    # Step 2: Clean string columns (strip whitespace, normalize event types)
    for col in ['EventType', 'ProductID', 'Outcome']:
        if col in df_clean.columns and df_clean[col].dtype == object:
            df_clean[col] = df_clean[col].astype(str).str.strip().replace({'nan': np.nan, 'None': np.nan})

    # Step 3: Create composite session ID to handle duplicate SessionID values across UserIDs
    df_clean['composite_session_id'] = df_clean['UserID'].astype(str) + "_" + df_clean['SessionID'].astype(str)

    # Step 4: Convert Timestamps into datetime
    logger.info("Converting timestamps to datetime...")
    df_clean['Timestamp'] = pd.to_datetime(df_clean['Timestamp'])

    # Step 5: Sort events by Session (composite) and Timestamp
    logger.info("Sorting events by composite session ID and Timestamp...")
    df_clean = df_clean.sort_values(by=['composite_session_id', 'Timestamp']).reset_index(drop=True)

    # Step 6: Validate and clean invalid amounts (Amount should be positive or NaN)
    if 'Amount' in df_clean.columns:
        invalid_amounts = (df_clean['Amount'] < 0).sum()
        if invalid_amounts > 0:
            logger.warning(f"Found {invalid_amounts} negative Amount values. Replacing with NaN.")
            df_clean.loc[df_clean['Amount'] < 0, 'Amount'] = np.nan

    logger.info(f"Cleaning complete. Processed dataset shape: {df_clean.shape}")
    return df_clean


def save_clean_dataset(df_clean: pd.DataFrame, output_dir: str = OUTPUT_DIR) -> str:
    """Saves cleaned dataset to CSV."""
    output_path = os.path.join(output_dir, "clean_dataset.csv")
    df_clean.to_csv(output_path, index=False)
    logger.info(f"Clean dataset saved to: {output_path}")
    return output_path


def run_preprocessing_pipeline() -> pd.DataFrame:
    """Executes end-to-end preprocessing phase."""
    df_raw = load_raw_data()
    inspect_data(df_raw)
    df_clean = clean_and_prepare_dataset(df_raw)
    save_clean_dataset(df_clean)
    return df_clean


if __name__ == "__main__":
    run_preprocessing_pipeline()
