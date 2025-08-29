using AgriFairConnect.API.Models;
using AgriFairConnect.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgriFairConnect.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CropController : ControllerBase
    {
        private readonly ICropService _cropService;

        public CropController(ICropService cropService)
        {
            _cropService = cropService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<List<Crop>>> GetAllCrops()
        {
            var crops = await _cropService.GetAllCropsAsync();
            return Ok(crops);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<Crop>> GetCropById(int id)
        {
            var crop = await _cropService.GetCropByIdAsync(id);
            if (crop == null)
            {
                return NotFound("Crop not found");
            }

            return Ok(crop);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Crop>> CreateCrop([FromBody] Crop crop)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var createdCrop = await _cropService.CreateCropAsync(crop);
                return CreatedAtAction(nameof(GetCropById), new { id = createdCrop.Id }, createdCrop);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<bool>> UpdateCrop(int id, [FromBody] Crop crop)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != crop.Id)
            {
                return BadRequest("ID mismatch");
            }

            var result = await _cropService.UpdateCropAsync(crop);
            if (!result)
            {
                return NotFound("Crop not found");
            }

            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<bool>> DeleteCrop(int id)
        {
            var result = await _cropService.DeleteCropAsync(id);
            if (!result)
            {
                return BadRequest("Cannot delete crop. It may be in use by farmers.");
            }

            return Ok(result);
        }

        [HttpPost("{id}/activate")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<bool>> ActivateCrop(int id)
        {
            var result = await _cropService.ActivateCropAsync(id);
            if (!result)
            {
                return NotFound("Crop not found");
            }

            return Ok(result);
        }

        [HttpPost("{id}/deactivate")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<bool>> DeactivateCrop(int id)
        {
            var result = await _cropService.DeactivateCropAsync(id);
            if (!result)
            {
                return NotFound("Crop not found");
            }

            return Ok(result);
        }
    }
}
