import { 
  LoginResponse, 
  SignupResponse, 
  FarmerProfileResponse, 
  Crop 
} from '../types/api';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Fetch-based API Client
class FetchClient {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Generic request method
  private async request<T>(
    url: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const config: RequestInit = {
      credentials: 'omit', // Changed to omit for proxy
      headers: this.getAuthHeaders(),
      ...options,
    };

    // Merge headers properly
    if (options.headers) {
      config.headers = { ...config.headers, ...options.headers };
    }

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, config);
      return this.handleResponse<T>(response);
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server');
      }
      throw error;
    }
  }

  // Authentication Methods
  async login(username: string, password: string, userType: string): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password, userType }),
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
    return this.request<SignupResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(signupData),
    });
  }

  async checkUsernameExists(username: string): Promise<boolean> {
    return this.request<boolean>(`/auth/check-username/${username}`, {
      method: 'GET',
    });
  }

  async logout(): Promise<void> {
    try {
      await this.request<void>('/auth/logout', {
        method: 'POST',
      });
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }

  async validateToken(token: string): Promise<boolean> {
    return this.request<boolean>('/auth/validate-token', {
      method: 'POST',
      body: JSON.stringify(token),
    });
  }

  // Farmer Profile Methods
  async getFarmerProfile(): Promise<FarmerProfileResponse> {
    return this.request<FarmerProfileResponse>('/farmer/profile', {
      method: 'GET',
    });
  }

  async getFarmerProfileByUsername(username: string): Promise<FarmerProfileResponse> {
    return this.request<FarmerProfileResponse>(`/farmer/profile/${username}`, {
      method: 'GET',
    });
  }

  async updateFarmerProfile(profileData: Partial<FarmerProfileResponse>): Promise<boolean> {
    return this.request<boolean>('/farmer/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async deleteFarmerProfile(): Promise<boolean> {
    return this.request<boolean>('/farmer/profile', {
      method: 'DELETE',
    });
  }

  async getAllFarmers(): Promise<FarmerProfileResponse[]> {
    return this.request<FarmerProfileResponse[]>('/farmer/all', {
      method: 'GET',
    });
  }

  async uploadDocument(file: File, documentType: string): Promise<boolean> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

    return this.request<boolean>('/farmer/upload-document', {
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
      body: formData,
    });
  }

  async deleteDocument(documentId: number): Promise<boolean> {
    return this.request<boolean>(`/farmer/document/${documentId}`, {
      method: 'DELETE',
    });
  }

  // Crop Methods
  async getAllCrops(): Promise<Crop[]> {
    return this.request<Crop[]>('/crop', {
      method: 'GET',
    });
  }

  async getCropById(id: number): Promise<Crop> {
    return this.request<Crop>(`/crop/${id}`, {
      method: 'GET',
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
export const fetchClient = new FetchClient();
