import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  TrendingUp,
  MapPin,
  Package,
  DollarSign,
  Calendar,
  User,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../services/apiClient';
import { 
  MarketPriceResponse, 
  CreateMarketPriceRequest,
  UpdateMarketPriceRequest,
  MarketPriceFilterRequest,
  BulkUpdateMarketPriceRequest,
  BulkMarketPriceItem
} from '../../types/api';

const MarketPriceManagement: React.FC = () => {
  const [marketPrices, setMarketPrices] = useState<MarketPriceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<MarketPriceResponse | null>(null);
  const [cropNames, setCropNames] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  // Form states
  const [createForm, setCreateForm] = useState<CreateMarketPriceRequest>({
    cropName: '',
    price: 0,
    unit: 'kg',
    location: ''
  });

  const [editForm, setEditForm] = useState<UpdateMarketPriceRequest>({
    price: 0,
    unit: 'kg',
    location: '',
    isActive: true
  });

  const [bulkForm, setBulkForm] = useState<BulkUpdateMarketPriceRequest>({
    prices: []
  });

  const [filterForm, setFilterForm] = useState<MarketPriceFilterRequest>({
    cropName: '',
    location: '',
    isActive: undefined,
    fromDate: '',
    toDate: ''
  });

  useEffect(() => {
    loadMarketPrices();
    loadCropNames();
    loadLocations();
  }, []);

  const loadMarketPrices = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAllMarketPrices();
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

  const handleCreateMarketPrice = async () => {
    try {
      await apiClient.createMarketPrice(createForm);
      toast.success('Market price created successfully');
      setShowCreateModal(false);
      setCreateForm({ cropName: '', price: 0, unit: 'kg', location: '' });
      await loadMarketPrices();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create market price');
    }
  };

  const handleUpdateMarketPrice = async () => {
    if (!selectedPrice) return;
    
    try {
      await apiClient.updateMarketPrice(selectedPrice.id, editForm);
      toast.success('Market price updated successfully');
      setShowEditModal(false);
      setSelectedPrice(null);
      await loadMarketPrices();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update market price');
    }
  };

  const handleDeleteMarketPrice = async (id: number) => {
    if (!confirm('Are you sure you want to delete this market price?')) return;
    
    try {
      await apiClient.deleteMarketPrice(id);
      toast.success('Market price deleted successfully');
      await loadMarketPrices();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete market price');
    }
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      if (isActive) {
        await apiClient.deactivateMarketPrice(id);
        toast.success('Market price deactivated successfully');
      } else {
        await apiClient.activateMarketPrice(id);
        toast.success('Market price activated successfully');
      }
      await loadMarketPrices();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${isActive ? 'deactivate' : 'activate'} market price`);
    }
  };

  const handleBulkUpdate = async () => {
    if (bulkForm.prices.length === 0) {
      toast.error('Please add at least one price to update');
      return;
    }

    try {
      await apiClient.bulkUpdateMarketPrices(bulkForm);
      toast.success('Market prices updated successfully');
      setShowBulkModal(false);
      setBulkForm({ prices: [] });
      await loadMarketPrices();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update market prices');
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

  const handleEdit = (price: MarketPriceResponse) => {
    setSelectedPrice(price);
    setEditForm({
      price: price.price,
      unit: price.unit,
      location: price.location,
      isActive: price.isActive
    });
    setShowEditModal(true);
  };

  const addBulkPrice = () => {
    setBulkForm(prev => ({
      prices: [...prev.prices, { cropName: '', price: 0, unit: 'kg', location: '' }]
    }));
  };

  const removeBulkPrice = (index: number) => {
    setBulkForm(prev => ({
      prices: prev.prices.filter((_, i) => i !== index)
    }));
  };

  const updateBulkPrice = (index: number, field: keyof BulkMarketPriceItem, value: string | number) => {
    setBulkForm(prev => ({
      prices: prev.prices.map((price, i) => 
        i === index ? { ...price, [field]: value } : price
      )
    }));
  };

  const filteredPrices = marketPrices.filter(price =>
    price.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    price.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    price.unit.toLowerCase().includes(searchTerm.toLowerCase())
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
              <h1 className="text-3xl font-bold text-gray-900">Market Price Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage crop market prices for farmers
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Price
              </button>
              <button
                onClick={() => setShowBulkModal(true)}
                className="btn-secondary"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Bulk Update
              </button>
              <button
                onClick={loadMarketPrices}
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

        {/* Market Prices Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Crop
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPrices.map((price) => (
                  <tr key={price.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="w-5 h-5 text-green-500 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{price.cropName}</div>
                          <div className="text-sm text-gray-500">Unit: {price.unit}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm font-medium text-gray-900">
                          ₹{price.price.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-blue-500 mr-1" />
                        <span className="text-sm text-gray-900">{price.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">{price.updatedBy}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">
                          {new Date(price.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        price.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {price.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(price)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(price.id, price.isActive)}
                          className={price.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                        >
                          {price.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteMarketPrice(price.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredPrices.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No market prices found</h3>
            <p className="text-gray-500">Get started by adding your first market price.</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Market Price</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Crop Name</label>
                  <input
                    type="text"
                    value={createForm.cropName}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, cropName: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter crop name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={createForm.price}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter price"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unit</label>
                  <select
                    value={createForm.unit}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, unit: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="kg">kg</option>
                    <option value="quintal">quintal</option>
                    <option value="ton">ton</option>
                    <option value="piece">piece</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    value={createForm.location}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, location: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter location"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateMarketPrice}
                  className="btn-primary"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedPrice && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Market Price</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Crop Name</label>
                  <input
                    type="text"
                    value={selectedPrice.cropName}
                    disabled
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.price}
                    onChange={(e) => setEditForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter price"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unit</label>
                  <select
                    value={editForm.unit}
                    onChange={(e) => setEditForm(prev => ({ ...prev, unit: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="kg">kg</option>
                    <option value="quintal">quintal</option>
                    <option value="ton">ton</option>
                    <option value="piece">piece</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter location"
                  />
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editForm.isActive}
                      onChange={(e) => setEditForm(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateMarketPrice}
                  className="btn-primary"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Update Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Bulk Update Market Prices</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {bulkForm.prices.map((price, index) => (
                  <div key={index} className="flex space-x-4 items-center p-4 border rounded-lg">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={price.cropName}
                        onChange={(e) => updateBulkPrice(index, 'cropName', e.target.value)}
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Crop name"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="number"
                        step="0.01"
                        value={price.price}
                        onChange={(e) => updateBulkPrice(index, 'price', parseFloat(e.target.value) || 0)}
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Price"
                      />
                    </div>
                    <div className="w-24">
                      <select
                        value={price.unit}
                        onChange={(e) => updateBulkPrice(index, 'unit', e.target.value)}
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="kg">kg</option>
                        <option value="quintal">quintal</option>
                        <option value="ton">ton</option>
                        <option value="piece">piece</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={price.location}
                        onChange={(e) => updateBulkPrice(index, 'location', e.target.value)}
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Location"
                      />
                    </div>
                    <button
                      onClick={() => removeBulkPrice(index)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <button
                  onClick={addBulkPrice}
                  className="btn-secondary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Price
                </button>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkUpdate}
                  className="btn-primary"
                >
                  Update All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={filterForm.isActive === undefined ? '' : filterForm.isActive.toString()}
                    onChange={(e) => setFilterForm(prev => ({ 
                      ...prev, 
                      isActive: e.target.value === '' ? undefined : e.target.value === 'true' 
                    }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All Status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
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

export default MarketPriceManagement;
