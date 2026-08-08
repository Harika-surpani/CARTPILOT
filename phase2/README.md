# Phase 2: Cart Abandonment Dataset Analysis & Feature Engineering

Welcome to **Phase 2** of the **CartPilot AI-Powered Cart Rescue Platform**. 

The goal of Phase 2 is to transform raw e-commerce clickstream events into a clean, session-aggregated, ML-ready dataset to predict cart abandonment risk in real time.

---

## 📁 Project Structure

```
phase2/
│
├── data/
│   └── ecommerce_clickstream_transactions.csv
│
├── notebooks/
│   └── phase2_eda_and_feature_engineering.ipynb
│
├── src/
│   ├── preprocessing.py          # Data loading, cleaning, schema inspection, sorting
│   ├── feature_engineering.py    # Session aggregation, target generation, train/test split
│   ├── eda_analysis.py           # Statistical summary and EDA chart generation
│   ├── train_model.py            # Baseline model training (Logistic Regression, RF, XGBoost)
│   ├── evaluate.py               # Evaluation metrics, confusion matrix, feature importance
│   └── utils.py                  # Path configuration & logger setup
│
├── outputs/
│   ├── clean_dataset.csv
│   ├── session_features.csv
│   ├── X_train.csv
│   ├── X_test.csv
│   ├── y_train.csv
│   ├── y_test.csv
│   ├── feature_importance.csv
│   └── figures/
│       ├── event_distribution.png
│       ├── abandonment_distribution.png
│       ├── session_duration_boxplot.png
│       ├── top_products.png
│       ├── confusion_matrix_logistic_regression.png
│       ├── confusion_matrix_random_forest.png
│       ├── confusion_matrix_xgboost.png
│       └── feature_importance_plot.png
│
├── models/
│   └── best_model.pkl
│
├── requirements.txt              # Required dependencies
└── README.md                     # Phase 2 documentation
```

---

## 📊 Dataset Overview

- **Source Dataset**: `ecommerce_clickstream_transactions.csv` (Kaggle E-commerce Clickstream and Transaction Dataset)
- **Raw Rows**: 74,817 clickstream events
- **Unique Users**: 1,000
- **Unique Sessions**: 10,000 (identified via composite key `UserID_SessionID`)
- **Event Types**: `page_view`, `product_view`, `click`, `add_to_cart`, `login`, `logout`, `purchase`

---

## 🛠️ Feature Engineering Specifications

Raw events are aggregated into 1 row per unique session:

| Category | Feature Name | Description |
| :--- | :--- | :--- |
| **Time** | `session_duration_sec` | Total session duration in seconds (`max(Timestamp) - min(Timestamp)`) |
| **Time** | `start_hour` | Hour of day (0–23) of the first session event |
| **Time** | `start_day_of_week` | Day of week (0=Monday, 6=Sunday) |
| **Behavior** | `total_events` | Total number of clickstream actions in session |
| **Behavior** | `product_views` | Count of product view events |
| **Behavior** | `clicks` | Count of general click events |
| **Behavior** | `add_to_cart_count` | Count of items added to cart |
| **Behavior** | `page_views` | Count of general page view events |
| **Behavior** | `logins` | Count of login events |
| **Behavior** | `logouts` | Count of logout events |
| **Cart** | `cart_value` | Cumulative transaction amount in session |
| **Cart** | `num_products` | Number of distinct products interacted with |
| **Engagement** | `avg_time_between_events_sec` | Mean time interval between consecutive actions |
| **Engagement** | `bounce_indicator` | Binary flag (1 if session has only 1 event or 0 sec duration) |
| **Engagement** | `checkout_started` | Binary flag (1 if user added items to cart or logged in) |

---

## 🎯 Target Variable Definition

- **`abandoned`**:
  - `0` (Not Abandoned / Purchase Completed) -> Session contains at least 1 `purchase` event (32.79% of sessions)
  - `1` (Abandoned) -> Session contains 0 `purchase` events (67.21% of sessions)

> **Note on Target Leakage**: `purchase_count` and raw outcome columns are explicitly excluded from `X_train` and `X_test` during model training.

---

## 🚀 How to Run the Pipeline

### 1. Execute End-to-End Pipeline
Run the main script from `phase2` directory:
```bash
python main.py
```

### 2. View Interactive Notebook
Open the Jupyter notebook:
```bash
jupyter notebook notebooks/phase2_eda_and_feature_engineering.ipynb
```

---

## 📈 ML Baseline Model Performance

Models evaluated on 20% holdout test set (`random_state=42`):

| Model | Accuracy | Precision | Recall | F1-Score | ROC-AUC |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Logistic Regression** | 0.9990 | 0.9985 | 1.0000 | 0.9992 | 0.9999 |
| **Random Forest** | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 |
| **XGBoost** | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 |

The winning model is saved as `models/best_model.pkl`.
