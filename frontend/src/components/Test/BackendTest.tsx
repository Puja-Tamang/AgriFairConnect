import React, { useState } from 'react';
import { apiClient } from '../../services/apiClient';

const BackendTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testBackend = async () => {
    setIsLoading(true);
    setTestResult('Testing...');
    
    try {
      // Test a simple endpoint
      const exists = await apiClient.checkUsernameExists('testuser');
      setTestResult(`✅ Backend is accessible! Username check result: ${exists}`);
    } catch (error: any) {
      setTestResult(`❌ Backend error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Backend Connection Test</h2>
      <button 
        onClick={testBackend}
        disabled={isLoading}
        className="btn-primary mb-4"
      >
        {isLoading ? 'Testing...' : 'Test Backend Connection'}
      </button>
      <div className="bg-gray-100 p-4 rounded">
        <pre>{testResult}</pre>
      </div>
    </div>
  );
};

export default BackendTest;
