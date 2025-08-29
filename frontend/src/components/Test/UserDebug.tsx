import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserDebug: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleManualRedirect = (path: string) => {
    navigate(path);
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">User Debug Information</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded">
          <h2 className="font-semibold">Authentication Status:</h2>
          <p>Is Authenticated: {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
        </div>

        <div className="p-4 bg-green-50 rounded">
          <h2 className="font-semibold">User Data:</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
            {user ? JSON.stringify(user, null, 2) : 'No user data'}
          </pre>
        </div>

        <div className="p-4 bg-yellow-50 rounded">
          <h2 className="font-semibold">Local Storage:</h2>
          <p>Auth Token: {localStorage.getItem('authToken') ? '✅ Present' : '❌ Missing'}</p>
          <p>User Data: {localStorage.getItem('user') ? '✅ Present' : '❌ Missing'}</p>
        </div>

        <div className="p-4 bg-purple-50 rounded">
          <h2 className="font-semibold">Manual Navigation:</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => handleManualRedirect('/farmer/dashboard')}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Go to Farmer Dashboard
            </button>
            <button 
              onClick={() => handleManualRedirect('/admin/dashboard')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Go to Admin Dashboard
            </button>
            <button 
              onClick={() => handleManualRedirect('/test/dashboard')}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Go to Test Dashboard
            </button>
          </div>
        </div>

        <div className="p-4 bg-red-50 rounded">
          <h2 className="font-semibold">Current URL:</h2>
          <p>{window.location.href}</p>
        </div>
      </div>
    </div>
  );
};

export default UserDebug;
