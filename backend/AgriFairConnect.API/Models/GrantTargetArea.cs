using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgriFairConnect.API.Models
{
    public class GrantTargetArea
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int GrantId { get; set; }

        [Required]
        public int WardNumber { get; set; }

        [Required]
        [StringLength(100)]
        public string Municipality { get; set; } = string.Empty;

        // Navigation property
        [ForeignKey("GrantId")]
        public virtual Grant Grant { get; set; } = null!;
    }
}
