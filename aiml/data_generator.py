import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta

def generate_farmer_dataset(num_farmers=150):
    """
    Generate a comprehensive dataset of farmers with various characteristics
    for training the AI prioritization model.
    """
    
    # Set random seed for reproducibility
    np.random.seed(42)
    random.seed(42)
    
    # Farmer names (Nepali names)
    first_names = [
        "Ram", "Sita", "Gita", "Hari", "Laxmi", "Krishna", "Radha", "Bishnu", 
        "Parvati", "Shiva", "Durga", "Ganesh", "Saraswati", "Buddha", "Maya",
        "Prakash", "Sunita", "Rajesh", "Anita", "Mohan", "Kumari", "Bikash",
        "Sabina", "Dinesh", "Rekha", "Suresh", "Puja", "Narayan", "Asha", "Ramesh"
    ]
    
    last_names = [
        "Shrestha", "Tamang", "Gurung", "Magar", "Rai", "Limbu", "Sherpa", "Thapa",
        "Karki", "Pandey", "Bhattarai", "Adhikari", "Khadka", "Rana", "Basnet",
        "Dahal", "Koirala", "Poudel", "Acharya", "Joshi", "Maharjan", "Shakya",
        "Bajracharya", "Vajracharya", "Tuladhar", "Manandhar", "Dangol", "Malla"
    ]
    
    # Municipalities
    municipalities = [
        "भद्रपुर नगरपालिका", "मेचीनगर नगरपालिका", "इटहरी नगरपालिका", 
        "धरान नगरपालिका", "बिराटनगर नगरपालिका", "बिरेन्द्रनगर नगरपालिका",
        "पोखरा नगरपालिका", "ललितपुर नगरपालिका", "भक्तपुर नगरपालिका",
        "धुलिखेल नगरपालिका", "बनेपा नगरपालिका", "पनौती नगरपालिका"
    ]
    
    # Crops
    crops = [
        "धान", "मकै", "गहुँ", "जौ", "आलु", "प्याज", "लसुन", "बन्दाकोबी", 
        "काउली", "टमाटर", "खुर्सानी", "भन्टा", "करेला", "लौका", "फर्सी"
    ]
    
    data = []
    
    for i in range(num_farmers):
        # Basic farmer info
        farmer_id = f"FARMER_{i+1:03d}"
        first_name = random.choice(first_names)
        last_name = random.choice(last_names)
        full_name = f"{first_name} {last_name}"
        
        # Contact info
        phone = f"98{random.randint(10000000, 99999999)}"
        email = f"{first_name.lower()}{random.randint(1, 999)}@gmail.com"
        
        # Location
        municipality = random.choice(municipalities)
        ward = random.randint(1, 15)
        address = f"Ward {ward}, {municipality}"
        
        # Economic indicators
        monthly_income = random.choice([
            random.randint(5000, 15000),    # Low income (10 points)
            random.randint(15001, 35000),   # Medium income (5 points)
            random.randint(35001, 80000)    # High income (2 points)
        ])
        
        land_size = random.choice([
            random.uniform(0.5, 1.9),       # <2 bigha (10 points)
            random.uniform(2.0, 4.0),       # 2-4 bigha (7 points)
            random.uniform(4.1, 10.0)       # >4 bigha (3 points)
        ])
        
        # Grant history
        previous_grants = random.choice([
            0,  # No previous grants (10 points)
            1,  # 1 previous grant (5 points)
            random.randint(2, 5)  # >1 previous grants (2 points)
        ])
        
        # Crop yield (based on land size and income as proxy)
        if land_size < 2 and monthly_income < 15000:
            crop_yield = random.choice(["low", "average"])  # Low yield (4 points)
        elif land_size > 4 and monthly_income > 35000:
            crop_yield = random.choice(["high", "average"])  # High yield (10 points)
        else:
            crop_yield = random.choice(["high", "average", "low"])  # Average yield (7 points)
        
        # Current crops (1-3 crops per farmer)
        num_crops = random.randint(1, 3)
        current_crops = random.sample(crops, num_crops)
        
        # Education level (proxy for farming knowledge)
        education_level = random.choice([
            "primary",      # Primary education
            "secondary",    # Secondary education
            "higher_secondary",  # Higher secondary
            "bachelor",     # Bachelor's degree
            "none"          # No formal education
        ])
        
        # Family size (affects need for support)
        family_size = random.randint(2, 8)
        
        # Age (affects experience and need)
        age = random.randint(25, 70)
        
        # Farming experience (years)
        farming_experience = random.randint(1, 30)
        
        # Credit score (proxy for financial responsibility)
        credit_score = random.randint(300, 850)
        
        # Distance from market center (affects accessibility)
        market_distance_km = random.uniform(0.5, 25.0)
        
        # Irrigation availability
        has_irrigation = random.choice([True, False])
        
        # Technology adoption
        uses_modern_technology = random.choice([True, False])
        
        # Social category (for inclusive development)
        social_category = random.choice([
            "general", "dalit", "janajati", "madhesi", "other"
        ])
        
        # Disability status
        has_disability = random.choice([True, False])
        
        # Priority score (target variable for ML model)
        # This will be calculated based on the scoring criteria
        priority_score = calculate_priority_score(
            monthly_income, land_size, previous_grants, crop_yield,
            family_size, age, farming_experience, credit_score,
            market_distance_km, has_irrigation, uses_modern_technology,
            social_category, has_disability
        )
        
        # Application status (for training data)
        application_status = "approved" if priority_score > 7.0 else "pending"
        
        # Timestamps
        registration_date = datetime.now() - timedelta(days=random.randint(1, 365))
        last_updated = datetime.now() - timedelta(days=random.randint(1, 30))
        
        farmer_data = {
            'farmer_id': farmer_id,
            'full_name': full_name,
            'phone': phone,
            'email': email,
            'address': address,
            'municipality': municipality,
            'ward': ward,
            'monthly_income': monthly_income,
            'land_size_bigha': round(land_size, 2),
            'previous_grants': previous_grants,
            'crop_yield': crop_yield,
            'current_crops': ', '.join(current_crops),
            'education_level': education_level,
            'family_size': family_size,
            'age': age,
            'farming_experience_years': farming_experience,
            'credit_score': credit_score,
            'market_distance_km': round(market_distance_km, 2),
            'has_irrigation': has_irrigation,
            'uses_modern_technology': uses_modern_technology,
            'social_category': social_category,
            'has_disability': has_disability,
            'priority_score': round(priority_score, 2),
            'application_status': application_status,
            'registration_date': registration_date.strftime('%Y-%m-%d'),
            'last_updated': last_updated.strftime('%Y-%m-%d')
        }
        
        data.append(farmer_data)
    
    return pd.DataFrame(data)

