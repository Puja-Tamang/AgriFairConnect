import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';

interface FraudResult {
  farmer_id: string;
  farmer_name: string;
  monthly_income: number;
  land_size_bigha: number;
  previous_grants: number;
  is_fraudulent: boolean;
  anomaly_score: number;
  risk_level: string;
  risk_factors: string[];
}

interface FraudAnalysisResponse {
  success: boolean;
  message: string;
  total_applications: number;
  fraud_detected: number;
  risk_distribution: {
    'High Risk': number;
    'Medium Risk': number;
    'Low Risk': number;
  };
  average_anomaly_score: number;
  results: FraudResult[];
  timestamp: string;
}

const FraudDetection: React.FC = () => {
  const { applications, grants } = useData();
  const [fraudResults, setFraudResults] = useState<FraudResult[]>([]);
  const [analysisSummary, setAnalysisSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedGrant, setSelectedGrant] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [debugInfo, setDebugInfo] = useState<string>('');

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'High Risk': return 'bg-red-500';
      case 'Medium Risk': return 'bg-yellow-500';
      case 'Low Risk': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskLabel = (riskLevel: string) => {
    switch (riskLevel) {
      case 'High Risk': return 'High Risk';
      case 'Medium Risk': return 'Medium Risk';
      case 'Low Risk': return 'Low Risk';
      default: return 'Unknown';
    }
  };

  const getAnomalyColor = (score: number) => {
    if (score < -0.3) return 'text-red-600';
    if (score < -0.1) return 'text-yellow-600';
    return 'text-green-600';
  };

  const checkApiStatus = async () => {
    try {
      const response = await fetch('http://localhost:8002/health');
      if (response.ok) {
        setApiStatus('connected');
        return true;
      } else {
        setApiStatus('disconnected');
        return false;
      }
    } catch (error) {
      setApiStatus('disconnected');
      return false;
    }
  };

  const runFraudAnalysis = async () => {
    if (!selectedGrant) {
      setError('Please select a grant first');
      return;
    }

    setLoading(true);
    setError(null);
    setDebugInfo('');

    try {
      // Check API status first
      const isApiConnected = await checkApiStatus();
      if (!isApiConnected) {
        setError('Fraud detection service is not available. Please ensure the AI service is running.');
        return;
      }

      if (applications.length === 0) {
        setError('No applications found for this grant. Please ensure there are submitted applications.');
        setDebugInfo(`Applications count: ${applications.length}`);
        return;
      }

      setDebugInfo(`Found ${applications.length} applications to analyze`);

      // Prepare application data for fraud detection
      const applicationsData = applications.map(app => ({
        farmer_id: app.farmerName || `FARMER_${app.id}`,
        farmer_name: app.farmerName || 'Unknown Farmer',
        monthly_income: app.monthlyIncome || 15000,
        land_size_bigha: app.landSize || 2.0,
        previous_grants: app.hasReceivedGrantBefore ? 1 : 0,
        phone: app.farmerPhone || '9800000000',
        email: app.farmerEmail || 'farmer@gmail.com',
        municipality: app.farmerMunicipality || 'भद्रपुर नगरपालिका',
        ward: app.farmerWard || 5,
        crop_details: app.cropDetails || 'धान, मकै'
      }));

      setDebugInfo(`Prepared ${applicationsData.length} applications for analysis`);

      // Call fraud detection API
      const response = await fetch('http://localhost:8002/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applications: applicationsData
        })
      });

      setDebugInfo(`API Response Status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result: FraudAnalysisResponse = await response.json();

      setDebugInfo(`Analysis completed successfully`);

      if (result.success) {
        setFraudResults(result.results);
        setAnalysisSummary({
          total_applications: result.total_applications,
          fraud_detected: result.fraud_detected,
          risk_distribution: result.risk_distribution,
          average_anomaly_score: result.average_anomaly_score,
          message: result.message
        });
      } else {
        setError('Failed to analyze applications for fraud');
      }

    } catch (err) {
      console.error('Fraud Analysis Error:', err);
      setError(`Failed to run fraud analysis: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setDebugInfo(`Error details: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testWithSampleData = async () => {
    setLoading(true);
    setError(null);
    setDebugInfo('Testing with sample data...');

    try {
      // Get sample data from API
      const response = await fetch('http://localhost:8002/sample-data');
      if (!response.ok) {
        throw new Error(`Failed to get sample data: ${response.status}`);
      }

      const sampleData = await response.json();
      setDebugInfo(`Got ${sampleData.count} sample applications`);

      // Use sample data for fraud detection
      const detectResponse = await fetch('http://localhost:8002/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applications: sampleData.sample_applications
        })
      });

      if (!detectResponse.ok) {
        const errorText = await detectResponse.text();
        throw new Error(`Detection failed: ${detectResponse.status} - ${errorText}`);
      }

      const result: FraudAnalysisResponse = await detectResponse.json();

      if (result.success) {
        setFraudResults(result.results);
        setAnalysisSummary({
          total_applications: result.total_applications,
          fraud_detected: result.fraud_detected,
          risk_distribution: result.risk_distribution,
          average_anomaly_score: result.average_anomaly_score,
          message: result.message
        });
        setDebugInfo('Sample data analysis completed successfully!');
      } else {
        setError('Failed to analyze sample data');
      }

    } catch (err) {
      console.error('Sample Data Test Error:', err);
      setError(`Sample data test failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setDebugInfo(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Check API status on component mount
  useEffect(() => {
    checkApiStatus();
  }, []);

  const getStatusIcon = () => {
    switch (apiStatus) {
      case 'connected': return '🟢';
      case 'disconnected': return '🔴';
      case 'checking': return '🟡';
      default: return '⚪';
    }
  };

  const getStatusText = () => {
    switch (apiStatus) {
      case 'connected': return 'AI Service Connected';
      case 'disconnected': return 'AI Service Disconnected';
      case 'checking': return 'Checking AI Service...';
      default: return 'Unknown Status';
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🔍 AI Fraud Detection
        </h2>
        <p className="text-gray-600">
          Detect suspicious applications using Isolation Forest algorithm
        </p>
        
        {/* API Status */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getStatusIcon()}</span>
            <span className="text-sm font-medium text-gray-700">{getStatusText()}</span>
          </div>
        </div>
      </div>

      {/* Grant Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Grant for Fraud Analysis
        </label>
        <select
          value={selectedGrant}
          onChange={(e) => setSelectedGrant(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          <option value="">Choose a grant...</option>
          {grants.map((grant) => (
            <option key={grant.id} value={grant.id}>
              {grant.title} - {grant.amount} NPR
            </option>
          ))}
        </select>
      </div>

      {/* Run Analysis Button */}
      <div className="mb-6">
        <button
          onClick={runFraudAnalysis}
          disabled={loading || !selectedGrant || apiStatus !== 'connected'}
          className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Analyzing for Fraud...
            </div>
          ) : (
            '🔍 Run Fraud Detection'
          )}
        </button>
      </div>

      {/* Test with Sample Data Button */}
      <div className="mb-6">
        <button
          onClick={testWithSampleData}
          disabled={loading || apiStatus !== 'connected'}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Testing with Sample Data...
            </div>
          ) : (
            '🧪 Test with Sample Data'
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Debug Info */}
      {debugInfo && (
        <div className="mb-6 p-4 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-700">
          <strong>Debug Info:</strong> {debugInfo}
        </div>
      )}

      {/* Analysis Summary */}
      {analysisSummary && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Fraud Analysis Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{analysisSummary.total_applications}</div>
              <div className="text-sm text-gray-600">Total Applications</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{analysisSummary.fraud_detected}</div>
              <div className="text-sm text-gray-600">Suspicious Cases</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">{analysisSummary.risk_distribution['Medium Risk']}</div>
              <div className="text-sm text-gray-600">Medium Risk</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{analysisSummary.risk_distribution['Low Risk']}</div>
              <div className="text-sm text-gray-600">Low Risk</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-lg font-bold text-gray-800">
                {analysisSummary.average_anomaly_score.toFixed(3)}
              </div>
              <div className="text-sm text-gray-600">Average Anomaly Score</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-lg font-bold text-gray-800">
                {((analysisSummary.fraud_detected / analysisSummary.total_applications) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Suspicious Rate</div>
            </div>
          </div>
        </div>
      )}

      {/* Fraud Results Table */}
      {fraudResults.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            🔍 Fraud Detection Results (Sorted by Risk)
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Level
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Farmer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Income (NPR)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Land (Bigha)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Previous Grants
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Anomaly Score
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Factors
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {fraudResults
                  .sort((a, b) => {
                    // Sort by risk level (High > Medium > Low)
                    const riskOrder = { 'High Risk': 3, 'Medium Risk': 2, 'Low Risk': 1 };
                    return riskOrder[b.risk_level as keyof typeof riskOrder] - riskOrder[a.risk_level as keyof typeof riskOrder];
                  })
                                     .map((result) => (
                    <tr key={result.farmer_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white ${getRiskColor(result.risk_level)}`}>
                          {getRiskLabel(result.risk_level)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {result.farmer_name}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {result.monthly_income.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {result.land_size_bigha}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {result.previous_grants}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getAnomalyColor(result.anomaly_score)}`}>
                          {result.anomaly_score.toFixed(3)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">
                          {result.risk_factors.length > 0 ? (
                            <ul className="list-disc list-inside text-xs">
                              {result.risk_factors.slice(0, 2).map((factor, idx) => (
                                <li key={idx} className="text-gray-600">{factor}</li>
                              ))}
                              {result.risk_factors.length > 2 && (
                                <li className="text-gray-500">+{result.risk_factors.length - 2} more</li>
                              )}
                            </ul>
                          ) : (
                            <span className="text-green-600 text-xs">No risk factors</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fraud Detection Information */}
      <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
        <h4 className="text-sm font-semibold text-red-800 mb-2">ℹ️ Fraud Detection Criteria</h4>
        <p className="text-sm text-red-700 mb-2">
          The AI system detects suspicious patterns using Isolation Forest algorithm:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-red-600">
          <div>
            <strong>Income Anomalies:</strong>
            <ul className="list-disc list-inside ml-2 mt-1">
              <li>Very high income but applying for grants</li>
              <li>Unusually low income with large land</li>
              <li>Income inconsistencies</li>
            </ul>
          </div>
          <div>
            <strong>Land Size Anomalies:</strong>
            <ul className="list-disc list-inside ml-2 mt-1">
              <li>Very large land holdings</li>
              <li>Land size vs income mismatch</li>
              <li>Suspicious land size patterns</li>
            </ul>
          </div>
          <div>
            <strong>Grant History Anomalies:</strong>
            <ul className="list-disc list-inside ml-2 mt-1">
              <li>Multiple previous grants</li>
              <li>Grant abuse patterns</li>
              <li>Unusual grant history</li>
            </ul>
          </div>
          <div>
            <strong>Combination Anomalies:</strong>
            <ul className="list-disc list-inside ml-2 mt-1">
              <li>Multiple suspicious factors</li>
              <li>Pattern inconsistencies</li>
              <li>Statistical outliers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FraudDetection;
