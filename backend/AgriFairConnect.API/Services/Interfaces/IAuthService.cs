using AgriFairConnect.API.ViewModels.Auth;

namespace AgriFairConnect.API.Services.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponse> LoginAsync(LoginRequest request);
        Task<FarmerSignupResponse> SignupFarmerAsync(FarmerSignupRequest request);
        Task<bool> CheckUsernameExistsAsync(string username);
        Task<bool> ValidateTokenAsync(string token);
        Task<bool> LogoutAsync(string userId);

    }
}
