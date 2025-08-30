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

export enum GrantType {
  Money = 0,
  Object = 1
}

export interface GrantTargetArea {
  id: number;
  wardNumber: number;
  municipality: string;
}

export interface Grant {
  id: number;
  title: string;
  description: string;
  type: GrantType;
  amount?: number;
  objectName?: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
  targetAreas: GrantTargetArea[];
  applicationCount: number;
}

export interface CreateGrantRequest {
  title: string;
  description: string;
  type: GrantType;
  amount?: number;
  objectName?: string;
  targetWards: number[];
  targetMunicipalities: string[];
}

// Grant Management Types
export interface GrantManagementResponse {
  id: number;
  title: string;
  description: string;
  type: GrantType;
  amount?: number;
  objectName?: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
  targetAreas: GrantTargetAreaResponse[];
  totalApplications: number;
  pendingApplications: number;
  processingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  recentApplications: ApplicationSummaryResponse[];
}

export interface GrantTargetAreaResponse {
  id: number;
  wardNumber: number;
  municipality: string;
}

export interface ApplicationSummaryResponse {
  id: number;
  farmerName: string;
  farmerUsername: string;
  status: ApplicationStatus;
  aiScore?: number;
  appliedAt: string;
  adminRemarks?: string;
}

export interface FarmerApplicationResponse {
  id: number;
  grantId: number;
  grantTitle: string;
  grantType: GrantType;
  grantAmount?: number;
  grantObjectName?: string;
  status: ApplicationStatus;
  farmerName: string;
  farmerPhone: string;
  farmerEmail: string;
  farmerAddress: string;
  farmerWard: number;
  farmerMunicipality: string;
  monthlyIncome: number;
  landSize: number;
  landSizeUnit: string;
  hasReceivedGrantBefore: boolean;
  previousGrantDetails?: string;
  cropDetails: string;
  expectedBenefits: string;
  additionalNotes?: string;
  citizenImageUrl?: string;
  landOwnershipUrl?: string;
  landTaxUrl?: string;
  aiScore?: number;
  adminRemarks?: string;
  appliedAt: string;
  updatedAt?: string;
}

export interface GrantApplicationResponse {
  message: string;
  applicationId: number;
}

export enum ApplicationStatus {
  Pending = 0,
  Processing = 1,
  Approved = 2,
  Rejected = 3
}

export interface ApplicationStatusUpdateRequest {
  status: ApplicationStatus;
  adminRemarks?: string;
}

export interface BulkApplicationStatusUpdateRequest {
  applicationIds: number[];
  status: ApplicationStatus;
  adminRemarks?: string;
}

// Market Price Types
export interface MarketPriceResponse {
  id: number;
  cropName: string;
  price: number;
  unit: string;
  location: string;
  updatedBy: string;
  updatedAt: string;
  isActive: boolean;
}

export interface CreateMarketPriceRequest {
  cropName: string;
  price: number;
  unit: string;
  location: string;
}

export interface UpdateMarketPriceRequest {
  price: number;
  unit: string;
  location: string;
  isActive: boolean;
}

export interface MarketPriceFilterRequest {
  cropName?: string;
  location?: string;
  isActive?: boolean;
  fromDate?: string;
  toDate?: string;
}

export interface BulkUpdateMarketPriceRequest {
  prices: BulkMarketPriceItem[];
}

export interface BulkMarketPriceItem {
  cropName: string;
  price: number;
  unit: string;
  location: string;
}
