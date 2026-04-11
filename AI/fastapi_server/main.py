"""
FastAPI Server for Medical AI Models
====================================
This server provides REST API endpoints for the following AI models:
1. Retinal Disease Detection (ResNet50 - PyTorch)
2. Skin Cancer Classification (EfficientNet - TensorFlow)
3. Skin Lesions Detection (DenseNet - TensorFlow)
4. Parkinson Speech Detection (DeepSpeech)
"""

import os
import sys
import uuid
from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn
from typing import Optional, Dict, Any
import tempfile
import shutil

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

app = FastAPI(
    title="Medical AI API",
    description="REST API for Medical AI Models - Retinal Disease, Skin Cancer, Skin Lesions, and Parkinson Detection",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# No-Cache Middleware to prevent caching of sensitive medical data results
@app.middleware("http")
async def add_no_cache_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

# Import model services
from services.retinal_disease_service import RetinalDiseaseService
from services.skin_cancer_service import SkinCancerService
from services.skin_lesions_service import SkinLesionsService
from services.parkinson_service import ParkinsonService
from services.gastro_service import GastroService
from services.lung_cancer_service import LungCancerService
from services.thyroid_service import ThyroidService
from services.retfound_service import RetFoundService

# Initialize services (lazy loading)
retinal_service = None
skin_cancer_service = None
skin_lesions_service = None
parkinson_service = None
gastro_service = None
lung_cancer_service = None
thyroid_service = None
retfound_service = None


def get_retinal_service():
    global retinal_service
    if retinal_service is None:
        retinal_service = RetinalDiseaseService()
    return retinal_service


def get_skin_cancer_service():
    global skin_cancer_service
    if skin_cancer_service is None:
        skin_cancer_service = SkinCancerService()
    return skin_cancer_service


def get_skin_lesions_service():
    global skin_lesions_service
    if skin_lesions_service is None:
        skin_lesions_service = SkinLesionsService()
    return skin_lesions_service


def get_parkinson_service():
    global parkinson_service
    if parkinson_service is None:
        parkinson_service = ParkinsonService()
    return parkinson_service


def get_gastro_service():
    global gastro_service
    if gastro_service is None:
        gastro_service = GastroService()
    return gastro_service


def get_lung_cancer_service():
    global lung_cancer_service
    if lung_cancer_service is None:
        lung_cancer_service = LungCancerService()
    return lung_cancer_service


def get_thyroid_service():
    global thyroid_service
    if thyroid_service is None:
        thyroid_service = ThyroidService()
    return thyroid_service


def get_retfound_service():
    global retfound_service
    if retfound_service is None:
        retfound_service = RetFoundService()
    return retfound_service


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "Medical AI API is running",
        "version": "2.1.0",
        "endpoints": {
            "retinal_disease": "/api/v1/retinal-disease/predict",
            "skin_cancer": "/api/v1/skin-cancer/predict",
            "skin_lesions": "/api/v1/skin-lesions/predict",
            "parkinson": "/api/v1/parkinson/predict",
            "gastro": "/api/v1/gastro/predict",
            "lung_cancer": "/api/v1/lung-cancer/predict",
            "thyroid": "/api/v1/thyroid/predict",
            "retfound": "/api/v1/retfound/predict"
        }
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "services": {
            "retinal_disease": "available",
            "skin_cancer": "available",
            "skin_lesions": "available",
            "parkinson": "available",
            "gastro": "available",
            "lung_cancer": "available",
            "thyroid": "available",
            "retfound": "available"
        }
    }


