"""
Frontend Integration Example for AgriFairConnect AI Service
This file shows how to integrate the AI service with the React frontend.
"""

import requests
import json
from typing import Dict, List, Any

class AIServiceClient:
    """Client for interacting with the AI service."""
    
    def __init__(self, base_url: str = "http://localhost:8001"):
        self.base_url = base_url
    
    def health_check(self) -> Dict[str, Any]:
        """Check if the AI service is running."""
        try:
            response = requests.get(f"{self.base_url}/health")
            return response.json()
        except requests.RequestException as e:
            return {"status": "error", "message": str(e)}
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the trained model."""
        try:
            response = requests.get(f"{self.base_url}/model/info")
            return response.json()
        except requests.RequestException as e:
            return {"error": str(e)}
    
    def predict_single_farmer(self, farmer_data: Dict[str, Any], grant_id: str = None) -> Dict[str, Any]:
        """Predict priority for a single farmer."""
        try:
            payload = {
                "farmer_data": farmer_data,
                "grant_id": grant_id
            }
            response = requests.post(f"{self.base_url}/predict", json=payload)
            return response.json()
        except requests.RequestException as e:
            return {"error": str(e)}
    
    def predict_batch_farmers(self, farmers_data: List[Dict[str, Any]], grant_id: str = None) -> Dict[str, Any]:
        """Predict priority for multiple farmers."""
        try:
            payload = {
                "farmers": farmers_data,
                "grant_id": grant_id
            }
            response = requests.post(f"{self.base_url}/predict/batch", json=payload)
            return response.json()
        except requests.RequestException as e:
            return {"error": str(e)}
    
    def train_model(self) -> Dict[str, Any]:
        """Trigger model training."""
        try:
            response = requests.post(f"{self.base_url}/model/train")
            return response.json()
        except requests.RequestException as e:
            return {"error": str(e)}
    
    def get_data_stats(self) -> Dict[str, Any]:
        """Get dataset statistics."""
        try:
            response = requests.get(f"{self.base_url}/data/stats")
            return response.json()
        except requests.RequestException as e:
            return {"error": str(e)}

# Example usage for React frontend integration
def example_react_integration():
    """Example of how to integrate with React frontend."""
    
    # Initialize client
    ai_client = AIServiceClient()
    
    # Example 1: Health check
    print("=== Health Check ===")
    health = ai_client.health_check()
    print(json.dumps(health, indent=2))
    
    # Example 2: Single farmer prediction
    print("\n=== Single Farmer Prediction ===")
    farmer_data = {
        "farmer_id": "FARMER_001",
        "full_name": "Ram Shrestha",
        "phone": "9812345678",
        "email": "ram@gmail.com",
        "address": "Ward 5, भद्रपुर नगरपालिका",
        "municipality": "भद्रपुर नगरपालिका",
        "ward": 5,
        "monthly_income": 12000,
        "land_size_bigha": 1.5,
        "previous_grants": 0,
        "crop_yield": "low",
        "current_crops": "धान, मकै",
        "education_level": "secondary",
        "family_size": 6,
        "age": 45,
        "farming_experience_years": 8,
        "credit_score": 450,
        "market_distance_km": 12.5,
        "has_irrigation": False,
        "uses_modern_technology": False,
        "social_category": "general",
        "has_disability": False
    }
    
    prediction = ai_client.predict_single_farmer(farmer_data, "GRANT_001")
    print(json.dumps(prediction, indent=2))
    
    # Example 3: Batch prediction
    print("\n=== Batch Prediction ===")
    farmers_batch = [
        farmer_data,
        {
            **farmer_data,
            "farmer_id": "FARMER_002",
            "full_name": "Sita Tamang",
            "monthly_income": 25000,
            "land_size_bigha": 3.0,
            "previous_grants": 1
        }
    ]
    
    batch_prediction = ai_client.predict_batch_farmers(farmers_batch, "GRANT_001")
    print(json.dumps(batch_prediction, indent=2))

# React/TypeScript integration example
def generate_typescript_types():
    """Generate TypeScript types for frontend integration."""
    
    typescript_code = """
// TypeScript types for AI service integration

export interface FarmerData {
  farmer_id: string;
  full_name: string;
  phone: string;
  email: string;
  address: string;
  municipality: string;
  ward: number;
  monthly_income: number;
  land_size_bigha: number;
  previous_grants: number;
  crop_yield: 'low' | 'average' | 'high';
  current_crops: string;
  education_level: string;
  family_size: number;
  age: number;
  farming_experience_years: number;
  credit_score: number;
  market_distance_km: number;
  has_irrigation: boolean;
  uses_modern_technology: boolean;
  social_category: string;
  has_disability: boolean;
}

export interface PredictionResponse {
  farmer_id: string;
  approval_probability: number;
  predicted_status: 'approved' | 'pending';
  priority_score: number;
  confidence: number;
  recommendation: string;
  reasoning: string[];
}

export interface BatchPredictionResponse {
  predictions: PredictionResponse[];
  summary: {
    total_farmers: number;
    high_priority: number;
    medium_priority: number;
    low_priority: number;
    avg_priority_score: number;
    avg_approval_probability: number;
  };
}

export interface ModelInfo {
  model_loaded: boolean;
  accuracy?: number;
  features_used?: string[];
  last_trained?: string;
}

// React hook example
export const useAIService = () => {
  const baseUrl = 'http://localhost:8001';
  
  const predictFarmer = async (farmerData: FarmerData, grantId?: string): Promise<PredictionResponse> => {
    const response = await fetch(`${baseUrl}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        farmer_data: farmerData,
        grant_id: grantId,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Prediction failed');
    }
    
    return response.json();
  };
  
  const predictBatch = async (farmers: FarmerData[], grantId?: string): Promise<BatchPredictionResponse> => {
    const response = await fetch(`${baseUrl}/predict/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        farmers,
        grant_id: grantId,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Batch prediction failed');
    }
    
    return response.json();
  };
  
  const getModelInfo = async (): Promise<ModelInfo> => {
    const response = await fetch(`${baseUrl}/model/info`);
    if (!response.ok) {
      throw new Error('Failed to get model info');
    }
    return response.json();
  };
  
  return {
    predictFarmer,
    predictBatch,
    getModelInfo,
  };
};
"""
    
    with open('ai_service_types.ts', 'w') as f:
        f.write(typescript_code)
    
    print("TypeScript types generated in 'ai_service_types.ts'")

if __name__ == "__main__":
    print("AgriFairConnect AI Service Frontend Integration Examples")
    print("="*60)
    
    # Generate TypeScript types
    generate_typescript_types()
    
    # Run examples
    example_react_integration()
