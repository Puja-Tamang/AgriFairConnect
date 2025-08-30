using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgriFairConnect.API.Models
{
    public class Application
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int GrantId { get; set; }

        [ForeignKey("GrantId")]
        public virtual Grant Grant { get; set; }

        [Required]
        public string FarmerId { get; set; }

        [ForeignKey("FarmerId")]
        public virtual AppUser Farmer { get; set; }

        [Required]
        [MaxLength(100)]
        public string FarmerName { get; set; }

        [Required]
        [MaxLength(20)]
        public string FarmerPhone { get; set; }

        [MaxLength(100)]
        public string FarmerEmail { get; set; }

        [Required]
        [MaxLength(200)]
        public string FarmerAddress { get; set; }

        [Required]
        public int FarmerWard { get; set; }

        [Required]
        [MaxLength(100)]
        public string FarmerMunicipality { get; set; }

        [Required]
        public decimal MonthlyIncome { get; set; }

        [Required]
        public decimal LandSize { get; set; }

        [Required]
        [MaxLength(20)]
        public string LandSizeUnit { get; set; }

        [Required]
        public bool HasReceivedGrantBefore { get; set; }

        [MaxLength(500)]
        public string? PreviousGrantDetails { get; set; }

        [Required]
        [MaxLength(500)]
        public string CropDetails { get; set; }

        [Required]
        [MaxLength(500)]
        public string ExpectedBenefits { get; set; }

        [MaxLength(1000)]
        public string? AdditionalNotes { get; set; }

        // Document URLs
        [MaxLength(500)]
        public string? CitizenImageUrl { get; set; }

        [MaxLength(500)]
        public string? LandOwnershipUrl { get; set; }

        [MaxLength(500)]
        public string? LandTaxUrl { get; set; }

        [Required]
        public ApplicationStatus Status { get; set; } = ApplicationStatus.Pending;

        [MaxLength(500)]
        public string? AdminRemarks { get; set; }

        public decimal? AiScore { get; set; }

        [Required]
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        [MaxLength(100)]
        public string? UpdatedBy { get; set; }
    }

    public enum ApplicationStatus
    {
        Pending = 0,
        Processing = 1,
        Approved = 2,
        Rejected = 3
    }
}
