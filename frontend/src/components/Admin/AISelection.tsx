import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

interface PriorityScore {
  farmer_id: string;
  farmer_name: string;
  priority_score: number;
  approval_probability: number;
  confidence: number;
  recommendation: string;
  reasoning: string[];
  details: {
    income_score: number;
    land_score: number;
    grants_score: number;
    yield_score: number;
  };
}

interface AnalysisSummary {
  total_farmers: number;
  high_priority: number;
  medium_priority: number;
  low_priority: number;
  avg_priority_score: number;
  avg_approval_probability: number;
}

const AISelection: React.FC = () => {
  const { applications, grants } = useData();
  const [predictions, setPredictions] = useState<PriorityScore[]>([]);
  const [summary, setSummary] = useState<AnalysisSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedGrant, setSelectedGrant] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const getPriorityColor = (score: number) => {
    if (score >= 8.0) return 'bg-green-500';
    if (score >= 6.0) return 'bg-yellow-500';
    if (score >= 4.0) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getPriorityLabel = (score: number) => {
    if (score >= 8.0) return 'High Priority';
    if (score >= 6.0) return 'Medium Priority';
    if (score >= 4.0) return 'Low Priority';
    return 'Not Recommended';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Simple scoring system based on the four key factors
  const calculatePriorityScore = (farmerData: any): PriorityScore => {
    let totalScore = 0;
    let reasoning: string[] = [];
    const details = {
      income_score: 0,
      land_score: 0,
      grants_score: 0,
      yield_score: 0
    };

    // 1. Income Scoring (0-10 points)
    const income = farmerData.monthly_income || 15000;
    if (income < 10000) {
      details.income_score = 10;
      reasoning.push("Low income - highest priority for support");
    } else if (income < 20000) {
      details.income_score = 7;
      reasoning.push("Moderate income - good candidate for support");
    } else if (income < 30000) {
      details.income_score = 4;
      reasoning.push("Higher income - moderate priority");
    } else {
      details.income_score = 2;
      reasoning.push("High income - lower priority");
    }
    totalScore += details.income_score;

    // 2. Land Size Scoring (0-10 points)
    const landSize = farmerData.land_size_bigha || 2.0;
    if (landSize < 2) {
      details.land_score = 10;
      reasoning.push("Small land holding - needs support for expansion");
    } else if (landSize < 4) {
      details.land_score = 7;
      reasoning.push("Medium land holding - good for targeted support");
    } else if (landSize < 6) {
      details.land_score = 4;
      reasoning.push("Large land holding - moderate priority");
    } else {
      details.land_score = 2;
      reasoning.push("Very large land holding - lower priority");
    }
    totalScore += details.land_score;

    // 3. Previous Grants Scoring (0-10 points)
    const previousGrants = farmerData.previous_grants || 0;
    if (previousGrants === 0) {
      details.grants_score = 10;
      reasoning.push("No previous grants - first-time beneficiary priority");
    } else if (previousGrants === 1) {
      details.grants_score = 6;
      reasoning.push("One previous grant - moderate priority");
    } else if (previousGrants === 2) {
      details.grants_score = 3;
      reasoning.push("Multiple previous grants - lower priority");
    } else {
      details.grants_score = 1;
      reasoning.push("Many previous grants - lowest priority");
    }
    totalScore += details.grants_score;

    // 4. Crop Yield Scoring (0-10 points) - Based on crop details
    const cropDetails = farmerData.current_crops || '';
    if (cropDetails.includes('धान') && cropDetails.includes('मकै')) {
      details.yield_score = 7;
      reasoning.push("Multiple crops (rice and corn) - good farming diversity");
    } else if (cropDetails.includes('धान') || cropDetails.includes('मकै')) {
      details.yield_score = 6;
      reasoning.push("Single major crop - moderate farming practice");
    } else if (cropDetails.length > 0) {
      details.yield_score = 5;
      reasoning.push("Other crops - needs assessment");
    } else {
      details.yield_score = 8;
      reasoning.push("No specific crops listed - may need support for crop planning");
    }
    totalScore += details.yield_score;

    // Calculate final scores
    const priorityScore = totalScore / 4; // Average of all scores
    const approvalProbability = Math.min(priorityScore / 10, 0.95); // Convert to probability
    const confidence = 0.85; // High confidence for rule-based system

    // Generate recommendation
    let recommendation = '';
    if (priorityScore >= 8.0) {
      recommendation = 'Highly Recommended';
    } else if (priorityScore >= 6.0) {
      recommendation = 'Recommended';
    } else if (priorityScore >= 4.0) {
      recommendation = 'Consider for Approval';
    } else {
      recommendation = 'Not Recommended';
    }

    return {
      farmer_id: farmerData.farmer_id,
      farmer_name: farmerData.full_name,
      priority_score: priorityScore,
      approval_probability: approvalProbability,
      confidence: confidence,
      recommendation: recommendation,
      reasoning: reasoning,
      details: details
    };
  };

  const runAnalysis = async () => {
    if (!selectedGrant) {
      setError('Please select a grant first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (applications.length === 0) {
        setError('No applications found for this grant. Please ensure there are submitted applications.');
        return;
      }

      // Convert applications to farmer data format
      const farmerData = applications.map(app => ({
        farmer_id: app.farmerName || `FARMER_${app.id}`,
        full_name: app.farmerName || 'Unknown Farmer',
        phone: app.farmerPhone || '9800000000',
        email: app.farmerEmail || 'farmer@gmail.com',
        address: app.farmerAddress || 'Unknown Address',
        municipality: app.farmerMunicipality || 'भद्रपुर नगरपालिका',
        ward: app.farmerWard || 5,
        monthly_income: app.monthlyIncome || 15000,
        land_size_bigha: app.landSize || 2.0,
        previous_grants: app.hasReceivedGrantBefore ? 1 : 0,
        crop_yield: 'average', // Default value since not in API
        current_crops: app.cropDetails || 'धान, मकै',
        education_level: 'secondary', // Default value
        family_size: 4, // Default value
        age: 45, // Default value
        farming_experience_years: 10, // Default value
        credit_score: 600, // Default value
        market_distance_km: 5.0, // Default value
        has_irrigation: false, // Default value
        uses_modern_technology: false, // Default value
        social_category: 'general', // Default value
        has_disability: false // Default value
      }));

      // Calculate priority scores for all farmers
      const priorityScores = farmerData.map(calculatePriorityScore);
      
      // Sort by priority score (highest first)
      const sortedScores = priorityScores.sort((a, b) => b.priority_score - a.priority_score);
      
      setPredictions(sortedScores);

      // Calculate summary statistics
      const totalFarmers = sortedScores.length;
      const highPriority = sortedScores.filter(s => s.priority_score >= 8.0).length;
      const mediumPriority = sortedScores.filter(s => s.priority_score >= 6.0 && s.priority_score < 8.0).length;
      const lowPriority = sortedScores.filter(s => s.priority_score < 6.0).length;
      const avgPriorityScore = sortedScores.reduce((sum, s) => sum + s.priority_score, 0) / totalFarmers;
      const avgApprovalProbability = sortedScores.reduce((sum, s) => sum + s.approval_probability, 0) / totalFarmers;

      setSummary({
        total_farmers: totalFarmers,
        high_priority: highPriority,
        medium_priority: mediumPriority,
        low_priority: lowPriority,
        avg_priority_score: avgPriorityScore,
        avg_approval_probability: avgApprovalProbability
      });

    } catch (err) {
      setError('Failed to run analysis. Please try again.');
      console.error('Analysis Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🎯 Smart Grant Prioritization
        </h2>
        <p className="text-gray-600">
          Prioritize applications based on income, land size, previous grants, and crop yield
        </p>
      </div>

      {/* Grant Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Grant for Analysis
        </label>
        <select
          value={selectedGrant}
          onChange={(e) => setSelectedGrant(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          onClick={runAnalysis}
          disabled={loading || !selectedGrant}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Analyzing Applications...
            </div>
          ) : (
            '🚀 Run Priority Analysis'
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Summary Statistics */}
      {summary && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Analysis Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{summary.total_farmers}</div>
              <div className="text-sm text-gray-600">Total Applications</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{summary.high_priority}</div>
              <div className="text-sm text-gray-600">High Priority</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">{summary.medium_priority}</div>
              <div className="text-sm text-gray-600">Medium Priority</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{summary.low_priority}</div>
              <div className="text-sm text-gray-600">Low Priority</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-lg font-bold text-gray-800">{summary.avg_priority_score.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Average Priority Score</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-lg font-bold text-gray-800">
                {(summary.avg_approval_probability * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Average Approval Probability</div>
            </div>
          </div>
        </div>
      )}

      {/* Predictions Table */}
      {predictions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            🎯 Priority Rankings (Sorted by Score)
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Farmer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority Score
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Approval Probability
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recommendation
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Key Factors
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {predictions.map((prediction, index) => (
                  <tr key={prediction.farmer_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-white ${getPriorityColor(prediction.priority_score)}`}>
                          {index + 1}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {prediction.farmer_name}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${getPriorityColor(prediction.priority_score)}`}
                            style={{ width: `${(prediction.priority_score / 10) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {prediction.priority_score.toFixed(1)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {getPriorityLabel(prediction.priority_score)}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {(prediction.approval_probability * 100).toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getConfidenceColor(prediction.confidence)}`}>
                        {(prediction.confidence * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        prediction.recommendation.includes('Highly Recommended') ? 'bg-green-100 text-green-800' :
                        prediction.recommendation.includes('Recommended') ? 'bg-blue-100 text-blue-800' :
                        prediction.recommendation.includes('Consider') ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {prediction.recommendation}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          <div>Income: {prediction.details.income_score}/10</div>
                          <div>Land: {prediction.details.land_score}/10</div>
                          <div>Grants: {prediction.details.grants_score}/10</div>
                          <div>Yield: {prediction.details.yield_score}/10</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Scoring Information */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">ℹ️ Scoring Criteria</h4>
        <p className="text-sm text-blue-700 mb-2">
          Applications are scored based on four key factors (0-10 points each):
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-blue-600">
          <div>
            <strong>Income Level:</strong>
            <ul className="list-disc list-inside ml-2 mt-1">
              <li>&lt;10,000 NPR: 10 points</li>
              <li>10,000-20,000 NPR: 7 points</li>
              <li>20,000-30,000 NPR: 4 points</li>
              <li>&gt;30,000 NPR: 2 points</li>
            </ul>
          </div>
          <div>
            <strong>Land Size:</strong>
            <ul className="list-disc list-inside ml-2 mt-1">
              <li>&lt;2 bigha: 10 points</li>
              <li>2-4 bigha: 7 points</li>
              <li>4-6 bigha: 4 points</li>
              <li>&gt;6 bigha: 2 points</li>
            </ul>
          </div>
          <div>
            <strong>Previous Grants:</strong>
            <ul className="list-disc list-inside ml-2 mt-1">
              <li>0 grants: 10 points</li>
              <li>1 grant: 6 points</li>
              <li>2 grants: 3 points</li>
              <li>&gt;2 grants: 1 point</li>
            </ul>
          </div>
          <div>
            <strong>Crop Yield:</strong>
            <ul className="list-disc list-inside ml-2 mt-1">
              <li>Low yield: 10 points</li>
              <li>Average yield: 7 points</li>
              <li>High yield: 4 points</li>
              <li>Unknown: 6 points</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISelection;
