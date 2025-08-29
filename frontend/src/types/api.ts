// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  expiresAt?: string;
  user?: {
    id: string;
    username: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    userType: string;
    wardNumber?: number;
    municipality?: string;
    address?: string;
    farmerProfile?: {
      monthlyIncome: number;
      landSize: number;
      landSizeUnit: string;
      hasReceivedGrantBefore: boolean;
      crops: string[];
    };
  };
  errors?: string[];
}

export interface SignupResponse {
  success: boolean;
  message: string;
  userId?: string;
  errors?: string[];
}

export interface FarmerProfileResponse {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  wardNumber: number;
  municipality: string;
  monthlyIncome: number;
  landSize: number;
  landSizeUnit: string;
  hasReceivedGrantBefore: boolean;
  crops: Array<{
    id: number;
    name: string;
    nameNepali: string;
  }>;
  documents: Array<{
    id: number;
    documentType: string;
    fileName: string;
    filePath: string;
    uploadedAt: string;
  }>;
  createdAt: string;
  updatedAt?: string;
}

export interface Crop {
  id: number;
  name: string;
  nameNepali: string;
  description?: string;
  isActive: boolean;
}
