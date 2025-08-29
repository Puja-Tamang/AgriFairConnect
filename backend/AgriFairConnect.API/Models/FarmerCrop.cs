using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgriFairConnect.API.Models
{
    public class FarmerCrop
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int FarmerProfileId { get; set; }

        [Required]
        public int CropId { get; set; }

        // Navigation properties
        [ForeignKey("FarmerProfileId")]
        public virtual FarmerProfile FarmerProfile { get; set; } = null!;
        
        [ForeignKey("CropId")]
        public virtual Crop Crop { get; set; } = null!;
    }
}
