using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgriFairConnect.API.Models
{
    public class Grant
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [StringLength(2000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        public GrantType Type { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? Amount { get; set; }

        [StringLength(200)]
        public string? ObjectName { get; set; }

        public string? GrantPhoto { get; set; }

        public DateTime? DeadlineAt { get; set; }

        [Required]
        public string CreatedBy { get; set; } = string.Empty;

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public bool IsActive { get; set; } = true;

        // Navigation properties
        public virtual ICollection<GrantTargetArea> GrantTargetAreas { get; set; } = new List<GrantTargetArea>();
        public virtual ICollection<Application> Applications { get; set; } = new List<Application>();
    }

    public enum GrantType
    {
        Money,
        Object
    }
}
