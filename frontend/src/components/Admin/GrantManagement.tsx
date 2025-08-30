import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Filter,
  Search,
  Download,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../services/apiClient';
import { 
  GrantManagementResponse, 
  ApplicationSummaryResponse, 
  ApplicationStatus, 
  ApplicationStatusUpdateRequest,
  BulkApplicationStatusUpdateRequest,
  GrantType 
} from '../../types/api';
import { useLanguage } from '../../context/LanguageContext';

const GrantManagement: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [grants, setGrants] = useState<GrantManagementResponse[]>([]);
  const [selectedGrant, setSelectedGrant] = useState<GrantManagementResponse | null>(null);
  const [applications, setApplications] = useState<ApplicationSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [selectedApplications, setSelectedApplications] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    loadGrants();
  }, []);

  const loadGrants = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAllGrantsForManagement();
      setGrants(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load grants');
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async (grantId: number) => {
    try {
      setApplicationsLoading(true);
      const data = await apiClient.getApplicationsByGrant(grantId, statusFilter === 'all' ? undefined : statusFilter);
      setApplications(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load applications');
    } finally {
      setApplicationsLoading(false);
    }
  };

  const handleGrantSelect = async (grant: GrantManagementResponse) => {
    setSelectedGrant(grant);
    setSelectedApplications([]);
    setShowBulkActions(false);
    await loadApplications(grant.id);
  };

  const handleStatusFilterChange = async (status: ApplicationStatus | 'all') => {
    setStatusFilter(status);
    if (selectedGrant) {
      await loadApplications(selectedGrant.id);
    }
  };

  const handleApplicationStatusUpdate = async (applicationId: number, status: ApplicationStatus, remarks?: string) => {
    try {
      const request: ApplicationStatusUpdateRequest = {
        status,
        adminRemarks: remarks
      };
      
      await apiClient.updateApplicationStatus(applicationId, request);
      toast.success('Application status updated successfully');
      
      if (selectedGrant) {
        await loadApplications(selectedGrant.id);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update application status');
    }
  };

  const handleBulkStatusUpdate = async (status: ApplicationStatus, remarks?: string) => {
    if (selectedApplications.length === 0) {
      toast.error('Please select applications to update');
      return;
    }

    try {
      const request: BulkApplicationStatusUpdateRequest = {
        applicationIds: selectedApplications,
        status,
        adminRemarks: remarks
      };
      
      await apiClient.bulkUpdateApplicationStatus(request);
      toast.success(`${selectedApplications.length} applications updated successfully`);
      
      setSelectedApplications([]);
      setShowBulkActions(false);
      
      if (selectedGrant) {
        await loadApplications(selectedGrant.id);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update applications');
    }
  };

  const handleGrantToggle = async (grantId: number, activate: boolean) => {
    try {
      if (activate) {
        await apiClient.activateGrant(grantId);
        toast.success('Grant activated successfully');
      } else {
        await apiClient.deactivateGrant(grantId);
        toast.success('Grant deactivated successfully');
      }
      await loadGrants();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${activate ? 'activate' : 'deactivate'} grant`);
    }
  };

  const handleApplicationSelect = (applicationId: number) => {
    setSelectedApplications(prev => 
      prev.includes(applicationId) 
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedApplications.length === applications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(applications.map(app => app.id));
    }
  };

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.Pending: return 'bg-yellow-100 text-yellow-800';
      case ApplicationStatus.Processing: return 'bg-blue-100 text-blue-800';
      case ApplicationStatus.Approved: return 'bg-green-100 text-green-800';
      case ApplicationStatus.Rejected: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.Pending: return <Clock className="w-4 h-4" />;
      case ApplicationStatus.Processing: return <AlertCircle className="w-4 h-4" />;
      case ApplicationStatus.Approved: return <CheckCircle className="w-4 h-4" />;
      case ApplicationStatus.Rejected: return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.Pending: return 'Pending';
      case ApplicationStatus.Processing: return 'Processing';
      case ApplicationStatus.Approved: return 'Approved';
      case ApplicationStatus.Rejected: return 'Rejected';
      default: return 'Unknown';
    }
  };

  const filteredGrants = grants.filter(grant =>
    grant.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    grant.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredApplications = applications.filter(app =>
    app.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.farmerUsername.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Grant Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage grants and review applications
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate('/admin/grants/create')}
                className="btn-primary"
              >
                Create New Grant
              </button>
              <button
                onClick={loadGrants}
                className="btn-secondary"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Grants List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Grants</h2>
                <div className="mt-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search grants..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {filteredGrants.map((grant) => (
                  <div
                    key={grant.id}
                    onClick={() => handleGrantSelect(grant)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedGrant?.id === grant.id ? 'bg-green-50 border-green-200' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 truncate">{grant.title}</h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{grant.description}</p>
                        <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                          <span className={`px-2 py-1 rounded-full ${
                            grant.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {grant.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className="flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            {grant.totalApplications} applications
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGrantToggle(grant.id, !grant.isActive);
                          }}
                          className={`p-1 rounded ${
                            grant.isActive 
                              ? 'text-red-600 hover:bg-red-50' 
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                        >
                          {grant.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/grants/edit/${grant.id}`);
                          }}
                          className="p-1 rounded text-blue-600 hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Applications Panel */}
          <div className="lg:col-span-2">
            {selectedGrant ? (
              <div className="bg-white rounded-lg shadow">
                {/* Grant Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{selectedGrant.title}</h2>
                      <p className="text-gray-600 mt-1">{selectedGrant.description}</p>
                      <div className="flex items-center mt-3 space-x-4 text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full ${
                          selectedGrant.type === GrantType.Money ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {selectedGrant.type === GrantType.Money ? 'Money Grant' : 'Object Grant'}
                        </span>
                        {selectedGrant.type === GrantType.Money && selectedGrant.amount && (
                          <span>₹{selectedGrant.amount.toLocaleString()}</span>
                        )}
                        {selectedGrant.type === GrantType.Object && selectedGrant.objectName && (
                          <span>{selectedGrant.objectName}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{selectedGrant.totalApplications}</div>
                      <div className="text-sm text-gray-500">Total Applications</div>
                    </div>
                  </div>

                  {/* Application Statistics */}
                  <div className="grid grid-cols-4 gap-4 mt-6">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-yellow-600">{selectedGrant.pendingApplications}</div>
                      <div className="text-xs text-gray-500">Pending</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">{selectedGrant.processingApplications}</div>
                      <div className="text-xs text-gray-500">Processing</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">{selectedGrant.approvedApplications}</div>
                      <div className="text-xs text-gray-500">Approved</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-red-600">{selectedGrant.rejectedApplications}</div>
                      <div className="text-xs text-gray-500">Rejected</div>
                    </div>
                  </div>
                </div>

                {/* Applications Controls */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search applications..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <select
                        value={statusFilter}
                        onChange={(e) => handleStatusFilterChange(e.target.value as ApplicationStatus | 'all')}
                        className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="all">All Status</option>
                        <option value={ApplicationStatus.Pending}>Pending</option>
                        <option value={ApplicationStatus.Processing}>Processing</option>
                        <option value={ApplicationStatus.Approved}>Approved</option>
                        <option value={ApplicationStatus.Rejected}>Rejected</option>
                      </select>
                    </div>
                    
                    {selectedApplications.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          {selectedApplications.length} selected
                        </span>
                        <button
                          onClick={() => setShowBulkActions(!showBulkActions)}
                          className="btn-secondary text-sm"
                        >
                          Bulk Actions
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Bulk Actions */}
                  {showBulkActions && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-700">Update {selectedApplications.length} applications to:</span>
                        <button
                          onClick={() => handleBulkStatusUpdate(ApplicationStatus.Approved)}
                          className="btn-success text-sm"
                        >
                          Approve All
                        </button>
                        <button
                          onClick={() => handleBulkStatusUpdate(ApplicationStatus.Rejected)}
                          className="btn-danger text-sm"
                        >
                          Reject All
                        </button>
                        <button
                          onClick={() => handleBulkStatusUpdate(ApplicationStatus.Processing)}
                          className="btn-secondary text-sm"
                        >
                          Mark Processing
                        </button>
                        <button
                          onClick={() => {
                            setSelectedApplications([]);
                            setShowBulkActions(false);
                          }}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Applications List */}
                <div className="max-h-96 overflow-y-auto">
                  {applicationsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                    </div>
                  ) : filteredApplications.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No applications found</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {filteredApplications.map((application) => (
                        <div key={application.id} className="p-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={selectedApplications.includes(application.id)}
                                onChange={() => handleApplicationSelect(application.id)}
                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                              />
                              <div>
                                <h4 className="font-medium text-gray-900">{application.farmerName}</h4>
                                <p className="text-sm text-gray-500">@{application.farmerUsername}</p>
                                <div className="flex items-center mt-1 space-x-2">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                                    {getStatusIcon(application.status)}
                                    <span className="ml-1">{getStatusText(application.status)}</span>
                                  </span>
                                  {application.aiScore && (
                                    <span className="text-xs text-gray-500">
                                      AI Score: {application.aiScore}%
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">
                                {new Date(application.appliedAt).toLocaleDateString()}
                              </span>
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => handleApplicationStatusUpdate(application.id, ApplicationStatus.Approved)}
                                  className="p-1 rounded text-green-600 hover:bg-green-50"
                                  title="Approve"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleApplicationStatusUpdate(application.id, ApplicationStatus.Rejected)}
                                  className="p-1 rounded text-red-600 hover:bg-red-50"
                                  title="Reject"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleApplicationStatusUpdate(application.id, ApplicationStatus.Processing)}
                                  className="p-1 rounded text-blue-600 hover:bg-blue-50"
                                  title="Mark Processing"
                                >
                                  <AlertCircle className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          {application.adminRemarks && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
                              <strong>Admin Remarks:</strong> {application.adminRemarks}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Grant</h3>
                <p className="text-gray-500">Choose a grant from the list to view and manage its applications</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrantManagement;
