using AgriFairConnect.API.Models;

namespace AgriFairConnect.API.Services.Interfaces
{
    public interface ICropService
    {
        Task<List<Crop>> GetAllCropsAsync();
        Task<Crop?> GetCropByIdAsync(int id);
        Task<Crop> CreateCropAsync(Crop crop);
        Task<bool> UpdateCropAsync(Crop crop);
        Task<bool> DeleteCropAsync(int id);
        Task<bool> ActivateCropAsync(int id);
        Task<bool> DeactivateCropAsync(int id);
    }
}
