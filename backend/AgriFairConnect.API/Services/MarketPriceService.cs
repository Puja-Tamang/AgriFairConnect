using AgriFairConnect.API.Data;
using AgriFairConnect.API.Models;
using AgriFairConnect.API.Services.Interfaces;
using AgriFairConnect.API.ViewModels.MarketPrice;
using Microsoft.EntityFrameworkCore;

namespace AgriFairConnect.API.Services
{
    public class MarketPriceService : IMarketPriceService
    {
        private readonly ApplicationDbContext _context;

        public MarketPriceService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<MarketPriceResponse> CreateMarketPriceAsync(CreateMarketPriceRequest request, string updatedBy)
        {
            var marketPrice = new MarketPrice
            {
                CropName = request.CropName,
                Price = request.Price,
                Unit = request.Unit,
                Location = request.Location,
                CropPhoto = request.CropPhoto,
                UpdatedBy = updatedBy,
                UpdatedAt = DateTime.UtcNow,
                IsActive = true
            };

            _context.MarketPrices.Add(marketPrice);
            await _context.SaveChangesAsync();

            return new MarketPriceResponse
            {
                Id = marketPrice.Id,
                CropName = marketPrice.CropName,
                Price = marketPrice.Price,
                Unit = marketPrice.Unit,
                Location = marketPrice.Location,
                CropPhoto = marketPrice.CropPhoto,
                UpdatedBy = marketPrice.UpdatedBy,
                UpdatedAt = marketPrice.UpdatedAt,
                IsActive = marketPrice.IsActive
            };
        }

        public async Task<MarketPriceResponse?> GetMarketPriceByIdAsync(int id)
        {
            var marketPrice = await _context.MarketPrices.FindAsync(id);
            if (marketPrice == null) return null;

            return new MarketPriceResponse
            {
                Id = marketPrice.Id,
                CropName = marketPrice.CropName,
                Price = marketPrice.Price,
                Unit = marketPrice.Unit,
                Location = marketPrice.Location,
                CropPhoto = marketPrice.CropPhoto,
                UpdatedBy = marketPrice.UpdatedBy,
                UpdatedAt = marketPrice.UpdatedAt,
                IsActive = marketPrice.IsActive
            };
        }

        public async Task<List<MarketPriceResponse>> GetAllMarketPricesAsync()
        {
            var marketPrices = await _context.MarketPrices
                .OrderByDescending(mp => mp.UpdatedAt)
                .ToListAsync();

            return marketPrices.Select(mp => new MarketPriceResponse
            {
                Id = mp.Id,
                CropName = mp.CropName,
                Price = mp.Price,
                Unit = mp.Unit,
                Location = mp.Location,
                CropPhoto = mp.CropPhoto,
                UpdatedBy = mp.UpdatedBy,
                UpdatedAt = mp.UpdatedAt,
                IsActive = mp.IsActive
            }).ToList();
        }

        public async Task<List<MarketPriceResponse>> GetActiveMarketPricesAsync()
        {
            var marketPrices = await _context.MarketPrices
                .Where(mp => mp.IsActive)
                .OrderByDescending(mp => mp.UpdatedAt)
                .ToListAsync();

            return marketPrices.Select(mp => new MarketPriceResponse
            {
                Id = mp.Id,
                CropName = mp.CropName,
                Price = mp.Price,
                Unit = mp.Unit,
                Location = mp.Location,
                CropPhoto = mp.CropPhoto,
                UpdatedBy = mp.UpdatedBy,
                UpdatedAt = mp.UpdatedAt,
                IsActive = mp.IsActive
            }).ToList();
        }

        public async Task<List<MarketPriceResponse>> GetMarketPricesByCropAsync(string cropName)
        {
            var marketPrices = await _context.MarketPrices
                .Where(mp => mp.CropName.ToLower().Contains(cropName.ToLower()) && mp.IsActive)
                .OrderByDescending(mp => mp.UpdatedAt)
                .ToListAsync();

            return marketPrices.Select(mp => new MarketPriceResponse
            {
                Id = mp.Id,
                CropName = mp.CropName,
                Price = mp.Price,
                Unit = mp.Unit,
                Location = mp.Location,
                CropPhoto = mp.CropPhoto,
                UpdatedBy = mp.UpdatedBy,
                UpdatedAt = mp.UpdatedAt,
                IsActive = mp.IsActive
            }).ToList();
        }

        public async Task<List<MarketPriceResponse>> GetMarketPricesByLocationAsync(string location)
        {
            var marketPrices = await _context.MarketPrices
                .Where(mp => mp.Location.ToLower().Contains(location.ToLower()) && mp.IsActive)
                .OrderByDescending(mp => mp.UpdatedAt)
                .ToListAsync();

            return marketPrices.Select(mp => new MarketPriceResponse
            {
                Id = mp.Id,
                CropName = mp.CropName,
                Price = mp.Price,
                Unit = mp.Unit,
                Location = mp.Location,
                CropPhoto = mp.CropPhoto,
                UpdatedBy = mp.UpdatedBy,
                UpdatedAt = mp.UpdatedAt,
                IsActive = mp.IsActive
            }).ToList();
        }

