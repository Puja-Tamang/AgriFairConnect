using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgriFairConnect.API.Models
{
    public class Application
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string FarmerId { get; set; } = string.Empty;

        [Required]
        public int GrantId { get; set; }

        [Required]
        public ApplicationStatus Status { get; set; } = ApplicationStatus.Pending;

        [Column(TypeName = "decimal(5,2)")]
        public decimal? AiScore { get; set; }

        [StringLength(1000)]
        public string? AdminRemarks { get; set; }

        [Required]
        public DateTime AppliedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        [ForeignKey("FarmerId")]
        public virtual AppUser Farmer { get; set; } = null!;

        [ForeignKey("GrantId")]
        public virtual Grant Grant { get; set; } = null!;

        public virtual ICollection<ApplicationDocument> ApplicationDocuments { get; set; } = new List<ApplicationDocument>();
    }

    public enum ApplicationStatus
    {
        Pending,
        Processing,
        Approved,
        Rejected
    }
}
