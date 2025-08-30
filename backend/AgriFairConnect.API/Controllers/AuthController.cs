using AgriFairConnect.API.Services.Interfaces;
using AgriFairConnect.API.ViewModels.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using AgriFairConnect.API.Models;

namespace AgriFairConnect.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(new LoginResponse
                {
                    Success = false,
                    Message = "Validation failed",
                    Errors = errors
                });
            }

            var response = await _authService.LoginAsync(request);
            
            if (response.Success)
            {
                return Ok(response);
            }

            return Unauthorized(response);
        }

        [HttpPost("signup")]
        public async Task<ActionResult<FarmerSignupResponse>> Signup([FromBody] FarmerSignupRequest request)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(new FarmerSignupResponse
                {
                    Success = false,
                    Message = "Validation failed",
                    Errors = errors
                });
            }

            var response = await _authService.SignupFarmerAsync(request);
            
            if (response.Success)
            {
                return CreatedAtAction(nameof(Signup), response);
            }

            return BadRequest(response);
        }

        [HttpGet("check-username/{username}")]
        public async Task<ActionResult<bool>> CheckUsernameExists(string username)
        {
            if (string.IsNullOrWhiteSpace(username))
            {
                return BadRequest("Username cannot be empty");
            }

            var exists = await _authService.CheckUsernameExistsAsync(username);
            return Ok(exists);
        }

        [HttpPost("logout")]
        public async Task<ActionResult<bool>> Logout()
        {
            // Get user ID from JWT token
            var userId = User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("Invalid token");
            }

            var result = await _authService.LogoutAsync(userId);
            return Ok(result);
        }

        [HttpPost("validate-token")]
        public async Task<ActionResult<bool>> ValidateToken([FromBody] string token)
        {
            if (string.IsNullOrWhiteSpace(token))
            {
                return BadRequest("Token cannot be empty");
            }

            var isValid = await _authService.ValidateTokenAsync(token);
            return Ok(isValid);
        }

        /// <summary>
        /// Debug endpoint to check admin user roles (temporary)
        /// </summary>
        [HttpGet("debug-admin")]
        public async Task<ActionResult> DebugAdmin()
        {
            var userManager = HttpContext.RequestServices.GetRequiredService<UserManager<AppUser>>();
            var adminUser = await userManager.FindByNameAsync("admin");
            
            if (adminUser == null)
            {
                return Ok(new { message = "Admin user not found" });
            }

            var roles = await userManager.GetRolesAsync(adminUser);
            return Ok(new { 
                userId = adminUser.Id,
                username = adminUser.UserName,
                userType = adminUser.UserType.ToString(),
                roles = roles,
                hasAdminRole = roles.Contains("Admin")
            });
        }

        /// <summary>
        /// Debug endpoint to check JWT token (temporary)
        /// </summary>
        [HttpGet("debug-token")]
        public async Task<ActionResult> DebugToken()
        {
            var authHeader = Request.Headers["Authorization"].FirstOrDefault();
            var token = authHeader?.Replace("Bearer ", "");
            
            if (string.IsNullOrEmpty(token))
            {
                return Ok(new { message = "No token provided" });
            }

            try
            {
                var tokenHandler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
                var jwtToken = tokenHandler.ReadJwtToken(token);
                
                return Ok(new { 
                    tokenExists = !string.IsNullOrEmpty(token),
                    tokenLength = token.Length,
                    claims = jwtToken.Claims.Select(c => new { type = c.Type, value = c.Value }).ToList(),
                    roles = jwtToken.Claims.Where(c => c.Type == "role").Select(c => c.Value).ToList(),
                    expires = jwtToken.ValidTo
                });
            }
            catch (Exception ex)
            {
                return Ok(new { 
                    message = "Token parsing failed",
                    error = ex.Message
                });
            }
        }


    }
}