        public async Task<List<MarketPriceResponse>> GetFilteredMarketPricesAsync(MarketPriceFilterRequest filter)
        {
            var query = _context.MarketPrices.AsQueryable();

            if (!string.IsNullOrWhiteSpace(filter.CropName))
            {
                query = query.Where(mp => mp.CropName.ToLower().Contains(filter.CropName.ToLower()));
            }

            if (!string.IsNullOrWhiteSpace(filter.Location))
            {
                query = query.Where(mp => mp.Location.ToLower().Contains(filter.Location.ToLower()));
            }

            if (filter.IsActive.HasValue)
            {
                query = query.Where(mp => mp.IsActive == filter.IsActive.Value);
            }

            if (filter.FromDate.HasValue)
            {
                query = query.Where(mp => mp.UpdatedAt >= filter.FromDate.Value);
            }

            if (filter.ToDate.HasValue)
            {
                query = query.Where(mp => mp.UpdatedAt <= filter.ToDate.Value);
            }

            var marketPrices = await query
                .OrderByDescending(mp => mp.UpdatedAt)
                .ToListAsync();

            return marketPrices.Select(mp => new MarketPriceResponse
            {
                Id = mp.Id,
                CropName = mp.CropName,
                Price = mp.Price,
                Unit = mp.Unit,
                Location = mp.Location,
                CropPhoto = mp.CropPhoto,
                UpdatedBy = mp.UpdatedBy,
                UpdatedAt = mp.UpdatedAt,
                IsActive = mp.IsActive
            }).ToList();
        }

        public async Task<MarketPriceResponse> UpdateMarketPriceAsync(int id, UpdateMarketPriceRequest request, string updatedBy)
        {
            var marketPrice = await _context.MarketPrices.FindAsync(id);
            if (marketPrice == null)
                throw new ArgumentException("Market price not found");

            marketPrice.Price = request.Price;
            marketPrice.Unit = request.Unit;
            marketPrice.Location = request.Location;
            marketPrice.CropPhoto = request.CropPhoto;
            marketPrice.IsActive = request.IsActive;
            marketPrice.UpdatedBy = updatedBy;
            marketPrice.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return new MarketPriceResponse
            {
                Id = marketPrice.Id,
                CropName = marketPrice.CropName,
                Price = marketPrice.Price,
                Unit = marketPrice.Unit,
                Location = marketPrice.Location,
                CropPhoto = marketPrice.CropPhoto,
                UpdatedBy = marketPrice.UpdatedBy,
                UpdatedAt = marketPrice.UpdatedAt,
                IsActive = marketPrice.IsActive
            };
        }

        public async Task<bool> DeleteMarketPriceAsync(int id)
        {
            var marketPrice = await _context.MarketPrices.FindAsync(id);
            if (marketPrice == null) return false;

            _context.MarketPrices.Remove(marketPrice);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ActivateMarketPriceAsync(int id)
        {
            var marketPrice = await _context.MarketPrices.FindAsync(id);
            if (marketPrice == null) return false;

            marketPrice.IsActive = true;
            marketPrice.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeactivateMarketPriceAsync(int id)
        {
            var marketPrice = await _context.MarketPrices.FindAsync(id);
            if (marketPrice == null) return false;

            marketPrice.IsActive = false;
            marketPrice.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> BulkUpdateMarketPricesAsync(BulkUpdateMarketPriceRequest request, string updatedBy)
        {
            var marketPrices = new List<MarketPrice>();

            foreach (var priceItem in request.Prices)
            {
                var marketPrice = new MarketPrice
                {
                    CropName = priceItem.CropName,
                    Price = priceItem.Price,
                    Unit = priceItem.Unit,
                    Location = priceItem.Location,
                    CropPhoto = priceItem.CropPhoto, // Add this line
                    UpdatedBy = updatedBy,
                    UpdatedAt = DateTime.UtcNow,
                    IsActive = true
                };

                marketPrices.Add(marketPrice);
            }

            _context.MarketPrices.AddRange(marketPrices);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<string>> GetDistinctCropNamesAsync()
        {
            return await _context.MarketPrices
                .Where(mp => mp.IsActive)
                .Select(mp => mp.CropName)
                .Distinct()
                .OrderBy(name => name)
                .ToListAsync();
        }

        public async Task<List<string>> GetDistinctLocationsAsync()
        {
            return await _context.MarketPrices
                .Where(mp => mp.IsActive)
                .Select(mp => mp.Location)
                .Distinct()
                .OrderBy(location => location)
                .ToListAsync();
        }

        public async Task<MarketPriceResponse?> GetLatestPriceByCropAndLocationAsync(string cropName, string location)
        {
            var marketPrice = await _context.MarketPrices
                .Where(mp => mp.CropName.ToLower() == cropName.ToLower() && 
                           mp.Location.ToLower() == location.ToLower() && 
                           mp.IsActive)
                .OrderByDescending(mp => mp.UpdatedAt)
                .FirstOrDefaultAsync();

            if (marketPrice == null) return null;

            return new MarketPriceResponse
            {
                Id = marketPrice.Id,
                CropName = marketPrice.CropName,
                Price = marketPrice.Price,
                Unit = marketPrice.Unit,
                Location = marketPrice.Location,
                UpdatedBy = marketPrice.UpdatedBy,
                UpdatedAt = marketPrice.UpdatedAt,
                IsActive = marketPrice.IsActive
            };
        }
    }
}
