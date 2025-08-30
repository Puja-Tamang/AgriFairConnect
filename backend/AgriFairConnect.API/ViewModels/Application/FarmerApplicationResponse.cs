using AgriFairConnect.API.Models;

namespace AgriFairConnect.API.ViewModels.Application
{
    public class FarmerApplicationResponse
    {
        public int Id { get; set; }
        public int GrantId { get; set; }
        public string GrantTitle { get; set; }
        public GrantType GrantType { get; set; }
        public decimal? GrantAmount { get; set; }
        public string GrantObjectName { get; set; }
        public ApplicationStatus Status { get; set; }
        public string FarmerName { get; set; }
        public string FarmerPhone { get; set; }
        public string FarmerEmail { get; set; }
        public string FarmerAddress { get; set; }
        public int FarmerWard { get; set; }
        public string FarmerMunicipality { get; set; }
        public decimal MonthlyIncome { get; set; }
        public decimal LandSize { get; set; }
        public string LandSizeUnit { get; set; }
        public bool HasReceivedGrantBefore { get; set; }
        public string? PreviousGrantDetails { get; set; }
        public string CropDetails { get; set; }
        public string ExpectedBenefits { get; set; }
        public string? AdditionalNotes { get; set; }
        public string? CitizenImageUrl { get; set; }
        public string? LandOwnershipUrl { get; set; }
        public string? LandTaxUrl { get; set; }
        public decimal? AiScore { get; set; }
        public string? AdminRemarks { get; set; }
        public string AppliedAt { get; set; }
        public string? UpdatedAt { get; set; }
    }
}
