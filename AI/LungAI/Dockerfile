# Dockerfile for LungAI Gradio Service
# Optimised for Render Free Tier (512 MB RAM limit)

FROM python:3.11-slim

WORKDIR /app/lungai

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Install CPU-only PyTorch first to avoid CUDA wheel resolution
RUN pip install --no-cache-dir \
    torch==2.1.0 \
    torchvision==0.16.0 \
    --index-url https://download.pytorch.org/whl/cpu

# Install remaining dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy app source
COPY . .

# Gradio env vars — ensure it binds correctly on Render
ENV GRADIO_SERVER_NAME="0.0.0.0"
ENV GRADIO_ANALYTICS_ENABLED="False"

EXPOSE 7860

# Render injects $PORT; app.py reads it via os.environ.get("PORT", 7860)
CMD ["python", "app.py"]
