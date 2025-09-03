import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { apiClient } from '../../services/apiClient';
import { ApplicationStatus, GrantType, FarmerApplicationResponse } from '../../types/api';
import ImagePreview from '../Common/ImagePreview';

const EditGrantApplication: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [application, setApplication] = useState<FarmerApplicationResponse | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        if (!id) {
          console.log('No ID provided');
          navigate('/farmer/applications');
          return;
        }
        console.log('Loading application with ID:', id);
        const data = await apiClient.getFarmerApplicationById(parseInt(id));
        console.log('Loaded application:', data);
        if (data.status !== ApplicationStatus.Pending) {
          toast.error('Only pending applications can be edited');
          navigate('/farmer/applications');
          return;
        }
        setApplication(data);
      } catch (e: any) {
        console.error('Error loading application:', e);
        toast.error(e.message || 'Failed to load application');
        navigate('/farmer/applications');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!application || !id) return;
    try {
      setSaving(true);
      const formData = new FormData();
      // Append only fields user might change; leave others untouched if empty
      formData.append('FarmerName', (document.getElementById('farmerName') as HTMLInputElement).value);
      formData.append('FarmerPhone', (document.getElementById('farmerPhone') as HTMLInputElement).value);
      formData.append('FarmerEmail', (document.getElementById('farmerEmail') as HTMLInputElement).value);
      formData.append('FarmerAddress', (document.getElementById('farmerAddress') as HTMLInputElement).value);
      formData.append('FarmerWard', (document.getElementById('farmerWard') as HTMLInputElement).value);
      formData.append('FarmerMunicipality', (document.getElementById('farmerMunicipality') as HTMLInputElement).value);
      formData.append('MonthlyIncome', (document.getElementById('monthlyIncome') as HTMLInputElement).value);
      formData.append('LandSize', (document.getElementById('landSize') as HTMLInputElement).value);
      formData.append('LandSizeUnit', (document.getElementById('landSizeUnit') as HTMLSelectElement).value);
      formData.append('HasReceivedGrantBefore', (document.getElementById('hasReceivedGrantBefore') as HTMLInputElement).checked.toString());
      formData.append('PreviousGrantDetails', (document.getElementById('previousGrantDetails') as HTMLTextAreaElement).value);
      formData.append('CropDetails', (document.getElementById('cropDetails') as HTMLTextAreaElement).value);
      formData.append('ExpectedBenefits', (document.getElementById('expectedBenefits') as HTMLTextAreaElement).value);
      formData.append('AdditionalNotes', (document.getElementById('additionalNotes') as HTMLTextAreaElement).value);

      const citizen = (document.getElementById('citizenImage') as HTMLInputElement).files?.[0];
      const land = (document.getElementById('landOwnership') as HTMLInputElement).files?.[0];
      const tax = (document.getElementById('landTax') as HTMLInputElement).files?.[0];
      if (citizen) formData.append('CitizenImage', citizen);
      if (land) formData.append('LandOwnership', land);
      if (tax) formData.append('LandTax', tax);

      await apiClient.updateFarmerApplication(parseInt(id), formData);
      toast.success('Application updated');
      navigate('/farmer/applications');
    } catch (e: any) {
      toast.error(e.message || 'Failed to update application');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!application) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Edit Application</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input id="farmerName" defaultValue={application.farmerName} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input id="farmerPhone" defaultValue={application.farmerPhone} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input id="farmerEmail" defaultValue={application.farmerEmail || ''} className="w-full border rounded px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <input id="farmerAddress" defaultValue={application.farmerAddress} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ward</label>
              <input id="farmerWard" type="number" defaultValue={application.farmerWard} className="w-full border rounded px-3 py-2" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Municipality</label>
              <input id="farmerMunicipality" defaultValue={application.farmerMunicipality} className="w-full border rounded px-3 py-2" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Monthly Income</label>
              <input id="monthlyIncome" type="number" defaultValue={application.monthlyIncome} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Land Size</label>
              <input id="landSize" type="number" step="0.01" defaultValue={application.landSize} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Land Unit</label>
              <select id="landSizeUnit" defaultValue={application.landSizeUnit} className="w-full border rounded px-3 py-2">
                <option value="bigha">Bigha</option>
                <option value="kattha">Kattha</option>
                <option value="ropani">Ropani</option>
                <option value="hectare">Hectare</option>
              </select>
            </div>
          </div>
          <div>
            <label className="inline-flex items-center space-x-2">
              <input id="hasReceivedGrantBefore" type="checkbox" defaultChecked={application.hasReceivedGrantBefore} />
              <span className="text-sm">Received grant before</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Previous Grant Details</label>
            <textarea id="previousGrantDetails" defaultValue={application.previousGrantDetails || ''} className="w-full border rounded px-3 py-2" rows={3} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Crop Details</label>
            <textarea id="cropDetails" defaultValue={application.cropDetails} className="w-full border rounded px-3 py-2" rows={3} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Expected Benefits</label>
            <textarea id="expectedBenefits" defaultValue={application.expectedBenefits} className="w-full border rounded px-3 py-2" rows={3} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Additional Notes</label>
            <textarea id="additionalNotes" defaultValue={application.additionalNotes || ''} className="w-full border rounded px-3 py-2" rows={3} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Citizen Image</label>
              {application.citizenImageUrl && (
                <div className="mb-2">
                  <ImagePreview url={application.citizenImageUrl} title="Current Citizen Image" />
                </div>
              )}
              <input id="citizenImage" type="file" accept="image/*" />
              <p className="text-xs text-gray-500 mt-1">Upload to replace current image</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Land Ownership</label>
              {application.landOwnershipUrl && (
                <div className="mb-2">
                  <ImagePreview url={application.landOwnershipUrl} title="Current Land Ownership" />
                </div>
              )}
              <input id="landOwnership" type="file" accept=".pdf,.jpg,.jpeg,.png" />
              <p className="text-xs text-gray-500 mt-1">Upload to replace current document</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Land Tax</label>
              {application.landTaxUrl && (
                <div className="mb-2">
                  <ImagePreview url={application.landTaxUrl} title="Current Land Tax Receipt" />
                </div>
              )}
              <input id="landTax" type="file" accept=".pdf,.jpg,.jpeg,.png" />
              <p className="text-xs text-gray-500 mt-1">Upload to replace current document</p>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button type="button" onClick={() => navigate('/farmer/applications')} className="px-4 py-2 border rounded">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
      
      {/* Toaster for notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            padding: '12px 16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
          success: {
            style: {
              background: '#10b981',
              color: '#ffffff',
              border: '1px solid #059669',
            },
            iconTheme: {
              primary: '#ffffff',
              secondary: '#10b981',
            },
          },
          error: {
            style: {
              background: '#ef4444',
              color: '#ffffff',
              border: '1px solid #dc2626',
            },
            iconTheme: {
              primary: '#ffffff',
              secondary: '#ef4444',
            },
          },
        }}
      />
    </div>
  );
};

export default EditGrantApplication;