# ==================== Retinal Disease Detection ====================
@app.post("/api/v1/retinal-disease/predict")
async def predict_retinal_disease(files: list[UploadFile] = File(...)):
    """
    Predict retinal diseases from multiple eye fundus images (Batch).
    
    Args:
        files: List of image files (JPEG, PNG)
    
    Returns:
        JSON with list of results for each file
    """
    results = []
    service = get_retinal_service()
    
    for file in files:
        if not file.content_type.startswith("image/"):
            results.append({
                "filename": file.filename,
                "status": "error",
                "error": "File must be an image"
            })
            continue
        
        tmp_path = None
        try:
            # Reset file cursor
            await file.seek(0)
            contents = await file.read()
            
            # Save temp file
            suffix = os.path.splitext(file.filename)[1] or ".jpg"
            tmp_path = os.path.join(tempfile.gettempdir(), f"retinal_{uuid.uuid4().hex}{suffix}")
            
            with open(tmp_path, "wb") as tmp:
                tmp.write(contents)
            
            # Predict
            prediction = service.predict(tmp_path)
            
            results.append({
                "filename": file.filename,
                "status": "success",
                "predictions": prediction
            })
            
        except Exception as e:
            results.append({
                "filename": file.filename,
                "status": "error",
                "error": str(e)
            })
        finally:
            if tmp_path and os.path.exists(tmp_path):
                try:
                    os.unlink(tmp_path)
                except:
                    pass
    
    return JSONResponse(content={
        "success": True,
        "model": "Retinal Disease Detection (ResNet50)",
        "results": results
    })


# ==================== Skin Cancer Classification ====================
@app.post("/api/v1/skin-cancer/predict")
async def predict_skin_cancer(files: list[UploadFile] = File(...)):
    """
    Classify multiple skin lesion images (Batch).
    
    Args:
        files: List of skin lesion image files
    
    Returns:
        JSON with list of classification results
    """
    results = []
    service = get_skin_cancer_service()
    
    for file in files:
        if not file.content_type.startswith("image/"):
            results.append({
                "filename": file.filename,
                "status": "error",
                "error": "File must be an image"
            })
            continue
        
        tmp_path = None
        try:
            await file.seek(0)
            contents = await file.read()
            
            suffix = os.path.splitext(file.filename)[1] or ".jpg"
            tmp_path = os.path.join(tempfile.gettempdir(), f"skin_cancer_{uuid.uuid4().hex}{suffix}")
            
            with open(tmp_path, "wb") as tmp:
                tmp.write(contents)
            
            prediction = service.predict(tmp_path)
            
            results.append({
                "filename": file.filename,
                "status": "success",
                "predictions": prediction
            })
            
        except Exception as e:
            results.append({
                "filename": file.filename,
                "status": "error",
                "error": str(e)
            })
        finally:
            if tmp_path and os.path.exists(tmp_path):
                try:
                    os.unlink(tmp_path)
                except:
                    pass
                    
    return JSONResponse(content={
        "success": True,
        "model": "Skin Cancer Classification (EfficientNet)",
        "results": results
    })


# ==================== Skin Lesions Detection ====================
@app.post("/api/v1/skin-lesions/predict")
async def predict_skin_lesions(files: list[UploadFile] = File(...)):
    """
    Detect and classify multiple skin lesions (Batch).
    
    Args:
        files: List of skin lesion image files
    
    Returns:
        JSON with list of classification results
    """
    results = []
    service = get_skin_lesions_service()
    
    for file in files:
        if not file.content_type.startswith("image/"):
            results.append({
                "filename": file.filename,
                "status": "error",
                "error": "File must be an image"
            })
            continue
        
        tmp_path = None
        try:
            await file.seek(0)
            contents = await file.read()
            
            suffix = os.path.splitext(file.filename)[1] or ".jpg"
            tmp_path = os.path.join(tempfile.gettempdir(), f"skin_lesions_{uuid.uuid4().hex}{suffix}")
            
            with open(tmp_path, "wb") as tmp:
                tmp.write(contents)
            
            prediction = service.predict(tmp_path)
            
            results.append({
                "filename": file.filename,
                "status": "success",
                "predictions": prediction
            })
            
        except Exception as e:
            results.append({
                "filename": file.filename,
                "status": "error",
                "error": str(e)
            })
        finally:
            if tmp_path and os.path.exists(tmp_path):
                try:
                    os.unlink(tmp_path)
                except:
                    pass
                    
    return JSONResponse(content={
        "success": True,
        "model": "Skin Lesions Detection (DenseNet/InceptionV3 Ensemble)",
        "results": results
    })


