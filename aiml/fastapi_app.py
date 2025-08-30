from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np
import joblib
import os
from datetime import datetime
import uvicorn

# Import our custom modules
from ml_model import FarmerPrioritizationModel
from data_generator import generate_farmer_dataset, save_dataset

app = FastAPI(
    title="AgriFairConnect AI Service",
    description="AI-powered farmer prioritization service using Logistic Regression",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model instance
model = None

# Pydantic models for API requests/responses
class FarmerData(BaseModel):
    farmer_id: str
    full_name: str
    phone: str
    email: str
    address: str
    municipality: str
    ward: int
    monthly_income: float
    land_size_bigha: float
    previous_grants: int
    crop_yield: str
    current_crops: str
    education_level: str
    family_size: int
    age: int
    farming_experience_years: int
    credit_score: int
    market_distance_km: float
    has_irrigation: bool
    uses_modern_technology: bool
    social_category: str
    has_disability: bool

class PredictionRequest(BaseModel):
    farmer_data: FarmerData
    grant_id: Optional[str] = None

class PredictionResponse(BaseModel):
    farmer_id: str
    approval_probability: float
    predicted_status: str
    priority_score: float
    confidence: float
    recommendation: str
    reasoning: List[str]

class BatchPredictionRequest(BaseModel):
    farmers: List[FarmerData]
    grant_id: Optional[str] = None

class BatchPredictionResponse(BaseModel):
    predictions: List[PredictionResponse]
    summary: Dict[str, Any]

class ModelInfo(BaseModel):
    model_loaded: bool
    accuracy: Optional[float] = None
    features_used: Optional[List[str]] = None
    last_trained: Optional[str] = None

@app.on_event("startup")
async def startup_event():
    """Initialize the model on startup."""
    global model
    model = FarmerPrioritizationModel()
    
    # Try to load existing model
    if not model.load_model():
        print("No existing model found. Please train the model first.")
    else:
        print("Model loaded successfully!")

@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "AgriFairConnect AI Service",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "model_loaded": model is not None and model.model is not None
    }

@app.get("/model/info", response_model=ModelInfo)
async def get_model_info():
    """Get information about the current model."""
    if model is None or model.model is None:
        return ModelInfo(model_loaded=False)
    
    # Try to load model metrics if available
    accuracy = None
    features_used = None
    last_trained = None
    
    try:
        if hasattr(model, 'feature_columns'):
            features_used = model.feature_columns
    except:
        pass
    
    return ModelInfo(
        model_loaded=True,
        accuracy=accuracy,
        features_used=features_used,
        last_trained=last_trained
    )

