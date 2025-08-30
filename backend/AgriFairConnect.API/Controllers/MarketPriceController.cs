using AgriFairConnect.API.Services.Interfaces;
using AgriFairConnect.API.ViewModels.MarketPrice;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AgriFairConnect.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MarketPriceController : ControllerBase
    {
        private readonly IMarketPriceService _marketPriceService;

        public MarketPriceController(IMarketPriceService marketPriceService)
        {
            _marketPriceService = marketPriceService;
        }

        /// <summary>
        /// Create a new market price (Admin only)
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<MarketPriceResponse>> CreateMarketPrice([FromBody] CreateMarketPriceRequest request)
        {
            try
            {
                var updatedBy = User.FindFirst(ClaimTypes.Name)?.Value ?? "admin";
                var marketPrice = await _marketPriceService.CreateMarketPriceAsync(request, updatedBy);
                return CreatedAtAction(nameof(GetMarketPriceById), new { id = marketPrice.Id }, marketPrice);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating the market price", error = ex.Message });
            }
        }

        /// <summary>
        /// Get a market price by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<MarketPriceResponse>> GetMarketPriceById(int id)
        {
            try
            {
                var marketPrice = await _marketPriceService.GetMarketPriceByIdAsync(id);
                if (marketPrice == null)
                    return NotFound(new { message = "Market price not found" });

                return Ok(marketPrice);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving the market price", error = ex.Message });
            }
        }

        /// <summary>
        /// Get all market prices (Admin only)
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<MarketPriceResponse>>> GetAllMarketPrices()
        {
            try
            {
                var marketPrices = await _marketPriceService.GetAllMarketPricesAsync();
                return Ok(marketPrices);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving market prices", error = ex.Message });
            }
        }

        /// <summary>
        /// Get active market prices (for farmers)
        /// </summary>
        [HttpGet("active")]
        public async Task<ActionResult<List<MarketPriceResponse>>> GetActiveMarketPrices()
        {
            try
            {
                var marketPrices = await _marketPriceService.GetActiveMarketPricesAsync();
                return Ok(marketPrices);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving active market prices", error = ex.Message });
            }
        }

        /// <summary>
        /// Get market prices by crop name
        /// </summary>
        [HttpGet("crop/{cropName}")]
        public async Task<ActionResult<List<MarketPriceResponse>>> GetMarketPricesByCrop(string cropName)
        {
            try
            {
                var marketPrices = await _marketPriceService.GetMarketPricesByCropAsync(cropName);
                return Ok(marketPrices);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving market prices by crop", error = ex.Message });
            }
        }

        /// <summary>
        /// Get market prices by location
        /// </summary>
        [HttpGet("location/{location}")]
        public async Task<ActionResult<List<MarketPriceResponse>>> GetMarketPricesByLocation(string location)
        {
            try
            {
                var marketPrices = await _marketPriceService.GetMarketPricesByLocationAsync(location);
                return Ok(marketPrices);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving market prices by location", error = ex.Message });
            }
        }

        /// <summary>
        /// Get filtered market prices (Admin only)
        /// </summary>
        [HttpPost("filter")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<MarketPriceResponse>>> GetFilteredMarketPrices([FromBody] MarketPriceFilterRequest filter)
        {
            try
            {
                var marketPrices = await _marketPriceService.GetFilteredMarketPricesAsync(filter);
                return Ok(marketPrices);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving filtered market prices", error = ex.Message });
            }
        }

        /// <summary>
        /// Update a market price (Admin only)
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<MarketPriceResponse>> UpdateMarketPrice(int id, [FromBody] UpdateMarketPriceRequest request)
        {
            try
            {
                var updatedBy = User.FindFirst(ClaimTypes.Name)?.Value ?? "admin";
                var marketPrice = await _marketPriceService.UpdateMarketPriceAsync(id, request, updatedBy);
                return Ok(marketPrice);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating the market price", error = ex.Message });
            }
        }

        /// <summary>
        /// Delete a market price (Admin only)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteMarketPrice(int id)
        {
            try
            {
                var success = await _marketPriceService.DeleteMarketPriceAsync(id);
                if (!success)
                    return NotFound(new { message = "Market price not found" });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting the market price", error = ex.Message });
            }
        }

        /// <summary>
        /// Activate a market price (Admin only)
        /// </summary>
        [HttpPost("{id}/activate")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> ActivateMarketPrice(int id)
        {
            try
            {
                var success = await _marketPriceService.ActivateMarketPriceAsync(id);
                if (!success)
                    return NotFound(new { message = "Market price not found" });

                return Ok(new { message = "Market price activated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while activating the market price", error = ex.Message });
            }
        }

        /// <summary>
        /// Deactivate a market price (Admin only)
        /// </summary>
        [HttpPost("{id}/deactivate")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeactivateMarketPrice(int id)
        {
            try
            {
                var success = await _marketPriceService.DeactivateMarketPriceAsync(id);
                if (!success)
                    return NotFound(new { message = "Market price not found" });

                return Ok(new { message = "Market price deactivated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deactivating the market price", error = ex.Message });
            }
        }

        /// <summary>
        /// Bulk update market prices (Admin only)
        /// </summary>
        [HttpPost("bulk-update")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> BulkUpdateMarketPrices([FromBody] BulkUpdateMarketPriceRequest request)
        {
            try
            {
                var updatedBy = User.FindFirst(ClaimTypes.Name)?.Value ?? "admin";
                var success = await _marketPriceService.BulkUpdateMarketPricesAsync(request, updatedBy);
                if (!success)
                    return BadRequest(new { message = "Failed to update market prices" });

                return Ok(new { message = "Market prices updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating market prices", error = ex.Message });
            }
        }

        /// <summary>
        /// Get distinct crop names
        /// </summary>
        [HttpGet("crops")]
        public async Task<ActionResult<List<string>>> GetDistinctCropNames()
        {
            try
            {
                var cropNames = await _marketPriceService.GetDistinctCropNamesAsync();
                return Ok(cropNames);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving crop names", error = ex.Message });
            }
        }

        /// <summary>
        /// Get distinct locations
        /// </summary>
        [HttpGet("locations")]
        public async Task<ActionResult<List<string>>> GetDistinctLocations()
        {
            try
            {
                var locations = await _marketPriceService.GetDistinctLocationsAsync();
                return Ok(locations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving locations", error = ex.Message });
            }
        }

        /// <summary>
        /// Get latest price by crop and location
        /// </summary>
        [HttpGet("latest")]
        public async Task<ActionResult<MarketPriceResponse>> GetLatestPriceByCropAndLocation([FromQuery] string cropName, [FromQuery] string location)
        {
            try
            {
                var marketPrice = await _marketPriceService.GetLatestPriceByCropAndLocationAsync(cropName, location);
                if (marketPrice == null)
                    return NotFound(new { message = "Market price not found for the specified crop and location" });

                return Ok(marketPrice);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving the latest market price", error = ex.Message });
            }
        }
    }
}