# ==================== Parkinson Speech Detection ====================
@app.post("/api/v1/parkinson/predict")
async def predict_parkinson(files: list[UploadFile] = File(...)):
    """
    Detect Parkinson's disease from multiple audio files (Batch).
    
    Args:
        files: List of audio files (WAV, MP3, OGG)
    
    Returns:
        JSON with list of detection results
    """
    results = []
    service = get_parkinson_service()
    
    for file in files:
        if not file.content_type.startswith("audio/") and not file.filename.endswith(('.wav', '.mp3', '.ogg')):
            results.append({
                "filename": file.filename,
                "status": "error",
                "error": "File must be an audio file (WAV, MP3, OGG)"
            })
            continue
        
        tmp_path = None
        try:
            await file.seek(0)
            contents = await file.read()
            
            suffix = os.path.splitext(file.filename)[1] or ".wav"
            tmp_path = os.path.join(tempfile.gettempdir(), f"parkinson_{uuid.uuid4().hex}{suffix}")
            
            with open(tmp_path, "wb") as tmp:
                tmp.write(contents)
            
            prediction = service.predict(tmp_path)
            
            results.append({
                "filename": file.filename,
                "status": "success",
                "predictions": prediction
            })
            
        except Exception as e:
            results.append({
                "filename": file.filename,
                "status": "error",
                "error": str(e)
            })
        finally:
            if tmp_path and os.path.exists(tmp_path):
                try:
                    os.unlink(tmp_path)
                except:
                    pass
                    
    return JSONResponse(content={
        "success": True,
        "model": "Parkinson Speech Detection (DeepSpeech)",
        "results": results
    })

# ==================== GastroAI - Gastrointestinal Disease Detection ====================
@app.post("/api/v1/gastro/predict")
async def predict_gastro(files: list[UploadFile] = File(...)):
    """
    Detect gastrointestinal conditions from multiple endoscopy images (Batch).
    
    Args:
        files: List of endoscopy image files (JPEG, PNG)
    
    Returns:
        JSON with list of gastrointestinal condition predictions
    """
    results = []
    service = get_gastro_service()
    
    for file in files:
        if not file.content_type.startswith("image/"):
            results.append({
                "filename": file.filename,
                "status": "error",
                "error": "File must be an image"
            })
            continue
        
        tmp_path = None
        try:
            await file.seek(0)
            contents = await file.read()
            
            suffix = os.path.splitext(file.filename)[1] or ".jpg"
            tmp_path = os.path.join(tempfile.gettempdir(), f"gastro_{uuid.uuid4().hex}{suffix}")
            
            with open(tmp_path, "wb") as tmp:
                tmp.write(contents)
            
            prediction = service.predict(tmp_path)
            
            results.append({
                "filename": file.filename,
                "status": "success",
                "predictions": prediction
            })
            
        except Exception as e:
            results.append({
                "filename": file.filename,
                "status": "error",
                "error": str(e)
            })
        finally:
            if tmp_path and os.path.exists(tmp_path):
                try:
                    os.unlink(tmp_path)
                except:
                    pass
                    
    return JSONResponse(content={
        "success": True,
        "model": "GastroAI - Gastrointestinal Disease Detection",
        "results": results
    })


# ==================== LungAI - Lung Cancer Detection ====================
@app.post("/api/v1/lung-cancer/predict")
async def predict_lung_cancer(files: list[UploadFile] = File(...)):
    """
    Detect and classify lung cancer from multiple CT scan images (Batch).
    
    Args:
        files: List of CT scan image files (JPEG, PNG)
    
    Returns:
        JSON with list of lung cancer classification results
    """
    results = []
    service = get_lung_cancer_service()
    
    for file in files:
        if not file.content_type.startswith("image/"):
            results.append({
                "filename": file.filename,
                "status": "error",
                "error": "File must be an image"
            })
            continue
        
        tmp_path = None
        try:
            await file.seek(0)
            contents = await file.read()
            
            suffix = os.path.splitext(file.filename)[1] or ".png"
            tmp_path = os.path.join(tempfile.gettempdir(), f"lung_{uuid.uuid4().hex}{suffix}")
            
            with open(tmp_path, "wb") as tmp:
                tmp.write(contents)
            
            prediction = service.predict(tmp_path)
            
            results.append({
                "filename": file.filename,
                "status": "success",
                "predictions": prediction
            })
            
        except Exception as e:
            results.append({
                "filename": file.filename,
                "status": "error",
                "error": str(e)
            })
        finally:
            if tmp_path and os.path.exists(tmp_path):
                try:
                    os.unlink(tmp_path)
                except:
                    pass
                    
    return JSONResponse(content={
        "success": True,
        "model": "LungAI - Lung Cancer Detection (ResNet50)",
        "results": results
    })


