"""
Automated End-to-End Integration Tests
======================================
Tests the full system flow:
Customer session -> Clickstream event -> WebSocket -> Feature extraction ->
ML Risk Prediction -> Reason Detection -> Recommendation -> Business Guardrail ->
Consent Check -> Self-Check -> Final Action -> Audit Log -> Experiment Assignment -> Notification Demo.
"""

import sys
import os
import json
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.main import app
from app.api.models import SessionInput
from app.services.realtime_session import get_realtime_session_manager
from app.services.audit_service import get_audit_service
from app.services.ai_cost_tracker import get_ai_cost_tracker
from app.services.notification_service import get_notification_dispatcher

client = TestClient(app)


class TestFullEndToEndIntegration:

    def test_01_health_check_endpoint(self):
        """Verify GET /health returns all required status attributes."""
        res = client.get("/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] in ("healthy", "degraded")
        assert "backend_status" in data
        assert "model_status" in data
        assert "database_status" in data
        assert "websocket_status" in data

    def test_02_predict_endpoint_flow(self):
        """Verify POST /predict returns valid risk score & probabilities."""
        session_data = {
            "session_id": "e2e_sess_101",
            "user_id": 1001,
            "total_events": 8,
            "num_products": 3,
            "cart_value": 350.0,
            "avg_time_between_events_sec": 45.0,
            "page_views": 3,
            "product_views": 3,
            "clicks": 2,
            "add_to_cart_count": 2,
            "session_duration_sec": 360.0,
            "checkout_started": 1
        }
        res = client.post("/predict", json=session_data)
        assert res.status_code == 200
        data = res.json()
        assert data["session_id"] == "e2e_sess_101"
        assert 0.0 <= data["risk_score"] <= 1.0
        assert 0.0 <= data["abandonment_probability"] <= 1.0

    def test_03_full_recommendation_and_enterprise_pipeline(self):
        """Verify POST /recommend executes full multi-agent pipeline and decision layer."""
        session_data = {
            "session_id": "e2e_sess_102",
            "user_id": 1002,
            "total_events": 12,
            "num_products": 4,
            "cart_value": 480.0,
            "avg_time_between_events_sec": 50.0,
            "page_views": 4,
            "product_views": 4,
            "clicks": 3,
            "add_to_cart_count": 2,
            "session_duration_sec": 420.0,
            "checkout_started": 1
        }
        res = client.post("/recommend", json=session_data)
        assert res.status_code == 200
        data = res.json()

        # Check required recommendation fields
        assert data["session_id"] == "e2e_sess_102"
        assert "risk_score" in data
        assert "reason" in data
        assert "recommended_action" in data
        assert "final_action" in data
        assert "discount_cost" in data
        assert "expected_incremental_margin" in data
        assert "consent_status" in data
        assert "selected_channel" in data
        assert "self_check_passed" in data

    def test_04_user_consent_preferences_api(self):
        """Verify GET and POST /users/{user_id}/preferences."""
        # Get defaults
        res_get = client.get("/users/1003/preferences")
        assert res_get.status_code == 200
        prefs = res_get.json()
        assert prefs["user_id"] == "1003"

        # Update preferences
        update_payload = {"dnd_enabled": True, "whatsapp_opt_in": True}
        res_post = client.post("/users/1003/preferences", json=update_payload)
        assert res_post.status_code == 200
        updated = res_post.json()
        assert updated["dnd_enabled"] is True
        assert updated["whatsapp_opt_in"] is True

    def test_05_ai_cost_tracker_endpoint(self):
        """Verify GET /ai-cost returns decision latency and cost metrics."""
        res = client.get("/ai-cost")
        assert res.status_code == 200
        data = res.json()
        assert "total_decisions" in data
        assert "total_llm_calls" in data
        assert "average_cost_per_decision" in data
        assert "average_latency_ms" in data

    def test_06_websocket_realtime_scoring(self):
        """Verify WebSocket /ws/session/{session_id} real-time session processing."""
        with client.websocket_connect("/ws/session/ws_e2e_999") as websocket:
            # Send clickstream event
            event_payload = {
                "user_id": 1005,
                "event_type": "ADD_TO_CART",
                "amount": 250.0,
                "product_id": "P_99"
            }
            websocket.send_text(json.dumps(event_payload))
            data = websocket.receive_json()

            assert data["session_id"] == "ws_e2e_999"
            assert "risk_score" in data
            assert "final_action" in data
            assert "cart_value" in data
            assert data["cart_value"] >= 250.0

    def test_07_holdout_experiments_endpoint(self):
        """Verify GET /experiments returns holdout experiment metrics."""
        res = client.get("/experiments")
        assert res.status_code == 200
        data = res.json()
        assert "control_sessions" in data
        assert "treatment_sessions" in data
        assert "incremental_conversion" in data

    def test_08_safe_demo_notification_dispatch(self):
        """Verify NotificationDispatcher in safe demo mode."""
        dispatcher = get_notification_dispatcher()
        res = dispatcher.dispatch("WHATSAPP", "+919876543210", "Rescue test offer")
        assert res["status"] == "DELIVERED_DEMO"
        assert res["channel"] == "WHATSAPP"
