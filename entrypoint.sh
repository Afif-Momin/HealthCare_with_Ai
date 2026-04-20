#!/bin/sh
# ──────────────────────────────────────────────────────────────
# HealthCare_with_Ai — Entrypoint
# Starts all four services in the background then waits.
# ──────────────────────────────────────────────────────────────

echo "🚀 Starting HealthCare AI Platform..."

# 1. Spring Boot Backend (port 8080)
echo "  → Spring Boot on :8080"
java -jar /app/backend/app.jar &

# 2. FastAPI AI Server (port 8000)
echo "  → FastAPI on :8000"
cd /app/fastapi_server && uvicorn main:app --host 0.0.0.0 --port 8000 &

# 3. LungAI Gradio App (port 7860)
echo "  → LungAI Gradio on :7860"
cd /app/lungai && python app.py &

# 4. React Frontend — served by `serve` (port 3000)
echo "  → React frontend on :3000"
serve -s /app/frontend/dist -l 3000 &

# Wait for all background processes
wait