@app.post("/predict", response_model=PredictionResponse)
async def predict_farmer_priority(request: PredictionRequest):
    """Predict priority for a single farmer."""
    if model is None or model.model is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Please train the model first.")
    
    try:
        # Convert Pydantic model to dict
        farmer_dict = request.farmer_data.dict()
        
        # Make prediction
        prediction = model.predict_priority(farmer_dict)
        
        # Generate recommendation and reasoning
        recommendation, reasoning = generate_recommendation(prediction, farmer_dict)
        
        return PredictionResponse(
            farmer_id=prediction['farmer_id'],
            approval_probability=prediction['approval_probability'],
            predicted_status=prediction['predicted_status'],
            priority_score=prediction['priority_score'],
            confidence=prediction['confidence'],
            recommendation=recommendation,
            reasoning=reasoning
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/predict/batch", response_model=BatchPredictionResponse)
async def predict_batch_priority(request: BatchPredictionRequest):
    """Predict priority for multiple farmers."""
    if model is None or model.model is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Please train the model first.")
    
    try:
        predictions = []
        
        for farmer_data in request.farmers:
            farmer_dict = farmer_data.dict()
            prediction = model.predict_priority(farmer_dict)
            
            recommendation, reasoning = generate_recommendation(prediction, farmer_dict)
            
            predictions.append(PredictionResponse(
                farmer_id=prediction['farmer_id'],
                approval_probability=prediction['approval_probability'],
                predicted_status=prediction['predicted_status'],
                priority_score=prediction['priority_score'],
                confidence=prediction['confidence'],
                recommendation=recommendation,
                reasoning=reasoning
            ))
        
        # Sort by priority score (highest first)
        predictions.sort(key=lambda x: x.priority_score, reverse=True)
        
        # Generate summary
        summary = {
            "total_farmers": len(predictions),
            "high_priority": len([p for p in predictions if p.priority_score >= 8.0]),
            "medium_priority": len([p for p in predictions if 5.0 <= p.priority_score < 8.0]),
            "low_priority": len([p for p in predictions if p.priority_score < 5.0]),
            "avg_priority_score": round(np.mean([p.priority_score for p in predictions]), 2),
            "avg_approval_probability": round(np.mean([p.approval_probability for p in predictions]), 4)
        }
        
        return BatchPredictionResponse(
            predictions=predictions,
            summary=summary
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch prediction failed: {str(e)}")

@app.post("/model/train")
async def train_model(background_tasks: BackgroundTasks):
    """Train the model with the current dataset."""
    try:
        # Check if dataset exists
        if not os.path.exists('farmer_dataset.csv'):
            # Generate dataset if it doesn't exist
            save_dataset()
        
        # Train model in background
        background_tasks.add_task(train_model_background)
        
        return {
            "message": "Model training started in background",
            "status": "training"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")

async def train_model_background():
    """Background task to train the model."""
    global model
    
    try:
        from ml_model import train_and_evaluate_model
        model, results = train_and_evaluate_model()
        print("Model training completed successfully!")
    except Exception as e:
        print(f"Model training failed: {str(e)}")

@app.post("/data/generate")
async def generate_data(num_farmers: int = 150):
    """Generate new dataset."""
    try:
        df = generate_farmer_dataset(num_farmers)
        df.to_csv('farmer_dataset.csv', index=False)
        
        return {
            "message": f"Dataset generated successfully",
            "total_farmers": len(df),
            "file_path": "farmer_dataset.csv"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Data generation failed: {str(e)}")

@app.get("/data/stats")
async def get_data_stats():
    """Get statistics about the current dataset."""
    try:
        if not os.path.exists('farmer_dataset.csv'):
            raise HTTPException(status_code=404, detail="Dataset not found")
        
        df = pd.read_csv('farmer_dataset.csv')
        
        stats = {
            "total_farmers": len(df),
            "columns": list(df.columns),
            "priority_score_stats": {
                "mean": round(df['priority_score'].mean(), 2),
                "median": round(df['priority_score'].median(), 2),
                "min": round(df['priority_score'].min(), 2),
                "max": round(df['priority_score'].max(), 2),
                "std": round(df['priority_score'].std(), 2)
            },
            "application_status_distribution": df['application_status'].value_counts().to_dict(),
            "municipality_distribution": df['municipality'].value_counts().head(5).to_dict(),
            "crop_yield_distribution": df['crop_yield'].value_counts().to_dict()
        }
        
        return stats
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get data stats: {str(e)}")

def generate_recommendation(prediction: Dict[str, Any], farmer_data: Dict[str, Any]) -> tuple:
    """Generate recommendation and reasoning based on prediction."""
    recommendation = ""
    reasoning = []
    
    priority_score = prediction['priority_score']
    approval_probability = prediction['approval_probability']
    
    # Generate recommendation based on priority score
    if priority_score >= 8.0:
        recommendation = "Highly Recommended for Grant Approval"
        reasoning.append("High priority score indicates strong need and eligibility")
    elif priority_score >= 6.0:
        recommendation = "Recommended for Grant Approval"
        reasoning.append("Good priority score shows eligibility for support")
    elif priority_score >= 4.0:
        recommendation = "Consider for Grant Approval"
        reasoning.append("Moderate priority score - review additional factors")
    else:
        recommendation = "Not Recommended for Grant Approval"
        reasoning.append("Low priority score - consider other applicants first")
    
    # Add reasoning based on individual factors
    monthly_income = farmer_data.get('monthly_income', 0)
    if monthly_income < 15000:
        reasoning.append("Low income level - high need for support")
    elif monthly_income > 35000:
        reasoning.append("Higher income level - lower priority")
    
    land_size = farmer_data.get('land_size_bigha', 0)
    if land_size < 2:
        reasoning.append("Small landholding - high priority for support")
    elif land_size > 4:
        reasoning.append("Large landholding - lower priority")
    
    previous_grants = farmer_data.get('previous_grants', 0)
    if previous_grants == 0:
        reasoning.append("No previous grants - first-time applicant priority")
    elif previous_grants > 1:
        reasoning.append("Multiple previous grants - lower priority")
    
    social_category = farmer_data.get('social_category', 'general')
    if social_category in ['dalit', 'janajati', 'madhesi']:
        reasoning.append("Marginalized social category - inclusive development priority")
    
    if farmer_data.get('has_disability', False):
        reasoning.append("Disability status - special consideration")
    
    # Add confidence level reasoning
    confidence = prediction['confidence']
    if confidence > 0.8:
        reasoning.append("High confidence prediction")
    elif confidence < 0.5:
        reasoning.append("Low confidence - manual review recommended")
    
    return recommendation, reasoning

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
