using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using AgriFairConnect.API.Data;
using AgriFairConnect.API.Models;
using AgriFairConnect.API.Services.Interfaces;
using AgriFairConnect.API.ViewModels.Application;

namespace AgriFairConnect.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ApplicationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public ApplicationController(ApplicationDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }



        /// <summary>
        /// Get farmer's applications (Farmer only)
        /// </summary>
        [HttpGet("grant/farmer")]
        [Authorize(Roles = "Farmer")]
        public async Task<ActionResult<List<FarmerApplicationResponse>>> GetFarmerApplications()
        {
            try
            {
                var farmerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(farmerId))
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                var applications = await _context.Applications
                    .Include(a => a.Grant)
                    .Where(a => a.FarmerId == farmerId)
                    .OrderByDescending(a => a.SubmittedAt)
                    .Select(a => new FarmerApplicationResponse
                    {
                        Id = a.Id,
                        GrantId = a.GrantId,
                        GrantTitle = a.Grant.Title,
                        GrantType = a.Grant.Type,
                        GrantAmount = a.Grant.Amount,
                        GrantObjectName = a.Grant.ObjectName,
                        Status = a.Status,
                        FarmerName = a.FarmerName,
                        FarmerPhone = a.FarmerPhone,
                        FarmerEmail = a.FarmerEmail,
                        FarmerAddress = a.FarmerAddress,
                        FarmerWard = a.FarmerWard,
                        FarmerMunicipality = a.FarmerMunicipality,
                        MonthlyIncome = a.MonthlyIncome,
                        LandSize = a.LandSize,
                        LandSizeUnit = a.LandSizeUnit,
                        HasReceivedGrantBefore = a.HasReceivedGrantBefore,
                        PreviousGrantDetails = a.PreviousGrantDetails,
                        CropDetails = a.CropDetails,
                        ExpectedBenefits = a.ExpectedBenefits,
                        AdditionalNotes = a.AdditionalNotes,
                        CitizenImageUrl = a.CitizenImageUrl,
                        LandOwnershipUrl = a.LandOwnershipUrl,
                        LandTaxUrl = a.LandTaxUrl,
                        AiScore = a.AiScore,
                        AdminRemarks = a.AdminRemarks,
                        AppliedAt = a.SubmittedAt.ToString("yyyy-MM-dd HH:mm:ss"),
                        UpdatedAt = a.UpdatedAt.HasValue ? a.UpdatedAt.Value.ToString("yyyy-MM-dd HH:mm:ss") : null
                    })
                    .ToListAsync();

                return Ok(applications);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving applications", error = ex.Message });
            }
        }

        /// <summary>
        /// Get all applications (Admin only)
        /// </summary>
        [HttpGet("grant/all")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<FarmerApplicationResponse>>> GetAllApplications()
        {
            try
            {
                var applications = await _context.Applications
                    .Include(a => a.Grant)
                    .OrderByDescending(a => a.SubmittedAt)
                    .Select(a => new FarmerApplicationResponse
                    {
                        Id = a.Id,
                        GrantId = a.GrantId,
                        GrantTitle = a.Grant.Title,
                        GrantType = a.Grant.Type,
                        GrantAmount = a.Grant.Amount,
                        GrantObjectName = a.Grant.ObjectName,
                        Status = a.Status,
                        FarmerName = a.FarmerName,
                        FarmerPhone = a.FarmerPhone,
                        FarmerEmail = a.FarmerEmail,
                        FarmerAddress = a.FarmerAddress,
                        FarmerWard = a.FarmerWard,
                        FarmerMunicipality = a.FarmerMunicipality,
                        MonthlyIncome = a.MonthlyIncome,
                        LandSize = a.LandSize,
                        LandSizeUnit = a.LandSizeUnit,
                        HasReceivedGrantBefore = a.HasReceivedGrantBefore,
                        PreviousGrantDetails = a.PreviousGrantDetails,
                        CropDetails = a.CropDetails,
                        ExpectedBenefits = a.ExpectedBenefits,
                        AdditionalNotes = a.AdditionalNotes,
                        CitizenImageUrl = a.CitizenImageUrl,
                        LandOwnershipUrl = a.LandOwnershipUrl,
                        LandTaxUrl = a.LandTaxUrl,
                        AiScore = a.AiScore,
                        AdminRemarks = a.AdminRemarks,
                        AppliedAt = a.SubmittedAt.ToString("yyyy-MM-dd HH:mm:ss"),
                        UpdatedAt = a.UpdatedAt.HasValue ? a.UpdatedAt.Value.ToString("yyyy-MM-dd HH:mm:ss") : null
                    })
                    .ToListAsync();

                return Ok(applications);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving applications", error = ex.Message });
            }
        }
    }
}
