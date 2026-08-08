# Phase 3: AI Cart Rescue Engine

Welcome to **Phase 3** of the **CartPilot AI Cart Rescue Platform**.

Phase 3 builds the real-time AI Cart Rescue inference and recommendation engine powered by the Phase 2 trained model (`best_model.pkl`). The backend API monitors active shopping sessions, calculates real-time abandonment risk scores, generates feature-level explanations, detects abandonment reasons, executes a configurable business rule engine to recommend exactly ONE action, logs audit decisions, and exposes production-grade REST APIs.

---

## 📁 Project Structure

```
phase3/
├── app/
│   ├── main.py                     # FastAPI application entry point
│   ├── api/
│   │   ├── endpoints.py            # API routes (/health, /predict, /recommend, /session/{id}, /metrics)
│   │   └── models.py               # Pydantic request/response schemas
│   ├── services/
│   │   ├── prediction_service.py   # Joblib model loader & inference engine
│   │   ├── recommendation_service.py # AI Pipeline orchestrator
│   │   ├── explanation_service.py  # Prediction explanation & feature importance weights
│   │   ├── reason_detection.py     # Abandonment reason heuristic engine
│   │   ├── business_rules.py       # Configurable rule engine mapping risk & reason -> 1 action
│   │   └── audit_service.py        # Audit logging service & analytics metrics
│   ├── config/
│   │   └── config.py               # Config & risk thresholds
│   └── utils/
│       └── logger.py               # Production logging utility
├── models/
│   └── best_model.pkl              # Loaded directly from Phase 2
├── data/
│   ├── feature_importance.csv
│   └── session_features.csv
├── logs/
│   └── audit.log                   # Audit log store
├── tests/
│   └── test_api.py                 # Pytest integration test suite
├── requirements.txt                # Dependencies
└── README.md                       # Documentation
```

---

## ⚡ AI Recommendation Pipeline

```
Incoming Session Data
       ↓
Real-Time Feature Alignment (15 features)
       ↓
Load Trained Model (best_model.pkl)
       ↓
Predict Abandonment Risk & Probabilities
       ↓
Generate Explanation (Top Contributing Features)
       ↓
Detect Abandonment Reason (Browsing Only, Price Sensitive, Payment Issue, etc.)
       ↓
Apply Configurable Business Rule Engine
       ↓
Recommend EXACTLY ONE Action (Do Nothing, Retry Payment, Offer Coupon, Free Shipping, Send Reminder)
       ↓
Audit Logging (Timestamp, Session ID, Risk Score, Action, Decision Time)
       ↓
Return Structured JSON Response
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Server health status, model load status, and version |
| `POST` | `/predict` | Predicts abandonment probability, purchase probability, risk score, and confidence |
| `POST` | `/recommend` | Full AI Pipeline: risk score, explanation, reason detection, 1 action, audit logging |
| `GET` | `/session/{session_id}` | Lookup recommendation & risk score for a specific session |
| `GET` | `/metrics` | Analytics metrics summary (total predictions, risk distributions, action counts) |

---

## 💡 Example Request & Response (`POST /recommend`)

### Request Payload:
```json
{
  "session_id": "1000_1",
  "total_events": 6,
  "num_products": 3,
  "cart_value": 320.0,
  "avg_time_between_events_sec": 45.0,
  "page_views": 2,
  "product_views": 2,
  "clicks": 1,
  "add_to_cart_count": 1,
  "session_duration_sec": 220.0,
  "checkout_started": 1
}
```

### JSON Response:
```json
{
  "session_id": "1000_1",
  "risk_score": 0.91,
  "purchase_probability": 0.09,
  "abandonment_probability": 0.91,
  "confidence": 0.91,
  "reason": "Price Sensitive",
  "recommended_action": "Offer Coupon",
  "top_features": [
    {
      "feature": "cart_value",
      "importance": 8.5312,
      "description": "High Cart Value ($320.00)"
    },
    {
      "feature": "avg_time_between_events_sec",
      "importance": 0.3596,
      "description": "Long Idle Time (45.0s average between actions)"
    }
  ],
  "timestamp": "2026-08-07T23:55:00Z"
}
```

---

## 🚀 How to Run the Server & Tests

### 1. Run Automated Unit Tests
```bash
pytest phase3/tests/test_api.py
```

### 2. Launch FastAPI Server
From `phase3` directory:
```bash
python app/main.py
```
Or with uvicorn:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive Swagger API docs available at: `http://localhost:8000/docs`.
