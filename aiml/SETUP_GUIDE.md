# 🚀 AgriFairConnect AI System Setup Guide

This guide will help you set up and use the AI-powered farmer prioritization system for grant applications.

## 📋 Prerequisites

- Python 3.8 or higher
- Node.js and npm (for frontend)
- Git

## 🛠️ Installation Steps

### Step 1: Clone and Navigate to AI Directory
```bash
cd aiml
```

### Step 2: Install Python Dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Generate Dataset
```bash
python data_generator.py
```
This creates a CSV file with 150+ synthetic farmer records for training.

### Step 4: Train the ML Model
```bash
python ml_model.py
```
This will:
- Load the dataset
- Train a Logistic Regression model
- Save the trained model files
- Display model performance metrics

### Step 5: Start the AI Service
```bash
python fastapi_app.py
```
The AI service will be available at: `http://localhost:8001`

## 🎯 How to Use the AI System

### 1. Access AI Selection in Frontend
1. Start your frontend application: `cd frontend && npm run dev`
2. Login as an admin user
3. Navigate to "AI Selection" from the admin dashboard
4. Select a grant for analysis
5. Click "Run AI Analysis"

### 2. Understanding the Results

#### Priority Score Categories:
- **8.0-10.0**: High Priority (Green) - Highly recommended for approval
- **6.0-7.9**: Medium Priority (Yellow) - Recommended for approval
- **4.0-5.9**: Low Priority (Orange) - Consider for approval
- **0.0-3.9**: Not Recommended (Red) - Low priority

#### Key Metrics:
- **Approval Probability**: ML model's prediction (0-100%)
- **Confidence**: How certain the model is about its prediction
- **Priority Score**: Comprehensive score based on multiple factors
- **Recommendation**: AI-generated recommendation with reasoning

### 3. AI Service API Endpoints

#### Health Check
```bash
curl http://localhost:8001/health
```

#### Single Farmer Prediction
```bash
curl -X POST http://localhost:8001/predict \
  -H "Content-Type: application/json" \
  -d '{
    "farmer_data": {
      "farmer_id": "FARMER_001",
      "full_name": "Ram Shrestha",
      "monthly_income": 12000,
      "land_size_bigha": 1.5,
      "previous_grants": 0,
      "crop_yield": "low"
    },
    "grant_id": "GRANT_001"
  }'
```

#### Batch Prediction
```bash
curl -X POST http://localhost:8001/predict/batch \
  -H "Content-Type: application/json" \
  -d '{
    "farmers": [farmer_data_array],
    "grant_id": "GRANT_001"
  }'
```

## 📊 Model Performance

The Logistic Regression model typically achieves:
- **Accuracy**: 76-89%
- **Cross-validation Score**: 83-88%
- **Feature Importance**: 
  - Land size (most important)
  - Monthly income
  - Irrigation availability
  - Crop yield
  - Family size

## 🎨 Visual Features

### Dashboard Widget
- Real-time AI service status
- Model accuracy display
- Key factors visualization
- Quick insights

### AI Selection Page
- Grant selection dropdown
- Analysis summary with statistics
- Ranked applications table
- Color-coded priority indicators
- Detailed reasoning for each recommendation

### Visual Elements
- Progress bars for priority scores
- Color-coded status badges
- Confidence level indicators
- Ranking numbers with priority colors

## 🔧 Troubleshooting

### AI Service Not Running
1. Check if Python dependencies are installed
2. Ensure port 8001 is not in use
3. Check console for error messages
4. Verify the model files exist

### Model Training Issues
1. Ensure dataset file exists (`farmer_dataset.csv`)
2. Check Python version compatibility
3. Verify scikit-learn installation
4. Check available memory for training

### Frontend Connection Issues
1. Verify AI service is running on `localhost:8001`
2. Check browser console for CORS errors
3. Ensure network connectivity
4. Check firewall settings

## 📈 Scoring Criteria

The AI system evaluates farmers based on:

### Primary Factors (40 points):
- **Income**: Low = 10, Medium = 5, High = 2
- **Land Size**: <2 bigha = 10, 2-4 bigha = 7, >4 bigha = 3
- **Previous Grants**: None = 10, 1 = 5, >1 = 2
- **Crop Yield**: High = 10, Average = 7, Low = 4

### Additional Factors (20 points):
- Family size, age, farming experience
- Credit score, market distance
- Technology adoption, social category
- Disability status, irrigation availability

## 🔄 Model Retraining

To retrain the model with new data:
```bash
curl -X POST http://localhost:8001/model/train
```

## 📝 Customization

### Adding New Features
1. Update `data_generator.py` to include new fields
2. Modify `ml_model.py` feature selection
3. Update `fastapi_app.py` API models
4. Test with new data

### Adjusting Scoring Weights
1. Modify `calculate_priority_score()` function
2. Update scoring criteria in `data_generator.py`
3. Retrain the model
4. Test with sample data

## 🚀 Quick Start Script

Use the automated setup script:
```bash
python start_ai_service.py
```

This script will:
1. Install dependencies
2. Generate dataset (if needed)
3. Train model (if needed)
4. Start the FastAPI service

## 📞 Support

For issues or questions:
1. Check the console logs
2. Verify all services are running
3. Test API endpoints manually
4. Review the model performance metrics

## 🎉 Success Indicators

You'll know the system is working when:
- AI service shows "healthy" status
- Model accuracy is above 75%
- Frontend can connect to AI service
- Priority scores are generated for applications
- Visual indicators show proper color coding

---

**Happy AI-powered grant selection! 🎯🤖**
