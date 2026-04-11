# Medical AI FastAPI Server

A production-ready FastAPI server providing REST API endpoints for medical AI models.

## 🏥 Available Models

### 1. Retinal Disease Detection
- **Model**: ResNet50 (PyTorch)
- **Endpoint**: `POST /api/v1/retinal-disease/predict`
- **Input**: Eye fundus image (JPEG/PNG)
- **Detects**: 
  - Diabetic Retinopathy
  - Age-related Macular Degeneration
  - Glaucoma indicators
  - And 40+ other conditions

### 2. Skin Cancer Classification
- **Model**: EfficientNetB3 (TensorFlow)
- **Endpoint**: `POST /api/v1/skin-cancer/predict`
- **Input**: Skin lesion image (JPEG/PNG)
- **Classifies**:
  - Melanoma (MEL)
  - Basal Cell Carcinoma (BCC)
  - Squamous Cell Carcinoma (SCC)
  - Melanocytic Nevus (NV)
  - And more...

### 3. Skin Lesions Detection
- **Model**: DenseNet201 (TensorFlow)
- **Endpoint**: `POST /api/v1/skin-lesions/predict`
- **Input**: Skin lesion image (JPEG/PNG)
- **Dataset**: HAM10000
- **Accuracy**: 87.7% on test set

### 4. Parkinson Speech Detection
- **Model**: DeepSpeech + Feature Analysis
- **Endpoint**: `POST /api/v1/parkinson/predict`
- **Input**: Audio file (WAV/MP3/OGG)
- **Analyzes**:
  - Voice jitter and shimmer
  - Pitch stability
  - Speech patterns

## 🚀 Quick Start

### Installation

```bash
# Navigate to the FastAPI server directory
cd AI/fastapi_server

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Running the Server

```bash
# Development mode with auto-reload
python main.py

# Or using uvicorn directly
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📡 API Usage Examples

### Retinal Disease Detection

```bash
curl -X POST "http://localhost:8000/api/v1/retinal-disease/predict" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@eye_image.jpg"
```

### Skin Cancer Classification

```bash
curl -X POST "http://localhost:8000/api/v1/skin-cancer/predict" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@skin_lesion.jpg"
```

### Skin Lesions Detection

```bash
curl -X POST "http://localhost:8000/api/v1/skin-lesions/predict" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@lesion_image.jpg"
```

### Parkinson Speech Detection

```bash
curl -X POST "http://localhost:8000/api/v1/parkinson/predict" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@speech_sample.wav"
```

## 📁 Project Structure

```
fastapi_server/
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── README.md              # This file
└── services/
    ├── __init__.py
    ├── retinal_disease_service.py   # Retinal disease detection
    ├── skin_cancer_service.py       # Skin cancer classification
    ├── skin_lesions_service.py      # Skin lesions detection
    └── parkinson_service.py         # Parkinson speech analysis
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `HOST` | Server host | `0.0.0.0` |
| `PORT` | Server port | `8000` |
| `LOG_LEVEL` | Logging level | `info` |

### CORS Configuration

By default, CORS is enabled for all origins. Modify `main.py` to restrict origins for production.

## 📊 Response Format

All endpoints return JSON responses in this format:

```json
{
  "success": true,
  "model": "Model Name",
  "predictions": {
    // Model-specific predictions
  }
}
```

## ⚠️ Important Notes

1. **Medical Disclaimer**: These AI models are for research and screening purposes only. They are NOT a replacement for professional medical diagnosis.

2. **Model Weights**: Pre-trained model weights should be placed in their respective directories:
   - Retinal: `AI/Retinal-Disease-Detection/models/`
   - Skin Cancer: `AI/Skin-Cancer-Classification-using-Deep-Learning/Src/saveModel/`
   - Skin Lesions: `AI/Skin-Lesions-Detection-Deep-learning/models/`

3. **GPU Support**: For faster inference, ensure CUDA is properly configured for both PyTorch and TensorFlow models.

## 🧪 Testing

```bash
# Run tests
pytest tests/

# Test health endpoint
curl http://localhost:8000/health
```

## 📜 License

This project is part of the InnovAItion-2026 medical AI initiative.
