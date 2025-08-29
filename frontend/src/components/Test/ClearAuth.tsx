import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ClearAuth: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleClearAuth = () => {
    // Clear all localStorage data
    localStorage.clear();
    // Force reload the page
    window.location.reload();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Clear Authentication Data</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded">
          <h2 className="font-semibold">Current Status:</h2>
          <p>Is Authenticated: {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
          <p>User: {user ? user.name : 'No user'}</p>
          <p>User Type: {user ? user.type : 'None'}</p>
        </div>

        <div className="p-4 bg-yellow-50 rounded">
          <h2 className="font-semibold">Local Storage Contents:</h2>
          <div className="text-sm">
            <p>Auth Token: {localStorage.getItem('authToken') ? '✅ Present' : '❌ Missing'}</p>
            <p>User Data: {localStorage.getItem('user') ? '✅ Present' : '❌ Missing'}</p>
            <p>AgriFair User: {localStorage.getItem('agrifair-user') ? '✅ Present' : '❌ Missing'}</p>
          </div>
        </div>

        <div className="p-4 bg-red-50 rounded">
          <h2 className="font-semibold">Actions:</h2>
          <div className="flex gap-2">
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Proper Logout
            </button>
            <button 
              onClick={handleClearAuth}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Clear All Data & Reload
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Go to Login
            </button>
          </div>
        </div>

        <div className="p-4 bg-green-50 rounded">
          <h2 className="font-semibold">Instructions:</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Click "Clear All Data & Reload" to remove all authentication data</li>
            <li>This will force you to login again</li>
            <li>Use "Proper Logout" for normal logout</li>
            <li>Use "Go to Login" to navigate to login page</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ClearAuth;
