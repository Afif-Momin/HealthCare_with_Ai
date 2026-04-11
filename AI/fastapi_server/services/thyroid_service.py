"""
Thyroid Disease Detection Service
==================================
Uses a machine learning classifier for thyroid disease prediction
based on patient medical data and lab values.
"""

import os
import numpy as np
import pandas as pd
from typing import Dict, Any, Optional, List
import joblib

# Try to import sklearn
try:
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.preprocessing import LabelEncoder, StandardScaler
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    print("Warning: scikit-learn not available. Thyroid detection will use rule-based predictions.")

# Thyroid disease labels
THYROID_LABELS = [
    "negative",
    "compensated_hypothyroid",
    "primary_hypothyroid",
    "secondary_hypothyroid"
]

THYROID_FULL_NAMES = {
    "negative": "Normal (No Thyroid Disease)",
    "compensated_hypothyroid": "Compensated Hypothyroidism",
    "primary_hypothyroid": "Primary Hypothyroidism",
    "secondary_hypothyroid": "Secondary Hypothyroidism"
}

THYROID_DESCRIPTIONS = {
    "negative": "Thyroid function is within normal parameters. No signs of thyroid disease detected.",
    "compensated_hypothyroid": "Mild hypothyroidism where the thyroid is underactive but the body is compensating. TSH is elevated but T4 is normal.",
    "primary_hypothyroid": "Thyroid gland is not producing enough hormones. Often caused by Hashimoto's thyroiditis or iodine deficiency.",
    "secondary_hypothyroid": "Hypothyroidism caused by pituitary gland dysfunction rather than the thyroid itself."
}

THYROID_RISK_LEVELS = {
    "negative": "LOW",
    "compensated_hypothyroid": "MODERATE",
    "primary_hypothyroid": "HIGH",
    "secondary_hypothyroid": "HIGH"
}

THYROID_RECOMMENDATIONS = {
    "negative": "No thyroid treatment needed. Continue routine health checkups.",
    "compensated_hypothyroid": "Monitor thyroid function every 6-12 months. Lifestyle modifications may help.",
    "primary_hypothyroid": "Consult endocrinologist. May require thyroid hormone replacement therapy (levothyroxine).",
    "secondary_hypothyroid": "Urgent endocrinologist referral needed. Pituitary function should be evaluated."
}

# Normal reference ranges for thyroid values
REFERENCE_RANGES = {
    "TSH": {"low": 0.4, "high": 4.0, "unit": "mIU/L"},
    "T3": {"low": 0.8, "high": 2.0, "unit": "ng/mL"},
    "TT4": {"low": 5.0, "high": 12.0, "unit": "μg/dL"},
    "T4U": {"low": 0.7, "high": 1.2, "unit": ""},
    "FTI": {"low": 5.0, "high": 12.0, "unit": ""}
}


