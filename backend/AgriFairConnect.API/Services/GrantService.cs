using AgriFairConnect.API.Data;
using AgriFairConnect.API.Models;
using AgriFairConnect.API.Services.Interfaces;
using AgriFairConnect.API.ViewModels.Grant;
using AgriFairConnect.API.ViewModels.Application;
using Microsoft.EntityFrameworkCore;

namespace AgriFairConnect.API.Services
{
    public class GrantService : IGrantService
    {
        private readonly ApplicationDbContext _context;

        public GrantService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<GrantResponse> CreateGrantAsync(CreateGrantRequest request, string createdBy)
        {
            // Validate request
            if (request.Type == Models.GrantType.Money && (!request.Amount.HasValue || request.Amount <= 0))
            {
                throw new ArgumentException("Amount is required for money grants");
            }

            if (request.Type == Models.GrantType.Object && string.IsNullOrWhiteSpace(request.ObjectName))
            {
                throw new ArgumentException("Object name is required for object grants");
            }

            if (!request.TargetWards.Any() || !request.TargetMunicipalities.Any())
            {
                throw new ArgumentException("At least one target ward and municipality is required");
            }

            // Create grant
            var grant = new Grant
            {
                Title = request.Title,
                Description = request.Description,
                Type = request.Type,
                Amount = request.Amount,
                ObjectName = request.ObjectName,
                CreatedBy = createdBy,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            _context.Grants.Add(grant);
            await _context.SaveChangesAsync();

            // Create target areas
            var targetAreas = new List<GrantTargetArea>();
            foreach (var ward in request.TargetWards)
            {
                foreach (var municipality in request.TargetMunicipalities)
                {
                    targetAreas.Add(new GrantTargetArea
                    {
                        GrantId = grant.Id,
                        WardNumber = ward,
                        Municipality = municipality
                    });
                }
            }

            _context.GrantTargetAreas.AddRange(targetAreas);
            await _context.SaveChangesAsync();

            return await GetGrantByIdAsync(grant.Id) ?? throw new InvalidOperationException("Failed to create grant");
        }

        public async Task<GrantResponse?> GetGrantByIdAsync(int id)
        {
            var grant = await _context.Grants
                .Include(g => g.GrantTargetAreas)
                .Include(g => g.Applications)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (grant == null) return null;

            return new GrantResponse
            {
                Id = grant.Id,
                Title = grant.Title,
                Description = grant.Description,
                Type = grant.Type,
                Amount = grant.Amount,
                ObjectName = grant.ObjectName,
                CreatedBy = grant.CreatedBy,
                CreatedAt = grant.CreatedAt,
                UpdatedAt = grant.UpdatedAt,
                IsActive = grant.IsActive,
                TargetAreas = grant.GrantTargetAreas.Select(gta => new GrantTargetAreaResponse
                {
                    Id = gta.Id,
                    WardNumber = gta.WardNumber,
                    Municipality = gta.Municipality
                }).ToList(),
                ApplicationCount = grant.Applications.Count
            };
        }

        public async Task<List<GrantResponse>> GetAllGrantsAsync()
        {
            var grants = await _context.Grants
                .Include(g => g.GrantTargetAreas)
                .Include(g => g.Applications)
                .OrderByDescending(g => g.CreatedAt)
                .ToListAsync();

            return grants.Select(g => new GrantResponse
            {
                Id = g.Id,
                Title = g.Title,
                Description = g.Description,
                Type = g.Type,
                Amount = g.Amount,
                ObjectName = g.ObjectName,
                CreatedBy = g.CreatedBy,
                CreatedAt = g.CreatedAt,
                UpdatedAt = g.UpdatedAt,
                IsActive = g.IsActive,
                TargetAreas = g.GrantTargetAreas.Select(gta => new GrantTargetAreaResponse
                {
                    Id = gta.Id,
                    WardNumber = gta.WardNumber,
                    Municipality = gta.Municipality
                }).ToList(),
                ApplicationCount = g.Applications.Count
            }).ToList();
        }

        public async Task<List<GrantResponse>> GetActiveGrantsAsync()
        {
            var grants = await _context.Grants
                .Include(g => g.GrantTargetAreas)
                .Include(g => g.Applications)
                .Where(g => g.IsActive)
                .OrderByDescending(g => g.CreatedAt)
                .ToListAsync();

            return grants.Select(g => new GrantResponse
            {
                Id = g.Id,
                Title = g.Title,
                Description = g.Description,
                Type = g.Type,
                Amount = g.Amount,
                ObjectName = g.ObjectName,
                CreatedBy = g.CreatedBy,
                CreatedAt = g.CreatedAt,
                UpdatedAt = g.UpdatedAt,
                IsActive = g.IsActive,
                TargetAreas = g.GrantTargetAreas.Select(gta => new GrantTargetAreaResponse
                {
                    Id = gta.Id,
                    WardNumber = gta.WardNumber,
                    Municipality = gta.Municipality
                }).ToList(),
                ApplicationCount = g.Applications.Count
            }).ToList();
        }

        public async Task<List<GrantResponse>> GetGrantsByMunicipalityAsync(string municipality)
        {
            var grants = await _context.Grants
                .Include(g => g.GrantTargetAreas)
                .Include(g => g.Applications)
                .Where(g => g.IsActive && g.GrantTargetAreas.Any(gta => gta.Municipality == municipality))
                .OrderByDescending(g => g.CreatedAt)
                .ToListAsync();

            return grants.Select(g => new GrantResponse
            {
                Id = g.Id,
                Title = g.Title,
                Description = g.Description,
                Type = g.Type,
                Amount = g.Amount,
                ObjectName = g.ObjectName,
                CreatedBy = g.CreatedBy,
                CreatedAt = g.CreatedAt,
                UpdatedAt = g.UpdatedAt,
                IsActive = g.IsActive,
                TargetAreas = g.GrantTargetAreas.Select(gta => new GrantTargetAreaResponse
                {
                    Id = gta.Id,
                    WardNumber = gta.WardNumber,
                    Municipality = gta.Municipality
                }).ToList(),
                ApplicationCount = g.Applications.Count
            }).ToList();
        }

        public async Task<GrantResponse> UpdateGrantAsync(int id, CreateGrantRequest request)
        {
            var grant = await _context.Grants
                .Include(g => g.GrantTargetAreas)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (grant == null)
                throw new ArgumentException("Grant not found");

            // Validate request
            if (request.Type == Models.GrantType.Money && (!request.Amount.HasValue || request.Amount <= 0))
            {
                throw new ArgumentException("Amount is required for money grants");
            }

            if (request.Type == Models.GrantType.Object && string.IsNullOrWhiteSpace(request.ObjectName))
            {
                throw new ArgumentException("Object name is required for object grants");
            }

            if (!request.TargetWards.Any() || !request.TargetMunicipalities.Any())
            {
                throw new ArgumentException("At least one target ward and municipality is required");
            }

            // Update grant
            grant.Title = request.Title;
            grant.Description = request.Description;
            grant.Type = request.Type;
            grant.Amount = request.Amount;
            grant.ObjectName = request.ObjectName;
            grant.UpdatedAt = DateTime.UtcNow;

            // Remove existing target areas
            _context.GrantTargetAreas.RemoveRange(grant.GrantTargetAreas);

            // Create new target areas
            var targetAreas = new List<GrantTargetArea>();
            foreach (var ward in request.TargetWards)
            {
                foreach (var municipality in request.TargetMunicipalities)
                {
                    targetAreas.Add(new GrantTargetArea
                    {
                        GrantId = grant.Id,
                        WardNumber = ward,
                        Municipality = municipality
                    });
                }
            }

            _context.GrantTargetAreas.AddRange(targetAreas);
            await _context.SaveChangesAsync();

            return await GetGrantByIdAsync(grant.Id) ?? throw new InvalidOperationException("Failed to update grant");
        }

        public async Task<bool> DeleteGrantAsync(int id)
        {
            var grant = await _context.Grants.FindAsync(id);
            if (grant == null) return false;

            _context.Grants.Remove(grant);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ActivateGrantAsync(int id)
        {
            var grant = await _context.Grants.FindAsync(id);
            if (grant == null) return false;

            grant.IsActive = true;
            grant.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeactivateGrantAsync(int id)
        {
            var grant = await _context.Grants.FindAsync(id);
            if (grant == null) return false;

            grant.IsActive = false;
            grant.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        // Grant Management Methods
        public async Task<GrantManagementResponse?> GetGrantManagementDataAsync(int grantId)
        {
            var grant = await _context.Grants
                .Include(g => g.GrantTargetAreas)
                .Include(g => g.Applications)
                    .ThenInclude(a => a.Farmer)
                .FirstOrDefaultAsync(g => g.Id == grantId);

            if (grant == null) return null;

            var applications = grant.Applications.ToList();
            
            return new GrantManagementResponse
            {
                Id = grant.Id,
                Title = grant.Title,
                Description = grant.Description,
                Type = grant.Type,
                Amount = grant.Amount,
                ObjectName = grant.ObjectName,
                CreatedBy = grant.CreatedBy,
                CreatedAt = grant.CreatedAt,
                UpdatedAt = grant.UpdatedAt,
                IsActive = grant.IsActive,
                TargetAreas = grant.GrantTargetAreas.Select(gta => new GrantTargetAreaResponse
                {
                    Id = gta.Id,
                    WardNumber = gta.WardNumber,
                    Municipality = gta.Municipality
                }).ToList(),
                TotalApplications = applications.Count,
                PendingApplications = applications.Count(a => a.Status == ApplicationStatus.Pending),
                ProcessingApplications = applications.Count(a => a.Status == ApplicationStatus.Processing),
                ApprovedApplications = applications.Count(a => a.Status == ApplicationStatus.Approved),
                RejectedApplications = applications.Count(a => a.Status == ApplicationStatus.Rejected),
                                 RecentApplications = applications
                     .OrderByDescending(a => a.SubmittedAt)
                     .Take(5)
                    .Select(a => new ApplicationSummaryResponse
                    {
                        Id = a.Id,
                        FarmerName = a.Farmer.FullName,
                        FarmerUsername = a.Farmer.UserName ?? string.Empty,
                        Status = a.Status,
                        AiScore = null, // Application model doesn't have AiScore
                        SubmittedAt = a.SubmittedAt,
                        AdminRemarks = a.AdminRemarks
                    }).ToList()
            };
        }

        public async Task<List<GrantManagementResponse>> GetAllGrantsForManagementAsync()
        {
            var grants = await _context.Grants
                .Include(g => g.GrantTargetAreas)
                .Include(g => g.Applications)
                .ToListAsync();

            return grants.Select(grant =>
            {
                var applications = grant.Applications.ToList();
                return new GrantManagementResponse
                {
                    Id = grant.Id,
                    Title = grant.Title,
                    Description = grant.Description,
                    Type = grant.Type,
                    Amount = grant.Amount,
                    ObjectName = grant.ObjectName,
                    CreatedBy = grant.CreatedBy,
                    CreatedAt = grant.CreatedAt,
                    UpdatedAt = grant.UpdatedAt,
                    IsActive = grant.IsActive,
                    TargetAreas = grant.GrantTargetAreas.Select(gta => new GrantTargetAreaResponse
                    {
                        Id = gta.Id,
                        WardNumber = gta.WardNumber,
                        Municipality = gta.Municipality
                    }).ToList(),
                    TotalApplications = applications.Count,
                    PendingApplications = applications.Count(a => a.Status == ApplicationStatus.Pending),
                    ProcessingApplications = applications.Count(a => a.Status == ApplicationStatus.Processing),
                    ApprovedApplications = applications.Count(a => a.Status == ApplicationStatus.Approved),
                    RejectedApplications = applications.Count(a => a.Status == ApplicationStatus.Rejected),
                    RecentApplications = new List<ApplicationSummaryResponse>() // Empty for list view
                };
            }).ToList();
        }

        public async Task<bool> UpdateApplicationStatusAsync(int applicationId, ApplicationStatus status, string? adminRemarks)
        {
            var application = await _context.Applications.FindAsync(applicationId);
            if (application == null) return false;

            application.Status = status;
            application.AdminRemarks = adminRemarks;
            application.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> BulkUpdateApplicationStatusAsync(List<int> applicationIds, ApplicationStatus status, string? adminRemarks)
        {
            var applications = await _context.Applications
                .Where(a => applicationIds.Contains(a.Id))
                .ToListAsync();

            if (!applications.Any()) return false;

            foreach (var application in applications)
            {
                application.Status = status;
                application.AdminRemarks = adminRemarks;
                application.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<ApplicationSummaryResponse>> GetApplicationsByGrantAsync(int grantId, ApplicationStatus? status = null)
        {
            var query = _context.Applications
                .Include(a => a.Farmer)
                .Where(a => a.GrantId == grantId);

            if (status.HasValue)
            {
                query = query.Where(a => a.Status == status.Value);
            }

            var applications = await query
                .OrderByDescending(a => a.SubmittedAt)
                .ToListAsync();

            return applications.Select(a => new ApplicationSummaryResponse
            {
                Id = a.Id,
                FarmerName = a.Farmer.FullName,
                FarmerUsername = a.Farmer.UserName ?? string.Empty,
                Status = a.Status,
                AiScore = null, // Application model doesn't have AiScore
                SubmittedAt = a.SubmittedAt,
                AdminRemarks = a.AdminRemarks
            }).ToList();
        }

        public async Task<List<FarmerApplicationResponse>> GetAllApplicationsAsync()
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

                return applications;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error retrieving applications: {ex.Message}");
            }
        }
    }
}
