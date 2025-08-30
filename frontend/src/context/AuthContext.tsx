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
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        // Validate that the user data has required fields
        if (userData && userData.id && userData.type) {
          // Validate token with backend
          try {
            const isValid = await apiClient.validateToken(token);
            if (isValid) {
              setUser(userData);
            } else {
              console.log('Token is invalid, clearing authentication');
              clearAuthData();
            }
          } catch (error) {
            console.log('Token validation failed, but not clearing auth data to prevent loop');
            // Don't clear auth data on network errors to prevent infinite loop
            // Only clear if it's a specific authentication error
            if (error instanceof Error && error.message.includes('401')) {
              clearAuthData();
            }
          }
        } else {
          console.log('Invalid user data found, clearing authentication');
          clearAuthData();
        }
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        clearAuthData();
      }
    } else {
      // Clear any invalid data
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