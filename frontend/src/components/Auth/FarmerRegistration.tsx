import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import toast from 'react-hot-toast';
import { Farmer } from '../../types';
import LanguageToggle from '../Layout/LanguageToggle';
import { apiClient } from '../../services/apiClient';

const FarmerRegistration: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { t } = useLanguage();
  
  const username = location.state?.username || '';
  const password = location.state?.password || '';
  const isNewSignup = location.state?.isNewSignup || false;
  

  
  const [formData, setFormData] = useState({
    username: username || '',
    password: password || '',
    name: '',
    address: '',
    ward: '',
    municipality: '',
    email: '',
  });

  const municipalities = [
    'भद्रपुर नगरपालिका',
    'मेचीनगर नगरपालिका',
    'दमक नगरपालिका',
    'कन्काई नगरपालिका',
    'अर्जुनधारा नगरपालिका',
    'शिवसताक्षी नगरपालिका',
    'गौरादह नगरपालिका',
    'बिर्तामोड नगरपालिका',
    'कमल गाउँपालिका',
    'गौरिगन्ज गाउँपालिका',
    'बरहादशी गाउँपालिका',
    'झापा गाउँपालिका',
    'बुद्धशान्ति गाउँपालिका',
    'हल्दिबारी गाउँपालिका',
    'कचनकवल गाउँपालिका'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };





  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.username || !formData.password || !formData.name || !formData.address || !formData.ward || !formData.municipality) {
      toast.error(t('registration.fillAllFields'));
      return;
    }

    if (formData.password.length < 6) {
      toast.error(t('login.passwordTooShort'));
      return;
    }

    if (!formData.email) {
      toast.error('Email is required');
      return;
    }

    // Check if username is available (only for new signups)
    if (isNewSignup) {
      try {
        const exists = await apiClient.checkUsernameExists(formData.username);
        if (exists) {
          toast.error(t('login.usernameExists'));
          return;
        }
      } catch (error) {
        console.log('Could not check username availability, proceeding anyway...');
      }
    }

    // Document validation is optional for now - can be uploaded later
    // if (!documents.citizenImage || !documents.landOwnership || !documents.landTax) {
    //   toast.error(t('registration.uploadAllDocs'));
    //   return;
    // }

    try {
      console.log('Form data:', formData);
      
      const farmer: Farmer = {
        id: `farmer-${formData.username}`,
        name: formData.name,
        phone: '9800000000', // Default phone number
        email: formData.email || undefined,
        type: 'farmer',
        address: formData.address,
        ward: parseInt(formData.ward),
        municipality: formData.municipality,
        monthlyIncome: 0, // Default value
        landSize: 0, // Default value
        crops: [], // Empty array
        previousGrant: false, // Default value
        documents: {
          citizenImage: '',
          landOwnership: '',
          landTax: '',
        }
      };

      // Save to database using the database service
      // Save farmer profile using API
      const signupData = {
        Username: formData.username,
        Password: formData.password,
        FullName: formData.name,
        Address: formData.address,
        Email: formData.email, // Required field
        PhoneNumber: '9800000000', // Required field
        WardNumber: parseInt(formData.ward) || 1,
        Municipality: formData.municipality,
        MonthlyIncome: 0, // Default value
        LandSize: 0, // Default value
        CropIds: [], // Empty array
        HasReceivedGrantBefore: false // Default value
      };

      console.log('Sending signup data:', JSON.stringify(signupData, null, 2));
      
      // Show loading toast
      const loadingToast = toast.loading('Creating account...');
      
      const response = await apiClient.signup(signupData);
      console.log('Signup response:', response);
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to create account');
      }
      
      if (isNewSignup) {
        // For new signups, show success message and redirect to login
        toast.success(t('login.signupSuccess'));
        navigate('/login');
      } else {
        // For existing users updating profile, log them in
        login(farmer);
        toast.success(t('registration.profileCreated'));
        navigate('/farmer/dashboard');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.message || t('registration.profileFailed');
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 py-8">
      {/* Language Toggle - Top Right */}
      <div className="absolute top-4 right-4">
        <LanguageToggle className="bg-white text-green-600 hover:bg-green-600 hover:text-white shadow-lg" />
      </div>
      
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{t('registration.title')}</h1>
            <p className="text-gray-600 mt-2">{t('registration.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('registration.personalInfo')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('registration.fullName')} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder={t('registration.fullName')}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('login.username')} *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder={t('login.username')}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('login.password')} *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="••••••••"
                    minLength={6}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('registration.address')} *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder={t('registration.address')}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('registration.email')} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('registration.wardNo')} *
                  </label>
                  <input
                    type="number"
                    name="ward"
                    value={formData.ward}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder={t('registration.wardNo')}
                    min="1"
                    max="50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('registration.municipality')} *
                  </label>
                  <select
                    name="municipality"
                    value={formData.municipality}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    <option value="">{t('registration.selectMunicipality')}</option>
                    {municipalities.map(municipality => (
                      <option key={municipality} value={municipality}>
                        {municipality}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>





            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-secondary flex-1"
              >
                {t('back')}
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
              >
                {isNewSignup ? t('registration.createProfile') : t('save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FarmerRegistration;