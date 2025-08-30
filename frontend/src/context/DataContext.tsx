import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { MarketPrice } from '../types';
import { Grant, Crop, FarmerApplicationResponse } from '../types/api';
import { apiClient } from '../services/apiClient';

interface DataContextType {
  grants: Grant[];
  applications: FarmerApplicationResponse[];
  marketPrices: MarketPrice[];
  crops: Crop[];
  isLoading: boolean;
  error: string | null;
  addGrant: (grant: Grant) => void;
  updateGrant: (id: number, grant: Partial<Grant>) => void;
  deleteGrant: (id: number) => void;
  addApplication: (application: FarmerApplicationResponse) => void;
  updateApplication: (id: number, updates: Partial<FarmerApplicationResponse>) => void;
  updateMarketPrice: (price: MarketPrice) => void;
  fetchCrops: () => Promise<void>;
  fetchGrants: () => Promise<void>;
  fetchApplications: () => Promise<void>;
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
    id: 1,
    title: 'डिजिटल कृषि सहायता कार्यक्रम',
    description: 'डिजिटल कृषि उपकरण र प्रविधि सहायता',
    type: 0, // GrantType.Money
    amount: 25000,
    objectName: undefined,
    createdBy: 'admin1',
    createdAt: new Date().toISOString(),
    updatedAt: undefined,
    isActive: true,
    targetAreas: [
      { id: 1, wardNumber: 1, municipality: 'भद्रपुर नगरपालिका' },
      { id: 2, wardNumber: 2, municipality: 'भद्रपुर नगरपालिका' },
      { id: 3, wardNumber: 3, municipality: 'भद्रपुर नगरपालिका' }
    ],
    applicationCount: 0
  },
  {
    id: 2,
    title: 'बीउ वितरण कार्यक्रम',
    description: 'उच्च गुणस्तरीय बीउ वितरण',
    type: 1, // GrantType.Object
    amount: undefined,
    objectName: 'बीउ प्याकेज',
    createdBy: 'admin1',
    createdAt: new Date().toISOString(),
    updatedAt: undefined,
    isActive: true,
    targetAreas: [
      { id: 4, wardNumber: 4, municipality: 'मेचीनगर नगरपालिका' },
      { id: 5, wardNumber: 5, municipality: 'मेचीनगर नगरपालिका' },
      { id: 6, wardNumber: 6, municipality: 'मेचीनगर नगरपालिका' }
    ],
    applicationCount: 0
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
  const [applications, setApplications] = useState<FarmerApplicationResponse[]>([]);
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>(mockMarketPrices);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedDataRef = useRef(false);

  const addGrant = (grant: Grant) => {
    setGrants(prev => [...prev, grant]);
  };

  const updateGrant = (id: number, updates: Partial<Grant>) => {
    setGrants(prev => prev.map(grant => 
      grant.id === id ? { ...grant, ...updates } : grant
    ));
  };

  const deleteGrant = (id: number) => {
    setGrants(prev => prev.filter(grant => grant.id !== id));
  };

  const addApplication = (application: FarmerApplicationResponse) => {
    setApplications(prev => [...prev, application]);
  };

  const updateApplication = (id: number, updates: Partial<FarmerApplicationResponse>) => {
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

  const fetchCrops = useCallback(async () => {
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
  }, []);

  const fetchGrants = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Use getActiveGrants instead of getAllGrants for farmers
      const grantsData = await apiClient.getActiveGrants();
      setGrants(grantsData);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch grants');
      console.error('Error fetching grants:', error);
      // Keep mock data as fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const applicationsData = await apiClient.getAllApplications();
      setApplications(applicationsData);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch applications');
      console.error('Error fetching applications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        apiClient.getAllCrops().then(setCrops).catch(error => {
          setError(error.message || 'Failed to fetch crops');
          console.error('Error fetching crops:', error);
        }),
        apiClient.getActiveGrants().then(setGrants).catch(error => {
          setError(error.message || 'Failed to fetch grants');
          console.error('Error fetching grants:', error);
        }),
        apiClient.getAllApplications().then(setApplications).catch(error => {
          setError(error.message || 'Failed to fetch applications');
          console.error('Error fetching applications:', error);
        })
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data on component mount - only run once
  useEffect(() => {
    if (!hasLoadedDataRef.current) {
      const loadInitialData = async () => {
        hasLoadedDataRef.current = true;
        await Promise.all([fetchCrops(), fetchGrants(), fetchApplications()]);
      };
      loadInitialData();
    }
  }, []); // Empty dependency array to run only once

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
        fetchGrants,
        fetchApplications,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};