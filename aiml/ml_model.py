import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.feature_selection import SelectKBest, f_classif
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
from typing import Dict, List, Tuple, Any
import warnings
warnings.filterwarnings('ignore')

class FarmerPrioritizationModel:
    """
    Machine Learning model for farmer prioritization using Logistic Regression.
    Predicts the likelihood of a farmer being approved for a grant based on various features.
    """
    
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.feature_columns = []
        self.target_column = 'application_status'
        self.model_path = 'farmer_prioritization_model.joblib'
        self.scaler_path = 'farmer_prioritization_scaler.joblib'
        self.encoders_path = 'farmer_prioritization_encoders.joblib'
        
    def preprocess_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Preprocess the dataset for machine learning.
        """
        df_processed = df.copy()
        
        # Handle missing values
        df_processed = df_processed.fillna(df_processed.mode().iloc[0])
        
        # Encode categorical variables
        categorical_columns = ['crop_yield', 'education_level', 'social_category']
        
        for col in categorical_columns:
            if col in df_processed.columns:
                le = LabelEncoder()
                df_processed[col] = le.fit_transform(df_processed[col].astype(str))
                self.label_encoders[col] = le
        
        # Convert boolean columns to integers
        boolean_columns = ['has_irrigation', 'uses_modern_technology', 'has_disability']
        for col in boolean_columns:
            if col in df_processed.columns:
                df_processed[col] = df_processed[col].astype(int)
        
        # Create binary target variable (approved = 1, pending = 0)
        df_processed['target'] = (df_processed[self.target_column] == 'approved').astype(int)
        
        return df_processed
    
    def select_features(self, df: pd.DataFrame) -> List[str]:
        """
        Select the most important features for the model.
        """
        # Define feature columns (excluding target and metadata)
        feature_candidates = [
            'monthly_income', 'land_size_bigha', 'previous_grants', 'crop_yield',
            'family_size', 'age', 'farming_experience_years', 'credit_score',
            'market_distance_km', 'has_irrigation', 'uses_modern_technology',
            'social_category', 'has_disability'
        ]
        
        # Filter columns that exist in the dataset
        available_features = [col for col in feature_candidates if col in df.columns]
        
        # Use SelectKBest to select top features
        X = df[available_features]
        y = df['target']
        
        # Select top 10 features
        selector = SelectKBest(score_func=f_classif, k=min(10, len(available_features)))
        selector.fit(X, y)
        
        # Get selected feature names
        selected_features = [available_features[i] for i in selector.get_support(indices=True)]
        
        print(f"Selected features: {selected_features}")
        return selected_features
    
    def train_model(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Train the Logistic Regression model.
        """
        print("Preprocessing data...")
        df_processed = self.preprocess_data(df)
        
        print("Selecting features...")
        self.feature_columns = self.select_features(df_processed)
        
        # Prepare features and target
        X = df_processed[self.feature_columns]
        y = df_processed['target']
        
        # Split the data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Scale the features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train the model
        print("Training Logistic Regression model...")
        self.model = LogisticRegression(
            random_state=42,
            max_iter=1000,
            C=1.0,
            solver='lbfgs'
        )
        
        self.model.fit(X_train_scaled, y_train)
        
        # Make predictions
        y_pred = self.model.predict(X_test_scaled)
        y_pred_proba = self.model.predict_proba(X_test_scaled)[:, 1]
        
        # Calculate metrics
        accuracy = accuracy_score(y_test, y_pred)
        cv_scores = cross_val_score(self.model, X_train_scaled, y_train, cv=5)
        
        # Create results dictionary
        results = {
            'accuracy': accuracy,
            'cv_mean': cv_scores.mean(),
            'cv_std': cv_scores.std(),
            'classification_report': classification_report(y_test, y_pred),
            'confusion_matrix': confusion_matrix(y_test, y_pred),
            'feature_importance': dict(zip(self.feature_columns, self.model.coef_[0])),
            'test_predictions': y_pred,
            'test_probabilities': y_pred_proba,
            'test_actual': y_test.values
        }
        
        print(f"Model Accuracy: {accuracy:.4f}")
        print(f"Cross-validation Score: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")
        
        return results
    
    def predict_priority(self, farmer_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict priority score for a single farmer.
        """
        if self.model is None:
            raise ValueError("Model not trained. Please train the model first.")
        
        # Create a DataFrame with the farmer data
        df_farmer = pd.DataFrame([farmer_data])
        
        # Preprocess the data
        df_processed = self.preprocess_data(df_farmer)
        
        # Select features
        X = df_processed[self.feature_columns]
        
        # Scale features
        X_scaled = self.scaler.transform(X)
        
        # Make prediction
        approval_probability = self.model.predict_proba(X_scaled)[0, 1]
        prediction = self.model.predict(X_scaled)[0]
        
        # Calculate priority score based on probability and other factors
        priority_score = self.calculate_priority_score(farmer_data, approval_probability)
        
        return {
            'farmer_id': farmer_data.get('farmer_id', 'Unknown'),
            'approval_probability': round(approval_probability, 4),
            'predicted_status': 'approved' if prediction == 1 else 'pending',
            'priority_score': round(priority_score, 2),
            'confidence': round(abs(approval_probability - 0.5) * 2, 4)  # Distance from 0.5
        }
    
    def calculate_priority_score(self, farmer_data: Dict[str, Any], approval_probability: float) -> float:
        """
        Calculate priority score based on farmer data and ML prediction.
        """
        score = 0.0
        
        # Base score from ML model (40% weight)
        score += approval_probability * 4.0
        
        # Economic factors (30% weight)
        monthly_income = farmer_data.get('monthly_income', 0)
        if monthly_income < 15000:
            score += 3.0  # Low income - highest priority
        elif monthly_income < 35000:
            score += 1.5  # Medium income
        else:
            score += 0.6  # High income
        
        # Land size factor (15% weight)
        land_size = farmer_data.get('land_size_bigha', 0)
        if land_size < 2:
            score += 1.5  # Small land - highest priority
        elif land_size <= 4:
            score += 1.05  # Medium land
        else:
            score += 0.45  # Large land
        
        # Previous grants factor (10% weight)
        previous_grants = farmer_data.get('previous_grants', 0)
        if previous_grants == 0:
            score += 1.0  # No previous grants - highest priority
        elif previous_grants == 1:
            score += 0.5  # One previous grant
        else:
            score += 0.2  # Multiple previous grants
        
        # Social factors (5% weight)
        social_category = farmer_data.get('social_category', 'general')
        if social_category in ['dalit', 'janajati', 'madhesi']:
            score += 0.5  # Marginalized groups
        
        # Normalize to 0-10 scale
        return min(score, 10.0)
    
    def save_model(self):
        """Save the trained model and preprocessing objects."""
        if self.model is None:
            raise ValueError("No model to save. Please train the model first.")
        
        joblib.dump(self.model, self.model_path)
        joblib.dump(self.scaler, self.scaler_path)
        joblib.dump(self.label_encoders, self.encoders_path)
        
        print(f"Model saved to {self.model_path}")
        print(f"Scaler saved to {self.scaler_path}")
        print(f"Encoders saved to {self.encoders_path}")
    
    def load_model(self):
        """Load the trained model and preprocessing objects."""
        try:
            self.model = joblib.load(self.model_path)
            self.scaler = joblib.load(self.scaler_path)
            self.label_encoders = joblib.load(self.encoders_path)
            print("Model loaded successfully!")
            return True
        except FileNotFoundError:
            print("Model files not found. Please train the model first.")
            return False
    
    def plot_feature_importance(self, results: Dict[str, Any]):
        """Plot feature importance."""
        feature_importance = results['feature_importance']
        
        plt.figure(figsize=(10, 6))
        features = list(feature_importance.keys())
        importance = list(feature_importance.values())
        
        # Sort by absolute importance
        sorted_idx = np.argsort(np.abs(importance))
        features = [features[i] for i in sorted_idx]
        importance = [importance[i] for i in sorted_idx]
        
        plt.barh(range(len(features)), importance)
        plt.yticks(range(len(features)), features)
        plt.xlabel('Feature Importance (Coefficient)')
        plt.title('Feature Importance for Farmer Prioritization')
        plt.tight_layout()
        plt.savefig('feature_importance.png', dpi=300, bbox_inches='tight')
        plt.show()
    
    def plot_confusion_matrix(self, results: Dict[str, Any]):
        """Plot confusion matrix."""
        cm = results['confusion_matrix']
        
        plt.figure(figsize=(8, 6))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                   xticklabels=['Pending', 'Approved'],
                   yticklabels=['Pending', 'Approved'])
        plt.title('Confusion Matrix')
        plt.ylabel('Actual')
        plt.xlabel('Predicted')
        plt.tight_layout()
        plt.savefig('confusion_matrix.png', dpi=300, bbox_inches='tight')
        plt.show()

def train_and_evaluate_model():
    """Train and evaluate the farmer prioritization model."""
    # Load the dataset
    try:
        df = pd.read_csv('farmer_dataset.csv')
        print(f"Dataset loaded: {len(df)} farmers")
    except FileNotFoundError:
        print("Dataset not found. Please run data_generator.py first.")
        return None
    
    # Initialize and train the model
    model = FarmerPrioritizationModel()
    results = model.train_model(df)
    
    # Save the model
    model.save_model()
    
    # Plot results
    model.plot_feature_importance(results)
    model.plot_confusion_matrix(results)
    
    # Print detailed results
    print("\n" + "="*50)
    print("MODEL EVALUATION RESULTS")
    print("="*50)
    print(f"Accuracy: {results['accuracy']:.4f}")
    print(f"Cross-validation Score: {results['cv_mean']:.4f} (+/- {results['cv_std'] * 2:.4f})")
    print("\nClassification Report:")
    print(results['classification_report'])
    
    print("\nFeature Importance:")
    for feature, importance in sorted(results['feature_importance'].items(), 
                                    key=lambda x: abs(x[1]), reverse=True):
        print(f"{feature}: {importance:.4f}")
    
    return model, results

if __name__ == "__main__":
    model, results = train_and_evaluate_model()
