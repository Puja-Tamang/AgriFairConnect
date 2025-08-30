using AgriFairConnect.API.ViewModels.MarketPrice;

namespace AgriFairConnect.API.Services.Interfaces
{
    public interface IMarketPriceService
    {
        Task<MarketPriceResponse> CreateMarketPriceAsync(CreateMarketPriceRequest request, string updatedBy);
        Task<MarketPriceResponse?> GetMarketPriceByIdAsync(int id);
        Task<List<MarketPriceResponse>> GetAllMarketPricesAsync();
        Task<List<MarketPriceResponse>> GetActiveMarketPricesAsync();
        Task<List<MarketPriceResponse>> GetMarketPricesByCropAsync(string cropName);
        Task<List<MarketPriceResponse>> GetMarketPricesByLocationAsync(string location);
        Task<List<MarketPriceResponse>> GetFilteredMarketPricesAsync(MarketPriceFilterRequest filter);
        Task<MarketPriceResponse> UpdateMarketPriceAsync(int id, UpdateMarketPriceRequest request, string updatedBy);
        Task<bool> DeleteMarketPriceAsync(int id);
        Task<bool> ActivateMarketPriceAsync(int id);
        Task<bool> DeactivateMarketPriceAsync(int id);
        Task<bool> BulkUpdateMarketPricesAsync(BulkUpdateMarketPriceRequest request, string updatedBy);
        Task<List<string>> GetDistinctCropNamesAsync();
        Task<List<string>> GetDistinctLocationsAsync();
        Task<MarketPriceResponse?> GetLatestPriceByCropAndLocationAsync(string cropName, string location);
    }
}
