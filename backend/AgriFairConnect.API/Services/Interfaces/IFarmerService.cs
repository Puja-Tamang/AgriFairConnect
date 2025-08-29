using AgriFairConnect.API.ViewModels.Farmer;

namespace AgriFairConnect.API.Services.Interfaces
{
    public interface IFarmerService
    {
        Task<FarmerProfileResponse?> GetFarmerProfileAsync(string userId);
        Task<FarmerProfileResponse?> GetFarmerProfileByUsernameAsync(string username);
        Task<bool> UpdateFarmerProfileAsync(string userId, FarmerProfileResponse request);
        Task<bool> DeleteFarmerProfileAsync(string userId);
        Task<List<FarmerProfileResponse>> GetAllFarmersAsync();
        Task<bool> UploadDocumentAsync(string userId, IFormFile file, string documentType);
        Task<bool> DeleteDocumentAsync(string userId, int documentId);
    }
}
