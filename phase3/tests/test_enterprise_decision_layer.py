"""
Phase Enterprise Decision Layer - Unit Tests
============================================
Tests covering all 10 scenarios:
1.  DND SMS block
2.  WhatsApp blocked (no opt-in)
3.  Email opt-out block
4.  No valid channel -> DO_NOTHING fallback
5.  Safe demo mode notification dispatch
6.  Self-check failure handling
7.  Budget violation handling
8.  Invalid action -> self-check rejects
9.  DO_NOTHING fallback from self-check
10. AI cost metrics calculation
"""

import sys
import os
import pytest

# Ensure app package is on path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.models.user_consent import UserPreferences, UserPreferencesUpdate
from app.services.consent_service import ConsentService
from app.services.self_check_agent import SelfCheckAgent
from app.services.ai_cost_tracker import AICostTracker
from app.services.notification_service import (
    NotificationDispatcher,
    EmailNotificationService,
    SMSNotificationService,
    WhatsAppNotificationService,
)


# ─────────────────────────────────────────────
# FIXTURES
# ─────────────────────────────────────────────

@pytest.fixture
def consent_service():
    """Return a fresh ConsentService with no persisted state."""
    return ConsentService()


@pytest.fixture
def self_check():
    """Return a fresh SelfCheckAgent instance."""
    return SelfCheckAgent()


@pytest.fixture
def cost_tracker():
    """Return a fresh AICostTracker."""
    return AICostTracker()


@pytest.fixture
def dispatcher():
    """Return a NotificationDispatcher (safe demo mode – no live API keys)."""
    return NotificationDispatcher()


# ─────────────────────────────────────────────
# SCENARIO 1: DND blocks SMS
# ─────────────────────────────────────────────

class TestDNDSMSBlock:
    def test_sms_blocked_when_dnd_enabled(self, consent_service):
        """If DND is enabled, SMS must NOT be selected as the channel."""
        # Setup: user has only SMS opted-in but DND active
        prefs = UserPreferences(
            user_id="user_dnd_1",
            email_opt_in=False,
            sms_opt_in=True,
            whatsapp_opt_in=False,
            dnd_enabled=True
        )
        consent_service.preferences["user_dnd_1"] = prefs

        result = consent_service.evaluate_consent_and_channel("user_dnd_1", "SEND_REMINDER")

        assert result.selected_channel == "NONE", "SMS must be blocked when DND is active"
        assert result.consent_status == "BLOCKED", "Status must be BLOCKED when no channel available"
        assert any("DND" in c for c in result.blocked_channels), "DND block reason must appear in blocked_channels"


# ─────────────────────────────────────────────
# SCENARIO 2: WhatsApp blocked (no opt-in)
# ─────────────────────────────────────────────

class TestWhatsAppBlockedNoOptIn:
    def test_whatsapp_not_selected_without_opt_in(self, consent_service):
        """WhatsApp must not be selected if whatsapp_opt_in is False."""
        prefs = UserPreferences(
            user_id="user_wa_2",
            email_opt_in=True,
            sms_opt_in=False,
            whatsapp_opt_in=False,
            dnd_enabled=False
        )
        consent_service.preferences["user_wa_2"] = prefs

        result = consent_service.evaluate_consent_and_channel("user_wa_2", "OFFER_COUPON")

        assert result.selected_channel != "WHATSAPP", "WhatsApp must not be selected without opt-in"
        assert result.selected_channel == "EMAIL", "Email must be selected as WhatsApp fallback"
        assert result.consent_status in ("APPROVED", "PARTIAL")


# ─────────────────────────────────────────────
# SCENARIO 3: Email opt-out block
# ─────────────────────────────────────────────

class TestEmailOptOutBlock:
    def test_email_skipped_when_not_opted_in(self, consent_service):
        """Email must not be selected if email_opt_in is False."""
        prefs = UserPreferences(
            user_id="user_email_3",
            email_opt_in=False,
            sms_opt_in=True,
            whatsapp_opt_in=False,
            dnd_enabled=False
        )
        consent_service.preferences["user_email_3"] = prefs

        result = consent_service.evaluate_consent_and_channel("user_email_3", "SEND_REMINDER")

        assert result.selected_channel != "EMAIL", "Email must not be selected if opted out"
        assert result.selected_channel == "SMS", "SMS must be used as Email fallback"
        assert any("Email" in c for c in result.blocked_channels)


