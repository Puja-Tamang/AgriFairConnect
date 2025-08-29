using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgriFairConnect.API.Models
{
    public class FarmerDocument
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int FarmerProfileId { get; set; }

        [Required]
        public DocumentType DocumentType { get; set; }

        [Required]
        [StringLength(255)]
        public string FileName { get; set; } = string.Empty;

        [Required]
        [StringLength(500)]
        public string FilePath { get; set; } = string.Empty;

        [StringLength(100)]
        public string? ContentType { get; set; }

        public long FileSize { get; set; }

        [Required]
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        [ForeignKey("FarmerProfileId")]
        public virtual FarmerProfile FarmerProfile { get; set; } = null!;
    }

    public enum DocumentType
    {
        CitizenshipPhoto,
        LandOwnershipCertificate,
        LandTaxReceipt
    }
}
