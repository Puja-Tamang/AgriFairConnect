using AgriFairConnect.API.Models;
using AgriFairConnect.API.Services.Interfaces;
using AgriFairConnect.API.ViewModels.Farmer;
using AgriFairConnect.API.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;

namespace AgriFairConnect.API.Services
{
    public class FarmerService : IFarmerService
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly ApplicationDbContext _context;

        public FarmerService(UserManager<AppUser> userManager, ApplicationDbContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        public async Task<FarmerProfileResponse?> GetFarmerProfileAsync(string userId)
        {
            try
            {
                var user = await _userManager.Users
                    .Include(u => u.FarmerProfile)
                    .ThenInclude(fp => fp!.FarmerCrops)
                    .ThenInclude(fc => fc.Crop)
                    .Include(u => u.FarmerProfile)
                    .ThenInclude(fp => fp!.FarmerDocuments)
                    .FirstOrDefaultAsync(u => u.Id == userId && u.UserType == UserType.Farmer);

                if (user?.FarmerProfile == null)
                    return null;

                return MapToFarmerProfileResponse(user);
            }
            catch
            {
                return null;
            }
        }

        public async Task<FarmerProfileResponse?> GetFarmerProfileByUsernameAsync(string username)
        {
            try
            {
                var user = await _userManager.Users
                    .Include(u => u.FarmerProfile)
                    .ThenInclude(fp => fp!.FarmerCrops)
                    .ThenInclude(fc => fc.Crop)
                    .Include(u => u.FarmerProfile)
                    .ThenInclude(fp => fp!.FarmerDocuments)
                    .FirstOrDefaultAsync(u => u.UserName == username && u.UserType == UserType.Farmer);

                if (user?.FarmerProfile == null)
                    return null;

                return MapToFarmerProfileResponse(user);
            }
            catch
            {
                return null;
            }
        }

        public async Task<bool> UpdateFarmerProfileAsync(string userId, FarmerProfileResponse request)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null || user.UserType != UserType.Farmer)
                    return false;

                // Update user information
                user.FullName = request.FullName;
                user.Email = request.Email;
                user.PhoneNumber = request.PhoneNumber;
                user.Address = request.Address;
                user.WardNumber = request.WardNumber;
                user.Municipality = request.Municipality;
                user.UpdatedAt = DateTime.UtcNow;

                var userResult = await _userManager.UpdateAsync(user);
                if (!userResult.Succeeded)
                    return false;

                // Update farmer profile
                var farmerProfile = await _context.FarmerProfiles
                    .FirstOrDefaultAsync(fp => fp.AppUserId == userId);