def calculate_priority_score(monthly_income, land_size, previous_grants, crop_yield,
                           family_size, age, farming_experience, credit_score,
                           market_distance_km, has_irrigation, uses_modern_technology,
                           social_category, has_disability):
    """
    Calculate priority score based on multiple criteria.
    Higher score = higher priority for grant.
    """
    score = 0.0
    
    # Income scoring (10 points max)
    if monthly_income < 15000:
        score += 10  # Low income - highest priority
    elif monthly_income < 35000:
        score += 5   # Medium income
    else:
        score += 2   # High income - lowest priority
    
    # Land size scoring (10 points max)
    if land_size < 2:
        score += 10  # Small land - highest priority
    elif land_size <= 4:
        score += 7   # Medium land
    else:
        score += 3   # Large land - lower priority
    
    # Previous grants scoring (10 points max)
    if previous_grants == 0:
        score += 10  # No previous grants - highest priority
    elif previous_grants == 1:
        score += 5   # One previous grant
    else:
        score += 2   # Multiple previous grants - lower priority
    
    # Crop yield scoring (10 points max)
    if crop_yield == "high":
        score += 10  # High yield - good farmer
    elif crop_yield == "average":
        score += 7   # Average yield
    else:
        score += 4   # Low yield - needs support
    
    # Additional factors (20 points max)
    
    # Family size (5 points max)
    if family_size >= 6:
        score += 5   # Large family - more need
    elif family_size >= 4:
        score += 3
    else:
        score += 1
    
    # Age factor (3 points max)
    if age > 60:
        score += 3   # Elderly - more vulnerable
    elif age < 30:
        score += 2   # Young - potential for growth
    else:
        score += 1
    
    # Farming experience (3 points max)
    if farming_experience < 5:
        score += 3   # New farmer - needs support
    elif farming_experience > 20:
        score += 2   # Experienced farmer
    else:
        score += 1
    
    # Credit score (3 points max)
    if credit_score < 500:
        score += 3   # Poor credit - needs support
    elif credit_score > 700:
        score += 1   # Good credit
    else:
        score += 2
    
    # Market distance (3 points max)
    if market_distance_km > 15:
        score += 3   # Remote location - needs support
    elif market_distance_km > 5:
        score += 2
    else:
        score += 1
    
    # Technology adoption (2 points max)
    if not uses_modern_technology:
        score += 2   # Needs technology support
    else:
        score += 0
    
    # Social category (1 point max)
    if social_category in ["dalit", "janajati", "madhesi"]:
        score += 1   # Marginalized groups
    
    # Disability (1 point max)
    if has_disability:
        score += 1   # Special consideration
    
    # Normalize score to 0-10 scale
    max_possible_score = 60  # 10+10+10+10+20 = 60
    normalized_score = (score / max_possible_score) * 10
    
    return normalized_score

def save_dataset():
    """Generate and save the dataset to CSV file."""
    print("Generating farmer dataset...")
    df = generate_farmer_dataset(150)
    
    # Save to CSV
    csv_path = "farmer_dataset.csv"
    df.to_csv(csv_path, index=False)
    print(f"Dataset saved to {csv_path}")
    print(f"Total farmers: {len(df)}")
    print(f"Columns: {list(df.columns)}")
    
    # Display some statistics
    print("\nDataset Statistics:")
    print(f"Average priority score: {df['priority_score'].mean():.2f}")
    print(f"Priority score range: {df['priority_score'].min():.2f} - {df['priority_score'].max():.2f}")
    print(f"Approved applications: {(df['application_status'] == 'approved').sum()}")
    print(f"Pending applications: {(df['application_status'] == 'pending').sum()}")
    
    return df

if __name__ == "__main__":
    df = save_dataset()
    print("\nFirst 5 rows:")
    print(df.head())
