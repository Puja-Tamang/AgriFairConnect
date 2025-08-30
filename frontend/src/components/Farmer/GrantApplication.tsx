import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  DollarSign,
  Package,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  Home
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { apiClient } from '../../services/apiClient';
import { Grant, GrantType } from '../../types/api';

interface GrantApplicationForm {
  grantId: number;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmerEmail: string;
  farmerAddress: string;
  farmerWard: number;
  farmerMunicipality: string;
  monthlyIncome: number;
  landSize: number;
  landSizeUnit: string;
  hasReceivedGrantBefore: boolean;
  previousGrantDetails?: string;
  cropDetails: string;
  expectedBenefits: string;
  documents: {
    citizenImage?: File;
    landOwnership?: File;
    landTax?: File;
  };
  additionalNotes?: string;
}

const GrantApplication: React.FC = () => {
  const { grantId } = useParams<{ grantId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  // Debug: Log user object
  console.log('User object:', user);

  const [grant, setGrant] = useState<Grant | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<GrantApplicationForm>({
    grantId: parseInt(grantId || '0'),
    farmerId: user?.id || '',
    farmerName: user?.name || '',
    farmerPhone: user?.phone || '',
    farmerEmail: user?.email || '',
    farmerAddress: user?.address || '',
    farmerWard: user?.ward || 1,
    farmerMunicipality: user?.municipality || 'भद्रपुर नगरपालिका',
    monthlyIncome: 0,
    landSize: 0,
    landSizeUnit: 'bigha',
    hasReceivedGrantBefore: false,
    cropDetails: '',
    expectedBenefits: '',
    documents: {},
    additionalNotes: ''
  });

  useEffect(() => {
    const fetchGrant = async () => {
      if (!grantId) return;
      
      try {
        setLoading(true);
        const grantData = await apiClient.getGrantById(parseInt(grantId));
        setGrant(grantData);
      } catch (error: any) {
        toast.error(error.message || 'Failed to fetch grant details');
        navigate('/farmer/grants');
      } finally {
        setLoading(false);
      }
    };

    fetchGrant();
  }, [grantId, navigate]);

  // Update form data when user object is loaded
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        farmerId: user.id,
        farmerName: user.name,
        farmerPhone: user.phone,
        farmerEmail: user.email || '',
        farmerAddress: user.address || '',
        farmerWard: user.ward || 1,
        farmerMunicipality: user.municipality || 'भद्रपुर नगरपालिका'
      }));
    }
  }, [user]);

  const handleInputChange = (field: keyof GrantApplicationForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDocumentUpload = (documentType: keyof GrantApplicationForm['documents'], file: File) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [documentType]: file
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!grant) return;

    // Validate required fields
    if (!formData.farmerName || !formData.farmerPhone || !formData.farmerAddress) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.documents.citizenImage || !formData.documents.landOwnership || !formData.documents.landTax) {
      toast.error('Please upload all required documents');
      return;
    }

    try {
      setSubmitting(true);
      
      // Create FormData for file upload
      const applicationData = new FormData();
      applicationData.append('grantId', formData.grantId.toString());
      applicationData.append('farmerName', formData.farmerName);
      applicationData.append('farmerPhone', formData.farmerPhone);
      applicationData.append('farmerEmail', formData.farmerEmail);
      applicationData.append('farmerAddress', formData.farmerAddress);
      applicationData.append('farmerWard', formData.farmerWard.toString());
      applicationData.append('farmerMunicipality', formData.farmerMunicipality);
      applicationData.append('monthlyIncome', formData.monthlyIncome.toString());
      applicationData.append('landSize', formData.landSize.toString());
      applicationData.append('landSizeUnit', formData.landSizeUnit);
      applicationData.append('hasReceivedGrantBefore', formData.hasReceivedGrantBefore.toString());
      if (formData.previousGrantDetails) {
        applicationData.append('previousGrantDetails', formData.previousGrantDetails);
      }
      applicationData.append('cropDetails', formData.cropDetails);
      applicationData.append('expectedBenefits', formData.expectedBenefits);
      applicationData.append('additionalNotes', formData.additionalNotes || '');

      // Append files
      if (formData.documents.citizenImage) {
        applicationData.append('citizenImage', formData.documents.citizenImage);
      }
      if (formData.documents.landOwnership) {
        applicationData.append('landOwnership', formData.documents.landOwnership);
      }
      if (formData.documents.landTax) {
        applicationData.append('landTax', formData.documents.landTax);
      }

      // Debug: Log what's being sent
      console.log('FormData contents:');
      for (let [key, value] of applicationData.entries()) {
        console.log(`${key}: ${value}`);
      }
      
      await apiClient.submitGrantApplication(applicationData);
      
      toast.success('Grant application submitted successfully!');
      navigate('/farmer/applications');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!grant) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Grant not found</h3>
        <p className="text-gray-500">The grant you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <button
              onClick={() => navigate('/farmer/grants')}
              className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Apply for Grant</h1>
              <p className="text-gray-600 mt-1">{grant.title}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Grant Details Card */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Grant Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">{grant.title}</h3>
                <p className="text-gray-600 text-sm">{grant.description}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  {grant.type === GrantType.Money ? (
                    <DollarSign className="w-4 h-4 text-green-500 mr-2" />
                  ) : (
                    <Package className="w-4 h-4 text-blue-500 mr-2" />
                  )}
                  <span className="text-sm font-medium">
                    {grant.type === GrantType.Money 
                      ? `रु ${grant.amount?.toLocaleString()}` 
                      : grant.objectName
                    }
                  </span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">
                    {grant.targetAreas.map(area => `${area.municipality} (वार्ड ${area.wardNumber})`).join(', ')}
                  </span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">
                    Created: {new Date(grant.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Application Form</h2>
            
            {/* Personal Information */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.farmerName}
                    onChange={(e) => handleInputChange('farmerName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.farmerPhone}
                    onChange={(e) => handleInputChange('farmerPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.farmerEmail}
                    onChange={(e) => handleInputChange('farmerEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={formData.farmerAddress}
                    onChange={(e) => handleInputChange('farmerAddress', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Land and Income Information */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Home className="w-5 h-5 mr-2" />
                Land and Income Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Income (रु) *
                  </label>
                  <input
                    type="number"
                    value={formData.monthlyIncome}
                    onChange={(e) => handleInputChange('monthlyIncome', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Land Size *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.landSize}
                    onChange={(e) => handleInputChange('landSize', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Land Size Unit *
                  </label>
                  <select
                    value={formData.landSizeUnit}
                    onChange={(e) => handleInputChange('landSizeUnit', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="bigha">Bigha</option>
                    <option value="kattha">Kattha</option>
                    <option value="ropani">Ropani</option>
                    <option value="hectare">Hectare</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Previous Grant Information */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Previous Grant Information</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="hasReceivedGrantBefore"
                    checked={formData.hasReceivedGrantBefore}
                    onChange={(e) => handleInputChange('hasReceivedGrantBefore', e.target.checked)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor="hasReceivedGrantBefore" className="ml-2 text-sm text-gray-700">
                    Have you received any grant before?
                  </label>
                </div>
                {formData.hasReceivedGrantBefore && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Previous Grant Details
                    </label>
                    <textarea
                      value={formData.previousGrantDetails || ''}
                      onChange={(e) => handleInputChange('previousGrantDetails', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Please describe the previous grant you received..."
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Crop and Benefits Information */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Crop and Benefits Information</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Crop Details *
                  </label>
                  <textarea
                    value={formData.cropDetails}
                    onChange={(e) => handleInputChange('cropDetails', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Describe the crops you grow and your farming activities..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Benefits *
                  </label>
                  <textarea
                    value={formData.expectedBenefits}
                    onChange={(e) => handleInputChange('expectedBenefits', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="How will this grant benefit your farming activities?"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Document Upload */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Required Documents
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Citizen Image *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleDocumentUpload('citizenImage', file);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Land Ownership Document *
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleDocumentUpload('landOwnership', file);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Land Tax Receipt *
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleDocumentUpload('landTax', file);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                value={formData.additionalNotes || ''}
                onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Any additional information you'd like to share..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/farmer/grants')}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Submit Application
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GrantApplication;
