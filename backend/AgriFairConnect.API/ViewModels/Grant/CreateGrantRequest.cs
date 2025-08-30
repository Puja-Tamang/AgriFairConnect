using System.ComponentModel.DataAnnotations;
using AgriFairConnect.API.Models;

namespace AgriFairConnect.API.ViewModels.Grant
{
    public class CreateGrantRequest
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [StringLength(2000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        public GrantType Type { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Amount must be positive")]
        public decimal? Amount { get; set; }

        [StringLength(200)]
        public string? ObjectName { get; set; }

        [Required]
        public List<int> TargetWards { get; set; } = new List<int>();

        [Required]
        public List<string> TargetMunicipalities { get; set; } = new List<string>();
    }
}
