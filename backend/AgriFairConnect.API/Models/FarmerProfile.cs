using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgriFairConnect.API.Models
{
    public class FarmerProfile
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string AppUserId { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal MonthlyIncome { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal LandSize { get; set; }

        [Required]
        [StringLength(20)]
        public string LandSizeUnit { get; set; } = "Bigha"; // Bigha, Hectare, etc.

        [Required]
        public bool HasReceivedGrantBefore { get; set; }

        // Navigation properties
        [ForeignKey("AppUserId")]
        public virtual AppUser AppUser { get; set; } = null!;
        
        public virtual ICollection<FarmerCrop> FarmerCrops { get; set; } = new List<FarmerCrop>();
        public virtual ICollection<FarmerDocument> FarmerDocuments { get; set; } = new List<FarmerDocument>();
    }
}
