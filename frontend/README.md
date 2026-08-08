# CartPilot AI Cart Rescue Platform — Frontend MVP

Welcome to the **Frontend MVP** of the **CartPilot AI Cart Rescue Platform**. 

This production-ready React application simulates an enterprise e-commerce customer journey, streams real-time clickstream events, evaluates cart abandonment risk using the Phase 3 FastAPI microservice (`/predict` & `/recommend`), displays color-coded risk gauges, and provides executive business analytics.

---

## 📁 Architecture & Technologies

- **Core Framework**: React 18 / 19 with TypeScript & Vite
- **Styling**: Tailwind CSS v3 with Glassmorphism SaaS dark theme
- **Routing**: React Router v6
- **State Management**: React Context API (`CartSessionContext`) managing clickstream events, cart state, AI prediction responses, and telemetry
- **API Integration**: Axios client targeting Phase 3 FastAPI backend (`http://localhost:8000`) with an intelligent demo fallback engine
- **Visualizations**: Recharts for business metrics (Area, Bar, Pie, Line charts)
- **Icons**: Lucide React Icons
- **Forms**: React Hook Form

---

## 🔌 Integrated Phase 3 Backend Endpoints

The frontend consumes all 5 Phase 3 FastAPI endpoints:

| Endpoint | Method | Purpose in Frontend |
| :--- | :---: | :--- |
| `/health` | `GET` | Live system status pulse badge in Navbar |
| `/predict` | `POST` | Calculates real-time abandonment & purchase probabilities |
| `/recommend` | `POST` | Full AI pipeline: risk score, reason detection, single rescue action & top features |
| `/session/{id}` | `GET` | Deep-dive session audit lookup in Session Details page |
| `/metrics` | `GET` | Executive KPI cards and charts in Business Dashboard |

---

## 🚀 How to Run locally

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build Production Bundle
```bash
npm run build
```

---

## 📄 Key Pages Overview

1. **Home (`/`)**: Landing page showcasing platform capabilities, pipeline architecture, and ROI statistics.
2. **Shop (`/shop`)**: E-commerce catalog simulating shopping sessions, product views, and cart actions.
3. **Checkout (`/checkout`)**: Multi-step checkout form triggering live FastAPI `/predict` and `/recommend` APIs with an animated AI inference calculation modal.
4. **Live AI Panel (`/live-ai`)**: Color-coded risk meter (Green/Yellow/Red), feature importances list, reason heuristics, and recommended action.
5. **Business Dashboard (`/dashboard`)**: Executive KPI cards with interactive Recharts visualizations.
6. **Session Details (`/session-details`)**: Deep-dive session inspector with vertical clickstream event timeline and decision audit logs.
7. **Notification Demo (`/notification-demo`)**: Omnichannel simulator showing popups, email previews, SMS, and WhatsApp messages for the AI recommendation.
8. **Admin Analytics (`/analytics`)**: Phase 2 ML performance dashboard with Confusion Matrix metrics, ROC Curve stats, feature importances, and model comparison.
