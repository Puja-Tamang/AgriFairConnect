using AgriFairConnect.API.Services.Interfaces;
using AgriFairConnect.API.ViewModels.Grant;
using AgriFairConnect.API.ViewModels.Application;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using AgriFairConnect.API.Data;
using AgriFairConnect.API.Models;

namespace AgriFairConnect.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GrantController : ControllerBase
    {
        private readonly IGrantService _grantService;
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public GrantController(IGrantService grantService, ApplicationDbContext context, IWebHostEnvironment environment)
        {
            _grantService = grantService;
            _context = context;
            _environment = environment;
        }

        /// <summary>
        /// Create a new grant (Admin only)
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<GrantResponse>> CreateGrant([FromBody] CreateGrantRequest request)
        {
            try
            {
                // Debug logging
                Console.WriteLine($"CreateGrant called by user: {User.Identity?.Name}");
                Console.WriteLine($"User claims: {string.Join(", ", User.Claims.Select(c => $"{c.Type}: {c.Value}"))}");
                Console.WriteLine($"User roles: {string.Join(", ", User.Claims.Where(c => c.Type == ClaimTypes.Role).Select(c => c.Value))}");
                
                var createdBy = User.FindFirst(ClaimTypes.Name)?.Value ?? "admin";
                var grant = await _grantService.CreateGrantAsync(request, createdBy);
                return CreatedAtAction(nameof(GetGrantById), new { id = grant.Id }, grant);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Microsoft.EntityFrameworkCore.DbUpdateException ex)
            {
                var inner = ex.InnerException?.Message ?? ex.Message;
                return StatusCode(500, new { message = "Database update failed while creating the grant", error = inner });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating the grant", error = ex.Message });
            }
        }

        /// <summary>
        /// Get all applications for admin dashboard
        /// </summary>
        [HttpGet("applications")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<FarmerApplicationResponse>>> GetAllApplications()
        {
            try
            {
                var applications = await _grantService.GetAllApplicationsAsync();
                return Ok(applications);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving applications", error = ex.Message });
            }
        }

        /// <summary>
        /// Get a grant by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<GrantResponse>> GetGrantById(int id)
        {
            try
            {
                var grant = await _grantService.GetGrantByIdAsync(id);
                if (grant == null)
                    return NotFound(new { message = "Grant not found" });

                return Ok(grant);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving the grant", error = ex.Message });
            }
        }

        /// <summary>
        /// Get all grants (Admin only)
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<GrantResponse>>> GetAllGrants()
        {
            try
            {
                // Debug logging
                Console.WriteLine($"GetAllGrants called by user: {User.Identity?.Name}");
                Console.WriteLine($"User claims: {string.Join(", ", User.Claims.Select(c => $"{c.Type}: {c.Value}"))}");
                Console.WriteLine($"User roles: {string.Join(", ", User.Claims.Where(c => c.Type == ClaimTypes.Role).Select(c => c.Value))}");
                
                var grants = await _grantService.GetAllGrantsAsync();
                return Ok(grants);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving grants", error = ex.Message });
            }
        }

        /// <summary>
        /// Get active grants (for farmers)
        /// </summary>
        [HttpGet("active")]
        public async Task<ActionResult<List<GrantResponse>>> GetActiveGrants()
        {
            try
            {
                Console.WriteLine("GetActiveGrants called - fetching grants from service...");
                var grants = await _grantService.GetActiveGrantsAsync();
                Console.WriteLine($"GetActiveGrants - Found {grants.Count} grants");
                foreach (var grant in grants)
                {
                    Console.WriteLine($"Grant: {grant.Id} - {grant.Title} - Active: {grant.IsActive}");
                }
                return Ok(grants);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving active grants", error = ex.Message });
            }
        }

        /// <summary>
        /// Get grants by municipality
        /// </summary>
        [HttpGet("municipality/{municipality}")]
        public async Task<ActionResult<List<GrantResponse>>> GetGrantsByMunicipality(string municipality)
        {
            try
            {
                var grants = await _grantService.GetGrantsByMunicipalityAsync(municipality);
                return Ok(grants);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving grants by municipality", error = ex.Message });
            }
        }

        /// <summary>
        /// Update a grant (Admin only)
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<GrantResponse>> UpdateGrant(int id, [FromBody] CreateGrantRequest request)
        {
            try
            {
                var grant = await _grantService.UpdateGrantAsync(id, request);
                return Ok(grant);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating the grant", error = ex.Message });
            }
        }

        /// <summary>
        /// Delete a grant (Admin only)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteGrant(int id)
        {
            try
            {
                var success = await _grantService.DeleteGrantAsync(id);
                if (!success)
                    return NotFound(new { message = "Grant not found" });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting the grant", error = ex.Message });
            }
        }

        /// <summary>
        /// Activate a grant (Admin only)
        /// </summary>
        [HttpPost("{id}/activate")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> ActivateGrant(int id)
        {
            try
            {
                var success = await _grantService.ActivateGrantAsync(id);
                if (!success)
                    return NotFound(new { message = "Grant not found" });

                return Ok(new { message = "Grant activated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while activating the grant", error = ex.Message });
            }
        }

        /// <summary>
        /// Deactivate a grant (Admin only)
        /// </summary>
        [HttpPost("{id}/deactivate")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeactivateGrant(int id)
        {
            try
            {
                var success = await _grantService.DeactivateGrantAsync(id);
                if (!success)
                    return NotFound(new { message = "Grant not found" });

                return Ok(new { message = "Grant deactivated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deactivating the grant", error = ex.Message });
            }
        }

        /// <summary>
        /// Debug endpoint to check authentication (temporary)
        /// </summary>
        [HttpGet("debug-auth")]
        public async Task<ActionResult> DebugAuth()
        {
            return Ok(new { 
                isAuthenticated = User.Identity?.IsAuthenticated,
                userName = User.Identity?.Name,
                claims = User.Claims.Select(c => new { type = c.Type, value = c.Value }).ToList(),
                roles = User.Claims.Where(c => c.Type == ClaimTypes.Role).Select(c => c.Value).ToList()
            });
        }

        // Grant Management Endpoints
        /// <summary>
        /// Get all grants for management (Admin only)
        /// </summary>
        [HttpGet("management")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<GrantManagementResponse>>> GetAllGrantsForManagement()
        {
            try
            {
                var grants = await _grantService.GetAllGrantsForManagementAsync();
                return Ok(grants);
            }
            catch (Exception ex)
            {
                // Fallback: return empty list so UI shows no items instead of error
                Console.WriteLine($"GetAllGrantsForManagement error: {ex.Message}");
                return Ok(new List<GrantManagementResponse>());
            }
        }

        /// <summary>
        /// Get grant management data by ID (Admin only)
        /// </summary>
        [HttpGet("management/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<GrantManagementResponse>> GetGrantManagementData(int id)
        {
            try
            {
                var grant = await _grantService.GetGrantManagementDataAsync(id);
                if (grant == null)
                    return NotFound(new { message = "Grant not found" });

                return Ok(grant);
            }
            catch (Exception ex)
            {
                // Fallback: return empty placeholder so UI can handle gracefully
                Console.WriteLine($"GetGrantManagementData error: {ex.Message}");
                return Ok(new GrantManagementResponse
                {
                    Id = id,
                    Title = string.Empty,
                    Description = string.Empty,
                    Type = Models.GrantType.Money,
                    Amount = null,
                    ObjectName = null,
                    GrantPhoto = null,
                    DeadlineAt = null,
                    CreatedBy = string.Empty,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = null,
                    IsActive = false,
                    TargetAreas = new List<GrantTargetAreaResponse>(),
                    TotalApplications = 0,
                    PendingApplications = 0,
                    ProcessingApplications = 0,
                    ApprovedApplications = 0,
                    RejectedApplications = 0,
                    RecentApplications = new List<ApplicationSummaryResponse>()
                });
            }
        }

        /// <summary>
        /// Get applications by grant ID (Admin only)
        /// </summary>
        [HttpGet("management/{id}/applications")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<ApplicationSummaryResponse>>> GetApplicationsByGrant(int id, [FromQuery] Models.ApplicationStatus? status = null)
        {
            try
            {
                var applications = await _grantService.GetApplicationsByGrantAsync(id, status);
                return Ok(applications);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving applications", error = ex.Message });
            }
        }

        /// <summary>
        /// Update application status (Admin only)
        /// </summary>
        [HttpPut("management/applications/{applicationId}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> UpdateApplicationStatus(int applicationId, [FromBody] ApplicationStatusUpdateRequest request)
        {
            try
            {
                var success = await _grantService.UpdateApplicationStatusAsync(applicationId, request.Status, request.AdminRemarks);
                if (!success)
                    return NotFound(new { message = "Application not found" });

                return Ok(new { message = "Application status updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating application status", error = ex.Message });
            }
        }

        /// <summary>
        /// Mark application as processing when admin views it (Admin only)
        /// </summary>
        [HttpPost("applications/{id}/view")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> MarkApplicationAsViewed(int id)
        {
            try
            {
                var application = await _context.Applications.FindAsync(id);
                if (application == null)
                {
                    return NotFound(new { message = "Application not found" });
                }

                // If status is Pending, change to Processing
                if (application.Status == ApplicationStatus.Pending)
                {
                    application.Status = ApplicationStatus.Processing;
                    application.UpdatedAt = DateTime.UtcNow;
                    application.UpdatedBy = User.FindFirst(ClaimTypes.Name)?.Value ?? "admin";
                    await _context.SaveChangesAsync();
                }

                return Ok(new { message = "Application marked as viewed" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating application", error = ex.Message });
            }
        }

        /// <summary>
        /// Get applications for the current farmer
        /// </summary>
        [HttpGet("farmer")]
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
        /// Get a single application owned by the current farmer
        /// </summary>
        [HttpGet("farmer/applications/{id}")]
        [Authorize(Roles = "Farmer")]
        public async Task<ActionResult<FarmerApplicationResponse>> GetMyApplicationById(int id)
        {
            try
            {
                var farmerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(farmerId))
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                var application = await _context.Applications
                    .Include(a => a.Grant)
                    .FirstOrDefaultAsync(a => a.Id == id && a.FarmerId == farmerId);

                if (application == null)
                {
                    return NotFound(new { message = "Application not found" });
                }

                var response = new FarmerApplicationResponse
                {
                    Id = application.Id,
                    GrantId = application.GrantId,
                    GrantTitle = application.Grant.Title,
                    GrantType = application.Grant.Type,
                    GrantAmount = application.Grant.Amount,
                    GrantObjectName = application.Grant.ObjectName,
                    Status = application.Status,
                    FarmerName = application.FarmerName,
                    FarmerPhone = application.FarmerPhone,
                    FarmerEmail = application.FarmerEmail,
                    FarmerAddress = application.FarmerAddress,
                    FarmerWard = application.FarmerWard,
                    FarmerMunicipality = application.FarmerMunicipality,
                    MonthlyIncome = application.MonthlyIncome,
                    LandSize = application.LandSize,
                    LandSizeUnit = application.LandSizeUnit,
                    HasReceivedGrantBefore = application.HasReceivedGrantBefore,
                    PreviousGrantDetails = application.PreviousGrantDetails,
                    CropDetails = application.CropDetails,
                    ExpectedBenefits = application.ExpectedBenefits,
                    AdditionalNotes = application.AdditionalNotes,
                    CitizenImageUrl = application.CitizenImageUrl,
                    LandOwnershipUrl = application.LandOwnershipUrl,
                    LandTaxUrl = application.LandTaxUrl,
                    AiScore = application.AiScore,
                    AdminRemarks = application.AdminRemarks,
                    AppliedAt = application.SubmittedAt.ToString("yyyy-MM-dd HH:mm:ss"),
                    UpdatedAt = application.UpdatedAt.HasValue ? application.UpdatedAt.Value.ToString("yyyy-MM-dd HH:mm:ss") : null
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving the application", error = ex.Message });
            }
        }

        /// <summary>
        /// Get a single application by ID (Admin only)
        /// </summary>
        [HttpGet("applications/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<FarmerApplicationResponse>> GetApplicationById(int id)
        {
            try
            {
                var application = await _context.Applications
                    .Include(a => a.Grant)
                    .FirstOrDefaultAsync(a => a.Id == id);

                if (application == null)
                {
                    return NotFound(new { message = "Application not found" });
                }

                var response = new FarmerApplicationResponse
                {
                    Id = application.Id,
                    GrantId = application.GrantId,
                    GrantTitle = application.Grant.Title,
                    GrantType = application.Grant.Type,
                    GrantAmount = application.Grant.Amount,
                    GrantObjectName = application.Grant.ObjectName,
                    Status = application.Status,
                    FarmerName = application.FarmerName,
                    FarmerPhone = application.FarmerPhone,
                    FarmerEmail = application.FarmerEmail,
                    FarmerAddress = application.FarmerAddress,
                    FarmerWard = application.FarmerWard,
                    FarmerMunicipality = application.FarmerMunicipality,
                    MonthlyIncome = application.MonthlyIncome,
                    LandSize = application.LandSize,
                    LandSizeUnit = application.LandSizeUnit,
                    HasReceivedGrantBefore = application.HasReceivedGrantBefore,
                    PreviousGrantDetails = application.PreviousGrantDetails,
                    CropDetails = application.CropDetails,
                    ExpectedBenefits = application.ExpectedBenefits,
                    AdditionalNotes = application.AdditionalNotes,
                    CitizenImageUrl = application.CitizenImageUrl,
                    LandOwnershipUrl = application.LandOwnershipUrl,
                    LandTaxUrl = application.LandTaxUrl,
                    AiScore = application.AiScore,
                    AdminRemarks = application.AdminRemarks,
                    AppliedAt = application.SubmittedAt.ToString("yyyy-MM-dd HH:mm:ss"),
                    UpdatedAt = application.UpdatedAt.HasValue ? application.UpdatedAt.Value.ToString("yyyy-MM-dd HH:mm:ss") : null
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving the application", error = ex.Message });
            }
        }

        /// <summary>
        /// Bulk update application status (Admin only)
        /// </summary>
        [HttpPut("management/applications/bulk-status")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> BulkUpdateApplicationStatus([FromBody] BulkApplicationStatusUpdateRequest request)
        {
            try
            {
                var success = await _grantService.BulkUpdateApplicationStatusAsync(request.ApplicationIds, request.Status, request.AdminRemarks);
                if (!success)
                    return BadRequest(new { message = "No applications found or updated" });

                return Ok(new { message = "Application statuses updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating application statuses", error = ex.Message });
            }
        }

        /// <summary>
        /// Submit a grant application (Farmer only)
        /// </summary>
        [HttpPost("application")]
        [Authorize(Roles = "Farmer")]
        public async Task<ActionResult> SubmitGrantApplication([FromForm] GrantApplicationRequest request)
        {
            try
            {
                var farmerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(farmerId))
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                // Validate grant exists and is active
                var grant = await _context.Grants
                    .Include(g => g.GrantTargetAreas)
                    .FirstOrDefaultAsync(g => g.Id == request.GrantId && g.IsActive);

                if (grant == null)
                {
                    return BadRequest(new { message = "Grant not found or not active" });
                }

                // Check if farmer is eligible for this grant
                var farmer = await _context.Users.FindAsync(farmerId);
                if (farmer == null)
                {
                    return BadRequest(new { message = "Farmer not found" });
                }

                var isEligible = grant.GrantTargetAreas.Any(area => 
                    area.WardNumber == farmer.WardNumber && 
                    area.Municipality == farmer.Municipality);

                if (!isEligible)
                {
                    return BadRequest(new { message = "You are not eligible for this grant" });
                }

                // Check if farmer has already applied for this grant
                var existingApplication = await _context.Applications
                    .FirstOrDefaultAsync(a => a.GrantId == request.GrantId && a.FarmerId == farmerId);

                if (existingApplication != null)
                {
                    return BadRequest(new { message = "You have already applied for this grant" });
                }

                // Handle file uploads
                var uploadsPath = Path.Combine(_environment.ContentRootPath, "wwwroot", "uploads", "applications");
                Directory.CreateDirectory(uploadsPath);

                var application = new Application
                {
                    GrantId = request.GrantId,
                    FarmerId = farmerId,
                    FarmerName = request.FarmerName,
                    FarmerPhone = request.FarmerPhone,
                    FarmerEmail = request.FarmerEmail,
                    FarmerAddress = request.FarmerAddress,
                    FarmerWard = request.FarmerWard,
                    FarmerMunicipality = request.FarmerMunicipality,
                    MonthlyIncome = request.MonthlyIncome,
                    LandSize = request.LandSize,
                    LandSizeUnit = request.LandSizeUnit,
                    HasReceivedGrantBefore = request.HasReceivedGrantBefore,
                    PreviousGrantDetails = request.PreviousGrantDetails,
                    CropDetails = request.CropDetails,
                    ExpectedBenefits = request.ExpectedBenefits,
                    AdditionalNotes = request.AdditionalNotes,
                    Status = ApplicationStatus.Pending,
                    SubmittedAt = DateTime.UtcNow
                };

                // Save files and update URLs
                if (request.CitizenImage != null)
                {
                    var citizenFileName = $"citizen_{farmerId}_{DateTime.UtcNow.Ticks}.jpg";
                    var citizenPath = Path.Combine(uploadsPath, citizenFileName);
                    using (var stream = new FileStream(citizenPath, FileMode.Create))
                    {
                        await request.CitizenImage.CopyToAsync(stream);
                    }
                    application.CitizenImageUrl = $"/uploads/applications/{citizenFileName}";
                }

                if (request.LandOwnership != null)
                {
                    var landFileName = $"land_{farmerId}_{DateTime.UtcNow.Ticks}{Path.GetExtension(request.LandOwnership.FileName)}";
                    var landPath = Path.Combine(uploadsPath, landFileName);
                    using (var stream = new FileStream(landPath, FileMode.Create))
                    {
                        await request.LandOwnership.CopyToAsync(stream);
                    }
                    application.LandOwnershipUrl = $"/uploads/applications/{landFileName}";
                }

                if (request.LandTax != null)
                {
                    var taxFileName = $"tax_{farmerId}_{DateTime.UtcNow.Ticks}{Path.GetExtension(request.LandTax.FileName)}";
                    var taxPath = Path.Combine(uploadsPath, taxFileName);
                    using (var stream = new FileStream(taxPath, FileMode.Create))
                    {
                        await request.LandTax.CopyToAsync(stream);
                    }
                    application.LandTaxUrl = $"/uploads/applications/{taxFileName}";
                }

                _context.Applications.Add(application);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Application submitted successfully", applicationId = application.Id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while submitting the application", error = ex.Message });
            }
        }

        /// <summary>
        /// Update an existing application (Farmer only) - only when status is Pending
        /// </summary>
        [HttpPut("application/{id}")]
        [Authorize(Roles = "Farmer")]
        public async Task<ActionResult> UpdateGrantApplication(int id, [FromForm] UpdateGrantApplicationRequest request)
        {
            try
            {
                var farmerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(farmerId))
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                var application = await _context.Applications.FindAsync(id);
                if (application == null)
                {
                    return NotFound(new { message = "Application not found" });
                }

                // Ownership and status checks
                if (application.FarmerId != farmerId)
                {
                    return Forbid();
                }
                if (application.Status != ApplicationStatus.Pending)
                {
                    return BadRequest(new { message = "Only applications in Pending status can be edited" });
                }

                // Update provided fields only
                if (request.FarmerName != null) application.FarmerName = request.FarmerName;
                if (request.FarmerPhone != null) application.FarmerPhone = request.FarmerPhone;
                if (request.FarmerEmail != null) application.FarmerEmail = request.FarmerEmail;
                if (request.FarmerAddress != null) application.FarmerAddress = request.FarmerAddress;
                if (request.FarmerWard.HasValue) application.FarmerWard = request.FarmerWard.Value;
                if (request.FarmerMunicipality != null) application.FarmerMunicipality = request.FarmerMunicipality;
                if (request.MonthlyIncome.HasValue) application.MonthlyIncome = request.MonthlyIncome.Value;
                if (request.LandSize.HasValue) application.LandSize = request.LandSize.Value;
                if (request.LandSizeUnit != null) application.LandSizeUnit = request.LandSizeUnit;
                if (request.HasReceivedGrantBefore.HasValue) application.HasReceivedGrantBefore = request.HasReceivedGrantBefore.Value;
                if (request.PreviousGrantDetails != null) application.PreviousGrantDetails = request.PreviousGrantDetails;
                if (request.CropDetails != null) application.CropDetails = request.CropDetails;
                if (request.ExpectedBenefits != null) application.ExpectedBenefits = request.ExpectedBenefits;
                if (request.AdditionalNotes != null) application.AdditionalNotes = request.AdditionalNotes;

                // Handle optional file replacements
                var uploadsPath = Path.Combine(_environment.ContentRootPath, "wwwroot", "uploads", "applications");
                Directory.CreateDirectory(uploadsPath);

                if (request.CitizenImage != null)
                {
                    var citizenFileName = $"citizen_{farmerId}_{DateTime.UtcNow.Ticks}.jpg";
                    var citizenPath = Path.Combine(uploadsPath, citizenFileName);
                    using (var stream = new FileStream(citizenPath, FileMode.Create))
                    {
                        await request.CitizenImage.CopyToAsync(stream);
                    }
                    application.CitizenImageUrl = $"/uploads/applications/{citizenFileName}";
                }

                if (request.LandOwnership != null)
                {
                    var landFileName = $"land_{farmerId}_{DateTime.UtcNow.Ticks}{Path.GetExtension(request.LandOwnership.FileName)}";
                    var landPath = Path.Combine(uploadsPath, landFileName);
                    using (var stream = new FileStream(landPath, FileMode.Create))
                    {
                        await request.LandOwnership.CopyToAsync(stream);
                    }
                    application.LandOwnershipUrl = $"/uploads/applications/{landFileName}";
                }

                if (request.LandTax != null)
                {
                    var taxFileName = $"tax_{farmerId}_{DateTime.UtcNow.Ticks}{Path.GetExtension(request.LandTax.FileName)}";
                    var taxPath = Path.Combine(uploadsPath, taxFileName);
                    using (var stream = new FileStream(taxPath, FileMode.Create))
                    {
                        await request.LandTax.CopyToAsync(stream);
                    }
                    application.LandTaxUrl = $"/uploads/applications/{taxFileName}";
                }

                application.UpdatedAt = DateTime.UtcNow;
                application.UpdatedBy = User.FindFirst(ClaimTypes.Name)?.Value ?? application.UpdatedBy;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Application updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating the application", error = ex.Message });
            }
        }

        [HttpPost("upload-photo")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<object>> UploadGrantPhoto([FromForm] IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { message = "No file uploaded" });
                }

                var uploadsPath = Path.Combine(_environment.ContentRootPath, "wwwroot", "uploads", "grants");
                Directory.CreateDirectory(uploadsPath);

                var safeFileName = Path.GetFileNameWithoutExtension(file.FileName);
                var ext = Path.GetExtension(file.FileName);
                var fileName = $"grant_{DateTime.UtcNow:yyyyMMddHHmmssfff}{ext}";
                var filePath = Path.Combine(uploadsPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var publicUrl = $"/uploads/grants/{fileName}";
                return Ok(new { url = publicUrl });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to upload grant photo", error = ex.Message });
            }
        }

    }
}