                if (farmerProfile != null)
                {
                    farmerProfile.MonthlyIncome = request.MonthlyIncome;
                    farmerProfile.LandSize = request.LandSize;
                    farmerProfile.LandSizeUnit = request.LandSizeUnit;
                    farmerProfile.HasReceivedGrantBefore = request.HasReceivedGrantBefore;

                    _context.FarmerProfiles.Update(farmerProfile);
                }

                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> DeleteFarmerProfileAsync(string userId)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null || user.UserType != UserType.Farmer)
                    return false;

                // Delete farmer profile and related data
                var farmerProfile = await _context.FarmerProfiles
                    .Include(fp => fp.FarmerCrops)
                    .Include(fp => fp.FarmerDocuments)
                    .FirstOrDefaultAsync(fp => fp.AppUserId == userId);

                if (farmerProfile != null)
                {
                    _context.FarmerCrops.RemoveRange(farmerProfile.FarmerCrops);
                    _context.FarmerDocuments.RemoveRange(farmerProfile.FarmerDocuments);
                    _context.FarmerProfiles.Remove(farmerProfile);
                }

                // Delete user
                var result = await _userManager.DeleteAsync(user);
                if (result.Succeeded)
                {
                    await _context.SaveChangesAsync();
                    return true;
                }

                return false;
            }
            catch
            {
                return false;
            }
        }

        public async Task<List<FarmerProfileResponse>> GetAllFarmersAsync()
        {
            try
            {
                var farmers = await _userManager.Users
                    .Where(u => u.UserType == UserType.Farmer)
                    .Include(u => u.FarmerProfile)
                    .ThenInclude(fp => fp!.FarmerCrops)
                    .ThenInclude(fc => fc.Crop)
                    .Include(u => u.FarmerProfile)
                    .ThenInclude(fp => fp!.FarmerDocuments)
                    .ToListAsync();

                return farmers.Select(MapToFarmerProfileResponse).ToList();
            }
            catch
            {
                return new List<FarmerProfileResponse>();
            }
        }

        public async Task<bool> UploadDocumentAsync(string userId, IFormFile file, string documentType)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null || user.UserType != UserType.Farmer)
                    return false;

                var farmerProfile = await _context.FarmerProfiles
                    .FirstOrDefaultAsync(fp => fp.AppUserId == userId);

                if (farmerProfile == null)
                    return false;

                // Validate file
                if (file == null || file.Length == 0)
                    return false;

                if (file.Length > 5 * 1024 * 1024) // 5MB limit
                    return false;

                // Generate unique filename
                var fileName = $"{Guid.NewGuid()}_{file.FileName}";
                var filePath = Path.Combine("uploads", "documents", fileName);

                // Ensure directory exists
                var directory = Path.GetDirectoryName(filePath);
                if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
                    Directory.CreateDirectory(directory);

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Parse document type
                if (!Enum.TryParse<DocumentType>(documentType, true, out var docType))
                    return false;

                // Save document record
                var document = new FarmerDocument
                {
                    FarmerProfileId = farmerProfile.Id,
                    DocumentType = docType,
                    FileName = file.FileName,
                    FilePath = filePath,
                    ContentType = file.ContentType,
                    FileSize = file.Length,
                    UploadedAt = DateTime.UtcNow
                };

                _context.FarmerDocuments.Add(document);
                await _context.SaveChangesAsync();

                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> DeleteDocumentAsync(string userId, int documentId)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null || user.UserType != UserType.Farmer)
                    return false;

                var farmerProfile = await _context.FarmerProfiles
                    .FirstOrDefaultAsync(fp => fp.AppUserId == userId);

                if (farmerProfile == null)
                    return false;

                var document = await _context.FarmerDocuments
                    .FirstOrDefaultAsync(d => d.Id == documentId && d.FarmerProfileId == farmerProfile.Id);

                if (document == null)
                    return false;

                // Delete physical file
                if (File.Exists(document.FilePath))
                    File.Delete(document.FilePath);

                // Delete database record
                _context.FarmerDocuments.Remove(document);
                await _context.SaveChangesAsync();

                return true;
            }
            catch
            {
                return false;
            }
        }

        private static FarmerProfileResponse MapToFarmerProfileResponse(AppUser user)
        {
            var profile = user.FarmerProfile!;
            
            return new FarmerProfileResponse
            {
                Id = user.Id,
                Username = user.UserName ?? string.Empty,
                FullName = user.FullName,
                Email = user.Email ?? string.Empty,
                PhoneNumber = user.PhoneNumber ?? string.Empty,
                Address = user.Address,
                WardNumber = user.WardNumber,
                Municipality = user.Municipality,
                MonthlyIncome = profile.MonthlyIncome ?? 0,
                LandSize = profile.LandSize ?? 0,
                LandSizeUnit = profile.LandSizeUnit,
                HasReceivedGrantBefore = profile.HasReceivedGrantBefore,
                Crops = profile.FarmerCrops.Select(fc => new CropInfo
                {
                    Id = fc.Crop.Id,
                    Name = fc.Crop.Name,
                    NameNepali = fc.Crop.NameNepali
                }).ToList(),
                Documents = profile.FarmerDocuments.Select(fd => new DocumentInfo
                {
                    Id = fd.Id,
                    DocumentType = fd.DocumentType.ToString(),
                    FileName = fd.FileName,
                    FilePath = fd.FilePath,
                    UploadedAt = fd.UploadedAt
                }).ToList(),
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt
            };
        }
    }
}
