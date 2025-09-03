import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, TrendingUp, User, DollarSign, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { Farmer } from '../../types';
import { ApplicationStatus } from '../../types/api';

const FarmerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { grants, applications, isLoading, error } = useData();
  const { t } = useLanguage();
  const farmer = user as Farmer;

  // Debug logging
  console.log('FarmerDashboard render:', {
    user,
    grants: grants?.length,
    applications: applications?.length,
    isLoading,
    error,
    farmer
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error loading dashboard</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Show message if no data
  if (!grants || !applications) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-600 text-xl mb-4">No data available</div>
          <p className="text-gray-500 mb-4">Grants: {grants ? grants.length : 'undefined'}</p>
          <p className="text-gray-500 mb-4">Applications: {applications ? applications.length : 'undefined'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

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

  // Helper function to check if farmer has already applied for a grant
  const hasAppliedForGrant = (grantId: number): boolean => {
    if (!applications || !user) return false;
    return applications.some(app => app.grantId === grantId && app.farmerName === user.name);
  };

  // Helper function to get application status for a grant
  const getApplicationStatus = (grantId: number): any => {
    if (!applications || !user) return null;
    return applications.find(app => app.grantId === grantId && app.farmerName === user.name) || null;
  };

  // Filter eligible grants for the farmer
  const eligibleGrants = grants.filter(grant => {
    // Check if grant is active
    if (!grant.isActive) return false;
    
    // Check if farmer's ward and municipality match grant target areas
    return grant.targetAreas.some(area => 
      area.wardNumber === farmer.ward && 
      area.municipality === farmer.municipality
    );
  });

  const farmerApplications = applications.filter(app => app.farmerName === farmer.name);

  const stats = [
    {
      icon: FileText,
      label: t('dashboard.availableGrants'),
      value: eligibleGrants.length,
      color: 'text-blue-600 bg-blue-100',
      link: '/farmer/grants'
    },
    {
      icon: User,
      label: t('dashboard.myApplications'),
      value: farmerApplications.length,
      color: 'text-green-600 bg-green-100',
      link: '/farmer/applications'
    },
    // Only show monthly income if it has a valid value
    ...(farmer.monthlyIncome && farmer.monthlyIncome > 0 ? [{
      icon: DollarSign,
      label: t('dashboard.monthlyIncome'),
      value: `रु ${farmer.monthlyIncome.toLocaleString()}`,
      color: 'text-purple-600 bg-purple-100',
    }] : []),
    // Only show land area if it has a valid value
    ...(farmer.landSize && farmer.landSize > 0 ? [{
      icon: MapPin,
      label: t('dashboard.landArea'),
      value: `${farmer.landSize} ${farmer.landSizeUnit || t('dashboard.bigha')}`,
      color: 'text-orange-600 bg-orange-100',
    }] : []),
  ];

  const recentGrants = eligibleGrants.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('dashboard.welcome')}, {farmer.name}!
            </h1>
            <p className="text-gray-600 mt-2">
              {farmer.municipality}, {t('registration.wardNo')} {farmer.ward}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="flex flex-wrap gap-2">
              {farmer.crops?.slice(0, 3).map(crop => (
                <span key={crop} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  {crop}
                </span>
              ))}
              {farmer.crops && farmer.crops.length > 3 && (
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  +{farmer.crops.length - 3}
                </span>
              )}
            </div>
          </div>
        </div>
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
                    {t('grants.applyNow')}
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/farmer/grants" className="card p-6 hover:bg-green-50 transition-colors">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.applyForGrant')}</h3>
              <p className="text-gray-600 text-sm mt-1">
                {eligibleGrants.length} {t('grants.availableFor')}
              </p>
            </div>
          </div>
        </Link>

        <Link to="/farmer/market" className="card p-6 hover:bg-green-50 transition-colors">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.viewMarketPrices')}</h3>
              <p className="text-gray-600 text-sm mt-1">
                {t('market.todayPrices')}
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Available Grants */}
      {recentGrants.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">{t('dashboard.recentGrants')}</h2>
            <Link
              to="/farmer/grants"
              className="text-green-600 hover:text-green-700 font-medium text-sm"
            >
              {t('dashboard.viewAll')} →
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentGrants.map(grant => {
              const hasApplied = hasAppliedForGrant(grant.id);
              const applicationStatus = getApplicationStatus(grant.id);
              
              return (
                <div key={grant.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  {/* Grant Photo */}
                  {grant.grantPhoto && (
                    <div className="mr-4">
                      <img
                        src={grant.grantPhoto}
                        alt={`${grant.title} photo`}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{grant.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{grant.description}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-sm text-green-600 font-medium">
                        {grant.type === 0 // GrantType.Money
                          ? `रु ${grant.amount?.toLocaleString()}` 
                          : grant.objectName
                        }
                      </span>
                      <span className="text-xs text-gray-500 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(grant.createdAt).toLocaleDateString('ne-NP')}
                      </span>
                    </div>
                  </div>
                  {hasApplied ? (
                    <div className="flex flex-col items-center">
                      <span className={`mb-2 ${
                        applicationStatus?.status === 'Approved' ? 'status-approved' :
                        applicationStatus?.status === 'Rejected' ? 'status-rejected' :
                        applicationStatus?.status === 'Processing' ? 'status-processing' :
                        'status-already-applied'
                      }`}>
                        {applicationStatus?.status === 'Approved' ? 'Approved' :
                         applicationStatus?.status === 'Rejected' ? 'Rejected' :
                         applicationStatus?.status === 'Processing' ? 'Processing' :
                         'Already Applied'}
                      </span>
                      <Link
                        to="/farmer/applications"
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View Application
                      </Link>
                    </div>
                  ) : (
                    <Link
                      to={`/farmer/grants/${grant.id}`}
                      className="btn-primary text-sm"
                    >
                      आवेदन दिनुहोस्
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Application Status */}
      {farmerApplications.length > 0 && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('dashboard.myApplications')}</h2>
          <div className="space-y-4">
            {farmerApplications.slice(0, 3).map(application => {
              const grant = grants.find(g => g.id === application.grantId);
              return (
                <div key={application.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{application.grantTitle || grant?.title}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(application.appliedAt).toLocaleDateString('ne-NP')}
                    </p>
                  </div>
                  <span className={`status-${getStatusString(application.status)}`}>
                    {t(`status.${getStatusString(application.status)}`)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4">
            <Link
              to="/farmer/applications"
              className="text-green-600 hover:text-green-700 font-medium text-sm"
            >
              {t('dashboard.viewAll')} →
            </Link>
          </div>
        </div>
      )}


    </div>
  );
};

export default FarmerDashboard;