import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, DollarSign, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { Grant } from '../../types';
import toast from 'react-hot-toast';

const CreateGrant: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addGrant } = useData();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'money' as 'money' | 'object',
    amount: '',
    objectName: '',
    targetWards: [] as number[],
    targetMunicipalities: [] as string[],
  });

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  const municipalities = [
    'काठमाडौं महानगरपालिका',
    'ललितपुर महानगरपालिका',
    'भक्तपुर नगरपालिका',
    'कीर्तिपुर नगरपालिका',
    'थिमी नगरपालिका'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleWardToggle = (ward: number) => {
    setFormData(prev => ({
      ...prev,
      targetWards: prev.targetWards.includes(ward)
        ? prev.targetWards.filter(w => w !== ward)
        : [...prev.targetWards, ward]
    }));
  };

  const handleMunicipalityToggle = (municipality: string) => {
    setFormData(prev => ({
      ...prev,
      targetMunicipalities: prev.targetMunicipalities.includes(municipality)
        ? prev.targetMunicipalities.filter(m => m !== municipality)
        : [...prev.targetMunicipalities, municipality]
    }));
  };

  const handleImageUpload = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('फाईल साईज 5MB भन्दा बढी हुनु हुँदैन');
      return;
    }

    setImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error(t('admin.grantTitleRequired'));
      return;
    }

    if (!formData.description.trim()) {
      toast.error(t('admin.descriptionRequired'));
      return;
    }

    if (formData.type === 'money' && (!formData.amount || parseFloat(formData.amount) <= 0)) {
      toast.error(t('admin.validAmount'));
      return;
    }

    if (formData.type === 'object' && !formData.objectName.trim()) {
      toast.error(t('admin.objectNameRequired'));
      return;
    }

    if (formData.targetWards.length === 0) {
      toast.error(t('admin.selectWard'));
      return;
    }

    if (formData.targetMunicipalities.length === 0) {
      toast.error(t('admin.selectMunicipality'));
      return;
    }

    try {
      const newGrant: Grant = {
        id: `grant-${Date.now()}`,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        amount: formData.type === 'money' ? parseFloat(formData.amount) : undefined,
        objectName: formData.type === 'object' ? formData.objectName : undefined,
        targetWard: formData.targetWards,
        targetMunicipality: formData.targetMunicipalities,
        image: imagePreview || undefined,
        createdBy: user?.id || 'admin',
        createdAt: new Date(),
      };

      addGrant(newGrant);
      toast.success(t('admin.grantCreated'));
      navigate('/admin/grants/manage');
    } catch (error) {
      toast.error(t('admin.grantFailed'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('admin.createGrant')}</h1>
        <p className="text-gray-600">{t('admin.createGrantSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('admin.basicInfo')}</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.grantTitle')} *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="input-field"
                placeholder={t('admin.grantTitlePlaceholder')}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.detailedDescription')} *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="input-field resize-none"
                placeholder={t('admin.descriptionPlaceholder')}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.grantType')} *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'money' }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.type === 'money'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-500" />
                  <span className="text-sm font-medium">{t('admin.cashAmount')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'object' }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.type === 'object'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <Package className="h-6 w-6 mx-auto mb-2 text-green-500" />
                  <span className="text-sm font-medium">{t('admin.objectMaterial')}</span>
                </button>
              </div>
            </div>

            {formData.type === 'money' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.amount')} *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="25000"
                  min="1"
                  required
                />
              </div>
            )}

            {formData.type === 'object' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.objectName')} *
                </label>
                <input
                  type="text"
                  name="objectName"
                  value={formData.objectName}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder={t('admin.objectPlaceholder')}
                  required
                />
              </div>
            )}
          </div>
        </div>

        {/* Target Areas */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('admin.targetAreas')}</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t('admin.wardNumbers')} * {t('admin.selectWards')}
              </label>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {Array.from({ length: 20 }, (_, i) => i + 1).map(ward => (
                  <button
                    key={ward}
                    type="button"
                    onClick={() => handleWardToggle(ward)}
                    className={`p-2 text-sm rounded border transition-colors ${
                      formData.targetWards.includes(ward)
                        ? 'bg-green-500 text-white border-green-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-green-300'
                    }`}
                  >
                    {ward}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t('admin.municipalities')} * {t('admin.selectMunicipalities')}
              </label>
              <div className="space-y-2">
                {municipalities.map(municipality => (
                  <label key={municipality} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.targetMunicipalities.includes(municipality)}
                      onChange={() => handleMunicipalityToggle(municipality)}
                      className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">{municipality}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="card p-6">
         <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('admin.grantImage')}</h2>
          
          {imagePreview ? (
            <div className="relative inline-block">
              <img 
                src={imagePreview} 
                alt="Grant" 
                className="h-48 w-72 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="h-10 w-10 text-gray-400 mb-3" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">{t('admin.uploadImage')}</span>
                </p>
                <p className="text-xs text-gray-500">{t('admin.imageFormats')}</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
              />
            </label>
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary flex-1"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            className="btn-primary flex-1"
          >
            {t('admin.createGrantButton')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateGrant;