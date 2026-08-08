import os
import sys
import pytest
from fastapi.testclient import TestClient

# Ensure phase3 root is in sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app

client = TestClient(app)


def test_health_endpoint():
    """Test GET /health returns 200 OK and model status."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    assert "version" in data


def test_predict_endpoint():
    """Test POST /predict calculates probabilities and risk score."""
    payload = {
        "session_id": "test_session_001",
        "total_events": 6,
        "num_products": 3,
        "cart_value": 350.0,
        "avg_time_between_events_sec": 45.0,
        "page_views": 2,
        "product_views": 2,
        "clicks": 1,
        "add_to_cart_count": 1,
        "session_duration_sec": 250.0,
        "start_hour": 18,
        "start_day_of_week": 3,
        "bounce_indicator": 0,
        "checkout_started": 1
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["session_id"] == "test_session_001"
    assert "risk_score" in data
    assert "purchase_probability" in data
    assert "abandonment_probability" in data
    assert "confidence" in data
    assert 0.0 <= data["risk_score"] <= 1.0


def test_recommend_high_risk_session():
    """Test POST /recommend for high-risk high cart value session -> Offer Coupon."""
    payload = {
        "session_id": "high_risk_001",
        "total_events": 2,
        "num_products": 1,
        "cart_value": 450.0,
        "avg_time_between_events_sec": 90.0,
        "page_views": 1,
        "product_views": 1,
        "clicks": 0,
        "add_to_cart_count": 1,
        "session_duration_sec": 300.0,
        "start_hour": 22,
        "start_day_of_week": 6,
        "bounce_indicator": 0,
        "checkout_started": 1
    }
    response = client.post("/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["session_id"] == "high_risk_001"
    assert "risk_score" in data
    assert "reason" in data
    assert "recommended_action" in data
    assert data["recommended_action"] in ["Offer Coupon", "Send Reminder", "Retry Payment", "Offer Free Shipping", "Do Nothing"]
    assert isinstance(data["top_features"], list)
    assert len(data["top_features"]) > 0


def test_recommend_payment_issue():
    """Test POST /recommend with payment failure -> Retry Payment."""
    payload = {
        "session_id": "payment_fail_001",
        "total_events": 8,
        "num_products": 2,
        "cart_value": 120.0,
        "avg_time_between_events_sec": 15.0,
        "page_views": 3,
        "product_views": 2,
        "clicks": 2,
        "add_to_cart_count": 1,
        "checkout_started": 1,
        "last_event_type": "payment_failed"
    }
    response = client.post("/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["reason"] == "Payment Issue"
    assert data["recommended_action"] == "Retry Payment"


def test_session_lookup_endpoint():
    """Test GET /session/{id} retrieves recommendation."""
    response = client.get("/session/1000_1")
    assert response.status_code == 200
    data = response.json()
    assert data["session_id"] == "1000_1"
    assert "recommended_action" in data


def test_metrics_endpoint():
    """Test GET /metrics returns analytics breakdown."""
    response = client.get("/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "total_predictions" in data
    assert "abandonment_risk_distribution" in data
    assert "action_breakdown" in data
    assert "reason_breakdown" in data
    assert "average_decision_latency_ms" in data
