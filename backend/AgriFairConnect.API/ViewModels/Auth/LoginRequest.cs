using System.ComponentModel.DataAnnotations;

namespace AgriFairConnect.API.ViewModels.Auth
{
    public class LoginRequest
    {
        [Required(ErrorMessage = "Username is required")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required")]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "User type is required")]
        public string UserType { get; set; } = string.Empty; // "farmer" or "admin"
    }
}
