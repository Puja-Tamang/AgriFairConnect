import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Farmer } from '../types';
import { apiClient } from '../services/apiClient';
import { LoginResponse } from '../types/api';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  updateFarmerProfile: (farmer: Farmer) => void;
  isAuthenticated: boolean;
  loginWithCredentials: (username: string, password: string, userType: string) => Promise<LoginResponse>;
  checkAuthStatus: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    if (!isCheckingAuth && !hasCheckedAuth) {
      checkAuthStatus();
    }
  }, []); // Only run once on mount

  const checkAuthStatus = async () => {
    if (isCheckingAuth) return; // Prevent multiple simultaneous checks
    
    setIsCheckingAuth(true);
    const token = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    
    // If no token or user data, ensure clean state
    if (!token || !savedUser) {
      console.log('No authentication data found, ensuring clean state');
      clearAuthData();
      setIsCheckingAuth(false);
      setHasCheckedAuth(true);
      return;
    }
    
    try {
      const userData = JSON.parse(savedUser);
      // Validate that the user data has required fields
      if (!userData || !userData.id || !userData.type) {
        console.log('Invalid user data found, clearing authentication');
        clearAuthData();
        setIsCheckingAuth(false);
        setHasCheckedAuth(true);
        return;
      }
      
      // Validate token with backend
      try {
        const isValid = await apiClient.validateToken(token);
        if (isValid) {
          console.log('Token is valid, setting user:', userData);
          setUser(userData);
        } else {
          console.log('Token is invalid, clearing authentication');
          clearAuthData();
        }
      } catch (error) {
        console.log('Token validation failed, clearing auth data to prevent issues');
        // Clear auth data on any error to ensure clean state
        clearAuthData();
      }
    } catch (error) {
      console.error('Error parsing saved user data:', error);
      clearAuthData();
    }
    
    setIsCheckingAuth(false);
    setHasCheckedAuth(true);
  };

  const clearAuthData = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('agrifair-user');
  };

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('agrifair-user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      clearAuthData();
    }
  };

  const updateFarmerProfile = (farmer: Farmer) => {
    setUser(farmer);
    localStorage.setItem('user', JSON.stringify(farmer));
  };

  const loginWithCredentials = async (username: string, password: string, userType: string): Promise<LoginResponse> => {
    try {
      const response = await apiClient.login(username, password, userType);
      if (response.success && response.user) {
        // Convert API user response to User type
        const userData: User = {
          id: response.user.id,
          name: response.user.fullName,
          phone: response.user.phoneNumber,
          type: response.user.userType.toLowerCase() as 'farmer' | 'admin',
          ward: response.user.wardNumber || 1,
          municipality: response.user.municipality || 'भद्रपुर नगरपालिका'
        };

        // If user is a farmer, fetch their profile data
        if (userData.type === 'farmer') {
          try {
            const farmerProfile = await apiClient.getFarmerProfile();
            if (farmerProfile) {
              // Update user data with farmer profile information
              userData.monthlyIncome = farmerProfile.monthlyIncome;
              userData.landSize = farmerProfile.landSize;
              userData.landSizeUnit = farmerProfile.landSizeUnit;
              userData.crops = farmerProfile.crops.map(crop => crop.name);
              userData.previousGrant = farmerProfile.hasReceivedGrantBefore;
            }
          } catch (error) {
            console.error('Failed to fetch farmer profile:', error);
            // Continue with basic user data if profile fetch fails
          }
        }

        setUser(userData);
        
        // Save token and user data to localStorage
        if (response.token) {
          localStorage.setItem('authToken', response.token);
        }
        localStorage.setItem('user', JSON.stringify(userData));
      }
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        logout, 
        updateFarmerProfile,
        isAuthenticated: !!user,
        loginWithCredentials,
        checkAuthStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};