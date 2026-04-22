# ╔══════════════════════════════════════════════════════════════════╗
# ║  ROOT DOCKERFILE — LOCAL DEVELOPMENT ONLY                      ║
# ║                                                                ║
# ║  This monolith Dockerfile runs all 4 services in one container ║
# ║  for local testing. DO NOT use for Render deployment.          ║
# ║                                                                ║
# ║  FOR RENDER DEPLOYMENT: see render.yaml in this directory.     ║
# ║  Each service has its own Dockerfile:                          ║
# ║    BackEnd/Dockerfile              → Spring Boot               ║
# ║    AI/fastapi_server/Dockerfile    → FastAPI AI Server         ║
# ║    AI/LungAI/Dockerfile            → LungAI Gradio             ║
# ║    FrontEnd/Dockerfile             → React (local only)        ║
# ╚══════════════════════════════════════════════════════════════════╝

# ----------- Build Frontend -----------
FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY FrontEnd/package.json FrontEnd/package-lock.json ./
RUN npm ci --prefer-offline
COPY FrontEnd/ ./
RUN npm run build

# ----------- Build Backend (Spring Boot) -----------
FROM maven:3.9.5-eclipse-temurin-17 AS backend-build
WORKDIR /backend
COPY BackEnd/pom.xml ./
RUN mvn dependency:go-offline -B
COPY BackEnd/src ./src
RUN mvn clean package -DskipTests -q

# ----------- Build FastAPI AI Server -----------
FROM python:3.11-slim AS fastapi-build
WORKDIR /fastapi_server
RUN apt-get update && apt-get install -y --no-install-recommends libsndfile1 libgomp1 gcc g++ \
    && rm -rf /var/lib/apt/lists/*
COPY AI/fastapi_server/requirements.txt ./
RUN pip install --no-cache-dir \
    torch==2.1.0 torchvision==0.16.0 \
    --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt
COPY AI/fastapi_server/ ./

# ----------- Build LungAI (Gradio) -----------
FROM python:3.11-slim AS lungai-build
WORKDIR /lungai
RUN apt-get update && apt-get install -y --no-install-recommends libgomp1 \
    && rm -rf /var/lib/apt/lists/*
COPY AI/LungAI/requirements.txt ./
RUN pip install --no-cache-dir \
    torch==2.1.0 torchvision==0.16.0 \
    --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt
COPY AI/LungAI/ ./

# ----------- Runtime Image (LOCAL ONLY) -----------
FROM eclipse-temurin:17-jre-alpine AS runtime

# Install Python and Node for running all services
RUN apk add --no-cache python3 py3-pip nodejs npm \
    && npm install -g serve

# Backend
WORKDIR /app/backend
COPY --from=backend-build /backend/target/*.jar app.jar

# FastAPI
WORKDIR /app/fastapi_server
COPY --from=fastapi-build /fastapi_server/ .
COPY --from=fastapi-build /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=fastapi-build /usr/local/bin/uvicorn /usr/local/bin/uvicorn

# LungAI
WORKDIR /app/lungai
COPY --from=lungai-build /lungai/ .

# Frontend
WORKDIR /app/frontend
COPY --from=frontend-build /frontend/dist ./dist

# Expose all service ports
EXPOSE 3000 8000 7860 8080

# Entrypoint
WORKDIR /app
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]
