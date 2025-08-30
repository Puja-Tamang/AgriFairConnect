#!/usr/bin/env python3
"""
Startup script for AgriFairConnect AI Service
This script will:
1. Generate the dataset if it doesn't exist
2. Train the model if it doesn't exist
3. Start the FastAPI service
"""

import os
import sys
import subprocess
import time
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors."""
    print(f"\n{'='*50}")
    print(f"Running: {description}")
    print(f"Command: {command}")
    print('='*50)
    
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print("✅ Success!")
        if result.stdout:
            print("Output:", result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print("❌ Error!")
        print("Error:", e.stderr)
        return False

def check_file_exists(filename):
    """Check if a file exists."""
    return Path(filename).exists()

def main():
    print("🚀 Starting AgriFairConnect AI Service Setup")
    print("="*60)
    
    # Check if we're in the right directory
    if not Path("requirements.txt").exists():
        print("❌ Error: requirements.txt not found. Please run this script from the aiml directory.")
        sys.exit(1)
    
    # Step 1: Install dependencies
    print("\n📦 Step 1: Installing dependencies...")
    if not run_command("pip install -r requirements.txt", "Installing Python dependencies"):
        print("❌ Failed to install dependencies. Please check your Python environment.")
        sys.exit(1)
    
    # Step 2: Generate dataset if it doesn't exist
    print("\n📊 Step 2: Checking dataset...")
    if not check_file_exists("farmer_dataset.csv"):
        print("Dataset not found. Generating new dataset...")
        if not run_command("python data_generator.py", "Generating farmer dataset"):
            print("❌ Failed to generate dataset.")
            sys.exit(1)
    else:
        print("✅ Dataset already exists.")
    
    # Step 3: Train model if it doesn't exist
    print("\n🤖 Step 3: Checking model...")
    model_files = [
        "farmer_prioritization_model.joblib",
        "farmer_prioritization_scaler.joblib", 
        "farmer_prioritization_encoders.joblib"
    ]
    
    if not all(check_file_exists(f) for f in model_files):
        print("Model files not found. Training new model...")
        if not run_command("python ml_model.py", "Training ML model"):
            print("❌ Failed to train model.")
            sys.exit(1)
    else:
        print("✅ Model already exists.")
    
    # Step 4: Start FastAPI service
    print("\n🌐 Step 4: Starting FastAPI service...")
    print("The AI service will be available at: http://localhost:8001")
    print("API documentation will be available at: http://localhost:8001/docs")
    print("\nPress Ctrl+C to stop the service.")
    
    try:
        run_command("python fastapi_app.py", "Starting FastAPI service")
    except KeyboardInterrupt:
        print("\n\n🛑 Service stopped by user.")
    except Exception as e:
        print(f"\n❌ Error starting service: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
