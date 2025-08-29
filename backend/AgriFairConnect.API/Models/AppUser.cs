using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace AgriFairConnect.API.Models
{
    public class AppUser : IdentityUser
    {
        [Required]
        [StringLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [StringLength(200)]
        public string Address { get; set; } = string.Empty;

        [Required]
        public int WardNumber { get; set; }

        [Required]
        [StringLength(100)]
        public string Municipality { get; set; } = string.Empty;

        [Required]
        public UserType UserType { get; set; }

        // Navigation properties
        public virtual FarmerProfile? FarmerProfile { get; set; }
        public virtual ICollection<Application> Applications { get; set; } = new List<Application>();
        public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();

        // Audit fields
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public enum UserType
    {
        Farmer,
        Admin
    }
}
