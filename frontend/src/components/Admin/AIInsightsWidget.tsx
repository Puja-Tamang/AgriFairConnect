import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Users, Award } from 'lucide-react';

interface AIInsightsWidgetProps {
  className?: string;
}

const AIInsightsWidget: React.FC<AIInsightsWidgetProps> = ({ className = '' }) => {
  const [status, setStatus] = useState<'active' | 'offline'>('active');

  useEffect(() => {
    // Simulate checking system status
    setStatus('active');
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'offline':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'active':
        return 'Prioritization System Active';
      case 'offline':
        return 'System Offline';
      default:
        return 'Checking Status...';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-800">Smart Prioritization</h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">System Status</p>
                <p className="text-lg font-bold text-blue-600">Active</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Accuracy</p>
                <p className="text-lg font-bold text-green-600">~85%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Factors Analyzed</p>
              <p className="text-lg font-bold text-purple-600">4 Key Factors</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600 mb-2">Scoring Criteria:</p>
          <div className="flex flex-wrap gap-1">
            <span className="px-2 py-1 bg-white text-xs rounded border">Income Level</span>
            <span className="px-2 py-1 bg-white text-xs rounded border">Land Size</span>
            <span className="px-2 py-1 bg-white text-xs rounded border">Previous Grants</span>
            <span className="px-2 py-1 bg-white text-xs rounded border">Crop Yield</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          🎯 Rule-based prioritization system for fair grant distribution
        </p>
      </div>
    </div>
  );
};

export default AIInsightsWidget;
