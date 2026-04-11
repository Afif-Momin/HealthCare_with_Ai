"""
Retinal Disease Detection Service
=================================
Uses ResNet50 model trained on retinal fundus images to detect various eye diseases.
"""

import os
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import numpy as np
from typing import Dict, List, Any

# Disease labels from the training data with full names and risk levels
# Disease labels from the training data (7 classes supported by current weights)
DISEASE_INFO = {
    "DR": {"full_name": "Diabetic Retinopathy", "risk_level": "HIGH", "description": "Damage to retinal blood vessels caused by diabetes"},
    "ARMD": {"full_name": "Age-related Macular Degeneration", "risk_level": "HIGH", "description": "Progressive deterioration of the macula affecting central vision"},
    "MH": {"full_name": "Macular Hole", "risk_level": "HIGH", "description": "Small break in the macula causing blurred central vision"},
    "DN": {"full_name": "Drusen", "risk_level": "MODERATE", "description": "Yellow deposits under the retina, early sign of AMD"},
    "MYA": {"full_name": "Pathological Myopia", "risk_level": "HIGH", "description": "Severe nearsightedness causing retinal damage"},
    "BRVO": {"full_name": "Branch Retinal Vein Occlusion", "risk_level": "HIGH", "description": "Blockage of small veins in the retina"},
    "TSLN": {"full_name": "Tessellation", "risk_level": "LOW", "description": "Visible choroidal vessels through thin retina"}
}

DISEASE_LABELS = list(DISEASE_INFO.keys())



class RetinalDiseaseService:
    def __init__(self, model_path: str = None):
        """
        Initialize the Retinal Disease Detection Service.
        
        Args:
            model_path: Path to the trained model weights (.pth file)
        """
        self.device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
        self.model = None
        self.transform = None
        
        # Default model path
        if model_path is None:
            base_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            model_path = os.path.join(base_path, "Retinal-Disease-Detection", "models", "ResNet50_v1.0.py.pth")
        
        self.model_path = model_path
        self._setup_transforms()
        self._load_model()
    
    def _setup_transforms(self):
        """Setup image preprocessing transforms"""
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])
    
    def _load_model(self):
        """Load the trained ResNet50 model"""
        try:
            # Create ResNet50 model architecture
            self.model = models.resnet50(pretrained=False)
            num_ftrs = self.model.fc.in_features
            self.model.fc = nn.Linear(num_ftrs, len(DISEASE_LABELS))
            
            # Load trained weights if available
            if os.path.exists(self.model_path):
                state_dict = torch.load(self.model_path, map_location=self.device)
                self.model.load_state_dict(state_dict)
                print(f"Loaded model weights from {self.model_path}")
            else:
                print(f"Warning: Model weights not found at {self.model_path}. Using random weights.")
            
            self.model = self.model.to(self.device)
            self.model.eval()
        except Exception as e:
            print(f"Error loading model: {e}")
            # Create a dummy model for API testing
            self.model = models.resnet50(pretrained=False)
            num_ftrs = self.model.fc.in_features
            self.model.fc = nn.Linear(num_ftrs, len(DISEASE_LABELS))
            self.model = self.model.to(self.device)
            self.model.eval()
    
    def predict(self, image_path: str) -> Dict[str, Any]:
        """
        Predict retinal diseases from an image.
        
        Args:
            image_path: Path to the retinal fundus image
            
        Returns:
            Dictionary containing predictions for each disease
        """
        try:
            # Load and preprocess image
            image = Image.open(image_path).convert('RGB')
            input_tensor = self.transform(image).unsqueeze(0).to(self.device)
            
            # Get predictions
            with torch.no_grad():
                outputs = self.model(input_tensor)
                probabilities = torch.sigmoid(outputs).cpu().numpy()[0]
            
            # Create results dictionary
            predictions = []
            detected_diseases = []
            
            for i, label in enumerate(DISEASE_LABELS):
                prob = float(probabilities[i])
                is_detected = prob > 0.5
                disease_info = DISEASE_INFO.get(label, {})
                
                predictions.append({
                    "disease": label,
                    "full_name": disease_info.get("full_name", label),
                    "description": disease_info.get("description", ""),
                    "risk_level": disease_info.get("risk_level", "UNKNOWN"),
                    "probability": round(prob, 4),
                    "detected": is_detected
                })
                
                if is_detected:
                    detected_diseases.append({
                        "disease": label,
                        "full_name": disease_info.get("full_name", label),
                        "description": disease_info.get("description", ""),
                        "risk_level": disease_info.get("risk_level", "UNKNOWN"),
                        "confidence": round(prob * 100, 2)
                    })
            
            # Sort detected diseases by confidence
            detected_diseases.sort(key=lambda x: x["confidence"], reverse=True)
            
            # Group by risk level
            high_risk = [d for d in detected_diseases if d["risk_level"] == "HIGH"]
            moderate_risk = [d for d in detected_diseases if d["risk_level"] == "MODERATE"]
            low_risk = [d for d in detected_diseases if d["risk_level"] == "LOW"]
            
            return {
                "detected_diseases": detected_diseases,
                "diseases_by_risk": {
                    "high": high_risk,
                    "moderate": moderate_risk,
                    "low": low_risk
                },
                "risk_counts": {
                    "high": len(high_risk),
                    "moderate": len(moderate_risk),
                    "low": len(low_risk)
                },
                "all_predictions": predictions,
                "summary": {
                    "total_diseases_detected": len(detected_diseases),
                    "high_risk_count": len(high_risk),
                    "moderate_risk_count": len(moderate_risk),
                    "low_risk_count": len(low_risk),
                    "highest_risk": detected_diseases[0] if detected_diseases else None,
                    "requires_immediate_attention": len(high_risk) > 0
                }
            }
            
        except Exception as e:
            raise Exception(f"Error during prediction: {str(e)}")
    
    def get_model_info(self) -> Dict[str, Any]:
        """Return model information"""
        return {
            "model_name": "ResNet50",
            "model_type": "Multi-label Classification",
            "input_size": "224x224",
            "num_classes": len(DISEASE_LABELS),
            "diseases": DISEASE_LABELS,
            "framework": "PyTorch",
            "device": str(self.device)
        }