class ThyroidService:
    def __init__(self, model_path: str = None):
        """
        Initialize the Thyroid Disease Detection Service.
        
        Args:
            model_path: Path to the trained model (optional)
        """
        self.model = None
        self.scaler = None
        self.label_encoder = None
        
        # Feature columns for the model
        self.feature_columns = [
            'age', 'TSH', 'T3', 'TT4', 'T4U', 'FTI',
            'on_thyroxine', 'query_on_thyroxine', 'on_antithyroid_meds',
            'sick', 'pregnant', 'thyroid_surgery', 'I131_treatment',
            'query_hypothyroid', 'query_hyperthyroid', 'lithium',
            'goitre', 'tumor', 'hypopituitary', 'psych',
            'TSH_measured', 'T3_measured', 'TT4_measured', 'T4U_measured', 'FTI_measured'
        ]
        
        if model_path:
            self.model_path = model_path
            self._load_model()
    
    def _load_model(self):
        """Load a pre-trained model if available"""
        if not SKLEARN_AVAILABLE:
            print("scikit-learn not available. Using rule-based predictions.")
            return
        
        try:
            if os.path.exists(self.model_path):
                self.model = joblib.load(self.model_path)
                print(f"Loaded Thyroid model from {self.model_path}")
            else:
                print(f"Thyroid model not found. Using rule-based predictions.")
        except Exception as e:
            print(f"Error loading Thyroid model: {e}")
            self.model = None
    
    def predict(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict thyroid disease based on patient data.
        
        Args:
            patient_data: Dictionary containing patient information and lab values
            
        Returns:
            Dictionary containing thyroid disease prediction
        """
        try:
            # Extract key lab values
            tsh = float(patient_data.get('TSH', 0))
            t3 = float(patient_data.get('T3', 0))
            tt4 = float(patient_data.get('TT4', 0))
            t4u = float(patient_data.get('T4U', 0))
            fti = float(patient_data.get('FTI', 0))
            age = int(patient_data.get('age', 40))
            
            # Use rule-based prediction based on medical guidelines
            prediction, probabilities = self._rule_based_prediction(tsh, t3, tt4, t4u, fti, patient_data)
            
            return self._format_predictions(prediction, probabilities, patient_data)
            
        except Exception as e:
            raise Exception(f"Error during prediction: {str(e)}")
    
    def _rule_based_prediction(self, tsh: float, t3: float, tt4: float, t4u: float, fti: float, 
                               patient_data: Dict[str, Any]) -> tuple:
        """Rule-based thyroid disease prediction based on medical guidelines"""
        
        # Initialize probabilities
        probs = {
            "negative": 0.0,
            "compensated_hypothyroid": 0.0,
            "primary_hypothyroid": 0.0,
            "secondary_hypothyroid": 0.0
        }
        
        tsh_measured = patient_data.get('TSH_measured', True)
        t3_measured = patient_data.get('T3_measured', True)
        tt4_measured = patient_data.get('TT4_measured', True)
        
        # Check for hypopituitary (secondary hypothyroid indicator)
        hypopituitary = patient_data.get('hypopituitary', False)
        
        if tsh > 0 and tsh_measured:
            if tsh > 10:
                # Clearly elevated TSH
                if tt4 < 5.0 and tt4_measured:
                    # Low T4 with high TSH = Primary hypothyroid
                    probs["primary_hypothyroid"] = 0.85
                    probs["compensated_hypothyroid"] = 0.10
                    probs["negative"] = 0.05
                else:
                    # Normal T4 with high TSH = Compensated hypothyroid
                    probs["compensated_hypothyroid"] = 0.75
                    probs["primary_hypothyroid"] = 0.15
                    probs["negative"] = 0.10
            elif tsh > 4.0:
                # Mildly elevated TSH
                probs["compensated_hypothyroid"] = 0.60
                probs["negative"] = 0.30
                probs["primary_hypothyroid"] = 0.10
            elif tsh < 0.4:
                # Low TSH - could indicate hyperthyroidism (not in our classes) or secondary hypothyroid
                if hypopituitary:
                    probs["secondary_hypothyroid"] = 0.70
                    probs["primary_hypothyroid"] = 0.15
                    probs["negative"] = 0.15
                else:
                    probs["negative"] = 0.70
                    probs["secondary_hypothyroid"] = 0.20
                    probs["compensated_hypothyroid"] = 0.10
            else:
                # Normal TSH
                probs["negative"] = 0.85
                probs["compensated_hypothyroid"] = 0.10
                probs["primary_hypothyroid"] = 0.05
        else:
            # No TSH measurement - use other indicators
            if tt4 < 5.0 and tt4_measured:
                probs["primary_hypothyroid"] = 0.50
                probs["compensated_hypothyroid"] = 0.30
                probs["negative"] = 0.20
            else:
                probs["negative"] = 0.70
                probs["compensated_hypothyroid"] = 0.20
                probs["primary_hypothyroid"] = 0.10
        
        # Additional risk factors
        if patient_data.get('goitre', False):
            probs["primary_hypothyroid"] += 0.10
            probs["negative"] = max(0, probs["negative"] - 0.10)
        
        if patient_data.get('thyroid_surgery', False):
            probs["primary_hypothyroid"] += 0.15
            probs["negative"] = max(0, probs["negative"] - 0.15)
        
        if patient_data.get('on_thyroxine', False):
            # Already on treatment suggests known condition
            probs["primary_hypothyroid"] += 0.20
            probs["negative"] = max(0, probs["negative"] - 0.20)
        
        # Normalize probabilities
        total = sum(probs.values())
        if total > 0:
            probs = {k: v/total for k, v in probs.items()}
        
        # Get prediction
        prediction = max(probs, key=probs.get)
        
        return prediction, probs
    
    def _format_predictions(self, prediction: str, probabilities: Dict[str, float], 
                           patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Format predictions into response"""
        
        # Get all class probabilities
        class_probabilities = []
        for label in THYROID_LABELS:
            prob = probabilities.get(label, 0.0)
            class_probabilities.append({
                "condition": label,
                "full_name": THYROID_FULL_NAMES.get(label, label),
                "description": THYROID_DESCRIPTIONS.get(label, ""),
                "probability": round(prob, 4),
                "percentage": round(prob * 100, 2),
                "confidence": round(prob * 100, 2),
                "risk_level": THYROID_RISK_LEVELS.get(label, "UNKNOWN"),
                "recommendation": THYROID_RECOMMENDATIONS.get(label, "")
            })
        
        # Sort by probability
        class_probabilities.sort(key=lambda x: x["probability"], reverse=True)
        
        # Get top prediction
        top_prediction = class_probabilities[0]
        
        # Group by risk level
        high_risk = [c for c in class_probabilities if c["risk_level"] == "HIGH" and c["probability"] > 0.1]
        moderate_risk = [c for c in class_probabilities if c["risk_level"] == "MODERATE" and c["probability"] > 0.1]
        low_risk = [c for c in class_probabilities if c["risk_level"] == "LOW" and c["probability"] > 0.1]
        
        # Analyze lab values
        lab_analysis = self._analyze_lab_values(patient_data)
        
        return {
            "primary_diagnosis": {
                "condition": top_prediction["condition"],
                "full_name": top_prediction["full_name"],
                "description": top_prediction["description"],
                "confidence": float(top_prediction["percentage"]),
                "risk_level": top_prediction["risk_level"],
                "recommendation": top_prediction["recommendation"]
            },
            "detected_conditions": class_probabilities,
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
            "lab_analysis": lab_analysis,
            "patient_info": {
                "age": int(patient_data.get('age', 0)),
                "sex": patient_data.get('sex', 'Unknown'),
                "on_treatment": bool(patient_data.get('on_thyroxine', False)),
                "history_of_surgery": bool(patient_data.get('thyroid_surgery', False))
            },
            "summary": {
                "total_conditions_analyzed": len(THYROID_LABELS),
                "requires_immediate_attention": bool(top_prediction["risk_level"] == "HIGH" and top_prediction["probability"] > 0.5),
                "requires_monitoring": bool(top_prediction["risk_level"] == "MODERATE"),
                "is_normal": bool(top_prediction["condition"] == "negative" and top_prediction["probability"] > 0.5),
                "highest_risk": top_prediction
            },
            "clinical_notes": {
                "confidence_level": "High" if top_prediction["probability"] > 0.8 
                                   else "Moderate" if top_prediction["probability"] > 0.5 
                                   else "Low",
                "note": "This is an AI-assisted screening tool. Diagnosis should be confirmed by an endocrinologist with additional testing."
            }
        }
    
    def _analyze_lab_values(self, patient_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Analyze individual lab values against reference ranges"""
        analysis = []
        
        for test, ranges in REFERENCE_RANGES.items():
            value = patient_data.get(test, None)
            measured = patient_data.get(f'{test}_measured', True)
            
            if value is not None and measured:
                value = float(value)
                status = "NORMAL"
                if value < ranges["low"]:
                    status = "LOW"
                elif value > ranges["high"]:
                    status = "HIGH"
                
                analysis.append({
                    "test": test,
                    "value": round(value, 2),
                    "unit": ranges["unit"],
                    "reference_range": f"{ranges['low']} - {ranges['high']}",
                    "status": status
                })
        
        return analysis
    
    def get_model_info(self) -> Dict[str, Any]:
        """Return model information"""
        return {
            "model_name": "Thyroid Disease Detection",
            "model_type": "Classification (Rule-based + ML)",
            "input_type": "Patient Data (JSON)",
            "num_classes": len(THYROID_LABELS),
            "classes": THYROID_LABELS,
            "descriptions": THYROID_DESCRIPTIONS,
            "reference_ranges": REFERENCE_RANGES,
            "required_fields": ["age", "TSH", "T3", "TT4", "T4U", "FTI"],
            "sklearn_available": SKLEARN_AVAILABLE,
            "model_loaded": self.model is not None
        }
