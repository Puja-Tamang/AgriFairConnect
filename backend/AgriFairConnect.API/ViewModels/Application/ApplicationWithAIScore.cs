using AgriFairConnect.API.Models;
using AgriFairConnect.API.Services.Interfaces;

namespace AgriFairConnect.API.ViewModels.Application
{
    public class ApplicationWithAIScore
    {
        public int Id { get; set; }
        public int GrantId { get; set; }
        public string GrantTitle { get; set; } = string.Empty;
        public string FarmerId { get; set; } = string.Empty;
        public string FarmerName { get; set; } = string.Empty;
        public string FarmerPhone { get; set; } = string.Empty;
        public string FarmerEmail { get; set; } = string.Empty;
        public string FarmerAddress { get; set; } = string.Empty;
        public int FarmerWard { get; set; }
        public string FarmerMunicipality { get; set; } = string.Empty;
        public decimal MonthlyIncome { get; set; }
        public decimal LandSize { get; set; }
        public string LandSizeUnit { get; set; } = string.Empty;
        public bool HasReceivedGrantBefore { get; set; }
        public string? PreviousGrantDetails { get; set; }
        public string CropDetails { get; set; } = string.Empty;
        public string ExpectedBenefits { get; set; } = string.Empty;
        public string? AdditionalNotes { get; set; }
        public string? CitizenImageUrl { get; set; }
        public string? LandOwnershipUrl { get; set; }
        public string? LandTaxUrl { get; set; }
        public ApplicationStatus Status { get; set; }
        public string? AdminRemarks { get; set; }
        public decimal? AiScore { get; set; }
        public DateTime SubmittedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? UpdatedBy { get; set; }
        
        // AI/ML Results
        public MLPredictionResult? PriorityScore { get; set; }
        public FraudDetectionResult? FraudRisk { get; set; }
    }
}
