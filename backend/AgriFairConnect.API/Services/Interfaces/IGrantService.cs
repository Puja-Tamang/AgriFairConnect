using AgriFairConnect.API.ViewModels.Grant;
using AgriFairConnect.API.Models;
using AgriFairConnect.API.ViewModels.Application;

namespace AgriFairConnect.API.Services.Interfaces
{
    public interface IGrantService
    {
        Task<GrantResponse> CreateGrantAsync(CreateGrantRequest request, string createdBy);
        Task<GrantResponse?> GetGrantByIdAsync(int id);
        Task<List<GrantResponse>> GetAllGrantsAsync();
        Task<List<GrantResponse>> GetActiveGrantsAsync();
        Task<List<GrantResponse>> GetGrantsByMunicipalityAsync(string municipality);
        Task<GrantResponse> UpdateGrantAsync(int id, CreateGrantRequest request);
        Task<bool> DeleteGrantAsync(int id);
        Task<bool> ActivateGrantAsync(int id);
        Task<bool> DeactivateGrantAsync(int id);
        
        // Grant Management Methods
        Task<GrantManagementResponse?> GetGrantManagementDataAsync(int grantId);
        Task<List<GrantManagementResponse>> GetAllGrantsForManagementAsync();
        Task<bool> UpdateApplicationStatusAsync(int applicationId, ApplicationStatus status, string? adminRemarks);
        Task<bool> BulkUpdateApplicationStatusAsync(List<int> applicationIds, ApplicationStatus status, string? adminRemarks);
        Task<List<ApplicationSummaryResponse>> GetApplicationsByGrantAsync(int grantId, ApplicationStatus? status = null);
        Task<List<FarmerApplicationResponse>> GetAllApplicationsAsync();
    }
}
