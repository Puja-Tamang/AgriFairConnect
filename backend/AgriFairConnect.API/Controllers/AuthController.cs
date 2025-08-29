using AgriFairConnect.API.Services.Interfaces;
using AgriFairConnect.API.ViewModels.Auth;
using Microsoft.AspNetCore.Mvc;

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
    }
}