# ==================== Thyroid Disease Detection ====================

class ThyroidRequest(BaseModel):
    """Request model for thyroid disease prediction"""
    age: int = 40
    sex: str = "F"
    on_thyroxine: bool = False
    query_on_thyroxine: bool = False
    on_antithyroid_meds: bool = False
    sick: bool = False
    pregnant: bool = False
    thyroid_surgery: bool = False
    I131_treatment: bool = False
    query_hypothyroid: bool = False
    query_hyperthyroid: bool = False
    lithium: bool = False
    goitre: bool = False
    tumor: bool = False
    hypopituitary: bool = False
    psych: bool = False
    TSH_measured: bool = True
    TSH: float = 2.0
    T3_measured: bool = True
    T3: float = 1.5
    TT4_measured: bool = True
    TT4: float = 8.0
    T4U_measured: bool = True
    T4U: float = 1.0
    FTI_measured: bool = True
    FTI: float = 8.0
    TBG_measured: bool = False
    TBG: float = 0.0


@app.post("/api/v1/thyroid/predict")
async def predict_thyroid(request: ThyroidRequest):
    """
    Predict thyroid disease based on patient data and lab values.
    
    Analyzes:
    - TSH, T3, TT4, T4U, FTI levels
    - Patient medical history
    - Current medications and treatments
    
    Classifications:
    - Normal (No Thyroid Disease)
    - Compensated Hypothyroidism
    - Primary Hypothyroidism
    - Secondary Hypothyroidism
    
    Args:
        request: JSON body with patient data
    
    Returns:
        JSON with thyroid disease prediction and lab analysis
    """
    try:
        service = get_thyroid_service()
        
        # Convert request to dictionary
        patient_data = request.model_dump()
        
        # Get prediction
        result = service.predict(patient_data)
        
        return JSONResponse(content={
            "success": True,
            "model": "Thyroid Disease Detection",
            "predictions": result
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== RETFound - Retinal Foundation Model ====================
@app.post("/api/v1/retfound/predict")
async def predict_retfound(files: list[UploadFile] = File(...)):
    """
    Advanced Retinal Disease Detection using RETFound (Batch).
    
    Args:
        files: List of fundus image files (JPEG, PNG)
    
    Returns:
        JSON with list of DR gradings
    """
    results = []
    service = get_retfound_service()
    
    for file in files:
        if not file.content_type.startswith("image/"):
            results.append({
                "filename": file.filename,
                "status": "error",
                "error": "File must be an image"
            })
            continue
        
        tmp_path = None
        try:
            await file.seek(0)
            contents = await file.read()
            
            suffix = os.path.splitext(file.filename)[1] or ".png"
            tmp_path = os.path.join(tempfile.gettempdir(), f"retfound_{uuid.uuid4().hex}{suffix}")
            
            with open(tmp_path, "wb") as tmp:
                tmp.write(contents)
            
            prediction = service.predict(tmp_path)
            
            results.append({
                "filename": file.filename,
                "status": "success",
                "predictions": prediction
            })
            
        except Exception as e:
            results.append({
                "filename": file.filename,
                "status": "error",
                "error": str(e)
            })
        finally:
            if tmp_path and os.path.exists(tmp_path):
                try:
                    os.unlink(tmp_path)
                except:
                    pass
                    
    return JSONResponse(content={
        "success": True,
        "model": "RETFound (ViT-Large)",
        "results": results
    })


# ==================== Batch Prediction Endpoints ====================
@app.post("/api/v1/batch/retinal-disease")
async def batch_predict_retinal(files: list[UploadFile] = File(...)):
    """Batch prediction for multiple retinal images"""
    results = []
    service = get_retinal_service()
    
    for file in files:
        if not file.content_type.startswith("image/"):
            results.append({"filename": file.filename, "error": "Not an image file"})
            continue
        
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
                shutil.copyfileobj(file.file, tmp)
                tmp_path = tmp.name
            
            result = service.predict(tmp_path)
            os.unlink(tmp_path)
            
            results.append({"filename": file.filename, "predictions": result})
        except Exception as e:
            results.append({"filename": file.filename, "error": str(e)})
    
    return JSONResponse(content={
        "success": True,
        "model": "Retinal Disease Detection (Batch)",
        "results": results
    })


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
