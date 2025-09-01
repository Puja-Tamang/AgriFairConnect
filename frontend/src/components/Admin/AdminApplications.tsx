import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Search,
  Filter,
  Download,
  CheckSquare,
  Square
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { apiClient } from '../../services/apiClient';
import { GrantType, ApplicationStatus, ApplicationStatusUpdateRequest } from '../../types/api';
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

const AdminApplications: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [applications, setApplications] = useState<FarmerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<FarmerApplication | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ApplicationStatus>('all');
  const [selectedApplications, setSelectedApplications] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject' | 'process'>('approve');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  // Set initial status filter from URL params
  useEffect(() => {
    const status = searchParams.get('status');
    if (status && status !== 'all') {
      const statusValue = ApplicationStatus[status as keyof typeof ApplicationStatus];
      if (statusValue !== undefined) {
        setStatusFilter(statusValue);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getAllApplications();
        setApplications(data);
      } catch (error: any) {
        toast.error(error.message || 'Failed to fetch applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleViewApplication = async (application: FarmerApplication) => {
    try {
      // Mark application as viewed (changes status from Pending to Processing)
      if (application.status === ApplicationStatus.Pending) {
        await apiClient.markApplicationAsViewed(application.id);
        // Update the application status locally
        setApplications(prev => prev.map(app => 
          app.id === application.id 
            ? { ...app, status: ApplicationStatus.Processing, updatedAt: new Date().toISOString() }
            : app
        ));
        toast.success('Application marked as processing');
      }
      setSelectedApplication(application);
      setShowApplicationModal(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark application as viewed');
    }
  };

  const handleUpdateApplicationStatus = async (applicationId: number, status: ApplicationStatus.Approved | ApplicationStatus.Rejected, remarks?: string) => {
    try {
      const request: ApplicationStatusUpdateRequest = { status, adminRemarks: remarks };
      await apiClient.updateApplicationStatus(applicationId, request);
      // Update the application status locally
      setApplications(prev => prev.map(app => 
        app.id === applicationId 
          ? { ...app, status, adminRemarks: remarks, updatedAt: new Date().toISOString() }
          : app
      ));
      toast.success(`Application ${status === ApplicationStatus.Approved ? 'approved' : 'rejected'} successfully`);
      setShowApplicationModal(false);
      setSelectedApplication(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update application status');
    }
  };

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

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.grantTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.farmerMunicipality.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSelectApplication = (applicationId: number) => {
    setSelectedApplications(prev => 
      prev.includes(applicationId) 
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedApplications.length === filteredApplications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(filteredApplications.map(app => app.id));
    }
  };

  const handleBulkAction = async () => {
    if (selectedApplications.length === 0) {
      toast.error('Please select applications to update');
      return;
    }

    try {
      const status = bulkAction === 'approve' ? ApplicationStatus.Approved : 
                    bulkAction === 'reject' ? ApplicationStatus.Rejected : ApplicationStatus.Processing;
      
      await apiClient.bulkUpdateApplicationStatus({
        applicationIds: selectedApplications,
        status,
        adminRemarks: `Bulk ${bulkAction} by admin`
      });

      toast.success(`Successfully ${bulkAction}d ${selectedApplications.length} applications`);
      
      // Refresh applications
      const updatedData = await apiClient.getAllApplications();
      setApplications(updatedData);
      setSelectedApplications([]);
      setShowBulkActions(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update applications');
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
            <h1 className="text-2xl font-bold text-gray-900">Grant Applications</h1>
            <p className="text-gray-600 mt-1">Review and manage farmer grant applications</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by farmer name, grant title, or municipality..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value === 'all' ? 'all' : Number(e.target.value) as ApplicationStatus)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value={ApplicationStatus.Pending}>Pending</option>
                  <option value={ApplicationStatus.Processing}>Processing</option>
                  <option value={ApplicationStatus.Approved}>Approved</option>
                  <option value={ApplicationStatus.Rejected}>Rejected</option>
                </select>
                <button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Bulk Actions
                </button>
              </div>
            </div>

            {/* Bulk Actions */}
            {showBulkActions && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedApplications.length === filteredApplications.length && filteredApplications.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm font-medium">
                      Select All ({filteredApplications.length})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={bulkAction}
                      onChange={(e) => setBulkAction(e.target.value as any)}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="approve">Approve</option>
                      <option value="reject">Reject</option>
                      <option value="process">Process</option>
                    </select>
                    <button
                      onClick={handleBulkAction}
                      disabled={selectedApplications.length === 0}
                      className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Apply to {selectedApplications.length} selected
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Applications List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Applications ({filteredApplications.length})
                </h2>
                <div className="space-y-4">
                  {filteredApplications.map((application) => (
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
                          <div className="flex items-center gap-2 mb-2">
                            {showBulkActions && (
                              <input
                                type="checkbox"
                                checked={selectedApplications.includes(application.id)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleSelectApplication(application.id);
                                }}
                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                              />
                            )}
                            <h3 className="font-medium text-gray-900">
                              {application.farmerName}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {application.grantTitle}
                          </p>
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
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewApplication(application);
                            }}
                            className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                          >
                            View
                          </button>
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
                    <div className="flex items-center space-x-2 mb-2">
                      {getStatusIcon(selectedApplication.status)}
                                             <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedApplication.status)}`}>
                         {getStatusText(selectedApplication.status)}
                       </span>
                    </div>
                                         <p className="text-sm text-gray-600">
                       Applied on {new Date(selectedApplication.appliedAt).toLocaleDateString()}
                     </p>
                    {selectedApplication.adminRemarks && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm font-medium text-gray-900 mb-1">Admin Remarks:</p>
                        <p className="text-sm text-gray-600">{selectedApplication.adminRemarks}</p>
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

                  {/* Action Buttons */}
                  <div className="flex space-x-3 mt-6">
                    <button
                      onClick={() => handleUpdateApplicationStatus(selectedApplication.id, ApplicationStatus.Approved)}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleUpdateApplicationStatus(selectedApplication.id, ApplicationStatus.Rejected)}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
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
      </div>

      {/* Application Details Modal */}
      {showApplicationModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Application Details</h2>
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Application content here - same as the sidebar but in modal */}
              <div className="space-y-6">
                {/* Grant Information */}
                <div>
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
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Status</h3>
                  <div className="flex items-center space-x-2 mb-2">
                    {getStatusIcon(selectedApplication.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedApplication.status)}`}>
                      {getStatusText(selectedApplication.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Applied on {new Date(selectedApplication.appliedAt).toLocaleDateString()}
                  </p>
                  {selectedApplication.adminRemarks && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm font-medium text-gray-900 mb-1">Admin Remarks:</p>
                      <p className="text-sm text-gray-600">{selectedApplication.adminRemarks}</p>
                    </div>
                  )}
                </div>

                {/* Personal Information */}
                <div>
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
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Land and Income</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Monthly Income:</span> रु {selectedApplication.monthlyIncome.toLocaleString()}</p>
                    <p><span className="font-medium">Land Size:</span> {selectedApplication.landSize} {selectedApplication.landSizeUnit}</p>
                    <p><span className="font-medium">Previous Grant:</span> {selectedApplication.hasReceivedGrantBefore ? 'Yes' : 'No'}</p>
                  </div>
                </div>

                {/* Crop Details */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Crop Details</h3>
                  <p className="text-sm text-gray-600">{selectedApplication.cropDetails}</p>
                </div>

                {/* Expected Benefits */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Expected Benefits</h3>
                  <p className="text-sm text-gray-600">{selectedApplication.expectedBenefits}</p>
                </div>

                {/* Additional Notes */}
                {selectedApplication.additionalNotes && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Additional Notes</h3>
                    <p className="text-sm text-gray-600">{selectedApplication.additionalNotes}</p>
                  </div>
                )}

                {/* AI Score */}
                {selectedApplication.aiScore && (
                  <div>
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

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 border-t">
                  <button
                    onClick={() => handleUpdateApplicationStatus(selectedApplication.id, ApplicationStatus.Approved)}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleUpdateApplicationStatus(selectedApplication.id, ApplicationStatus.Rejected)}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApplications;
