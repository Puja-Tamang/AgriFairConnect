import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

class FraudDetectionModel:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.feature_names = ['monthly_income', 'land_size_bigha', 'previous_grants']
        
    def generate_fraud_data(self, n_samples=100):
        """Generate synthetic data with some fraudulent patterns"""
        np.random.seed(42)
        
        # Generate legitimate data
        legitimate_data = {
            'farmer_id': [f'FARMER_{i:03d}' for i in range(n_samples)],
            'farmer_name': [f'Farmer {i+1}' for i in range(n_samples)],
            'monthly_income': np.random.normal(15000, 5000, n_samples),
            'land_size_bigha': np.random.normal(3.0, 1.5, n_samples),
            'previous_grants': np.random.poisson(0.5, n_samples),
            'phone': [f'98{np.random.randint(10000000, 99999999)}' for _ in range(n_samples)],
            'email': [f'farmer{i+1}@gmail.com' for i in range(n_samples)],
            'municipality': ['भद्रपुर नगरपालिका'] * n_samples,
            'ward': np.random.randint(1, 11, n_samples),
            'crop_details': np.random.choice(['धान', 'मकै', 'गहुँ', 'सरसों', 'आलु'], n_samples),
            'is_fraudulent': [False] * n_samples
        }
        
        # Add fraudulent patterns (about 15% of data)
        fraud_indices = np.random.choice(n_samples, size=int(n_samples * 0.15), replace=False)
        
        for idx in fraud_indices:
            fraud_type = np.random.choice(['income_fraud', 'land_fraud', 'grant_fraud', 'combination_fraud'])
            
            if fraud_type == 'income_fraud':
                # Suspiciously low income but large land
                legitimate_data['monthly_income'][idx] = np.random.uniform(5000, 8000)
                legitimate_data['land_size_bigha'][idx] = np.random.uniform(8, 15)
                
            elif fraud_type == 'land_fraud':
                # Suspiciously large land but low income
                legitimate_data['land_size_bigha'][idx] = np.random.uniform(10, 20)
                legitimate_data['monthly_income'][idx] = np.random.uniform(8000, 12000)
                
            elif fraud_type == 'grant_fraud':
                # Many previous grants but still applying
                legitimate_data['previous_grants'][idx] = np.random.randint(5, 10)
                legitimate_data['monthly_income'][idx] = np.random.uniform(25000, 40000)
                
            elif fraud_type == 'combination_fraud':
                # Multiple suspicious factors
                legitimate_data['monthly_income'][idx] = np.random.uniform(30000, 50000)
                legitimate_data['land_size_bigha'][idx] = np.random.uniform(12, 25)
                legitimate_data['previous_grants'][idx] = np.random.randint(3, 8)
            
            legitimate_data['is_fraudulent'][idx] = True
        
        # Ensure data is within reasonable bounds
        legitimate_data['monthly_income'] = np.clip(legitimate_data['monthly_income'], 5000, 50000)
        legitimate_data['land_size_bigha'] = np.clip(legitimate_data['land_size_bigha'], 0.5, 25)
        legitimate_data['previous_grants'] = np.clip(legitimate_data['previous_grants'], 0, 10)
        
        return pd.DataFrame(legitimate_data)
    
    def prepare_features(self, data):
        """Prepare features for the model"""
        features = data[self.feature_names].copy()
        
        # Handle missing values
        features = features.fillna(features.median())
        
        # Scale features
        features_scaled = self.scaler.fit_transform(features)
        
        return features_scaled, features
    
    def train_model(self, data):
        """Train the Isolation Forest model"""
        print("🔄 Training Fraud Detection Model...")
        
        # Prepare features
        X_scaled, X_original = self.prepare_features(data)
        
        # Train Isolation Forest
        self.model = IsolationForest(
            contamination=0.15,  # Expected proportion of anomalies
            random_state=42,
            n_estimators=100,
            max_samples='auto'
        )
        
        self.model.fit(X_scaled)
        
        # Make predictions
        predictions = self.model.predict(X_scaled)
        scores = self.model.decision_function(X_scaled)
        
        # Convert predictions: -1 (anomaly) -> True (fraud), 1 (normal) -> False (fraud)
        fraud_predictions = (predictions == -1)
        
        # Calculate accuracy against synthetic labels
        accuracy = np.mean(fraud_predictions == data['is_fraudulent'])
        
        print(f"✅ Model trained successfully!")
        print(f"📊 Detection Accuracy: {accuracy:.2%}")
        print(f"🎯 Detected {np.sum(fraud_predictions)} potential fraud cases")
        print(f"📈 Actual fraud cases: {np.sum(data['is_fraudulent'])}")
        
        return {
            'accuracy': accuracy,
            'detected_fraud': int(np.sum(fraud_predictions)),
            'actual_fraud': int(np.sum(data['is_fraudulent'])),
            'predictions': fraud_predictions,
            'scores': scores
        }
    
    def predict_fraud(self, data):
        """Predict fraud for new data"""
        if self.model is None:
            raise ValueError("Model not trained. Please train the model first.")
        
        # Prepare features
        X_scaled, X_original = self.prepare_features(data)
        
        # Make predictions
        predictions = self.model.predict(X_scaled)
        scores = self.model.decision_function(X_scaled)
        
        # Convert predictions
        fraud_predictions = (predictions == -1)
        
        return {
            'predictions': fraud_predictions,
            'scores': scores,
            'risk_level': self._calculate_risk_level(scores)
        }
    
    def _calculate_risk_level(self, scores):
        """Calculate risk level based on anomaly scores"""
        risk_levels = []
        for score in scores:
            if score < -0.3:
                risk_levels.append('High Risk')
            elif score < -0.1:
                risk_levels.append('Medium Risk')
            else:
                risk_levels.append('Low Risk')
        return risk_levels
    
    def save_model(self, filepath='fraud_detection_model.pkl'):
        """Save the trained model"""
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'feature_names': self.feature_names
        }
        joblib.dump(model_data, filepath)
        print(f"💾 Model saved to {filepath}")
    
    def load_model(self, filepath='fraud_detection_model.pkl'):
        """Load a trained model"""
        model_data = joblib.load(filepath)
        self.model = model_data['model']
        self.scaler = model_data['scaler']
        self.feature_names = model_data['feature_names']
        print(f"📂 Model loaded from {filepath}")
    
    def generate_visualizations(self, data, predictions, scores):
        """Generate fraud detection visualizations"""
        plt.style.use('default')
        
        # Create figure with subplots
        fig, axes = plt.subplots(2, 2, figsize=(15, 12))
        fig.suptitle('Fraud Detection Analysis', fontsize=16, fontweight='bold')
        
        # 1. Anomaly Score Distribution
        axes[0, 0].hist(scores, bins=30, alpha=0.7, color='skyblue', edgecolor='black')
        axes[0, 0].axvline(x=-0.1, color='orange', linestyle='--', label='Medium Risk Threshold')
        axes[0, 0].axvline(x=-0.3, color='red', linestyle='--', label='High Risk Threshold')
        axes[0, 0].set_xlabel('Anomaly Score')
        axes[0, 0].set_ylabel('Frequency')
        axes[0, 0].set_title('Anomaly Score Distribution')
        axes[0, 0].legend()
        axes[0, 0].grid(True, alpha=0.3)
        
        # 2. Income vs Land Size (with fraud highlighting)
        scatter = axes[0, 1].scatter(data['monthly_income'], data['land_size_bigha'], 
                                   c=scores, cmap='RdYlBu_r', alpha=0.7, s=50)
        axes[0, 1].set_xlabel('Monthly Income (NPR)')
        axes[0, 1].set_ylabel('Land Size (Bigha)')
        axes[0, 1].set_title('Income vs Land Size (Color: Anomaly Score)')
        plt.colorbar(scatter, ax=axes[0, 1], label='Anomaly Score')
        axes[0, 1].grid(True, alpha=0.3)
        
        # 3. Previous Grants vs Income
        scatter2 = axes[1, 0].scatter(data['previous_grants'], data['monthly_income'], 
                                    c=scores, cmap='RdYlBu_r', alpha=0.7, s=50)
        axes[1, 0].set_xlabel('Previous Grants')
        axes[1, 0].set_ylabel('Monthly Income (NPR)')
        axes[1, 0].set_title('Previous Grants vs Income (Color: Anomaly Score)')
        plt.colorbar(scatter2, ax=axes[1, 0], label='Anomaly Score')
        axes[1, 0].grid(True, alpha=0.3)
        
        # 4. Risk Level Distribution
        risk_levels = self._calculate_risk_level(scores)
        risk_counts = pd.Series(risk_levels).value_counts()
        colors = ['green', 'orange', 'red']
        axes[1, 1].pie(risk_counts.values, labels=risk_counts.index, autopct='%1.1f%%', 
                      colors=colors, startangle=90)
        axes[1, 1].set_title('Risk Level Distribution')
        
        plt.tight_layout()
        plt.savefig('fraud_detection_analysis.png', dpi=300, bbox_inches='tight')
        plt.close()
        
        print("📊 Visualizations saved as 'fraud_detection_analysis.png'")
        
        return {
            'risk_distribution': risk_counts.to_dict(),
            'avg_anomaly_score': np.mean(scores),
            'high_risk_count': np.sum(np.array(risk_levels) == 'High Risk'),
            'medium_risk_count': np.sum(np.array(risk_levels) == 'Medium Risk'),
            'low_risk_count': np.sum(np.array(risk_levels) == 'Low Risk')
        }

