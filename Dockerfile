# Dockerfile for HealthCare_with_Ai (Monorepo)
# Multi-service: Frontend (React/Vite), Backend (Spring Boot), FastAPI AI Server, LungAI (Gradio)

# ----------- Build Frontend -----------
FROM node:20 AS frontend-build
WORKDIR /frontend
COPY FrontEnd/package.json FrontEnd/package-lock.json ./
RUN npm ci
COPY FrontEnd/ ./
RUN npm run build

# ----------- Build Backend (Spring Boot) -----------
FROM maven:3.9.5-eclipse-temurin-17 AS backend-build
WORKDIR /backend
COPY BackEnd/pom.xml ./
RUN mvn dependency:go-offline -B
COPY BackEnd/src ./src
RUN mvn clean package -DskipTests

# ----------- Build FastAPI AI Server -----------
FROM python:3.11-slim AS fastapi-build
WORKDIR /fastapi_server
COPY AI/fastapi_server/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY AI/fastapi_server/ ./

# ----------- Build LungAI (Gradio) -----------
FROM python:3.11-slim AS lungai-build
WORKDIR /lungai
COPY AI/LungAI/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY AI/LungAI/ ./

# ----------- Runtime Image -----------
FROM eclipse-temurin:21-jdk-alpine AS runtime

# Backend
WORKDIR /app/backend
COPY --from=backend-build /backend/target/*.jar app.jar

# FastAPI
WORKDIR /app/fastapi_server
COPY --from=fastapi-build /fastapi_server/ .

# LungAI
WORKDIR /app/lungai
COPY --from=lungai-build /lungai/ .

# Frontend
WORKDIR /app/frontend
COPY --from=frontend-build /frontend/dist ./dist

# Expose ports
EXPOSE 3000 8000 7860 8080

# Entrypoint script
WORKDIR /app
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]
