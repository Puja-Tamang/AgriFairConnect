import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, DollarSign, Package, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { Farmer } from '../../types';

const AvailableGrants: React.FC = () => {
  const { user } = useAuth();
  const { grants } = useData();
  const { t } = useLanguage();
  const farmer = user as Farmer;

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'money' | 'object'>('all');

  // Filter grants for the farmer's location
  const eligibleGrants = grants.filter(grant => 
    grant.targetWard.includes(farmer.ward || 0) && 
    grant.targetMunicipality.includes(farmer.municipality || '')
  );

  // Apply search and filter
  const filteredGrants = eligibleGrants.filter(grant => {
    const matchesSearch = grant.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grant.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || grant.type === filterType;
    return matchesSearch && matchesFilter;
  });

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
              <option value="money">{t('grants.money')}</option>
              <option value="object">{t('grants.object')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grants Grid */}
      {filteredGrants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGrants.map(grant => (
            <div key={grant.id} className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-full ${
                  grant.type === 'money' ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  {grant.type === 'money' ? 
                    <DollarSign className={`h-5 w-5 ${
                      grant.type === 'money' ? 'text-green-600' : 'text-blue-600'
                    }`} /> :
                    <Package className={`h-5 w-5 ${
                      grant.type === 'money' ? 'text-green-600' : 'text-blue-600'
                    }`} />
                  }
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  grant.type === 'money' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {grant.type === 'money' ? t('grants.money') : t('grants.object')}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">{grant.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{grant.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                  <span className="font-semibold text-green-600">
                    {grant.type === 'money' 
                      ? `रु ${grant.amount?.toLocaleString()}` 
                      : grant.objectName
                    }
                  </span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>
                    वार्ड {grant.targetWard.join(', ')} - {grant.targetMunicipality[0]}
                  </span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{grant.createdAt.toLocaleDateString('ne-NP')}</span>
                </div>
              </div>

              <Link
                to={`/farmer/grants/${grant.id}`}
                className="w-full btn-primary text-center block"
              >
                {t('grants.applyNow')}
              </Link>
            </div>
          ))}
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