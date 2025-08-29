namespace AgriFairConnect.API.ViewModels.Auth
{
    public class LoginResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? Token { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public UserInfo? User { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
    }

    public class UserInfo
    {
        public string Id { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string UserType { get; set; } = string.Empty;
        public int? WardNumber { get; set; }
        public string? Municipality { get; set; }
        public string? Address { get; set; }
        public FarmerProfileInfo? FarmerProfile { get; set; }
    }

    public class FarmerProfileInfo
    {
        public decimal MonthlyIncome { get; set; }
        public decimal LandSize { get; set; }
        public string LandSizeUnit { get; set; } = string.Empty;
        public bool HasReceivedGrantBefore { get; set; }
        public List<string> Crops { get; set; } = new List<string>();
    }
}