# ─────────────────────────────────────────────
# SCENARIO 4: No valid channel → DO_NOTHING
# ─────────────────────────────────────────────

class TestNoValidChannelDoNothing:
    def test_all_channels_blocked_gives_blocked_status(self, consent_service):
        """If all channels are blocked, consent_status must be BLOCKED."""
        prefs = UserPreferences(
            user_id="user_blocked_4",
            email_opt_in=False,
            sms_opt_in=True,
            whatsapp_opt_in=False,
            dnd_enabled=True   # DND blocks the only opted-in channel (SMS)
        )
        consent_service.preferences["user_blocked_4"] = prefs

        result = consent_service.evaluate_consent_and_channel("user_blocked_4", "SEND_REMINDER")

        assert result.selected_channel == "NONE"
        assert result.consent_status == "BLOCKED"

    def test_do_nothing_action_skips_consent_check(self, consent_service):
        """DO_NOTHING actions must bypass channel checks and return APPROVED."""
        prefs = UserPreferences(
            user_id="user_blocked_4",
            email_opt_in=False,
            sms_opt_in=False,
            whatsapp_opt_in=False,
            dnd_enabled=True
        )
        consent_service.preferences["user_blocked_4"] = prefs

        result = consent_service.evaluate_consent_and_channel("user_blocked_4", "DO_NOTHING")

        assert result.selected_channel == "NONE"
        assert result.consent_status == "APPROVED"  # DO_NOTHING doesn't need a channel


# ─────────────────────────────────────────────
# SCENARIO 5: Safe demo mode notification
# ─────────────────────────────────────────────

class TestSafeDemoNotification:
    def test_email_demo_dispatch_returns_delivered_demo(self, dispatcher):
        """Email service must return DELIVERED_DEMO in safe demo mode (no SENDGRID_API_KEY)."""
        # Ensure no live key is present for test isolation
        os.environ.pop("SENDGRID_API_KEY", None)
        result = dispatcher.dispatch("EMAIL", "user@example.com", "Your cart is waiting!")
        assert result["status"] == "DELIVERED_DEMO"
        assert result["channel"] == "EMAIL"

    def test_sms_demo_dispatch_returns_delivered_demo(self, dispatcher):
        """SMS service must return DELIVERED_DEMO in safe demo mode (no TWILIO_AUTH_TOKEN)."""
        os.environ.pop("TWILIO_AUTH_TOKEN", None)
        result = dispatcher.dispatch("SMS", "+919999999999", "Complete your cart purchase!")
        assert result["status"] == "DELIVERED_DEMO"
        assert result["channel"] == "SMS"

    def test_whatsapp_demo_dispatch_returns_delivered_demo(self, dispatcher):
        """WhatsApp service must return DELIVERED_DEMO in safe demo mode (no WHATSAPP_API_TOKEN)."""
        os.environ.pop("WHATSAPP_API_TOKEN", None)
        result = dispatcher.dispatch("WHATSAPP", "+919999999999", "Rescue offer inside!")
        assert result["status"] == "DELIVERED_DEMO"
        assert result["channel"] == "WHATSAPP"

    def test_unknown_channel_returns_skipped(self, dispatcher):
        """An unknown channel must return SKIPPED, not raise an exception."""
        result = dispatcher.dispatch("UNKNOWN_CHANNEL", "recipient", "msg")
        assert result["status"] == "SKIPPED"
        assert result["channel"] == "NONE"


# ─────────────────────────────────────────────
# SCENARIO 6: Self-check failure handling
# ─────────────────────────────────────────────

class TestSelfCheckFailure:
    def test_missing_session_id_fails_self_check(self, self_check):
        """Missing session_id must cause self-check failure and DO_NOTHING override."""
        passed, reasons, final = self_check.evaluate_self_check(
            session_id="",
            user_id=1001,
            risk_score=0.85,
            final_action="SEND_REMINDER",
            discount_cost=0.0,
            expected_incremental_margin=100.0,
            consent_status="APPROVED",
            selected_channel="EMAIL"
        )
        assert not passed
        assert final == "DO_NOTHING"
        assert any("Missing session_id" in r for r in reasons)

    def test_invalid_risk_score_fails_self_check(self, self_check):
        """Risk score out of [0,1] range must cause self-check failure."""
        passed, reasons, final = self_check.evaluate_self_check(
            session_id="sess-001",
            user_id=1001,
            risk_score=2.5,  # Invalid
            final_action="SEND_REMINDER",
            discount_cost=0.0,
            expected_incremental_margin=100.0,
            consent_status="APPROVED",
            selected_channel="WHATSAPP"
        )
        assert not passed
        assert final == "DO_NOTHING"
        assert any("Invalid risk_score" in r for r in reasons)


