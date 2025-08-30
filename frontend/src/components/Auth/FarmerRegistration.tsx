import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload, X } from 'lucide-react';
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
    monthlyIncome: '',
    landSize: '',
    crops: [] as string[],
    previousGrant: false,
  });

  const [documents, setDocuments] = useState({
    citizenImage: null as File | null,
    landOwnership: null as File | null,
    landTax: null as File | null,
  });

  const [previews, setPreviews] = useState({
    citizenImage: '',
    landOwnership: '',
    landTax: '',
  });

  const cropOptions = [
    { key: 'rice', label: t('crops.rice') },
    { key: 'corn', label: t('crops.corn') },
    { key: 'wheat', label: t('crops.wheat') },
    { key: 'barley', label: t('crops.barley') },
    { key: 'potato', label: t('crops.potato') },
    { key: 'onion', label: t('crops.onion') },
    { key: 'garlic', label: t('crops.garlic') },
    { key: 'cabbage', label: t('crops.cabbage') },
    { key: 'cauliflower', label: t('crops.cauliflower') },
    { key: 'tomato', label: t('crops.tomato') },
    { key: 'chili', label: t('crops.chili') },
    { key: 'eggplant', label: t('crops.eggplant') },
    { key: 'bitterGourd', label: t('crops.bitterGourd') },
    { key: 'bottleGourd', label: t('crops.bottleGourd') },
    { key: 'okra', label: t('crops.okra') }
  ];

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

  const handleCropToggle = (crop: string) => {
    setFormData(prev => ({
      ...prev,
      crops: prev.crops.includes(crop)
        ? prev.crops.filter(c => c !== crop)
        : [...prev.crops, crop]
    }));
  };

  const handleFileUpload = (field: keyof typeof documents, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('registration.fileSizeError'));
      return;
    }

    setDocuments(prev => ({ ...prev, [field]: file }));
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviews(prev => ({ ...prev, [field]: e.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const removeFile = (field: keyof typeof documents) => {
    setDocuments(prev => ({ ...prev, [field]: null }));
    setPreviews(prev => ({ ...prev, [field]: '' }));
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

    if (formData.crops.length === 0) {
      toast.error(t('registration.selectCrop'));
      return;
    }

    // Validate numeric fields
    if (isNaN(parseFloat(formData.monthlyIncome)) || parseFloat(formData.monthlyIncome) <= 0) {
      toast.error('Please enter a valid monthly income');
      return;
    }

    if (isNaN(parseFloat(formData.landSize)) || parseFloat(formData.landSize) <= 0) {
      toast.error('Please enter a valid land size');
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
      console.log('Documents:', documents);
      
      const farmer: Farmer = {
        id: `farmer-${formData.username}`,
        name: formData.name,
        phone: '9800000000', // Default phone number
        email: formData.email || undefined,
        type: 'farmer',
        address: formData.address,
        ward: parseInt(formData.ward),
        municipality: formData.municipality,
        monthlyIncome: parseFloat(formData.monthlyIncome),
        landSize: parseFloat(formData.landSize),
        crops: formData.crops,
        previousGrant: formData.previousGrant,
        documents: {
          citizenImage: previews.citizenImage,
          landOwnership: previews.landOwnership,
          landTax: previews.landTax,
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
        MonthlyIncome: parseFloat(formData.monthlyIncome) || 0,
        LandSize: parseFloat(formData.landSize) || 0,
        CropIds: formData.crops.map(crop => {
          const cropIndex = cropOptions.findIndex(opt => opt.key === crop);
          return cropIndex >= 0 ? cropIndex + 1 : 0; // Map to database IDs (1-15)
        }).filter(id => id > 0),
        HasReceivedGrantBefore: formData.previousGrant
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

            {/* Agricultural Information */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('registration.agriculturalInfo')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('registration.monthlyIncome')} *
                  </label>
                  <input
                    type="number"
                    name="monthlyIncome"
                    value={formData.monthlyIncome}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="रु 25,000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('registration.landSize')} *
                  </label>
                  <input
                    type="number"
                    name="landSize"
                    value={formData.landSize}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="2.5"
                    step="0.1"
                    required
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('registration.currentCrops')} *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {cropOptions.map(crop => (
                    <label key={crop.key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.crops.includes(crop.label)}
                        onChange={() => handleCropToggle(crop.label)}
                        className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700">{crop.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="previousGrant"
                    checked={formData.previousGrant}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {t('registration.previousGrant')}
                  </span>
                </label>
              </div>
            </div>

            {/* Document Upload */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('registration.requiredDocuments')}</h2>
              <div className="space-y-6">
                {/* Citizen Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('registration.citizenPhoto')} *
                  </label>
                  {previews.citizenImage ? (
                    <div className="relative inline-block">
                      <img src={previews.citizenImage} alt="Citizen" className="h-32 w-48 object-cover rounded-lg border" />
                      <button
                        type="button"
                        onClick={() => removeFile('citizenImage')}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">{t('registration.uploadCitizen')}</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('citizenImage', e.target.files[0])}
                      />
                    </label>
                  )}
                </div>

                {/* Land Ownership */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('registration.landOwnership')} *
                  </label>
                  {previews.landOwnership ? (
                    <div className="relative inline-block">
                      <img src={previews.landOwnership} alt="Land Ownership" className="h-32 w-48 object-cover rounded-lg border" />
                      <button
                        type="button"
                        onClick={() => removeFile('landOwnership')}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">{t('registration.uploadLandOwnership')}</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,application/pdf"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('landOwnership', e.target.files[0])}
                      />
                    </label>
                  )}
                </div>

                {/* Land Tax */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('registration.landTax')} *
                  </label>
                  {previews.landTax ? (
                    <div className="relative inline-block">
                      <img src={previews.landTax} alt="Land Tax" className="h-32 w-48 object-cover rounded-lg border" />
                      <button
                        type="button"
                        onClick={() => removeFile('landTax')}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">{t('registration.uploadLandTax')}</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,application/pdf"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('landTax', e.target.files[0])}
                      />
                    </label>
                  )}
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