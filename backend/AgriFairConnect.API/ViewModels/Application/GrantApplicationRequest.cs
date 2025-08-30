using Microsoft.AspNetCore.Http;

namespace AgriFairConnect.API.ViewModels.Application
{
    public class GrantApplicationRequest
    {
        public int GrantId { get; set; }
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
        public IFormFile CitizenImage { get; set; }
        public IFormFile LandOwnership { get; set; }
        public IFormFile LandTax { get; set; }
    }
}
