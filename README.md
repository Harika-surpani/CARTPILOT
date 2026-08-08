# CartPilot AI Cart Rescue Platform

## Project Overview

CartPilot is an AI-powered cart abandonment rescue platform that combines:

- A **React + TypeScript + Vite frontend** (`frontend/`) for shopping session simulation, risk dashboards, and AI-driven recommendations.
- A **FastAPI backend** (`phase3/`) that exposes `/health`, `/predict`, `/recommend`, `/session/{id}`, and `/metrics` endpoints.
- A **Phase 2 pipeline** (`phase2/`) for data preprocessing, feature engineering, model training, and artifact generation.

The frontend can run in demo fallback mode when the backend is offline, while the backend uses a Phase 2-trained model and produces real-time abandonment risk predictions and recommendation actions.

## Repository Structure

- `frontend/` - React app with Vite, Tailwind, Recharts, and Axios integration.
- `phase3/` - FastAPI backend service with predictive recommendation engine.
- `phase2/` - ML pipeline for preprocessing, feature engineering, and training.
- `app/`, `src/`, `data/`, `models/`, `tests/` - supporting project files and utilities.

## What I have done

- Reviewed the frontend and backend configuration files.
- Confirmed frontend run commands and backend dependency requirements.
- Identified the correct backend test invocation.
- Added a top-level README with usage and git push instructions.

## Frontend Setup

1. Open a terminal in the frontend folder:

```bash
cd "c:\Users\HP\Downloads\Telegram Desktop\CartPilot\CartPilot\frontend"
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open the app:

- `http://localhost:3000`

5. Build for production:

```bash
npm run build
```

6. Preview the production build:

```bash
npm run preview
```

## Backend Setup

1. Open a terminal in the backend folder:

```bash
cd "c:\Users\HP\Downloads\Telegram Desktop\CartPilot\CartPilot\phase3"
```

2. Install Python dependencies:

```bash
python -m pip install -r requirements.txt
```

3. Run the FastAPI server:

```bash
python app/main.py
```

Or with uvicorn:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

4. Open API docs:

- `http://localhost:8000/docs`

## Backend Testing

1. In `phase3/` run:

```bash
python -m pytest tests/test_api.py
```

2. To run all backend tests:

```bash
python -m pytest
```

## Notes

- The frontend uses `http://localhost:8000` by default for backend calls.
- If the backend is offline, the frontend uses a demo fallback engine in `frontend/src/services/api.ts`.
- Backend dependencies include `fastapi`, `uvicorn`, `pydantic`, `joblib`, `pandas`, `numpy`, `scikit-learn`, `xgboost`, `shap`, `httpx`, and `pytest`.

## Git commit and push steps

1. Verify your remote repository is configured:

```bash
git remote -v
```

2. Add the README and any updated files:

```bash
git add README.md
git add .
```

3. Commit your changes:

```bash
git commit -m "Add top-level README and document frontend/backend run instructions"
```

4. Push to GitHub:

```bash
git push -u origin main
```

If your branch is `master` instead of `main`:

```bash
git push -u origin master
```
