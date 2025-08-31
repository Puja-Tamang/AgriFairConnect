import React, { useState, useEffect } from 'react';

const FraudInsightsWidget: React.FC = () => {
  const [status, setStatus] = useState<'active' | 'offline'>('offline');
  const [lastCheck, setLastCheck] = useState<string>('Never');

  useEffect(() => {
    // Check fraud detection service status
    const checkFraudService = async () => {
      try {
        const response = await fetch('http://localhost:8002/health');
        if (response.ok) {
          setStatus('active');
          setLastCheck(new Date().toLocaleTimeString());
        } else {
          setStatus('offline');
        }
      } catch (error) {
        setStatus('offline');
      }
    };

    checkFraudService();
    const interval = setInterval(checkFraudService, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">🔍 Fraud Detection</h3>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {status === 'active' ? 'Active' : 'Offline'}
        </span>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">System Status</p>
          <p className="text-lg font-bold text-blue-600">
            {status === 'active' ? '🟢 Online' : '🔴 Offline'}
          </p>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">Detection Accuracy</p>
          <p className="text-lg font-bold text-green-600">~96%</p>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">Algorithm</p>
          <p className="text-lg font-bold text-purple-600">Isolation Forest</p>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">Last Check</p>
          <p className="text-sm font-medium text-gray-800">{lastCheck}</p>
        </div>

        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            🎯 AI-powered fraud detection using anomaly detection
          </p>
        </div>
      </div>
    </div>
  );
};

export default FraudInsightsWidget;
