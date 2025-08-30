# AgriFairConnect AI Service

AI-powered farmer prioritization service using Logistic Regression for agricultural grant applications.

## Overview

This service provides intelligent prioritization of farmers for agricultural grants using machine learning. It analyzes various factors like income, land size, previous grants, crop yield, and social factors to predict the likelihood of grant approval and calculate priority scores.

## Features

- **Logistic Regression Model**: Predicts grant approval probability
- **Priority Scoring**: Calculates comprehensive priority scores based on multiple criteria
- **Batch Processing**: Process multiple farmers simultaneously
- **Real-time Predictions**: Fast API endpoints for instant predictions
- **Model Training**: Automated model training with cross-validation
- **Data Generation**: Synthetic dataset generation for testing

## Scoring Criteria

The system uses the following scoring criteria (out of 10 points each):

### Primary Factors (40 points total)
- **Income**: Low income = 10, Medium = 5, High = 2
- **Land Size**: <2 bigha = 10, 2-4 bigha = 7, >4 bigha = 3
- **Previous Grants**: None = 10, 1 grant = 5, >1 = 2
- **Crop Yield**: High yield = 10, Average = 7, Low = 4

### Additional Factors (20 points total)
- **Family Size**: Large families get higher priority
- **Age**: Elderly and young farmers get special consideration
- **Farming Experience**: New farmers get support priority
- **Credit Score**: Poor credit indicates need for support
- **Market Distance**: Remote locations get higher priority
- **Technology Adoption**: Non-adopters get support priority
- **Social Category**: Marginalized groups get inclusive development priority
- **Disability Status**: Special consideration for disabled farmers

## Installation

1. **Install Dependencies**:
```bash
pip install -r requirements.txt
```

2. **Generate Dataset**:
```bash
python data_generator.py
```

3. **Train Model**:
```bash
python ml_model.py
```

4. **Start FastAPI Service**:
```bash
python fastapi_app.py
```

## API Endpoints

### Health & Info
- `GET /` - Service status
- `GET /health` - Health check
- `GET /model/info` - Model information

### Predictions
- `POST /predict` - Single farmer prediction
- `POST /predict/batch` - Batch predictions for multiple farmers

### Model Management
- `POST /model/train` - Train/retrain the model
- `POST /data/generate` - Generate new dataset
- `GET /data/stats` - Dataset statistics

## Usage Examples

### Single Prediction
```python
import requests

# Farmer data
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

# Make prediction
response = requests.post("http://localhost:8001/predict", json={
    "farmer_data": farmer_data,
    "grant_id": "GRANT_001"
})

result = response.json()
print(f"Priority Score: {result['priority_score']}")
print(f"Recommendation: {result['recommendation']}")
```

### Batch Prediction
```python
# Multiple farmers
farmers = [farmer_data1, farmer_data2, farmer_data3]

response = requests.post("http://localhost:8001/predict/batch", json={
    "farmers": farmers,
    "grant_id": "GRANT_001"
})

result = response.json()
print(f"Total farmers: {result['summary']['total_farmers']}")
print(f"High priority: {result['summary']['high_priority']}")
```

## Model Performance

The Logistic Regression model typically achieves:
- **Accuracy**: 85-90%
- **Cross-validation Score**: 83-88%
- **Feature Importance**: Income, land size, and previous grants are most important

## Files Structure

```
aiml/
├── requirements.txt          # Python dependencies
├── data_generator.py         # Dataset generation
├── ml_model.py              # ML model implementation
├── fastapi_app.py           # FastAPI service
├── README.md                # This file
├── farmer_dataset.csv       # Generated dataset
├── farmer_prioritization_model.joblib    # Trained model
├── farmer_prioritization_scaler.joblib   # Feature scaler
└── farmer_prioritization_encoders.joblib # Label encoders
```

## Integration with Main Application

To integrate with the main AgriFairConnect application:

1. **Add AI Service URL** to your frontend configuration
2. **Create API client** for AI service calls
3. **Add AI Selection component** to admin dashboard
4. **Update application processing** to use AI predictions

## Development

### Adding New Features
1. Update `data_generator.py` for new data fields
2. Modify `ml_model.py` for new features
3. Update `fastapi_app.py` for new endpoints
4. Test with synthetic data

### Model Improvements
- Try different algorithms (Random Forest, XGBoost)
- Add feature engineering
- Implement ensemble methods
- Add model explainability

## Monitoring

- Model accuracy tracking
- Prediction confidence monitoring
- API response times
- Error rate monitoring

## Security Considerations

- Input validation
- Rate limiting
- Authentication for admin endpoints
- Data privacy protection

## License

This project is part of AgriFairConnect and follows the same license terms.
