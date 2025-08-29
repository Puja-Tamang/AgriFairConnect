import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, Users, User, Lock, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import toast from 'react-hot-toast';
import LanguageToggle from '../Layout/LanguageToggle';
import { apiClient } from '../../services/apiClient';

const Login: React.FC = () => {
  const [userType, setUserType] = useState<'farmer' | 'admin'>('farmer');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { loginWithCredentials } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error(t('login.usernameRequired'));
      return;
    }

    if (!password.trim()) {
      toast.error(t('login.passwordRequired'));
      return;
    }

    setIsLoading(true);

    try {
      console.log('Login attempt:', { username, userType });
      const response = await loginWithCredentials(username, password, userType);
      console.log('Login response:', response);
      
      if (response.success) {
        console.log('Login successful, navigating to:', userType === 'farmer' ? '/farmer/dashboard' : '/admin/dashboard');
        console.log('User type from form:', userType);
        console.log('Response user type:', response.user?.userType);
        
        // Use the user type from the response, fallback to form user type
        const actualUserType = (response.user?.userType || userType).toLowerCase();
        console.log('Actual user type for navigation:', actualUserType);
        
        if (actualUserType === 'farmer') {
          navigate('/farmer/dashboard');
        } else {
          navigate('/admin/dashboard');
        }
        toast.success(t('login.loginSuccess'));
      } else {
        toast.error(response.message || t('login.loginFailed'));
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(t('login.loginFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    if (userType !== 'farmer') {
      toast.error(t('login.onlyFarmersSignup'));
      return;
    }

    // Navigate to registration without username/password validation
    navigate('/farmer/register', { 
      state: { 
        isNewSignup: true 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center p-4">
      {/* Language Toggle - Top Right */}
      <div className="absolute top-4 right-4">
        <LanguageToggle className="bg-white text-green-600 hover:bg-green-600 hover:text-white shadow-lg" />
      </div>
      
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
            <Sprout className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t('login.title')}</h1>
          <p className="text-gray-600 mt-2">{t('login.subtitle')}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('login.userType')}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setUserType('farmer')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  userType === 'farmer'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <Sprout className="h-6 w-6 mx-auto mb-2 text-green-500" />
                <span className="text-sm font-medium">{t('login.farmer')}</span>
              </button>
              <button
                type="button"
                onClick={() => setUserType('admin')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  userType === 'admin'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <Users className="h-6 w-6 mx-auto mb-2 text-green-500" />
                <span className="text-sm font-medium">{t('login.admin')}</span>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              {t('login.username')}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field pl-10"
                placeholder={userType === 'farmer' ? 'farmer123' : 'admin'}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              {t('login.password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? t('loading') : t('login.loginButton')}
          </button>

          {/* Signup Button - Only show for farmers */}
          {userType === 'farmer' && (
            <button
              type="button"
              onClick={handleSignup}
              disabled={isLoading}
              className="w-full btn-secondary mt-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus className="h-4 w-4 inline mr-2" />
              {t('login.signupButton')}
            </button>
          )}
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            {userType === 'farmer' 
              ? t('login.newFarmer')
              : t('login.adminAccount')
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;