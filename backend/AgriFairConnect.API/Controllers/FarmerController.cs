using AgriFairConnect.API.Services.Interfaces;
using AgriFairConnect.API.ViewModels.Farmer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgriFairConnect.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FarmerController : ControllerBase
    {
        private readonly IFarmerService _farmerService;

        public FarmerController(IFarmerService farmerService)
        {
            _farmerService = farmerService;
        }

        [HttpGet("profile")]
        public async Task<ActionResult<FarmerProfileResponse>> GetProfile()
        {
            var userId = User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("Invalid token");
            }

            var profile = await _farmerService.GetFarmerProfileAsync(userId);
            if (profile == null)
            {
                return NotFound("Farmer profile not found");
            }

            return Ok(profile);
        }

        [HttpGet("profile/{username}")]
        [AllowAnonymous]
        public async Task<ActionResult<FarmerProfileResponse>> GetProfileByUsername(string username)
        {
            if (string.IsNullOrWhiteSpace(username))
            {
                return BadRequest("Username cannot be empty");
            }

            var profile = await _farmerService.GetFarmerProfileByUsernameAsync(username);
            if (profile == null)
            {
                return NotFound("Farmer profile not found");
            }

            return Ok(profile);
        }

        [HttpPut("profile")]
        public async Task<ActionResult<bool>> UpdateProfile([FromBody] FarmerProfileResponse request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("Invalid token");
            }

            var result = await _farmerService.UpdateFarmerProfileAsync(userId, request);
            if (!result)
            {
                return BadRequest("Failed to update profile");
            }

            return Ok(result);
        }

        [HttpDelete("profile")]
        public async Task<ActionResult<bool>> DeleteProfile()
        {
            var userId = User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("Invalid token");
            }

            var result = await _farmerService.DeleteFarmerProfileAsync(userId);
            if (!result)
            {
                return BadRequest("Failed to delete profile");
            }

            return Ok(result);
        }

        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<FarmerProfileResponse>>> GetAllFarmers()
        {
            var farmers = await _farmerService.GetAllFarmersAsync();
            return Ok(farmers);
        }

        [HttpPost("upload-document")]
        public async Task<ActionResult<bool>> UploadDocument(IFormFile file, string documentType)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file provided");
            }

            if (file.Length > 5 * 1024 * 1024) // 5MB limit
            {
                return BadRequest("File size exceeds 5MB limit");
            }

            var userId = User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("Invalid token");
            }

            var result = await _farmerService.UploadDocumentAsync(userId, file, documentType);
            if (!result)
            {
                return BadRequest("Failed to upload document");
            }

            return Ok(result);
        }

        [HttpDelete("document/{documentId}")]
        public async Task<ActionResult<bool>> DeleteDocument(int documentId)
        {
            var userId = User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("Invalid token");
            }

            var result = await _farmerService.DeleteDocumentAsync(userId, documentId);
            if (!result)
            {
                return BadRequest("Failed to delete document");
            }

            return Ok(result);
        }
    }
}
