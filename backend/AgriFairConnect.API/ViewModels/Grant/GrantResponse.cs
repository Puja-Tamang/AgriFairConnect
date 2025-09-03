using AgriFairConnect.API.Models;

namespace AgriFairConnect.API.ViewModels.Grant
{
    public class GrantResponse
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
        public int ApplicationCount { get; set; }
    }

    public class GrantTargetAreaResponse
    {
        public int Id { get; set; }
        public int WardNumber { get; set; }
        public string Municipality { get; set; } = string.Empty;
    }
}
