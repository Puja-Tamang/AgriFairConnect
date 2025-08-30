import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Package, 
  DollarSign, 
  Calendar,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../services/apiClient';
import { MarketPriceResponse, MarketPriceFilterRequest } from '../../types/api';

const MarketPrices: React.FC = () => {
  const [marketPrices, setMarketPrices] = useState<MarketPriceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [cropNames, setCropNames] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  const [filterForm, setFilterForm] = useState<MarketPriceFilterRequest>({
    cropName: '',
    location: '',
    isActive: true,
    fromDate: '',
    toDate: ''
  });

  useEffect(() => {
    loadActiveMarketPrices();
    loadCropNames();
    loadLocations();
  }, []);

  const loadActiveMarketPrices = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getActiveMarketPrices();
      setMarketPrices(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load market prices');
    } finally {
      setLoading(false);
    }
  };

  const loadCropNames = async () => {
    try {
      const data = await apiClient.getDistinctCropNames();
      setCropNames(data);
    } catch (error: any) {
      console.error('Failed to load crop names:', error);
    }
  };

  const loadLocations = async () => {
    try {
      const data = await apiClient.getDistinctLocations();
      setLocations(data);
    } catch (error: any) {
      console.error('Failed to load locations:', error);
    }
  };

  const handleFilter = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getFilteredMarketPrices(filterForm);
      setMarketPrices(data);
      setShowFilterModal(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to filter market prices');
    } finally {
      setLoading(false);
    }
  };

  const getLatestPriceByCrop = async (cropName: string, location: string) => {
    try {
      const data = await apiClient.getLatestPriceByCropAndLocation(cropName, location);
      return data;
    } catch (error: any) {
      console.error('Failed to get latest price:', error);
      return null;
    }
  };

  const filteredPrices = marketPrices.filter(price =>
    price.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    price.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    price.unit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group prices by crop and location
  const groupedPrices = filteredPrices.reduce((acc, price) => {
    const key = `${price.cropName}-${price.location}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(price);
    return acc;
  }, {} as Record<string, MarketPriceResponse[]>);

  // Get the latest price for each group
  const latestPrices = Object.values(groupedPrices).map(prices => {
    return prices.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
  });

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
              <h1 className="text-3xl font-bold text-gray-900">Market Prices</h1>
              <p className="mt-1 text-sm text-gray-500">
                Current crop prices in your area
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={loadActiveMarketPrices}
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
        {/* Controls */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by crop, location, or unit..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button
                onClick={() => setShowFilterModal(true)}
                className="btn-secondary"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </button>
            </div>
          </div>
        </div>

        {/* Market Prices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestPrices.map((price) => (
            <div key={price.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Package className="w-6 h-6 text-green-500 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">{price.cropName}</h3>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <DollarSign className="w-5 h-5 text-green-500 mr-2" />
                      <span className="text-2xl font-bold text-gray-900">
                        ₹{price.price.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">per {price.unit}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-blue-500 mr-2" />
                    <span className="text-sm text-gray-600">{price.location}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-500">
                      Updated: {new Date(price.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {latestPrices.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No market prices available</h3>
            <p className="text-gray-500">Check back later for updated prices.</p>
          </div>
        )}

        {/* Price Trends Section */}
        {latestPrices.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Price Trends</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {latestPrices.slice(0, 6).map((price) => (
                  <div key={price.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{price.cropName}</span>
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      ₹{price.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {price.location} • {price.unit}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Information Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <div className="flex items-start">
            <Info className="w-6 h-6 text-blue-500 mr-3 mt-1" />
            <div>
              <h3 className="text-lg font-medium text-blue-900 mb-2">About Market Prices</h3>
              <p className="text-blue-700 text-sm">
                Market prices are updated regularly by administrators to reflect current market conditions. 
                These prices help you make informed decisions about when to sell your crops for the best returns.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Market Prices</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Crop Name</label>
                  <select
                    value={filterForm.cropName || ''}
                    onChange={(e) => setFilterForm(prev => ({ ...prev, cropName: e.target.value || undefined }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All Crops</option>
                    {cropNames.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <select
                    value={filterForm.location || ''}
                    onChange={(e) => setFilterForm(prev => ({ ...prev, location: e.target.value || undefined }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All Locations</option>
                    {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">From Date</label>
                  <input
                    type="date"
                    value={filterForm.fromDate || ''}
                    onChange={(e) => setFilterForm(prev => ({ ...prev, fromDate: e.target.value || undefined }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">To Date</label>
                  <input
                    type="date"
                    value={filterForm.toDate || ''}
                    onChange={(e) => setFilterForm(prev => ({ ...prev, toDate: e.target.value || undefined }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFilter}
                  className="btn-primary"
                >
                  Apply Filter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketPrices;
