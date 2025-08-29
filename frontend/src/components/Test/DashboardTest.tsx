import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const DashboardTest: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="p-8 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Dashboard Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded">
          <h2 className="font-semibold">Authentication Status:</h2>
          <p>Is Authenticated: {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
          <p>User: {user ? JSON.stringify(user, null, 2) : 'No user'}</p>
        </div>

        <div className="p-4 bg-green-50 rounded">
          <h2 className="font-semibold">Language Status:</h2>
          <p>Current Language: {t('language.current')}</p>
          <p>Welcome Message: {t('dashboard.welcome')}</p>
        </div>

        <div className="p-4 bg-yellow-50 rounded">
          <h2 className="font-semibold">Navigation Test:</h2>
          <p>If you can see this, the dashboard is working!</p>
          <p>Current URL: {window.location.href}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardTest;
