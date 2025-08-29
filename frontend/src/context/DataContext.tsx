import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Grant, Application, MarketPrice } from '../types';
import { apiClient } from '../services/apiClient';
import { Crop } from '../types/api';

interface DataContextType {
  grants: Grant[];
  applications: Application[];
  marketPrices: MarketPrice[];
  crops: Crop[];
  isLoading: boolean;
  error: string | null;
  addGrant: (grant: Grant) => void;
  updateGrant: (id: string, grant: Partial<Grant>) => void;
  deleteGrant: (id: string) => void;
  addApplication: (application: Application) => void;
  updateApplication: (id: string, updates: Partial<Application>) => void;
  updateMarketPrice: (price: MarketPrice) => void;
  fetchCrops: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Mock data for demonstration
const mockGrants: Grant[] = [
  {
    id: '1',
    title: 'डिजिटल कृषि सहायता कार्यक्रम',
    description: 'डिजिटल कृषि उपकरण र प्रविधि सहायता',
    type: 'money',
    amount: 25000,
    targetWard: [1, 2, 3],
    targetMunicipality: ['काठमाडौं महानगरपालिका'],
    createdBy: 'admin1',
    createdAt: new Date(),
  },
  {
    id: '2',
    title: 'बीउ वितरण कार्यक्रम',
    description: 'उच्च गुणस्तरीय बीउ वितरण',
    type: 'object',
    objectName: 'बीउ प्याकेज',
    targetWard: [4, 5, 6],
    targetMunicipality: ['ललितपुर महानगरपालिका'],
    createdBy: 'admin1',
    createdAt: new Date(),
  },
];

const mockMarketPrices: MarketPrice[] = [
  {
    id: '1',
    cropName: 'धान',
    price: 2500,
    unit: 'प्रति मुरी',
    location: 'काठमाडौं',
    updatedAt: new Date(),
    updatedBy: 'admin1',
  },
  {
    id: '2',
    cropName: 'मकै',
    price: 2200,
    unit: 'प्रति मुरी',
    location: 'काठमाडौं',
    updatedAt: new Date(),
    updatedBy: 'admin1',
  },
];

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [grants, setGrants] = useState<Grant[]>(mockGrants);
  const [applications, setApplications] = useState<Application[]>([]);
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>(mockMarketPrices);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addGrant = (grant: Grant) => {
    setGrants(prev => [...prev, grant]);
  };

  const updateGrant = (id: string, updates: Partial<Grant>) => {
    setGrants(prev => prev.map(grant => 
      grant.id === id ? { ...grant, ...updates } : grant
    ));
  };

  const deleteGrant = (id: string) => {
    setGrants(prev => prev.filter(grant => grant.id !== id));
  };

  const addApplication = (application: Application) => {
    setApplications(prev => [...prev, application]);
  };

  const updateApplication = (id: string, updates: Partial<Application>) => {
    setApplications(prev => prev.map(app => 
      app.id === id ? { ...app, ...updates } : app
    ));
  };

  const updateMarketPrice = (price: MarketPrice) => {
    setMarketPrices(prev => {
      const existing = prev.find(p => p.id === price.id);
      if (existing) {
        return prev.map(p => p.id === price.id ? price : p);
      }
      return [...prev, price];
    });
  };

  const fetchCrops = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const cropsData = await apiClient.getAllCrops();
      setCrops(cropsData);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch crops');
      console.error('Error fetching crops:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    await fetchCrops();
  };

  // Load crops on component mount
  useEffect(() => {
    fetchCrops();
  }, []);

  return (
    <DataContext.Provider 
      value={{ 
        grants,
        applications,
        marketPrices,
        crops,
        isLoading,
        error,
        addGrant,
        updateGrant,
        deleteGrant,
        addApplication,
        updateApplication,
        updateMarketPrice,
        fetchCrops,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};