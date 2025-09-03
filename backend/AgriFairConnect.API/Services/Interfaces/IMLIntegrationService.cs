using AgriFairConnect.API.Models;

namespace AgriFairConnect.API.Services.Interfaces
{
    public interface IMLIntegrationService
    {
        Task<MLPredictionResult> GetPriorityScoreAsync(Application application);
        Task<FraudDetectionResult> GetFraudRiskAsync(Application application);
        Task<List<MLPredictionResult>> GetBatchPriorityScoresAsync(List<Application> applications);
        Task<List<FraudDetectionResult>> GetBatchFraudRisksAsync(List<Application> applications);
        Task<bool> UpdateApplicationWithAIScoreAsync(int applicationId, decimal aiScore);
    }

    public class MLPredictionResult
    {
        public int ApplicationId { get; set; }
        public string FarmerId { get; set; } = string.Empty;
        public string FarmerName { get; set; } = string.Empty;
        public double PriorityScore { get; set; }
        public double ApprovalProbability { get; set; }
        public string PredictedStatus { get; set; } = string.Empty;
        public double Confidence { get; set; }
        public string Recommendation { get; set; } = string.Empty;
        public List<string> Reasoning { get; set; } = new List<string>();
        public bool Success { get; set; }
        public string? ErrorMessage { get; set; }
    }

    public class FraudDetectionResult
    {
        public int ApplicationId { get; set; }
        public string FarmerId { get; set; } = string.Empty;
        public string FarmerName { get; set; } = string.Empty;
        public bool IsFraudulent { get; set; }
        public double AnomalyScore { get; set; }
        public string RiskLevel { get; set; } = string.Empty;
        public List<string> RiskFactors { get; set; } = new List<string>();
        public bool Success { get; set; }
        public string? ErrorMessage { get; set; }
    }
}
