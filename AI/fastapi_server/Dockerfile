# Dockerfile for FastAPI Medical AI Server
# Optimised for Render Free Tier (512 MB RAM limit)
# Key optimisations:
#   - CPU-only PyTorch (torch+cpu index) — saves ~600 MB vs default CUDA build
#   - TensorFlow REMOVED — saves ~700 MB (TF services use mock predictions)
#   - opencv-python-headless — no X11/display server needed in container
#   - python:3.11-slim base — minimal OS layer

# -------- Stage 1: Build / install deps --------
FROM python:3.11-slim AS builder

WORKDIR /install

# System libs needed by librosa / soundfile / opencv-headless
RUN apt-get update && apt-get install -y --no-install-recommends \
    libsndfile1 \
    libgomp1 \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Install CPU-only torch first from PyTorch's dedicated CPU index
# (prevents pip from resolving the ~2 GB CUDA wheel)
RUN pip install --no-cache-dir \
    torch==2.1.0 \
    torchvision==0.16.0 \
    --index-url https://download.pytorch.org/whl/cpu

# Install the rest of the dependencies
RUN pip install --no-cache-dir \
    --extra-index-url https://download.pytorch.org/whl/cpu \
    -r requirements.txt

# -------- Stage 2: Lean runtime image --------
FROM python:3.11-slim

WORKDIR /app/fastapi_server

# Runtime system libs only
RUN apt-get update && apt-get install -y --no-install-recommends \
    libsndfile1 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy installed packages from builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy app source
COPY . .

EXPOSE 8000

# Render injects $PORT; fall back to 8000 for local dev
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1 --loop asyncio
