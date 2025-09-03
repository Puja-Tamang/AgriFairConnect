using AgriFairConnect.API.Models;

namespace AgriFairConnect.API.ViewModels.Grant
{
    public class GrantManagementResponse
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public GrantType Type { get; set; }
        public decimal? Amount { get; set; }
        public string? ObjectName { get; set; }
        public string? GrantPhoto { get; set; }
        public DateTime? DeadlineAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; }
        public List<GrantTargetAreaResponse> TargetAreas { get; set; } = new List<GrantTargetAreaResponse>();
        
        // Application statistics
        public int TotalApplications { get; set; }
        public int PendingApplications { get; set; }
        public int ProcessingApplications { get; set; }
        public int ApprovedApplications { get; set; }
        public int RejectedApplications { get; set; }
        
        // Recent applications for quick overview
        public List<ApplicationSummaryResponse> RecentApplications { get; set; } = new List<ApplicationSummaryResponse>();
    }



    public class ApplicationSummaryResponse
    {
        public int Id { get; set; }
        public string FarmerName { get; set; } = string.Empty;
        public string FarmerUsername { get; set; } = string.Empty;
        public ApplicationStatus Status { get; set; }
        public decimal? AiScore { get; set; }
        public DateTime SubmittedAt { get; set; }
        public string? AdminRemarks { get; set; }
    }
}
