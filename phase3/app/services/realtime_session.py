import time
from datetime import datetime, timezone
from typing import Dict, Any, List

from app.api.models import SessionInput
from app.services.multi_agent_pipeline import get_multi_agent_pipeline
from app.services.ai_cost_tracker import get_ai_cost_tracker
from app.services.experiment_service import get_experiment_service
from app.utils.logger import setup_logger

logger = setup_logger("realtime_session")


class SessionState:
    """Stores in-memory live clickstream state for a single active shopping session."""

    def __init__(self, session_id: str, user_id: Any = 1000, campaign_id: str = "default_campaign"):
        self.session_id = session_id
        self.user_id = user_id
        self.campaign_id = campaign_id
        self.start_time = time.time()
        self.events: List[Dict[str, Any]] = []
        self.cart_value: float = 0.0
        self.products: set = set()
        self.page_views: int = 0
        self.product_views: int = 0
        self.clicks: int = 0
        self.add_to_cart_count: int = 0
        self.checkout_started: int = 0
        self.last_event_type: str = "page_view"

    def record_event(self, event_type: str, amount: float = 0.0, product_id: str = None) -> Dict[str, Any]:
        normalized_event = event_type.upper().strip()
        timestamp = datetime.now(timezone.utc).isoformat()

        if product_id:
            self.products.add(product_id)

        if amount > 0:
            if normalized_event in ("ADD_TO_CART", "ADD_TO_CART_EVENT"):
                self.cart_value += amount
            elif normalized_event in ("SET_CART_VALUE", "CART_UPDATE") or self.cart_value == 0.0:
                self.cart_value = amount

        if normalized_event in ("PAGE_VIEW", "PAGEVIEW"):
            self.page_views += 1
        elif normalized_event in ("PRODUCT_VIEW", "PRODUCTVIEW"):
            self.product_views += 1
        elif normalized_event in ("CLICK", "CLICK_EVENT"):
            self.clicks += 1
        elif normalized_event in ("ADD_TO_CART", "ADDTOCART"):
            self.add_to_cart_count += 1
        elif normalized_event in ("REMOVE_FROM_CART", "REMOVE_FROM_CART_EVENT"):
            if amount > 0:
                self.cart_value = max(0.0, self.cart_value - amount)
        elif normalized_event in ("CHECKOUT_STARTED", "CHECKOUT_START"):
            self.checkout_started = 1
        elif normalized_event in ("PAYMENT_ATTEMPT", "PAYMENT_FAILED"):
            self.checkout_started = 1

        self.last_event_type = normalized_event.lower()

        event_record = {
            "event_type": normalized_event,
            "product_id": product_id,
            "amount": amount,
            "timestamp": timestamp
        }
        self.events.append(event_record)
        return event_record

    def to_session_input(self) -> SessionInput:
        duration_sec = max(1.0, round(time.time() - self.start_time, 1))
        total_events = max(1, len(self.events))
        avg_time = round(duration_sec / total_events, 1)
        now_dt = datetime.now(timezone.utc)

        return SessionInput(
            session_id=self.session_id,
            user_id=self.user_id if isinstance(self.user_id, int) else 1000,
            total_events=total_events,
            num_products=max(1 if self.add_to_cart_count > 0 else 0, len(self.products)),
            cart_value=round(self.cart_value, 2),
            avg_time_between_events_sec=avg_time,
            page_views=max(1, self.page_views),
            product_views=max(1, self.product_views),
            clicks=max(1, self.clicks),
            add_to_cart_count=self.add_to_cart_count,
            logins=0,
            logouts=0,
            session_duration_sec=duration_sec,
            start_hour=now_dt.hour,
            start_day_of_week=now_dt.weekday(),
            bounce_indicator=1 if total_events <= 1 else 0,
            checkout_started=self.checkout_started,
            last_event_type=self.last_event_type
        )


class RealtimeSessionManager:
    """Orchestrates real-time event updates via Multi-Agent Decision Pipeline."""

    def __init__(self):
        self.sessions: Dict[str, SessionState] = {}
        self.pipeline = get_multi_agent_pipeline()
        self.ai_cost_tracker = get_ai_cost_tracker()
        self.experiment_service = get_experiment_service()

    def get_or_create_session(self, session_id: str, user_id: Any = 1000, campaign_id: str = "default_campaign") -> SessionState:
        if session_id not in self.sessions:
            self.sessions[session_id] = SessionState(session_id=session_id, user_id=user_id, campaign_id=campaign_id)
        return self.sessions[session_id]

    def process_event(self, session_id: str, event_data: Dict[str, Any]) -> Dict[str, Any]:
        user_id = event_data.get("user_id", 1000)
        campaign_id = event_data.get("campaign_id", "default_campaign")
        event_type = event_data.get("event_type", "PAGE_VIEW")
        amount = float(event_data.get("amount", event_data.get("cart_value", 0.0)))
        product_id = event_data.get("product_id")

        session_state = self.get_or_create_session(session_id, user_id=user_id, campaign_id=campaign_id)
        session_state.record_event(event_type, amount=amount, product_id=product_id)

        if event_type.upper() in ("PURCHASE_COMPLETED", "PAYMENT_SUCCESS", "PURCHASE"):
            self.experiment_service.record_outcome(session_id, True)

        session_input = session_state.to_session_input()

        # Run Multi-Agent Decision Pipeline
        result = self.pipeline.execute_pipeline(session_input)

        # Track cost
        self.ai_cost_tracker.record_decision(
            estimated_cost=result.get("estimated_cost", 0.0001),
            latency_ms=result.get("decision_latency_ms", 10.0),
            llm_calls=result.get("llm_calls", 0)
        )

        result["cart_value"] = session_input.cart_value
        result["events_count"] = len(session_state.events)
        result["decision_status"] = "APPROVED" if result.get("self_check_passed") else "REJECTED_SELF_CHECK"

        return result


_realtime_session_manager = None

def get_realtime_session_manager() -> RealtimeSessionManager:
    global _realtime_session_manager
    if _realtime_session_manager is None:
        _realtime_session_manager = RealtimeSessionManager()
    return _realtime_session_manager
