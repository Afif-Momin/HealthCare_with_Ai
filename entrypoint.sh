#!/bin/sh
# Entrypoint for HealthCare_with_Ai monorepo Docker image
# Starts all services: Backend (Spring Boot), FastAPI, LungAI, and Frontend

# Start Backend (Spring Boot)
java -jar /app/backend/app.jar &

# Start FastAPI server
uvicorn main:app --host 0.0.0.0 --port 8000 --app-dir /app/fastapi_server &

# Start LungAI (Gradio)
python /app/lungai/app.py &

# Start Frontend (Vite preview server)
npx serve -s /app/frontend/dist -l 3000 &

wait
