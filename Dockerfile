# ─────────────────────────────────────────────────────────────────────────────
# HealthCare_with_Ai — Multi-Service Dockerfile
# Services:  Frontend (React/Vite → served by `serve`)
#            Backend  (Spring Boot JAR, Java 17)
#            FastAPI  (Python 3.11 AI server)
#            LungAI   (Gradio app)
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Build React Frontend ────────────────────────────────────────────
FROM node:20-alpine AS frontend-build

WORKDIR /frontend
COPY FrontEnd/package*.json ./
RUN npm install --legacy-peer-deps
COPY FrontEnd/ ./
RUN npm run build

# ── Stage 2: Build Spring Boot Backend ───────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-17 AS backend-build

WORKDIR /backend
COPY BackEnd/pom.xml ./
RUN mvn dependency:go-offline -B
COPY BackEnd/src ./src
RUN mvn clean package -DskipTests -B

# ── Stage 3: Java 17 JRE provider ────────────────────────────────────────────
# Used only as a copy source — avoids apt package availability issues
FROM eclipse-temurin:17-jre-jammy AS jre-provider

# ── Stage 4: Final Runtime Image ─────────────────────────────────────────────
# python:3.11-slim (Debian Bookworm) — Python is native here
FROM python:3.11-slim AS runtime

# Copy Java 17 JRE from the official Temurin image (no apt needed)
COPY --from=jre-provider /opt/java/openjdk /opt/java/openjdk
ENV JAVA_HOME=/opt/java/openjdk
ENV PATH="${JAVA_HOME}/bin:${PATH}"

# Install Node 20 + npm via NodeSource (for `serve` static file server)
RUN apt-get update && apt-get install -y --no-install-recommends \
        curl wget ca-certificates gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install `serve` globally
RUN npm install -g serve

# ── FastAPI: install dependencies ─────────────────────────────────────────────
WORKDIR /app/fastapi_server
COPY AI/fastapi_server/requirements.txt ./

# Install lighter deps first (cached unless requirements.txt changes)
RUN pip install --no-cache-dir \
        "fastapi>=0.104.0" \
        "uvicorn[standard]>=0.24.0" \
        "python-multipart>=0.0.6" \
        "Pillow>=10.0.0" \
        "numpy>=1.24.0" \
        "pandas>=2.0.0" \
        "scipy>=1.11.0" \
        "scikit-learn>=1.3.0" \
        "python-jose>=3.3.0" \
        "pydantic>=2.0.0" \
        "pydantic-settings>=2.0.0" \
        "httpx>=0.24.0" \
        "joblib>=1.3.0" \
        "timm>=0.9.0" \
        "soundfile>=0.12.0" \
        "librosa>=0.10.0" \
        "opencv-python-headless>=4.8.0"

# Heavy ML frameworks in a separate layer
RUN pip install --no-cache-dir \
        "torch>=2.0.0" \
        "torchvision>=0.15.0"

COPY AI/fastapi_server/ ./

# ── LungAI (Gradio) ───────────────────────────────────────────────────────────
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

# 3000 = React  |  8080 = Spring Boot  |  8000 = FastAPI  |  7860 = Gradio
EXPOSE 3000 8080 8000 7860

ENTRYPOINT ["/app/entrypoint.sh"]
