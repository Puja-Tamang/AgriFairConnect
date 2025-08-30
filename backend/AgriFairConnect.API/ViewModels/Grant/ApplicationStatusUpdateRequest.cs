using System.ComponentModel.DataAnnotations;
using AgriFairConnect.API.Models;

namespace AgriFairConnect.API.ViewModels.Grant
{
    public class ApplicationStatusUpdateRequest
    {
        [Required]
        public ApplicationStatus Status { get; set; }
        
        [StringLength(1000)]
        public string? AdminRemarks { get; set; }
    }

    public class BulkApplicationStatusUpdateRequest
    {
        [Required]
        public List<int> ApplicationIds { get; set; } = new List<int>();
        
        [Required]
        public ApplicationStatus Status { get; set; }
        
        [StringLength(1000)]
        public string? AdminRemarks { get; set; }
    }
}