# ─────────────────────────────────────────────
# SCENARIO 7: Budget violation handling
# ─────────────────────────────────────────────

class TestBudgetViolation:
    def test_discount_exceeding_budget_fails_check(self, self_check):
        """Discount cost > max_user_discount must fail and override to DO_NOTHING."""
        passed, reasons, final = self_check.evaluate_self_check(
            session_id="sess-002",
            user_id=1002,
            risk_score=0.90,
            final_action="OFFER_COUPON",
            discount_cost=600.0,  # Exceeds default 500.0 cap
            expected_incremental_margin=50.0,
            consent_status="APPROVED",
            selected_channel="EMAIL"
        )
        assert not passed
        assert final == "DO_NOTHING"
        assert any("exceeds budget" in r for r in reasons)

    def test_discount_within_budget_passes_check(self, self_check):
        """Discount cost within budget must pass the budget check."""
        passed, reasons, final = self_check.evaluate_self_check(
            session_id="sess-002b",
            user_id=1002,
            risk_score=0.75,
            final_action="OFFER_COUPON",
            discount_cost=100.0,  # Under 500.0 cap
            expected_incremental_margin=200.0,
            consent_status="APPROVED",
            selected_channel="EMAIL"
        )
        assert passed
        assert final == "OFFER_COUPON"


# ─────────────────────────────────────────────
# SCENARIO 8: Invalid action → self-check rejects
# ─────────────────────────────────────────────

class TestInvalidActionRejection:
    def test_unlisted_action_resolved_to_do_nothing(self, self_check):
        """An unknown action not in action_map must be resolved and locked to DO_NOTHING."""
        passed, reasons, final = self_check.evaluate_self_check(
            session_id="sess-003",
            user_id=1003,
            risk_score=0.70,
            final_action="GIVE_GIFT_CARD",  # Not in allowed actions
            discount_cost=0.0,
            expected_incremental_margin=0.0,
            consent_status="APPROVED",
            selected_channel="WHATSAPP"
        )
        # action_map fallback resolves to DO_NOTHING which IS allowed → check passes
        # but the final_action MUST be DO_NOTHING, not the original unlisted one
        assert final == "DO_NOTHING", "Unknown action must always resolve to safe DO_NOTHING"

    def test_empty_action_string_fails_self_check(self, self_check):
        """An empty action string must fail check 3 (not a valid string) and return DO_NOTHING."""
        passed, reasons, final = self_check.evaluate_self_check(
            session_id="sess-003b",
            user_id=1003,
            risk_score=0.70,
            final_action="",  # Empty string → fails check 3
            discount_cost=0.0,
            expected_incremental_margin=0.0,
            consent_status="APPROVED",
            selected_channel="WHATSAPP"
        )
        assert final == "DO_NOTHING"
        assert not passed
        assert any("action" in r.lower() for r in reasons)


# ─────────────────────────────────────────────
# SCENARIO 9: DO_NOTHING fallback from self-check
# ─────────────────────────────────────────────

class TestDoNothingFallback:
    def test_all_blocked_channel_forced_do_nothing(self, self_check):
        """If consent is BLOCKED for a communication action, self-check must override to DO_NOTHING."""
        passed, reasons, final = self_check.evaluate_self_check(
            session_id="sess-004",
            user_id=1004,
            risk_score=0.65,
            final_action="SEND_REMINDER",
            discount_cost=0.0,
            expected_incremental_margin=0.0,
            consent_status="BLOCKED",
            selected_channel="NONE"
        )
        assert not passed
        assert final == "DO_NOTHING"
        # Should flag both consent blocked AND no channel reasons
        assert any("BLOCKED" in r or "channel" in r.lower() for r in reasons)

    def test_do_nothing_action_passes_self_check(self, self_check):
        """A valid DO_NOTHING action with all checks passing must remain DO_NOTHING."""
        passed, reasons, final = self_check.evaluate_self_check(
            session_id="sess-005",
            user_id=1005,
            risk_score=0.40,
            final_action="DO_NOTHING",
            discount_cost=0.0,
            expected_incremental_margin=0.0,
            consent_status="APPROVED",
            selected_channel="NONE"
        )
        assert passed
        assert final == "DO_NOTHING"


