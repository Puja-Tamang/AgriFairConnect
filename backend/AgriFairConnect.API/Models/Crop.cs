using System.ComponentModel.DataAnnotations;

namespace AgriFairConnect.API.Models
{
    public class Crop
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string NameNepali { get; set; } = string.Empty;

        [StringLength(200)]
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ICollection<FarmerCrop> FarmerCrops { get; set; } = new List<FarmerCrop>();
    }
}
