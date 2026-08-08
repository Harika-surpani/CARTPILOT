# CartRescue AI — Technical Architecture & System Design Document

---

## 1. System Architecture Diagram

```mermaid
graph TD
    User[E-Commerce Shopper] -->|Clickstream Events| Frontend[React 19 SPA Frontend]
    Frontend -->|HTTP REST| API[FastAPI Gateway Engine]
    Frontend -->|WebSockets /ws/session| WS[WebSocket Session Handler]

    subgraph Backend Core Engine
        WS --> Manager[RealtimeSessionManager]
        API --> RecService[RecommendationService]

        Manager --> Pipeline[MultiAgentPipeline]
        RecService --> Pipeline

        subgraph Multi-Agent Decision Layer
            Pipeline --> Agent1[1. RiskAgent - XGBoost ML]
            Pipeline --> Agent2[2. ReasonAgent - SHAP Intent]
            Pipeline --> Agent3[3. ActionAgent - Rule Mapping]
            Pipeline --> Agent4[4. PolicyAgent - Guardrails & Consent]
            Pipeline --> Agent5[5. SelfCheckAgent - 8-Point Safety]
        end

        Agent4 --> Guardrail[Phase 5 Business Guardrails Engine]
        Agent4 --> Consent[User Consent & DND Service]
        Agent4 --> Holdout[Phase 6 Holdout Experiment Service]
    end

    Agent5 --> Dispatcher[Notification Dispatcher]
    Agent5 --> Audit[Audit Service - logs/audit.log]
    Pipeline --> CostTracker[AI Cost & Latency Tracker]

    Dispatcher -->|Safe Demo / API| Channels[WhatsApp / Email / SMS]
    Audit --> Dashboard[Admin Analytics Dashboard]
    CostTracker --> Dashboard
```

---

## 2. AI Workflow Diagram

```mermaid
sequenceDiagram
    autonumber
    participant Client as React Storefront
    participant WS as WebSocket Server
    participant Pipeline as Multi-Agent Pipeline
    participant Risk as RiskAgent (XGBoost)
    participant Reason as ReasonAgent (SHAP)
    participant Policy as PolicyAgent (Guardrails+Consent)
    participant Safety as SelfCheckAgent (8-Point)
    participant Audit as Audit Service

    Client->>WS: Stream Event (ADD_TO_CART, ₹14,999)
    WS->>Pipeline: Execute Session Vector
    Pipeline->>Risk: predict_risk(15-Feature Vector)
    Risk-->>Pipeline: risk_score = 0.82, abandonment_prob = 0.82
    Pipeline->>Reason: explain_prediction(session, 0.82)
    Reason-->>Pipeline: intent = "Price Sensitive", top_signals
    Pipeline->>Policy: evaluate_guardrails + consent + holdout
    Policy-->>Pipeline: candidate = "OFFER_COUPON", margin = +₹3,149, channel = WHATSAPP
    Pipeline->>Safety: evaluate_self_check(8 rules)
    Safety-->>Pipeline: self_check_passed = True, final_action = "OFFER_COUPON"
    Pipeline->>Audit: log_decision(JSONL entry)
    Pipeline-->>WS: Return Decision JSON Payload (~11.4ms)
    WS-->>Client: Real-Time Score & Rescue Overlay Update
```

---

## 3. Data Flow Diagram

```mermaid
flowchart LR
    A[Clickstream Raw Events] -->|Aggregate| B[15-Feature Session Vector]
    B -->|Inference| C[XGBoost Probability Engine]
    C --> D{Abandonment Risk >= 0.40?}
    D -- No --> E[Final Action: DO_NOTHING]
    D -- Yes --> F[SHAP Feature Attribution]
    F --> G[Phase 5 Guardrail Margin Check]
    G --> H{Incremental Margin > 0 & Budget OK?}
    H -- No --> E
    H -- Yes --> I[Consent & DND Channel Check]
    I --> J{Eligible Channel Available?}
    J -- No --> E
    J -- Yes --> K[Phase 6 Holdout Check: 10% Control / 90% Treatment]
    K -- Control Group --> E
    K -- Treatment Group --> L[SelfCheckAgent 8-Point Matrix]
    L -- Pass --> M[Final Action: Executed Action]
    L -- Fail --> E
```

---

## 4. Decision Flow Diagram

```mermaid
graph TD
    Start([Session Input Event]) --> RiskCheck[RiskAgent Inactive Check]
    RiskCheck -->|Risk < 0.40| DoNothing1[DO_NOTHING - Low Risk]
    RiskCheck -->|Risk >= 0.40| ReasonCheck[ReasonAgent: Detect Intent]

    ReasonCheck --> ActionSelect[ActionAgent: Map Candidate Action]
    ActionSelect --> BudgetCheck{Phase 5: Under ₹500 Cap & Campaign Cap?}
    BudgetCheck -->|No| DoNothing2[DO_NOTHING - Budget Exceeded]

    BudgetCheck -->|Yes| MarginCheck{Phase 5: Incremental Margin > 0?}
    MarginCheck -->|No| DoNothing3[DO_NOTHING - Negative Margin]

    MarginCheck -->|Yes| ConsentCheck{Consent & DND Policy Check}
    ConsentCheck -->|Blocked / DND| DoNothing4[DO_NOTHING - Channel Blocked]

    ConsentCheck -->|Approved| HoldoutCheck{Phase 6 Holdout Assignment}
    HoldoutCheck -->|Control Group 10%| DoNothing5[DO_NOTHING - Holdout Control]

    HoldoutCheck -->|Treatment Group 90%| SafetyCheck{SelfCheckAgent 8-Point Matrix}
    SafetyCheck -->|Failed Check| DoNothing6[DO_NOTHING - Safety Rejection]
    SafetyCheck -->|Passed All 8 Checks| Execute[Execute Final Action]
```