# ─────────────────────────────────────────────
# SCENARIO 10: AI Cost Tracker
# ─────────────────────────────────────────────

class TestAICostTracking:
    def test_initial_state_is_zero(self, cost_tracker):
        """A fresh tracker must report all-zero metrics."""
        metrics = cost_tracker.get_metrics()
        assert metrics.total_decisions == 0
        assert metrics.total_llm_calls == 0
        assert metrics.total_estimated_cost == 0.0
        assert metrics.average_cost_per_decision == 0.0
        assert metrics.average_latency_ms == 0.0

    def test_record_single_decision_no_llm(self, cost_tracker):
        """Recording one decision with no LLM call should show correct totals."""
        cost_tracker.record_decision(estimated_cost=0.0001, latency_ms=12.5, llm_calls=0)
        metrics = cost_tracker.get_metrics()
        assert metrics.total_decisions == 1
        assert metrics.total_llm_calls == 0
        assert abs(metrics.average_cost_per_decision - 0.0001) < 1e-8
        assert abs(metrics.average_latency_ms - 12.5) < 0.01

    def test_record_multiple_decisions_accumulates(self, cost_tracker):
        """Recording multiple decisions must accumulate totals correctly."""
        cost_tracker.record_decision(estimated_cost=0.0001, latency_ms=10.0, llm_calls=0)
        cost_tracker.record_decision(estimated_cost=0.0002, latency_ms=20.0, llm_calls=1)
        cost_tracker.record_decision(estimated_cost=0.0001, latency_ms=15.0, llm_calls=0)

        metrics = cost_tracker.get_metrics()
        assert metrics.total_decisions == 3
        assert metrics.total_llm_calls == 1
        assert abs(metrics.average_latency_ms - 15.0) < 0.5
        # LLM calls == 1 out of 3 decisions: most decisions use ML only (preferred by design)
        assert metrics.total_llm_calls < metrics.total_decisions

    def test_zero_llm_calls_cost_preferred(self, cost_tracker):
        """System should prefer no LLM calls for routine ML decisions."""
        for _ in range(10):
            cost_tracker.record_decision(estimated_cost=0.0001, latency_ms=8.0, llm_calls=0)

        metrics = cost_tracker.get_metrics()
        assert metrics.total_llm_calls == 0, "Routine ML decisions must use 0 LLM calls"
        assert metrics.total_decisions == 10


# ─────────────────────────────────────────────
# CONSENT PREFERENCES UPDATE TESTS
# ─────────────────────────────────────────────

class TestConsentPreferencesUpdate:
    def test_get_creates_default_preferences(self, consent_service):
        """Getting prefs for an unknown user must return sensible defaults."""
        prefs = consent_service.get_preferences("new_user_999")
        assert prefs.user_id == "new_user_999"
        assert isinstance(prefs.email_opt_in, bool)
        assert isinstance(prefs.sms_opt_in, bool)

    def test_update_preferences_persists_change(self, consent_service):
        """Updating preferences must persist to in-memory store."""
        update = UserPreferencesUpdate(email_opt_in=False, dnd_enabled=True)
        updated = consent_service.update_preferences("user_upd_1", update)
        assert updated.email_opt_in is False
        assert updated.dnd_enabled is True

        # Re-fetch and verify persistence
        fetched = consent_service.get_preferences("user_upd_1")
        assert fetched.email_opt_in is False

    def test_whatsapp_first_priority_selection(self, consent_service):
        """When all channels are opted-in, WhatsApp must be selected first (priority 1)."""
        prefs = UserPreferences(
            user_id="user_prio_1",
            email_opt_in=True,
            sms_opt_in=True,
            whatsapp_opt_in=True,
            dnd_enabled=False
        )
        consent_service.preferences["user_prio_1"] = prefs

        result = consent_service.evaluate_consent_and_channel("user_prio_1", "SEND_REMINDER")
        assert result.selected_channel == "WHATSAPP"
        assert result.consent_status in ("APPROVED", "PARTIAL")
