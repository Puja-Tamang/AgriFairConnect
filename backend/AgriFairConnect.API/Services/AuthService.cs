using AgriFairConnect.API.Models;
using AgriFairConnect.API.Services.Interfaces;
using AgriFairConnect.API.ViewModels.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace AgriFairConnect.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly IConfiguration _configuration;
        private readonly IFarmerService _farmerService;

        public AuthService(
            UserManager<AppUser> userManager,
            SignInManager<AppUser> signInManager,
            IConfiguration configuration,
            IFarmerService farmerService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _farmerService = farmerService;
        }

        public async Task<LoginResponse> LoginAsync(LoginRequest request)
        {
            try
            {
                var user = await _userManager.FindByNameAsync(request.Username);
                if (user == null)
                {
                    return new LoginResponse
                    {
                        Success = false,
                        Message = "Invalid username or password",
                        Errors = new List<string> { "Invalid credentials" }
                    };
                }

                // Check if user type matches
                if (request.UserType.ToLower() == "farmer" && user.UserType != UserType.Farmer)
                {
                    return new LoginResponse
                    {
                        Success = false,
                        Message = "Invalid user type for this account",
                        Errors = new List<string> { "User type mismatch" }
                    };
                }

                if (request.UserType.ToLower() == "admin" && user.UserType != UserType.Admin)
                {
                    return new LoginResponse
                    {
                        Success = false,
                        Message = "Invalid user type for this account",
                        Errors = new List<string> { "User type mismatch" }
                    };
                }

                var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);
                if (!result.Succeeded)
                {
                    return new LoginResponse
                    {
                        Success = false,
                        Message = "Invalid username or password",
                        Errors = new List<string> { "Invalid credentials" }
                    };
                }

                // Generate JWT token
                var token = GenerateJwtToken(user);
                var expiresAt = DateTime.UtcNow.AddHours(24); // Token expires in 24 hours

                // Get user info
                var userInfo = await GetUserInfoAsync(user);

                return new LoginResponse
                {
                    Success = true,
                    Message = "Login successful",
                    Token = token,
                    ExpiresAt = expiresAt,
                    User = userInfo
                };
            }
            catch (Exception ex)
            {
                return new LoginResponse
                {
                    Success = false,
                    Message = "An error occurred during login",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<FarmerSignupResponse> SignupFarmerAsync(FarmerSignupRequest request)
        {
            try
            {
                // Check if username already exists
                var existingUser = await _userManager.FindByNameAsync(request.Username);
                if (existingUser != null)
                {
                    return new FarmerSignupResponse
                    {
                        Success = false,
                        Message = "Username already exists",
                        Errors = new List<string> { "Username is already taken" }
                    };
                }

                // Check if email already exists
                var existingEmail = await _userManager.FindByEmailAsync(request.Email);
                if (existingEmail != null)
                {
                    return new FarmerSignupResponse
                    {
                        Success = false,
                        Message = "Email already exists",
                        Errors = new List<string> { "Email is already registered" }
                    };
                }

                // Create new user
                var user = new AppUser
                {
                    UserName = request.Username,
                    Email = request.Email,
                    PhoneNumber = request.PhoneNumber,
                    FullName = request.FullName,
                    Address = request.Address,
                    WardNumber = request.WardNumber,
                    Municipality = request.Municipality,
                    UserType = UserType.Farmer,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                };

                var result = await _userManager.CreateAsync(user, request.Password);
                if (!result.Succeeded)
                {
                    var errors = result.Errors.Select(e => e.Description).ToList();
                    return new FarmerSignupResponse
                    {
                        Success = false,
                        Message = "Failed to create user account",
                        Errors = errors
                    };
                }

                // Create farmer profile
                var farmerProfile = new FarmerProfile
                {
                    AppUserId = user.Id,
                    MonthlyIncome = request.MonthlyIncome,
                    LandSize = request.LandSize,
                    LandSizeUnit = "Bigha",
                    HasReceivedGrantBefore = request.HasReceivedGrantBefore
                };

                // TODO: Save farmer profile and crops to database
                // This would typically be done in a transaction

                return new FarmerSignupResponse
                {
                    Success = true,
                    Message = "Farmer account created successfully",
                    UserId = user.Id
                };
            }
            catch (Exception ex)
            {
                return new FarmerSignupResponse
                {
                    Success = false,
                    Message = "An error occurred during signup",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<bool> CheckUsernameExistsAsync(string username)
        {
            var user = await _userManager.FindByNameAsync(username);
            return user != null;
        }

        public Task<bool> ValidateTokenAsync(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT key not configured"));

                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = _configuration["Jwt:Issuer"],
                    ValidateAudience = true,
                    ValidAudience = _configuration["Jwt:Audience"],
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                return Task.FromResult(true);
            }
            catch
            {
                return Task.FromResult(false);
            }
        }

        public async Task<bool> LogoutAsync(string userId)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user != null)
                {
                    await _signInManager.SignOutAsync();
                    return true;
                }
                return false;
            }
            catch
            {
                return false;
            }
        }

        private string GenerateJwtToken(AppUser user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT key not configured"));

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id),
                    new Claim(ClaimTypes.Name, user.UserName ?? string.Empty),
                    new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
                    new Claim("UserType", user.UserType.ToString()),
                    new Claim("FullName", user.FullName)
                }),
                Expires = DateTime.UtcNow.AddHours(24),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private async Task<UserInfo> GetUserInfoAsync(AppUser user)
        {
            var userInfo = new UserInfo
            {
                Id = user.Id,
                Username = user.UserName ?? string.Empty,
                FullName = user.FullName,
                Email = user.Email ?? string.Empty,
                PhoneNumber = user.PhoneNumber ?? string.Empty,
                UserType = user.UserType.ToString(),
                WardNumber = user.WardNumber,
                Municipality = user.Municipality,
                Address = user.Address
            };

            // If user is a farmer, get additional profile information
            if (user.UserType == UserType.Farmer)
            {
                var farmerProfile = await _farmerService.GetFarmerProfileAsync(user.Id);
                if (farmerProfile != null)
                {
                    userInfo.FarmerProfile = new FarmerProfileInfo
                    {
                        MonthlyIncome = farmerProfile.MonthlyIncome,
                        LandSize = farmerProfile.LandSize,
                        LandSizeUnit = farmerProfile.LandSizeUnit,
                        HasReceivedGrantBefore = farmerProfile.HasReceivedGrantBefore,
                        Crops = farmerProfile.Crops.Select(c => c.Name).ToList()
                    };
                }
            }

            return userInfo;
        }
    }
}
