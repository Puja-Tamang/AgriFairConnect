import React from 'react';

const ClearAuth: React.FC = () => {
  const clearAllAuthData = () => {
    // Clear all authentication data
    localStorage.clear();
    sessionStorage.clear();
    
    // Force reload the page
    window.location.href = '/login';
  };

  const clearAuthDataOnly = () => {
    // Clear only authentication-related data
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('agrifair-user');
    
    // Force reload the page
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Clear Authentication Data
        </h1>
        
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-sm text-yellow-800">
              <strong>Current Issue:</strong> Login page is loading in a repetitive loop.
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm text-blue-800">
              <strong>Solution:</strong> Clear authentication data to stop the loop and start fresh.
            </p>
          </div>
          
          <div className="flex flex-col space-y-3">
            <button
              onClick={clearAuthDataOnly}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Clear Auth Data Only
            </button>
            
            <button
              onClick={clearAllAuthData}
              className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Clear All Data (Nuclear Option)
            </button>
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            After clearing, you'll be redirected to the login page.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClearAuth;