def main():
    """Main function to train and test the fraud detection model"""
    print("🚀 Starting Fraud Detection Model Training...")
    
    # Initialize model
    fraud_model = FraudDetectionModel()
    
    # Generate synthetic data
    print("📊 Generating synthetic data...")
    data = fraud_model.generate_fraud_data(n_samples=100)
    data.to_csv('fraud_detection_data.csv', index=False)
    print(f"💾 Data saved to 'fraud_detection_data.csv'")
    
    # Train model
    results = fraud_model.train_model(data)
    
    # Generate visualizations
    print("📈 Generating visualizations...")
    viz_results = fraud_model.generate_visualizations(data, results['predictions'], results['scores'])
    
    # Save model
    fraud_model.save_model()
    
    # Print summary
    print("\n" + "="*50)
    print("📋 FRAUD DETECTION MODEL SUMMARY")
    print("="*50)
    print(f"Total Applications: {len(data)}")
    print(f"Actual Fraud Cases: {results['actual_fraud']}")
    print(f"Detected Fraud Cases: {results['detected_fraud']}")
    print(f"Detection Accuracy: {results['accuracy']:.2%}")
    print(f"High Risk Applications: {viz_results['high_risk_count']}")
    print(f"Medium Risk Applications: {viz_results['medium_risk_count']}")
    print(f"Low Risk Applications: {viz_results['low_risk_count']}")
    print(f"Average Anomaly Score: {viz_results['avg_anomaly_score']:.3f}")
    print("="*50)
    
    return fraud_model, data, results

if __name__ == "__main__":
    fraud_model, data, results = main()
