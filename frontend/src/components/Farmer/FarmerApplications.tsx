import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  Calendar,
  MapPin,
  DollarSign,
  Package,
  Edit
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { apiClient } from '../../services/apiClient';
import { GrantType, ApplicationStatus } from '../../types/api';
import ImagePreview from '../Common/ImagePreview';

interface FarmerApplication {
  id: number;
  grantId: number;
  grantTitle: string;
  grantType: GrantType;
  grantAmount?: number;
  grantObjectName?: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt?: string;
  adminRemarks?: string;
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
  additionalNotes?: string;
  citizenImageUrl?: string;
  landOwnershipUrl?: string;
  landTaxUrl?: string;
  aiScore?: number;
}

const FarmerApplications: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<FarmerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<FarmerApplication | null>(null);

  const handleEditApplication = (application: FarmerApplication) => {
    console.log('Edit button clicked for application:', application.id);
    console.log('Application status:', application.status);
    navigate(`/farmer/applications/edit/${application.id}`);
  };

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getFarmerApplications();
        setApplications(data);
      } catch (error: any) {
        toast.error(error.message || 'Failed to fetch applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.Pending:
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case ApplicationStatus.Processing:
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case ApplicationStatus.Approved:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case ApplicationStatus.Rejected:
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.Pending:
        return 'bg-yellow-100 text-yellow-800';
      case ApplicationStatus.Processing:
        return 'bg-blue-100 text-blue-800';
      case ApplicationStatus.Approved:
        return 'bg-green-100 text-green-800';
      case ApplicationStatus.Rejected:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.Pending:
        return 'Pending';
      case ApplicationStatus.Processing:
        return 'Processing';
      case ApplicationStatus.Approved:
        return 'Approved';
      case ApplicationStatus.Rejected:
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">My Grant Applications</h1>
            <p className="text-gray-600 mt-1">Track the status of your grant applications</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {applications.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-500 mb-6">You haven't submitted any grant applications yet.</p>
            <button
              onClick={() => window.location.href = '/farmer/grants'}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Browse Available Grants
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Applications List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Applications</h2>
                  <div className="space-y-4">
                    {applications.map((application) => (
                      <div
                        key={application.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedApplication?.id === application.id
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedApplication(application)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-1">
                              {application.grantTitle}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {application.grantType === GrantType.Money 
                                ? `रु ${application.grantAmount?.toLocaleString()}` 
                                : application.grantObjectName
                              }
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(application.appliedAt).toLocaleDateString()}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {application.farmerMunicipality}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(application.status)}
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                          {getStatusText(application.status)}
                        </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Application Details */}
            <div className="lg:col-span-1">
              {selectedApplication ? (
                <div className="bg-white rounded-lg shadow sticky top-8">
                  <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Details</h2>
                    
                    {/* Grant Information */}
                    <div className="mb-6">
                      <h3 className="font-medium text-gray-900 mb-2">Grant Information</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Title:</span> {selectedApplication.grantTitle}</p>
                        <p>
                          <span className="font-medium">Type:</span> 
                          {selectedApplication.grantType === GrantType.Money ? (
                            <span className="flex items-center">
                              <DollarSign className="w-4 h-4 text-green-500 mr-1" />
                              रु {selectedApplication.grantAmount?.toLocaleString()}
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <Package className="w-4 h-4 text-blue-500 mr-1" />
                              {selectedApplication.grantObjectName}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Status Information */}
                    <div className="mb-6">
                      <h3 className="font-medium text-gray-900 mb-2">Status</h3>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(selectedApplication.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedApplication.status)}`}>
                            {selectedApplication.status}
                          </span>
                        </div>
                        {selectedApplication.status === ApplicationStatus.Pending && (
                          <button
                            onClick={() => handleEditApplication(selectedApplication)}
                            className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Submitted on {new Date(selectedApplication.appliedAt).toLocaleDateString()}
                      </p>
                      {selectedApplication.adminRemarks && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm font-medium text-gray-900 mb-1">Admin Remarks:</p>
                          <p className="text-sm text-gray-600">{selectedApplication.adminRemarks}</p>
                        </div>
                      )}
                      {selectedApplication.status === ApplicationStatus.Pending && (
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                          <p className="text-sm text-blue-800">
                            Your application is pending review. You can still edit it until it's processed by admin.
                          </p>
                        </div>
                      )}
                      {selectedApplication.status === ApplicationStatus.Processing && (
                        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <div className="text-sm text-yellow-800">
                            Your application is being reviewed by admin.
                          </div>
                        </div>
                      )}
                      {selectedApplication.status === ApplicationStatus.Approved && (
                        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                          <p className="text-sm text-green-800">
                            Congratulations! Your application has been approved.
                          </p>
                        </div>
                      )}
                      {selectedApplication.status === ApplicationStatus.Rejected && (
                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-sm text-red-800">
                            Your application has been rejected. Please check admin remarks for details.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Personal Information */}
                    <div className="mb-6">
                      <h3 className="font-medium text-gray-900 mb-2">Personal Information</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Name:</span> {selectedApplication.farmerName}</p>
                        <p><span className="font-medium">Phone:</span> {selectedApplication.farmerPhone}</p>
                        <p><span className="font-medium">Email:</span> {selectedApplication.farmerEmail}</p>
                        <p><span className="font-medium">Address:</span> {selectedApplication.farmerAddress}</p>
                        <p><span className="font-medium">Ward:</span> {selectedApplication.farmerWard}</p>
                        <p><span className="font-medium">Municipality:</span> {selectedApplication.farmerMunicipality}</p>
                      </div>
                    </div>

                    {/* Land and Income */}
                    <div className="mb-6">
                      <h3 className="font-medium text-gray-900 mb-2">Land and Income</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Monthly Income:</span> रु {selectedApplication.monthlyIncome.toLocaleString()}</p>
                        <p><span className="font-medium">Land Size:</span> {selectedApplication.landSize} {selectedApplication.landSizeUnit}</p>
                        <p><span className="font-medium">Previous Grant:</span> {selectedApplication.hasReceivedGrantBefore ? 'Yes' : 'No'}</p>
                      </div>
                    </div>

                    {/* Crop Details */}
                    <div className="mb-6">
                      <h3 className="font-medium text-gray-900 mb-2">Crop Details</h3>
                      <p className="text-sm text-gray-600">{selectedApplication.cropDetails}</p>
                    </div>

                    {/* Expected Benefits */}
                    <div className="mb-6">
                      <h3 className="font-medium text-gray-900 mb-2">Expected Benefits</h3>
                      <p className="text-sm text-gray-600">{selectedApplication.expectedBenefits}</p>
                    </div>

                    {/* Additional Notes */}
                    {selectedApplication.additionalNotes && (
                      <div className="mb-6">
                        <h3 className="font-medium text-gray-900 mb-2">Additional Notes</h3>
                        <p className="text-sm text-gray-600">{selectedApplication.additionalNotes}</p>
                      </div>
                    )}

                    {/* AI Score */}
                    {selectedApplication.aiScore && (
                      <div className="mb-6">
                        <h3 className="font-medium text-gray-900 mb-2">AI Assessment Score</h3>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                              style={{ width: `${(selectedApplication.aiScore / 100) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {selectedApplication.aiScore.toFixed(1)}/100
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Documents */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Documents</h3>
                      <div className="space-y-2 text-sm">
                        {selectedApplication.citizenImageUrl && (
                          <ImagePreview 
                            url={selectedApplication.citizenImageUrl}
                            title="Citizen Image"
                          />
                        )}
                        {selectedApplication.landOwnershipUrl && (
                          <ImagePreview 
                            url={selectedApplication.landOwnershipUrl}
                            title="Land Ownership Document"
                          />
                        )}
                        {selectedApplication.landTaxUrl && (
                          <ImagePreview 
                            url={selectedApplication.landTaxUrl}
                            title="Land Tax Receipt"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4" />
                    <p>Select an application to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerApplications;
