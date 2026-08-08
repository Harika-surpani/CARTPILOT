from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
from app.services.realtime_session import get_realtime_session_manager
from app.utils.logger import setup_logger

logger = setup_logger("websocket_routes")

router = APIRouter(tags=["Real-Time WebSocket Session Engine"])


@router.websocket("/ws/session/{session_id}")
async def websocket_session_endpoint(websocket: WebSocket, session_id: str):
    """
    WebSocket endpoint: /ws/session/{session_id}
    Receives real-time clickstream events from React frontend, updates session state,
    calculates features, predicts abandonment risk, applies Phase 5 guardrails & Phase 6 holdout,
    and returns real-time scoring to frontend.
    """
    await websocket.accept()
    session_manager = get_realtime_session_manager()
    logger.info(f"WebSocket client connected for session: {session_id}")

    try:
        while True:
            raw_data = await websocket.receive_text()
            try:
                event_data = json.loads(raw_data)
            except Exception as e:
                logger.warning(f"Invalid JSON received on WS for session {session_id}: {raw_data}")
                await websocket.send_json({"error": f"Invalid JSON payload: {str(e)}"})
                continue

            # Process event through real-time ML + Guardrail + Holdout pipeline
            result = session_manager.process_event(session_id, event_data)

            # Send back real-time inference result
            await websocket.send_json(result)

    except WebSocketDisconnect:
        logger.info(f"WebSocket client disconnected for session: {session_id}")
    except Exception as e:
        logger.exception(f"Unexpected error in WebSocket loop for session {session_id}: {e}")
        try:
            await websocket.send_json({"error": str(e)})
        except Exception:
            pass
