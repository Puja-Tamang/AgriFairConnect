import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { 
  LoginResponse, 
  SignupResponse, 
  FarmerProfileResponse, 
  Crop,
  Grant,
  CreateGrantRequest,
  MarketPriceResponse,
  CreateMarketPriceRequest,
  UpdateMarketPriceRequest,
  MarketPriceFilterRequest,
  GrantManagementResponse,
  ApplicationSummaryResponse,
  ApplicationStatusUpdateRequest,
  BulkApplicationStatusUpdateRequest,
  ApplicationStatus,
  BulkUpdateMarketPriceRequest,
  FarmerApplicationResponse,
  GrantApplicationResponse
} from '../types/api';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// API Client Class using Axios
class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: false, // Changed to false for proxy
    });

    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid - only redirect if not already on login page
          if (window.location.pathname !== '/login') {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic request method
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.request<T>(config);
      return response.data;
    } catch (error: any) {
      console.error('API Error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Full error response:', JSON.stringify(error.response?.data, null, 2));
      
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || 
                           error.response.data?.error || 
                           error.response.data?.title ||
                           `HTTP ${error.response.status}: ${error.response.statusText}`;
        throw new Error(errorMessage);
      } else if (error.request) {
        // Network error
        throw new Error('Network error: Unable to connect to server');
      } else {
        // Other error
        throw new Error(error.message || 'An unexpected error occurred');
      }
    }
  }

  // Authentication Methods
  async login(username: string, password: string, userType: string): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>({
      method: 'POST',
      url: '/auth/login',
      data: { username, password, userType },
    });

    if (response.success && response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  }

  async signup(signupData: {
    Username: string;
    Password: string;
    FullName: string;
    Address: string;
    Email: string;
    PhoneNumber: string;
    WardNumber: number;
    Municipality: string;
    MonthlyIncome?: number;
    LandSize?: number;
    CropIds?: number[];
    HasReceivedGrantBefore?: boolean;
  }): Promise<SignupResponse> {
    return this.request<SignupResponse>({
      method: 'POST',
      url: '/auth/signup',
      data: signupData,
    });
  }

  async checkUsernameExists(username: string): Promise<boolean> {
    return this.request<boolean>({
      method: 'GET',
      url: `/auth/check-username/${username}`,
    });
  }

  async logout(): Promise<void> {
    try {
      await this.request<void>({
        method: 'POST',
        url: '/auth/logout',
      });
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }

  async validateToken(token: string): Promise<boolean> {
    return this.request<boolean>({
      method: 'POST',
      url: '/auth/validate-token',
      data: `"${token}"`, // Wrap token in quotes for JSON
    });
  }



  // Farmer Profile Methods
  async getFarmerProfile(): Promise<FarmerProfileResponse> {
    return this.request<FarmerProfileResponse>({
      method: 'GET',
      url: '/farmer/profile',
    });
  }

  async getFarmerProfileByUsername(username: string): Promise<FarmerProfileResponse> {
    return this.request<FarmerProfileResponse>({
      method: 'GET',
      url: `/farmer/profile/${username}`,
    });
  }

  async updateFarmerProfile(profileData: Partial<FarmerProfileResponse>): Promise<boolean> {
    return this.request<boolean>({
      method: 'PUT',
      url: '/farmer/profile',
      data: profileData,
    });
  }

  async deleteFarmerProfile(): Promise<boolean> {
    return this.request<boolean>({
      method: 'DELETE',
      url: '/farmer/profile',
    });
  }

  async getAllFarmers(): Promise<FarmerProfileResponse[]> {
    return this.request<FarmerProfileResponse[]>({
      method: 'GET',
      url: '/farmer/all',
    });
  }

  async uploadDocument(file: File, documentType: string): Promise<boolean> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

    return this.request<boolean>({
      method: 'POST',
      url: '/farmer/upload-document',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async deleteDocument(documentId: number): Promise<boolean> {
    return this.request<boolean>({
      method: 'DELETE',
      url: `/farmer/document/${documentId}`,
    });
  }

  // Crop Methods
  async getAllCrops(): Promise<Crop[]> {
    return this.request<Crop[]>({
      method: 'GET',
      url: '/crop',
    });
  }

  async getCropById(id: number): Promise<Crop> {
    return this.request<Crop>({
      method: 'GET',
      url: `/crop/${id}`,
    });
  }

  // Grant Methods
  async createGrant(grantData: CreateGrantRequest): Promise<Grant> {
    return this.request<Grant>({
      method: 'POST',
      url: '/grant',
      data: grantData,
    });
  }

  async getGrantById(id: number): Promise<Grant> {
    return this.request<Grant>({
      method: 'GET',
      url: `/grant/${id}`,
    });
  }

  async getAllGrants(): Promise<Grant[]> {
    return this.request<Grant[]>({
      method: 'GET',
      url: '/grant',
    });
  }

  async getActiveGrants(): Promise<Grant[]> {
    return this.request<Grant[]>({
      method: 'GET',
      url: '/grant/active',
    });
  }

  async getGrantsByMunicipality(municipality: string): Promise<Grant[]> {
    return this.request<Grant[]>({
      method: 'GET',
      url: `/grant/municipality/${encodeURIComponent(municipality)}`,
    });
  }

  async updateGrant(id: number, grantData: CreateGrantRequest): Promise<Grant> {
    return this.request<Grant>({
      method: 'PUT',
      url: `/grant/${id}`,
      data: grantData,
    });
  }

  async deleteGrant(id: number): Promise<boolean> {
    return this.request<boolean>({
      method: 'DELETE',
      url: `/grant/${id}`,
    });
  }

  async activateGrant(id: number): Promise<boolean> {
    return this.request<boolean>({
      method: 'POST',
      url: `/grant/${id}/activate`,
    });
  }

  async deactivateGrant(id: number): Promise<boolean> {
    return this.request<boolean>({
      method: 'POST',
      url: `/grant/${id}/deactivate`,
    });
  }

  // Grant Management Methods
  async getAllGrantsForManagement(): Promise<GrantManagementResponse[]> {
    return this.request<GrantManagementResponse[]>({
      method: 'GET',
      url: '/grant/management',
    });
  }

  async getGrantManagementData(id: number): Promise<GrantManagementResponse> {
    return this.request<GrantManagementResponse>({
      method: 'GET',
      url: `/grant/management/${id}`,
    });
  }

  async getApplicationsByGrant(grantId: number, status?: ApplicationStatus): Promise<ApplicationSummaryResponse[]> {
    const params = status !== undefined ? `?status=${status}` : '';
    return this.request<ApplicationSummaryResponse[]>({
      method: 'GET',
      url: `/grant/management/${grantId}/applications${params}`,
    });
  }

  async updateApplicationStatus(applicationId: number, request: ApplicationStatusUpdateRequest): Promise<boolean> {
    return this.request<boolean>({
      method: 'PUT',
      url: `/grant/management/applications/${applicationId}/status`,
      data: request,
    });
  }

  async bulkUpdateApplicationStatus(request: BulkApplicationStatusUpdateRequest): Promise<boolean> {
    return this.request<boolean>({
      method: 'PUT',
      url: '/grant/management/applications/bulk-status',
      data: request,
    });
  }

  // Grant Application Methods
  async submitGrantApplication(formData: FormData): Promise<GrantApplicationResponse> {
    const response = await this.axiosInstance.post('/grant/application', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getFarmerApplications(): Promise<FarmerApplicationResponse[]> {
    return this.request<FarmerApplicationResponse[]>({
      method: 'GET',
      url: '/grant/farmer',
    });
  }

  async getAllApplications(): Promise<FarmerApplicationResponse[]> {
    return this.request<FarmerApplicationResponse[]>({
      method: 'GET',
      url: '/grant/applications',
    });
  }

  async getApplicationById(id: number): Promise<FarmerApplicationResponse> {
    return this.request<FarmerApplicationResponse>({
      method: 'GET',
      url: `/grant/applications/${id}`,
    });
  }

  async markApplicationAsViewed(id: number): Promise<boolean> {
    return this.request<boolean>({
      method: 'POST',
      url: `/grant/applications/${id}/view`,
    });
  }



  // Market Price Methods
  async createMarketPrice(request: CreateMarketPriceRequest): Promise<MarketPriceResponse> {
    return this.request<MarketPriceResponse>({
      method: 'POST',
      url: '/marketprice',
      data: request,
    });
  }

  async getMarketPriceById(id: number): Promise<MarketPriceResponse> {
    return this.request<MarketPriceResponse>({
      method: 'GET',
      url: `/marketprice/${id}`,
    });
  }

  async getAllMarketPrices(): Promise<MarketPriceResponse[]> {
    return this.request<MarketPriceResponse[]>({
      method: 'GET',
      url: '/marketprice',
    });
  }

  async getActiveMarketPrices(): Promise<MarketPriceResponse[]> {
    return this.request<MarketPriceResponse[]>({
      method: 'GET',
      url: '/marketprice/active',
    });
  }

  async getMarketPricesByCrop(cropName: string): Promise<MarketPriceResponse[]> {
    return this.request<MarketPriceResponse[]>({
      method: 'GET',
      url: `/marketprice/crop/${encodeURIComponent(cropName)}`,
    });
  }

  async getMarketPricesByLocation(location: string): Promise<MarketPriceResponse[]> {
    return this.request<MarketPriceResponse[]>({
      method: 'GET',
      url: `/marketprice/location/${encodeURIComponent(location)}`,
    });
  }

  async getFilteredMarketPrices(filter: MarketPriceFilterRequest): Promise<MarketPriceResponse[]> {
    return this.request<MarketPriceResponse[]>({
      method: 'POST',
      url: '/marketprice/filter',
      data: filter,
    });
  }

  async updateMarketPrice(id: number, request: UpdateMarketPriceRequest): Promise<MarketPriceResponse> {
    return this.request<MarketPriceResponse>({
      method: 'PUT',
      url: `/marketprice/${id}`,
      data: request,
    });
  }

  async deleteMarketPrice(id: number): Promise<boolean> {
    return this.request<boolean>({
      method: 'DELETE',
      url: `/marketprice/${id}`,
    });
  }

  async activateMarketPrice(id: number): Promise<boolean> {
    return this.request<boolean>({
      method: 'POST',
      url: `/marketprice/${id}/activate`,
    });
  }

  async deactivateMarketPrice(id: number): Promise<boolean> {
    return this.request<boolean>({
      method: 'POST',
      url: `/marketprice/${id}/deactivate`,
    });
  }

  async bulkUpdateMarketPrices(request: BulkUpdateMarketPriceRequest): Promise<boolean> {
    return this.request<boolean>({
      method: 'POST',
      url: '/marketprice/bulk-update',
      data: request,
    });
  }

  async getDistinctCropNames(): Promise<string[]> {
    return this.request<string[]>({
      method: 'GET',
      url: '/marketprice/crops',
    });
  }

  async getDistinctLocations(): Promise<string[]> {
    return this.request<string[]>({
      method: 'GET',
      url: '/marketprice/locations',
    });
  }

  async getLatestPriceByCropAndLocation(cropName: string, location: string): Promise<MarketPriceResponse> {
    return this.request<MarketPriceResponse>({
      method: 'GET',
      url: `/marketprice/latest?cropName=${encodeURIComponent(cropName)}&location=${encodeURIComponent(location)}`,
    });
  }

  // Utility Methods
  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    return !!token;
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Method to update auth token (useful for token refresh)
  updateAuthToken(token: string) {
    localStorage.setItem('authToken', token);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
