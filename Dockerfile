# ─────────────────────────────────────────────────────────────────────────────
# HealthCare_with_Ai — Multi-Service Dockerfile
# Services:  Frontend (React/Vite → nginx)
#            Backend  (Spring Boot JAR → Java 17)
#            FastAPI  (Python AI server)
#            LungAI   (Gradio app)
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Build React Frontend ───────────────────────────────────────────
FROM node:20-alpine AS frontend-build

WORKDIR /frontend
# Copy manifests first for layer-cache efficiency
COPY FrontEnd/package*.json ./
RUN npm install --legacy-peer-deps
COPY FrontEnd/ ./
# Build to /frontend/dist
RUN npm run build

# ── Stage 2: Build Spring Boot Backend ──────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-17 AS backend-build

WORKDIR /backend
# Download dependencies first (cached layer unless pom.xml changes)
COPY BackEnd/pom.xml ./
RUN mvn dependency:go-offline -B

COPY BackEnd/src ./src
RUN mvn clean package -DskipTests -B

# ── Stage 3: Final Runtime Image ─────────────────────────────────────────────
# Use a Python-based image so we can run FastAPI + Gradio WITHOUT a second
# process manager. Java 17 is installed on top.
FROM python:3.11-slim AS runtime

# ── Java 17 ──────────────────────────────────────────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
        openjdk-17-jre-headless \
        nodejs npm curl wget \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# ── Install `serve` globally for the static React build ──────────────────────
RUN npm install -g serve

# ── FastAPI dependencies ──────────────────────────────────────────────────────
WORKDIR /app/fastapi_server
COPY AI/fastapi_server/requirements.txt ./
# Use --no-cache-dir and split torch/tf for better layer caching
RUN pip install --no-cache-dir \
        fastapi>=0.104.0 \
        "uvicorn[standard]>=0.24.0" \
        python-multipart>=0.0.6 \
        Pillow>=10.0.0 \
        numpy>=1.24.0 \
        pandas>=2.0.0 \
        scipy>=1.11.0 \
        scikit-learn>=1.3.0 \
        python-jose>=3.3.0 \
        pydantic>=2.0.0 \
        pydantic-settings>=2.0.0 \
        httpx>=0.24.0 \
        joblib>=1.3.0 \
        timm>=0.9.0 \
    && pip install --no-cache-dir \
        "torch>=2.0.0" torchvision>=0.15.0 \
        librosa>=0.10.0 soundfile>=0.12.0 \
        opencv-python-headless>=4.8.0

COPY AI/fastapi_server/ ./

# ── LungAI (Gradio) dependencies ─────────────────────────────────────────────
WORKDIR /app/lungai
COPY AI/LungAI/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY AI/LungAI/ ./

# ── Spring Boot JAR ───────────────────────────────────────────────────────────
WORKDIR /app/backend
COPY --from=backend-build /backend/target/*.jar app.jar

# ── React Static Build ────────────────────────────────────────────────────────
WORKDIR /app/frontend
COPY --from=frontend-build /frontend/dist ./dist

# ── Entrypoint ────────────────────────────────────────────────────────────────
WORKDIR /app
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

# Ports: 3000 = React frontend | 8080 = Spring Boot | 8000 = FastAPI | 7860 = Gradio
EXPOSE 3000 8080 8000 7860

ENTRYPOINT ["/app/entrypoint.sh"]
