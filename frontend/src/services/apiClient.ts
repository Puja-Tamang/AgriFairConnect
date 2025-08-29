import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { 
  LoginResponse, 
  SignupResponse, 
  FarmerProfileResponse, 
  Crop 
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
          // Token expired or invalid
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
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
    MonthlyIncome: number;
    LandSize: number;
    CropIds: number[];
    HasReceivedGrantBefore: boolean;
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
      data: token,
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
