export interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  type: 'farmer' | 'admin';
  ward?: number;
  municipality?: string;
}

export interface Farmer extends User {
  address: string;
  monthlyIncome: number;
  landSize: number;
  crops: string[];
  previousGrant: boolean;
  documents?: {
    citizenImage?: string;
    landOwnership?: string;
    landTax?: string;
  };
}

export interface Grant {
  id: string;
  title: string;
  description: string;
  type: 'money' | 'object';
  amount?: number;
  objectName?: string;
  targetWard: number[];
  targetMunicipality: string[];
  image?: string;
  createdBy: string;
  createdAt: Date;
}

export interface Application {
  id: string;
  farmerId: string;
  grantId: string;
  status: 'pending' | 'processing' | 'approved' | 'rejected';
  documents: {
    citizenImage: string;
    landOwnership: string;
    landTax: string;
  };
  aiScore?: number;
  adminRemarks?: string;
  appliedAt: Date;
  updatedAt: Date;
}

export interface MarketPrice {
  id: string;
  cropName: string;
  price: number;
  unit: string;
  location: string;
  updatedAt: Date;
  updatedBy: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  read: boolean;
  createdAt: Date;
}