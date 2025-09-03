import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, DollarSign, Package, MapPin, Calendar, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { Grant, GrantType, FarmerApplicationResponse } from '../../types/api';
import toast from 'react-hot-toast';

const AvailableGrants: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { grants, applications, isLoading: loading, fetchGrants, fetchApplications } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | GrantType.Money | GrantType.Object>('all');

  useEffect(() => {
    fetchGrants();
    fetchApplications();
  }, []); // Remove fetchGrants from dependency array

  // Helper function to check if farmer has already applied for a grant
  const hasAppliedForGrant = (grantId: number): boolean => {
    if (!applications || !user) return false;
    return applications.some(app => app.grantId === grantId && app.farmerName === user.name);
  };

  // Helper function to get application status for a grant
  const getApplicationStatus = (grantId: number): FarmerApplicationResponse | null => {
    if (!applications || !user) return null;
    return applications.find(app => app.grantId === grantId && app.farmerName === user.name) || null;
  };

  // Debug logging (commented out to reduce noise)
  // console.log('AvailableGrants - All grants:', grants);
  // console.log('AvailableGrants - User:', user);
  // console.log('AvailableGrants - User ward:', user?.ward);
  // console.log('AvailableGrants - User municipality:', user?.municipality);
  // console.log('AvailableGrants - User type:', user?.type);
  // console.log('AvailableGrants - User id:', user?.id);

  // Filter grants for the farmer's location
  const eligibleGrants = grants.filter(grant => {
    // Check if grant is active
    if (!grant.isActive) return false;

    // Hide expired grants
    if (grant.deadlineAt && new Date(grant.deadlineAt) <= new Date()) return false;
    
    // Check if farmer's ward and municipality match grant target areas
    const isEligible = grant.targetAreas.some(area => 
      area.wardNumber === user?.ward && 
      area.municipality === user?.municipality
    );
    
    return isEligible;
  });

  // console.log('AvailableGrants - Eligible grants:', eligibleGrants);

  // Apply search and filter
  const filteredGrants = eligibleGrants.filter(grant => {
    const matchesSearch = grant.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grant.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || grant.type === filterType;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="card p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('grants.title')}</h1>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('grants.title')}</h1>
        <p className="text-gray-600">
          {eligibleGrants.length} {t('grants.availableFor')}
        </p>
      </div>

      {/* Search and Filter */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('grants.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
                          <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="input-field w-auto"
              >
                <option value="all">{t('grants.allTypes')}</option>
                <option value={GrantType.Money}>{t('grants.money')}</option>
                <option value={GrantType.Object}>{t('grants.object')}</option>
              </select>
          </div>
        </div>
      </div>

      {/* Grants Grid */}
      {filteredGrants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGrants.map(grant => {
            const hasApplied = hasAppliedForGrant(grant.id);
            const applicationStatus = getApplicationStatus(grant.id);
            
            return (
              <div key={grant.id} className="card p-6 hover:shadow-lg transition-shadow">
                {/* Grant Photo */}
                {grant.grantPhoto && (
                  <div className="mb-4">
                    <img
                      src={grant.grantPhoto}
                      alt={`${grant.title} photo`}
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-full ${
                    grant.type === GrantType.Money ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    {grant.type === GrantType.Money ? 
                      <DollarSign className={`h-5 w-5 ${
                        grant.type === GrantType.Money ? 'text-green-600' : 'text-blue-600'
                      }`} /> :
                      <Package className={`h-5 w-5 ${
                        grant.type === GrantType.Money ? 'text-green-600' : 'text-blue-600'
                      }`} />
                    }
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    grant.type === GrantType.Money ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {grant.type === GrantType.Money ? t('grants.money') : t('grants.object')}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{grant.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{grant.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                    <span className="font-semibold text-green-600">
                      {grant.type === GrantType.Money 
                        ? `रु ${grant.amount?.toLocaleString()}` 
                        : grant.objectName
                      }
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>
                      वार्ड {grant.targetAreas.map(area => area.wardNumber).join(', ')} - {grant.targetAreas[0]?.municipality}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Deadline: {grant.deadlineAt ? new Date(grant.deadlineAt).toLocaleDateString('ne-NP') : 'N/A'}</span>
                  </div>
                </div>

                {/* Application Status */}
                {hasApplied ? (
                  <div className="w-full">
                    <div className="flex items-center justify-center p-3 rounded-lg">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                      <span className={`font-medium ${
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
                    </div>
                    {applicationStatus && (
                      <div className="mt-2 text-center">
                        <Link
                          to="/farmer/applications"
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          View Application
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={`/farmer/grants/apply/${grant.id}`}
                    className="w-full btn-primary text-center block"
                  >
                    {t('grants.applyNow')}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
         <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('grants.noGrants')}</h3>
          <p className="text-gray-600">
            {searchTerm || filterType !== 'all' 
             ? t('grants.noGrantsMessage')
             : t('grants.noGrantsArea')
            }
          </p>
        </div>
      )}

      {/* Information Card */}
      <div className="card p-6 bg-green-50 border-green-200">
        <h3 className="text-lg font-semibold text-green-900 mb-2">{t('grants.information')}</h3>
        <ul className="text-sm text-green-800 space-y-1">
          <li>{t('grants.infoText1')}</li>
          <li>{t('grants.infoText2')}</li>
          <li>{t('grants.infoText3')}</li>
        </ul>
      </div>
    </div>
  );
};

export default AvailableGrants;