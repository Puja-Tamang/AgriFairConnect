using AgriFairConnect.API.Models;
using AgriFairConnect.API.Services.Interfaces;
using AgriFairConnect.API.Data;
using Microsoft.EntityFrameworkCore;

namespace AgriFairConnect.API.Services
{
    public class CropService : ICropService
    {
        private readonly ApplicationDbContext _context;

        public CropService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Crop>> GetAllCropsAsync()
        {
            try
            {
                return await _context.Crops
                    .Where(c => c.IsActive)
                    .OrderBy(c => c.Name)
                    .ToListAsync();
            }
            catch
            {
                return new List<Crop>();
            }
        }

        public async Task<Crop?> GetCropByIdAsync(int id)
        {
            try
            {
                return await _context.Crops
                    .FirstOrDefaultAsync(c => c.Id == id && c.IsActive);
            }
            catch
            {
                return null;
            }
        }

        public async Task<Crop> CreateCropAsync(Crop crop)
        {
            try
            {
                crop.CreatedAt = DateTime.UtcNow;
                crop.IsActive = true;

                _context.Crops.Add(crop);
                await _context.SaveChangesAsync();

                return crop;
            }
            catch
            {
                throw new InvalidOperationException("Failed to create crop");
            }
        }

        public async Task<bool> UpdateCropAsync(Crop crop)
        {
            try
            {
                var existingCrop = await _context.Crops.FindAsync(crop.Id);
                if (existingCrop == null)
                    return false;

                existingCrop.Name = crop.Name;
                existingCrop.NameNepali = crop.NameNepali;
                existingCrop.Description = crop.Description;

                _context.Crops.Update(existingCrop);
                await _context.SaveChangesAsync();

                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> DeleteCropAsync(int id)
        {
            try
            {
                var crop = await _context.Crops.FindAsync(id);
                if (crop == null)
                    return false;

                // Check if crop is being used by any farmers
                var isUsed = await _context.FarmerCrops
                    .AnyAsync(fc => fc.CropId == id);

                if (isUsed)
                    return false; // Cannot delete crop that is in use

                _context.Crops.Remove(crop);
                await _context.SaveChangesAsync();

                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> ActivateCropAsync(int id)
        {
            try
            {
                var crop = await _context.Crops.FindAsync(id);
                if (crop == null)
                    return false;

                crop.IsActive = true;
                _context.Crops.Update(crop);
                await _context.SaveChangesAsync();

                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> DeactivateCropAsync(int id)
        {
            try
            {
                var crop = await _context.Crops.FindAsync(id);
                if (crop == null)
                    return false;

                crop.IsActive = false;
                _context.Crops.Update(crop);
                await _context.SaveChangesAsync();

                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}