---

## 5. System Component Breakdown

| Component | Class Name | Location | Responsibility |
| :--- | :--- | :--- | :--- |
| **API Gateway** | `FastAPI` | [`main.py`](file:///c:/Users/kalya/OneDrive/Desktop/CartPilot/CartPilot/phase3/app/main.py) | REST API routing, CORS middleware, startup model lifecycle management |
| **WebSocket Handler** | `websocket_session_endpoint` | [`websocket_routes.py`](file:///c:/Users/kalya/OneDrive/Desktop/CartPilot/CartPilot/phase3/app/api/websocket_routes.py) | Full-duplex JSON stream handling on `/ws/session/{session_id}` |
| **Session Manager** | `RealtimeSessionManager` | [`realtime_session.py`](file:///c:/Users/kalya/OneDrive/Desktop/CartPilot/CartPilot/phase3/app/services/realtime_session.py) | In-memory clickstream state tracking & feature vector compilation |
| **Risk Prediction** | `PredictionService` | [`prediction_service.py`](file:///c:/Users/kalya/OneDrive/Desktop/CartPilot/CartPilot/phase3/app/services/prediction_service.py) | Pre-trained XGBoost model loading & 15-feature inference |
| **Explanation Engine**| `ExplanationService` | [`explanation_service.py`](file:///c:/Users/kalya/OneDrive/Desktop/CartPilot/CartPilot/phase3/app/services/explanation_service.py) | SHAP feature importance extraction and human-readable intent mapping |
| **Guardrail Engine** | `BusinessGuardrailsEngine` | [`business_guardrails.py`](file:///c:/Users/kalya/OneDrive/Desktop/CartPilot/CartPilot/phase3/app/services/business_guardrails.py) | Per-user/campaign budget limits & expected incremental profit margin calculation |
| **Consent Engine** | `ConsentService` | [`consent_service.py`](file:///c:/Users/kalya/OneDrive/Desktop/CartPilot/CartPilot/phase3/app/services/consent_service.py) | WhatsApp ➔ Email ➔ SMS channel selection & DND blocking |
| **Holdout Engine** | `ExperimentService` | [`experiment_service.py`](file:///c:/Users/kalya/OneDrive/Desktop/CartPilot/CartPilot/phase3/app/services/experiment_service.py) | 10% Control / 90% Treatment reproducible holdout assignment (`random_state=42`) |
| **Safety Agent** | `SelfCheckAgent` | [`self_check_agent.py`](file:///c:/Users/kalya/OneDrive/Desktop/CartPilot/CartPilot/phase3/app/services/self_check_agent.py) | 8-point deterministic safety verification & fallback enforcement |
| **Cost Tracker** | `AICostTracker` | [`ai_cost_tracker.py`](file:///c:/Users/kalya/OneDrive/Desktop/CartPilot/CartPilot/phase3/app/services/ai_cost_tracker.py) | Tracks decision latency, micro-cost ($0.0001), and zero-LLM decision ratio |
| **Audit Log Service** | `AuditService` | [`audit_service.py`](file:///c:/Users/kalya/OneDrive/Desktop/CartPilot/CartPilot/phase3/app/services/audit_service.py) | Appends decision records to JSONL file `logs/audit.log` |

---

## 6. Business Guardrail & Margin Logic

Phase 5 evaluates expected incremental profit before authorizing monetary incentives:

$$\text{Expected Incremental Margin} = (\text{Recovery Prob} \times \text{Cart Value} \times \text{Profit Margin}) - \text{Discount Cost}$$

Where:
- $\text{Recovery Prob} = \text{Risk Score} \times 0.50$
- $\text{Profit Margin} = 30\%$ (configurable in `BusinessConfig`)
- $\text{Discount Cost} = 10\%$ of Cart Value for `OFFER_COUPON`, ₹100 for `OFFER_FREE_SHIPPING`, ₹0 for `SEND_REMINDER`/`RETRY_PAYMENT`/`DO_NOTHING`.

If $\text{Expected Incremental Margin} < 0$, the action is automatically downgraded to **`DO_NOTHING`**.

---

## 7. Holdout Experiment Methodology (Phase 6)

Traffic is assigned to experiment groups using a deterministic hash of the session ID:
- **Control Group (10%)**: Interventions are suppressed (`DO_NOTHING`).
- **Treatment Group (90%)**: Interventions are executed normally.

Key metrics calculated:
- $\text{Control Conversion Rate} = \frac{\text{Control Conversions}}{\text{Control Sessions}}$
- $\text{Treatment Conversion Rate} = \frac{\text{Treatment Conversions}}{\text{Treatment Sessions}}$
- $\text{Incremental Lift} = \text{Treatment Conversion Rate} - \text{Control Conversion Rate}$
- $\text{Incremental Margin} = (\text{Treatment Conversions} \times \text{Avg Cart Value} \times \text{Margin}) - \text{Total Discount Cost} - \text{Control Baseline Revenue}$
