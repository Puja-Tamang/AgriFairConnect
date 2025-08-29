using System.ComponentModel.DataAnnotations;

namespace AgriFairConnect.API.ViewModels.Auth
{
    public class FarmerSignupRequest
    {
        [Required(ErrorMessage = "Username is required")]
        [StringLength(50, MinimumLength = 3, ErrorMessage = "Username must be between 3 and 50 characters")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be at least 6 characters")]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "Full name is required")]
        [StringLength(100, ErrorMessage = "Full name cannot exceed 100 characters")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Address is required")]
        [StringLength(200, ErrorMessage = "Address cannot exceed 200 characters")]
        public string Address { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        [StringLength(100, ErrorMessage = "Email cannot exceed 100 characters")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Phone number is required")]
        [Phone(ErrorMessage = "Invalid phone number format")]
        [StringLength(15, ErrorMessage = "Phone number cannot exceed 15 characters")]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required(ErrorMessage = "Ward number is required")]
        [Range(1, 100, ErrorMessage = "Ward number must be between 1 and 100")]
        public int WardNumber { get; set; }

        [Required(ErrorMessage = "Municipality is required")]
        [StringLength(100, ErrorMessage = "Municipality cannot exceed 100 characters")]
        public string Municipality { get; set; } = string.Empty;

        [Required(ErrorMessage = "Monthly income is required")]
        [Range(0, double.MaxValue, ErrorMessage = "Monthly income must be positive")]
        public decimal MonthlyIncome { get; set; }

        [Required(ErrorMessage = "Land size is required")]
        [Range(0, double.MaxValue, ErrorMessage = "Land size must be positive")]
        public decimal LandSize { get; set; }

        [Required(ErrorMessage = "At least one crop must be selected")]
        public List<int> CropIds { get; set; } = new List<int>();

        [Required(ErrorMessage = "Previous grant information is required")]
        public bool HasReceivedGrantBefore { get; set; }
    }
}
