import React, { useState } from 'react';
import { apiClient } from '../../services/apiClient';
import { fetchClient } from '../../services/fetchClient';
import toast from 'react-hot-toast';

const ApiTestComponent: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testAuthEndpoints = async () => {
    setIsLoading(true);
    addResult('🧪 Testing Authentication Endpoints...');

    try {
      // Test username check
      const exists = await apiClient.checkUsernameExists('testuser');
      addResult(`✅ Username check: ${exists ? 'exists' : 'available'}`);

      // Test token validation
      const isValid = await apiClient.validateToken('test-token');
      addResult(`✅ Token validation: ${isValid ? 'valid' : 'invalid'}`);

    } catch (error: any) {
      addResult(`❌ Auth test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testCropEndpoints = async () => {
    setIsLoading(true);
    addResult('🌾 Testing Crop Endpoints...');

    try {
      // Test get all crops
      const crops = await apiClient.getAllCrops();
      addResult(`✅ Get all crops: ${crops.length} crops found`);

      if (crops.length > 0) {
        // Test get crop by ID
        const crop = await apiClient.getCropById(crops[0].id);
        addResult(`✅ Get crop by ID: ${crop.name}`);
      }

    } catch (error: any) {
      addResult(`❌ Crop test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testFarmerEndpoints = async () => {
    setIsLoading(true);
    addResult('👨‍🌾 Testing Farmer Endpoints...');

    try {
      // Test get all farmers (requires auth)
      const farmers = await apiClient.getAllFarmers();
      addResult(`✅ Get all farmers: ${farmers.length} farmers found`);

    } catch (error: any) {
      addResult(`❌ Farmer test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testFetchClient = async () => {
    setIsLoading(true);
    addResult('🔄 Testing Fetch Client...');

    try {
      // Test username check with fetch client
      const exists = await fetchClient.checkUsernameExists('testuser');
      addResult(`✅ Fetch client username check: ${exists ? 'exists' : 'available'}`);

      // Test get all crops with fetch client
      const crops = await fetchClient.getAllCrops();
      addResult(`✅ Fetch client get crops: ${crops.length} crops found`);

    } catch (error: any) {
      addResult(`❌ Fetch client test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testAllEndpoints = async () => {
    setIsLoading(true);
    addResult('🚀 Starting comprehensive API test...');

    try {
      await testAuthEndpoints();
      await testCropEndpoints();
      await testFarmerEndpoints();
      await testFetchClient();
      
      addResult('🎉 All API tests completed!');
    } catch (error: any) {
      addResult(`❌ Comprehensive test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">API Integration Test</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <button
            onClick={testAuthEndpoints}
            disabled={isLoading}
            className="btn-primary disabled:opacity-50"
          >
            Test Auth
          </button>
          
          <button
            onClick={testCropEndpoints}
            disabled={isLoading}
            className="btn-primary disabled:opacity-50"
          >
            Test Crops
          </button>
          
          <button
            onClick={testFarmerEndpoints}
            disabled={isLoading}
            className="btn-primary disabled:opacity-50"
          >
            Test Farmers
          </button>
          
          <button
            onClick={testFetchClient}
            disabled={isLoading}
            className="btn-primary disabled:opacity-50"
          >
            Test Fetch
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={testAllEndpoints}
            disabled={isLoading}
            className="btn-secondary disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test All Endpoints'}
          </button>
          
          <button
            onClick={clearResults}
            className="btn-secondary"
          >
            Clear Results
          </button>
        </div>

        <div className="bg-gray-100 rounded-lg p-4 h-96 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-3">Test Results:</h3>
          {testResults.length === 0 ? (
            <p className="text-gray-500">No test results yet. Click a test button to start.</p>
          ) : (
            <div className="space-y-1">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono">
                  {result}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">API Configuration:</h3>
          <div className="text-sm space-y-1">
            <p><strong>Base URL:</strong> {process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}</p>
            <p><strong>Client:</strong> Axios (with interceptors)</p>
            <p><strong>Alternative:</strong> Fetch (with credentials)</p>
            <p><strong>CORS:</strong> Configured for localhost:3000</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiTestComponent;
