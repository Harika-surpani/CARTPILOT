import os
import sys
import pytest
from fastapi.testclient import TestClient

# Ensure phase3 root is in sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.services.business_guardrails import BusinessGuardrailsEngine, ACTION_DO_NOTHING, ACTION_OFFER_COUPON
from app.models.business_config import BusinessConfig
from app.services.experiment_service import ExperimentService
from app.services.realtime_session import RealtimeSessionManager

client = TestClient(app)


# Scenario 1: High-risk session prediction
def test_high_risk_session_prediction():
    payload = {
        "session_id": "test_high_risk_session",
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
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["session_id"] == "test_high_risk_session"
    assert "risk_score" in data
    assert "abandonment_probability" in data
    assert 0.0 <= data["risk_score"] <= 1.0


# Scenario 2 & 5: Low-risk session resulting in DO_NOTHING
def test_low_risk_session_do_nothing():
    payload = {
        "session_id": "test_low_risk_session",
        "total_events": 15,
        "num_products": 5,
        "cart_value": 50.0,
        "avg_time_between_events_sec": 5.0,
        "page_views": 5,
        "product_views": 4,
        "clicks": 4,
        "add_to_cart_count": 2,
        "session_duration_sec": 75.0,
        "checkout_started": 0
    }
    response = client.post("/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "recommended_action" in data
    assert data["recommended_action"] in ["Do Nothing", "DO_NOTHING", "Offer Free Shipping", "Send Reminder", "OFFER_FREE_SHIPPING", "SEND_REMINDER"]


# Scenario 3: Coupon within budget
def test_coupon_within_budget():
    engine = BusinessGuardrailsEngine(config=BusinessConfig(
        max_user_discount=500.0,
        max_campaign_discount=10000.0,
        coupon_percentage=0.10,
        estimated_profit_margin=0.30
    ))
    final_action, cost, margin, status = engine.evaluate_guardrails(
        session_id="s1",
        risk_score=0.85,
        cart_value=1000.0, # Coupon = 100
        predicted_reason="Price Sensitive",
        recommended_action="OFFER_COUPON",
        user_id=1,
        campaign_id="c1"
    )
    assert final_action == ACTION_OFFER_COUPON
    assert cost == 100.0
    assert margin > 0.0
    assert status == "APPROVED"


# Scenario 4: Coupon exceeding budget -> Fallback to DO_NOTHING
def test_coupon_exceeding_budget():
    engine = BusinessGuardrailsEngine(config=BusinessConfig(
        max_user_discount=50.0, # Strict limit
        max_campaign_discount=10000.0,
        coupon_percentage=0.10
    ))
    final_action, cost, margin, status = engine.evaluate_guardrails(
        session_id="s2",
        risk_score=0.90,
        cart_value=2000.0, # Coupon = 200 > max_user_discount (50)
        predicted_reason="Price Sensitive",
        recommended_action="OFFER_COUPON",
        user_id=2,
        campaign_id="c1"
    )
    assert final_action == ACTION_DO_NOTHING
    assert cost == 0.0
    assert status == "EXCEEDS_USER_DISCOUNT_BUDGET"


# Scenario 6: Control/treatment assignment (10% Control / 90% Treatment with random_state=42)
def test_control_treatment_assignment():
    exp_service = ExperimentService()
    group, final_action, cost = exp_service.process_session_experiment(
        session_id="test_exp_session_001",
        recommended_action="OFFER_COUPON",
        guardrail_action="OFFER_COUPON",
        cart_value=1000.0,
        discount_cost=100.0
    )
    assert group in ["CONTROL", "TREATMENT"]
    if group == "CONTROL":
        assert final_action == "DO_NOTHING"
        assert cost == 0.0
    else:
        assert final_action == "OFFER_COUPON"
        assert cost == 100.0


# Scenario 7: Incremental conversion calculation in experiment metrics service
def test_incremental_conversion_calculation():
    exp_service = ExperimentService()
    metrics_low = exp_service.get_metrics()
    assert metrics_low.status_message == "Insufficient sample size"

    from app.models.experiment import ExperimentRecord
    for i in range(10):
        sid = f"ctrl_{i}"
        exp_service.records[sid] = ExperimentRecord(
            experiment_id="exp1", session_id=sid, group="CONTROL", recommended_action="OFFER_COUPON",
            final_action="DO_NOTHING", purchase_outcome=(i < 2), cart_value=100.0, discount_cost=0.0, timestamp="2026-08-08"
        )

    for i in range(90):
        sid = f"trt_{i}"
        exp_service.records[sid] = ExperimentRecord(
            experiment_id="exp1", session_id=sid, group="TREATMENT", recommended_action="OFFER_COUPON",
            final_action="OFFER_COUPON", purchase_outcome=(i < 45), cart_value=100.0, discount_cost=10.0, timestamp="2026-08-08"
        )

    metrics = exp_service.get_metrics()
    assert metrics.status_message == "Sufficient sample size"
    assert metrics.control_conversion_rate == 0.20 # 2 / 10
    assert metrics.treatment_conversion_rate == 0.50 # 45 / 90
    assert round(metrics.incremental_conversion, 2) == 0.30 # 0.50 - 0.20


# Scenario 8: WebSocket event processing & real-time risk score update
def test_websocket_event_processing():
    manager = RealtimeSessionManager()
    res1 = manager.process_event("ws_test_s1", {"event_type": "PAGE_VIEW"})
    assert res1["session_id"] == "ws_test_s1"
    assert "risk_score" in res1
    assert "final_action" in res1

    res2 = manager.process_event("ws_test_s1", {"event_type": "ADD_TO_CART", "amount": 2500.0, "product_id": "P100"})
    assert res2["cart_value"] == 2500.0
    assert "expected_incremental_margin" in res2


# Scenario 9: Risk score update on clickstream events
def test_risk_score_update_on_events():
    manager = RealtimeSessionManager()
    initial_res = manager.process_event("risk_test_s1", {"event_type": "PAGE_VIEW"})
    checkout_res = manager.process_event("risk_test_s1", {"event_type": "CHECKOUT_STARTED", "amount": 4000.0})
    assert checkout_res["cart_value"] == 4000.0
    assert 0.0 <= checkout_res["risk_score"] <= 1.0


# Scenario 10: Exactly ONE final action returned per session
def test_exactly_one_final_action():
    manager = RealtimeSessionManager()
    res = manager.process_event("single_action_test", {"event_type": "PAYMENT_ATTEMPT", "amount": 1500.0})
    final_act = res["final_action"]
    assert isinstance(final_act, str)
    assert final_act in ["DO_NOTHING", "RETRY_PAYMENT", "OFFER_COUPON", "OFFER_FREE_SHIPPING", "SEND_REMINDER"]
