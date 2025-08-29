import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, TrendingUp, User, DollarSign, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { Farmer } from '../../types';

const FarmerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { grants, applications } = useData();
  const { t } = useLanguage();
  const farmer = user as Farmer;

  // Filter eligible grants for the farmer
  const eligibleGrants = grants.filter(grant => 
    grant.targetWard.includes(farmer.ward || 0) && 
    grant.targetMunicipality.includes(farmer.municipality || '')
  );

  const farmerApplications = applications.filter(app => app.farmerId === farmer.id);

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
    {
      icon: DollarSign,
      label: t('dashboard.monthlyIncome'),
      value: `रु ${farmer.monthlyIncome?.toLocaleString()}`,
      color: 'text-purple-600 bg-purple-100',
    },
    {
      icon: MapPin,
      label: t('dashboard.landArea'),
      value: `${farmer.landSize} ${t('dashboard.bigha')}`,
      color: 'text-orange-600 bg-orange-100',
    },
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
            {recentGrants.map(grant => (
              <div key={grant.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{grant.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{grant.description}</p>
                  <div className="flex items-center mt-2 space-x-4">
                    <span className="text-sm text-green-600 font-medium">
                      {grant.type === 'money' 
                        ? `रु ${grant.amount?.toLocaleString()}` 
                        : grant.objectName
                      }
                    </span>
                    <span className="text-xs text-gray-500 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {grant.createdAt.toLocaleDateString('ne-NP')}
                    </span>
                  </div>
                </div>
                <Link
                  to={`/farmer/grants/${grant.id}`}
                  className="btn-primary text-sm"
                >
                  आवेदन दिनुहोस्
                </Link>
              </div>
            ))}
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
                    <h3 className="font-semibold text-gray-900">{grant?.title}</h3>
                    <p className="text-sm text-gray-600">
                      {application.appliedAt.toLocaleDateString('ne-NP')}
                    </p>
                  </div>
                  <span className={`status-${application.status}`}>
                    {t(`status.${application.status}`)}
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