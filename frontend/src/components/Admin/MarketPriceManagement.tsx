import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Search, 
  
  Download, 
  
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
  UpdateMarketPriceRequest
} from '../../types/api';

const MarketPriceManagement: React.FC = () => {
  const [marketPrices, setMarketPrices] = useState<MarketPriceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

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

  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedEditPhoto, setSelectedEditPhoto] = useState<File | null>(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState<string | null>(null);

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
      let photoUrl = '';
      
      if (selectedPhoto) {
        try {
          photoUrl = await apiClient.uploadCropPhoto(selectedPhoto);
        } catch (error: any) {
          toast.error('Failed to upload photo: ' + error.message);
          return;
        }
      }

      const marketPriceData = {
        ...createForm,
        cropPhoto: photoUrl
      };

      await apiClient.createMarketPrice(marketPriceData);
      toast.success('Market price created successfully');
      setShowCreateModal(false);
      setCreateForm({ cropName: '', price: 0, unit: 'kg', location: '' });
      setSelectedPhoto(null);
      setPhotoPreview(null);
      await loadMarketPrices();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create market price');
    }
  };

  const handleUpdateMarketPrice = async () => {
    if (!selectedPrice) return;
    
    try {
      // Prepare payload and optionally upload new photo
      const payload: any = { ...editForm };
      if (selectedEditPhoto) {
        try {
          const uploadedUrl = await apiClient.uploadCropPhoto(selectedEditPhoto);
          payload.cropPhoto = uploadedUrl;
        } catch (e: any) {
          toast.error('Failed to upload new photo: ' + e.message);
          return;
        }
      } else if (selectedPrice.cropPhoto) {
        payload.cropPhoto = selectedPrice.cropPhoto; // keep existing photo
      }

      await apiClient.updateMarketPrice(selectedPrice.id, payload);
      toast.success('Market price updated successfully');
      setShowEditModal(false);
      setSelectedPrice(null);
      setSelectedEditPhoto(null);
      setEditPhotoPreview(null);
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
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search prices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={loadMarketPrices}
              className="btn-secondary hidden"
            >
              Reload
            </button>
          </div>
        </div>
      </div>

      {/* Prices Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop Photo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPrices.map(price => (
                <tr key={price.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {price.cropPhoto ? (
                      <img src={price.cropPhoto} alt={`${price.cropName} photo`} className="w-16 h-16 object-cover rounded-lg border" />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No Photo</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{price.cropName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-600 font-semibold">₹{price.price.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{price.unit}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{price.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(price.id, price.isActive)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${price.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {price.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPrice(price);
                        setEditForm({
                          price: price.price,
                          unit: price.unit,
                          location: price.location,
                          isActive: price.isActive,
                        });
                        setShowEditModal(true);
                        toast.success('Editing market price');
                      }}
                      className="text-blue-600 hover:text-blue-900 flex items-center"
                    >
                      <Edit className="w-4 h-4 mr-1" /> Edit
                    </button>
                    <button onClick={() => handleDeleteMarketPrice(price.id)} className="text-red-600 hover:text-red-900 flex items-center">
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Market Price</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Crop</label>
                  <input
                    type="text"
                    value={createForm.cropName}
                    onChange={(e) => setCreateForm({ ...createForm, cropName: e.target.value })}
                    placeholder="Enter crop name"
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={createForm.price}
                      onChange={(e) => setCreateForm({ ...createForm, price: parseFloat(e.target.value) || 0 })}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                    <select
                      value={createForm.unit}
                      onChange={(e) => setCreateForm({ ...createForm, unit: e.target.value })}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="kg">kg</option>
                      <option value="quintal">quintal</option>
                      <option value="muri">muri</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={createForm.location}
                    onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                    placeholder="Enter location"
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Crop Photo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Crop Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setSelectedPhoto(file);
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => setPhotoPreview(reader.result as string);
                        reader.readAsDataURL(file);
                      } else {
                        setPhotoPreview(null);
                      }
                    }}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                  {photoPreview && (
                    <div className="mt-2">
                      <img src={photoPreview} alt="Preview" className="h-24 w-24 object-cover rounded border" />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex justify-end space-x-3">
                <button onClick={() => setShowCreateModal(false)} className="btn-secondary">Cancel</button>
                <button onClick={handleCreateMarketPrice} className="btn-primary">Create</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedPrice && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Market Price</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                    <select
                      value={editForm.unit}
                      onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="kg">kg</option>
                      <option value="quintal">quintal</option>
                      <option value="muri">muri</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    placeholder="Enter location"
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={editForm.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === 'active' })}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Edit Crop Photo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Crop Photo</label>
                  <div className="flex items-center space-x-4">
                    <div className="h-24 w-24 border rounded flex items-center justify-center bg-gray-50">
                      {(editPhotoPreview || selectedPrice?.cropPhoto) ? (
                        <img
                          src={editPhotoPreview || (selectedPrice?.cropPhoto as string)}
                          alt="Current"
                          className="h-24 w-24 object-cover rounded"
                        />
                      ) : (
                        <span className="text-gray-400 text-xs">No Photo</span>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setSelectedEditPhoto(file);
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => setEditPhotoPreview(reader.result as string);
                          reader.readAsDataURL(file);
                        } else {
                          setEditPhotoPreview(selectedPrice?.cropPhoto || null);
                        }
                      }}
                      className="block border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end space-x-3">
                <button onClick={() => setShowEditModal(false)} className="btn-secondary">Cancel</button>
                <button onClick={handleUpdateMarketPrice} className="btn-primary">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketPriceManagement;
