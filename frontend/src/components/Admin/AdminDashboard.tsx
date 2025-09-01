import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, DollarSign, TrendingUp, Eye, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { ApplicationStatus, FarmerApplicationResponse } from '../../types/api';
import { apiClient } from '../../services/apiClient';
import AIInsightsWidget from './AIInsightsWidget';
import FraudInsightsWidget from './FraudInsightsWidget';

const AdminDashboard: React.FC = () => {
  const { grants, marketPrices } = useData();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [applications, setApplications] = useState<FarmerApplicationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch applications data
  const fetchApplications = async () => {
    if (user?.type === 'admin') {
      try {
        setLoading(true);
        const applicationsData = await apiClient.getAllApplications();
        setApplications(applicationsData);
        console.log('Fetched applications:', applicationsData.length);
      } catch (error: any) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Fetch applications data when component mounts
  useEffect(() => {
    fetchApplications();
  }, [user]);

  // Refresh applications every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (user?.type === 'admin') {
        fetchApplications();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  // Helper function to get status string from enum
  const getStatusString = (status: ApplicationStatus): string => {
    switch (status) {
      case ApplicationStatus.Pending:
        return 'pending';
      case ApplicationStatus.Processing:
        return 'processing';
      case ApplicationStatus.Approved:
        return 'approved';
      case ApplicationStatus.Rejected:
        return 'rejected';
      default:
        return 'pending';
    }
  };

  const stats = [
    {
      icon: Users,
      label: t('dashboard.totalApplications'),
      value: applications.length,
      color: 'text-blue-600 bg-blue-100',
      change: '+12%',
      link: '/admin/applications'
    },
    {
      icon: FileText,
      label: t('dashboard.activeGrants'),
      value: grants.length,
      color: 'text-green-600 bg-green-100',
      change: '+8%',
      link: '/admin/grants/manage'
    },
    {
      icon: DollarSign,
      label: t('dashboard.distributedAmount'),
      value: 'रु 2,50,000',
      color: 'text-purple-600 bg-purple-100',
      change: '+15%',
    },
    {
      icon: TrendingUp,
      label: t('dashboard.marketPrices'),
      value: marketPrices.length,
      color: 'text-orange-600 bg-orange-100',
      change: t('dashboard.updated'),
      link: '/admin/market-prices'
    },
            {
          icon: Eye,
          label: 'AI Selection',
          value: '🤖',
          color: 'text-indigo-600 bg-indigo-100',
          change: 'ML Powered',
          link: '/admin/ai-selection'
        },
        {
          icon: Eye,
          label: 'Fraud Detection',
          value: '🔍',
          color: 'text-red-600 bg-red-100',
          change: 'AI Powered',
          link: '/admin/fraud-detection'
        },
  ];

  // Calculate application statistics with debugging
  const applicationStats = {
    pending: applications.filter(app => app.status === ApplicationStatus.Pending).length,
    processing: applications.filter(app => app.status === ApplicationStatus.Processing).length,
    approved: applications.filter(app => app.status === ApplicationStatus.Approved).length,
    rejected: applications.filter(app => app.status === ApplicationStatus.Rejected).length,
  };

  // Debug log for application stats
  console.log('Application Stats:', {
    total: applications.length,
    stats: applicationStats,
    applications: applications.map(app => ({ id: app.id, status: app.status, statusName: getStatusString(app.status) }))
  });

  const recentApplications = applications.slice(0, 5);

  return (
    <div className="space-y-8">


      {/* Welcome Section */}
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.admin')}</h1>
        <p className="text-gray-600 mt-2">{t('app.subtitle')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              {stat.link && (
                <div className="mt-4">
                  <Link
                    to={stat.link}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    {t('dashboard.viewDetails')} →
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Application Status Overview */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Application Status Overview</h2>
          <button
            onClick={fetchApplications}
            disabled={loading}
            className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link to="/admin/applications?status=pending" className="card p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-3xl font-bold text-yellow-600">
                  {loading ? '...' : applicationStats.pending}
                </p>
                <p className="text-sm text-gray-600 font-medium">Pending</p>
              </div>
            </div>
          </Link>
          
          <Link to="/admin/applications?status=processing" className="card p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-3xl font-bold text-blue-600">
                  {loading ? '...' : applicationStats.processing}
                </p>
                <p className="text-sm text-gray-600 font-medium">Processing</p>
              </div>
            </div>
          </Link>
          
          <Link to="/admin/applications?status=approved" className="card p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-3xl font-bold text-green-600">
                  {loading ? '...' : applicationStats.approved}
                </p>
                <p className="text-sm text-gray-600 font-medium">Approved</p>
              </div>
            </div>
          </Link>
          
          <Link to="/admin/applications?status=rejected" className="card p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-full">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-3xl font-bold text-red-600">
                  {loading ? '...' : applicationStats.rejected}
                </p>
                <p className="text-sm text-gray-600 font-medium">Rejected</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/admin/grants/create" className="card p-6 hover:bg-green-50 transition-colors">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('admin.createGrant')}</h3>
              <p className="text-gray-600 text-sm mt-1">{t('admin.createGrantSubtitle')}</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/grants/manage" className="card p-6 hover:bg-green-50 transition-colors">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Manage Grants</h3>
              <p className="text-gray-600 text-sm mt-1">
                Review applications and manage grant status
              </p>
            </div>
          </div>
        </Link>

        <Link to="/admin/ai-selection" className="card p-6 hover:bg-green-50 transition-colors">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('nav.aiSelection')}</h3>
              <p className="text-gray-600 text-sm mt-1">AI Selection System</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/market-prices" className="card p-6 hover:bg-green-50 transition-colors">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Market Prices</h3>
              <p className="text-gray-600 text-sm mt-1">
                Manage crop prices for farmers
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* AI Insights Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          {/* Recent Applications */}
          {recentApplications.length > 0 && (
            <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">{t('dashboard.recentApplications')}</h2>
            <Link
              to="/admin/applications"
              className="text-green-600 hover:text-green-700 font-medium text-sm"
            >
              {t('dashboard.viewAll')} →
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('login.farmer')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Grant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Application Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentApplications.map(application => {
                  const grant = grants.find(g => g.id === application.grantId);
                  return (
                    <tr key={application.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {application.farmerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {application.grantTitle || grant?.title || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(application.appliedAt).toLocaleDateString('ne-NP')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`status-${getStatusString(application.status)}`}>
                          {t(`status.${getStatusString(application.status)}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          to={`/admin/applications/${application.id}`}
                          className="text-green-600 hover:text-green-700 font-medium"
                        >
                          {t('view')}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
        </div>
        
                 {/* AI Insights Widgets */}
         <div className="lg:col-span-1 space-y-6">
           <AIInsightsWidget />
           <FraudInsightsWidget />
         </div>
      </div>
    </div>
  );
};

export default AdminDashboard;