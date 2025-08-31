from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import pandas as pd
import numpy as np
import joblib
import os
from datetime import datetime
import uvicorn

# Import the fraud detection model
from fraud_detection_model import FraudDetectionModel

app = FastAPI(
    title="Fraud Detection API",
    description="AI-powered fraud detection for grant applications using Isolation Forest",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the fraud detection model
fraud_model = FraudDetectionModel()

# Pydantic models for API requests/responses
class ApplicationData(BaseModel):
    farmer_id: str
    farmer_name: str
    monthly_income: float
    land_size_bigha: float
    previous_grants: int
    phone: Optional[str] = None
    email: Optional[str] = None
    municipality: Optional[str] = None
    ward: Optional[int] = None
    crop_details: Optional[str] = None

class FraudDetectionRequest(BaseModel):
    applications: List[ApplicationData]

class FraudDetectionResponse(BaseModel):
    success: bool
    message: str
    total_applications: int
    fraud_detected: int
    risk_distribution: Dict[str, int]
    average_anomaly_score: float
    results: List[Dict[str, Any]]
    timestamp: str

class ModelStatusResponse(BaseModel):
    status: str
    model_loaded: bool
    last_trained: Optional[str] = None
    accuracy: Optional[float] = None

@app.on_event("startup")
async def startup_event():
    """Initialize the model on startup"""
    try:
        # Try to load existing model
        if os.path.exists('fraud_detection_model.pkl'):
            fraud_model.load_model()
            print("✅ Fraud detection model loaded successfully")
        else:
            print("⚠️ No existing model found. Please train the model first.")
    except Exception as e:
        print(f"❌ Error loading model: {e}")

@app.get("/", response_model=Dict[str, str])
async def root():
    """Root endpoint"""
    return {
        "message": "Fraud Detection API is running!",
        "version": "1.0.0",
        "endpoints": {
            "train_model": "/train",
            "detect_fraud": "/detect",
            "model_status": "/status",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/status", response_model=ModelStatusResponse)
async def get_model_status():
    """Get the current status of the fraud detection model"""
    try:
        model_loaded = fraud_model.model is not None
        status = "ready" if model_loaded else "not_loaded"
        
        return ModelStatusResponse(
            status=status,
            model_loaded=model_loaded,
            last_trained=None,  # Could be enhanced to track training time
            accuracy=None  # Could be enhanced to track model accuracy
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking model status: {str(e)}")

@app.post("/train")
async def train_model():
    """Train the fraud detection model with synthetic data"""
    try:
        print("🔄 Training fraud detection model...")
        
        # Generate synthetic data
        data = fraud_model.generate_fraud_data(n_samples=100)
        
        # Train the model
        results = fraud_model.train_model(data)
        
        # Generate visualizations
        viz_results = fraud_model.generate_visualizations(
            data, results['predictions'], results['scores']
        )
        
        # Save the model
        fraud_model.save_model()
        
        # Save the training data
        data.to_csv('fraud_detection_data.csv', index=False)
        
        return {
            "success": True,
            "message": "Model trained successfully",
            "total_applications": len(data),
            "actual_fraud": results['actual_fraud'],
            "detected_fraud": results['detected_fraud'],
            "accuracy": results['accuracy'],
            "risk_distribution": viz_results,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error training model: {str(e)}")

@app.post("/detect", response_model=FraudDetectionResponse)
async def detect_fraud(request: FraudDetectionRequest):
    """Detect fraud in grant applications"""
    try:
        if fraud_model.model is None:
            raise HTTPException(
                status_code=400, 
                detail="Model not trained. Please train the model first using /train endpoint"
            )
        
        # Convert request data to DataFrame
        applications_data = []
        for app in request.applications:
            app_dict = app.dict()
            applications_data.append(app_dict)
        
        data = pd.DataFrame(applications_data)
        
        # Make predictions
        predictions = fraud_model.predict_fraud(data)
        
        # Prepare results
        results = []
        for i, (_, row) in enumerate(data.iterrows()):
            result = {
                "farmer_id": row['farmer_id'],
                "farmer_name": row['farmer_name'],
                "monthly_income": row['monthly_income'],
                "land_size_bigha": row['land_size_bigha'],
                "previous_grants": row['previous_grants'],
                "is_fraudulent": bool(predictions['predictions'][i]),
                "anomaly_score": float(predictions['scores'][i]),
                "risk_level": predictions['risk_level'][i],
                "risk_factors": _identify_risk_factors(row, predictions['scores'][i])
            }
            results.append(result)
        
        # Calculate summary statistics
        fraud_detected = sum(predictions['predictions'])
        risk_levels = predictions['risk_level']
        risk_distribution = {
            "High Risk": risk_levels.count('High Risk'),
            "Medium Risk": risk_levels.count('Medium Risk'),
            "Low Risk": risk_levels.count('Low Risk')
        }
        
        return FraudDetectionResponse(
            success=True,
            message=f"Fraud detection completed. Found {fraud_detected} suspicious applications.",
            total_applications=len(data),
            fraud_detected=fraud_detected,
            risk_distribution=risk_distribution,
            average_anomaly_score=float(np.mean(predictions['scores'])),
            results=results,
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error detecting fraud: {str(e)}")

def _identify_risk_factors(row: pd.Series, anomaly_score: float) -> List[str]:
    """Identify specific risk factors for an application"""
    risk_factors = []
    
    # Income-based risks
    if row['monthly_income'] > 30000:
        risk_factors.append("High income - may not need grant")
    elif row['monthly_income'] < 8000:
        risk_factors.append("Very low income - needs verification")
    
    # Land size risks
    if row['land_size_bigha'] > 10:
        risk_factors.append("Large land holding - may not need support")
    elif row['land_size_bigha'] < 1:
        risk_factors.append("Very small land - needs assessment")
    
    # Previous grants risks
    if row['previous_grants'] > 3:
        risk_factors.append("Multiple previous grants - potential abuse")
    elif row['previous_grants'] == 0:
        risk_factors.append("No previous grants - first-time applicant")
    
    # Anomaly score based risks
    if anomaly_score < -0.3:
        risk_factors.append("High anomaly score - suspicious pattern")
    elif anomaly_score < -0.1:
        risk_factors.append("Medium anomaly score - needs review")
    
    return risk_factors

@app.get("/sample-data")
async def get_sample_data():
    """Get sample data for testing"""
    try:
        # Generate sample data
        data = fraud_model.generate_fraud_data(n_samples=10)
        
        # Convert to list of dictionaries
        sample_applications = []
        for _, row in data.iterrows():
            sample_applications.append({
                "farmer_id": row['farmer_id'],
                "farmer_name": row['farmer_name'],
                "monthly_income": float(row['monthly_income']),
                "land_size_bigha": float(row['land_size_bigha']),
                "previous_grants": int(row['previous_grants']),
                "phone": row['phone'],
                "email": row['email'],
                "municipality": row['municipality'],
                "ward": int(row['ward']),
                "crop_details": row['crop_details']
            })
        
        return {
            "success": True,
            "sample_applications": sample_applications,
            "count": len(sample_applications)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating sample data: {str(e)}")

if __name__ == "__main__":
    print("🚀 Starting Fraud Detection API...")
    print("📊 Available endpoints:")
    print("   - GET  / : API information")
    print("   - GET  /health : Health check")
    print("   - GET  /status : Model status")
    print("   - POST /train : Train model")
    print("   - POST /detect : Detect fraud")
    print("   - GET  /sample-data : Get sample data")
    
    uvicorn.run(app, host="0.0.0.0", port=8002)
