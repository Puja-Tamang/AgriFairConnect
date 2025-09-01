using System.Net;
using System.Text.Json;
using AgriFairConnect.API.Models;
using Xunit;

namespace AgriFairConnect.Tests.Controllers
{
    public class MarketPriceControllerTests : TestBase
    {
        [Fact]
        public async Task CreateMarketPrice_WithValidData_ShouldCreateMarketPrice()
        {
            // Arrange
            var admin = await CreateTestAdminAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(admin);

            var marketPriceRequest = new
            {
                cropName = "Rice",
                location = "भद्रपुर नगरपालिका",
                price = 2500.0m,
                unit = "Quintal",
                date = DateTime.UtcNow.Date,
                isActive = true,
                notes = "Test market price"
            };

            // Act
            var response = await authenticatedClient.PostAsJsonAsync("/api/marketprice", marketPriceRequest);

            // Assert
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(content);
            
            Assert.True(result.TryGetProperty("id", out _));
            Assert.Equal("Rice", result.GetProperty("cropName").GetString());
        }

        [Fact]
        public async Task CreateMarketPrice_WithoutAdminRole_ShouldReturnForbidden()
        {
            // Arrange
            var farmer = await CreateTestUserAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(farmer);

            var marketPriceRequest = new
            {
                cropName = "Rice",
                location = "भद्रपुर नगरपालिका",
                price = 2500.0m,
                unit = "Quintal",
                date = DateTime.UtcNow.Date,
                isActive = true
            };

            // Act
            var response = await authenticatedClient.PostAsJsonAsync("/api/marketprice", marketPriceRequest);

            // Assert
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [Fact]
        public async Task CreateMarketPrice_WithoutToken_ShouldReturnUnauthorized()
        {
            // Arrange
            var marketPriceRequest = new
            {
                cropName = "Rice",
                location = "भद्रपुर नगरपालिका",
                price = 2500.0m,
                unit = "Quintal",
                date = DateTime.UtcNow.Date,
                isActive = true
            };

            // Act
            var response = await Client.PostAsJsonAsync("/api/marketprice", marketPriceRequest);

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task CreateMarketPrice_WithInvalidData_ShouldReturnBadRequest()
        {
            // Arrange
            var admin = await CreateTestAdminAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(admin);

            var marketPriceRequest = new
            {
                // Missing required fields
                cropName = "",
                location = "",
                price = -100.0m
            };

            // Act
            var response = await authenticatedClient.PostAsJsonAsync("/api/marketprice", marketPriceRequest);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task GetMarketPriceById_WithValidId_ShouldReturnMarketPrice()
        {
            // Arrange
            var admin = await CreateTestAdminAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(admin);

            // First create a market price
            var marketPriceRequest = new
            {
                cropName = "Wheat",
                location = "मेचीनगर नगरपालिका",
                price = 3000.0m,
                unit = "Quintal",
                date = DateTime.UtcNow.Date,
                isActive = true
            };

            var createResponse = await authenticatedClient.PostAsJsonAsync("/api/marketprice", marketPriceRequest);
            var createContent = await createResponse.Content.ReadAsStringAsync();
            var createdMarketPrice = JsonSerializer.Deserialize<JsonElement>(createContent);
            var marketPriceId = createdMarketPrice.GetProperty("id").GetInt32();

            // Act
            var response = await Client.GetAsync($"/api/marketprice/{marketPriceId}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(content);
            
            Assert.Equal(marketPriceId, result.GetProperty("id").GetInt32());
            Assert.Equal("Wheat", result.GetProperty("cropName").GetString());
        }

        [Fact]
        public async Task GetMarketPriceById_WithInvalidId_ShouldReturnNotFound()
        {
            // Arrange
            var invalidId = 99999;

            // Act
            var response = await Client.GetAsync($"/api/marketprice/{invalidId}");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task GetAllMarketPrices_WithAdminRole_ShouldReturnAllMarketPrices()
        {
            // Arrange
            var admin = await CreateTestAdminAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(admin);

            // Create some test market prices
            var marketPriceRequest1 = new
            {
                cropName = "Rice",
                location = "भद्रपुर नगरपालिका",
                price = 2500.0m,
                unit = "Quintal",
                date = DateTime.UtcNow.Date,
                isActive = true
            };

            var marketPriceRequest2 = new
            {
                cropName = "Wheat",
                location = "मेचीनगर नगरपालिका",
                price = 3000.0m,
                unit = "Quintal",
                date = DateTime.UtcNow.Date,
                isActive = true
            };

            await authenticatedClient.PostAsJsonAsync("/api/marketprice", marketPriceRequest1);
            await authenticatedClient.PostAsJsonAsync("/api/marketprice", marketPriceRequest2);

            // Act
            var response = await authenticatedClient.GetAsync("/api/marketprice");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(content);
            
            Assert.True(result.ValueKind == JsonValueKind.Array);
            Assert.True(result.GetArrayLength() >= 2);
        }

        [Fact]
        public async Task GetAllMarketPrices_WithoutAdminRole_ShouldReturnForbidden()
        {
            // Arrange
            var farmer = await CreateTestUserAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(farmer);

            // Act
            var response = await authenticatedClient.GetAsync("/api/marketprice");

            // Assert
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [Fact]
        public async Task GetActiveMarketPrices_ShouldReturnActiveMarketPrices()
        {
            // Arrange
            var admin = await CreateTestAdminAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(admin);

            // Create active and inactive market prices
            var activeMarketPriceRequest = new
            {
                cropName = "Rice",
                location = "भद्रपुर नगरपालिका",
                price = 2500.0m,
                unit = "Quintal",
                date = DateTime.UtcNow.Date,
                isActive = true
            };

            var inactiveMarketPriceRequest = new
            {
                cropName = "Wheat",
                location = "मेचीनगर नगरपालिका",
                price = 3000.0m,
                unit = "Quintal",
                date = DateTime.UtcNow.Date,
                isActive = false
            };

            await authenticatedClient.PostAsJsonAsync("/api/marketprice", activeMarketPriceRequest);
            await authenticatedClient.PostAsJsonAsync("/api/marketprice", inactiveMarketPriceRequest);

            // Act
            var response = await Client.GetAsync("/api/marketprice/active");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(content);
            
            Assert.True(result.ValueKind == JsonValueKind.Array);
            
            // All returned market prices should be active
            foreach (var marketPrice in result.EnumerateArray())
            {
                Assert.True(marketPrice.GetProperty("isActive").GetBoolean());
            }
        }

        [Fact]
        public async Task GetMarketPricesByCrop_WithValidCropName_ShouldReturnMarketPrices()
        {
            // Arrange
            var admin = await CreateTestAdminAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(admin);

            var cropName = "Rice";

            // Create market prices for the crop
            var marketPriceRequest = new
            {
                cropName = cropName,
                location = "भद्रपुर नगरपालिका",
                price = 2500.0m,
                unit = "Quintal",
                date = DateTime.UtcNow.Date,
                isActive = true
            };

            await authenticatedClient.PostAsJsonAsync("/api/marketprice", marketPriceRequest);

            // Act
            var response = await Client.GetAsync($"/api/marketprice/crop/{cropName}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(content);
            
            Assert.True(result.ValueKind == JsonValueKind.Array);
            
            // All returned market prices should be for the specified crop
            foreach (var marketPrice in result.EnumerateArray())
            {
                Assert.Equal(cropName, marketPrice.GetProperty("cropName").GetString());
            }
        }

        [Fact]
        public async Task GetMarketPricesByLocation_WithValidLocation_ShouldReturnMarketPrices()
        {
            // Arrange
            var admin = await CreateTestAdminAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(admin);

            var location = "भद्रपुर नगरपालिका";

            // Create market prices for the location
            var marketPriceRequest = new
            {
                cropName = "Rice",
                location = location,
                price = 2500.0m,
                unit = "Quintal",
                date = DateTime.UtcNow.Date,
                isActive = true
            };

            await authenticatedClient.PostAsJsonAsync("/api/marketprice", marketPriceRequest);

            // Act
            var response = await Client.GetAsync($"/api/marketprice/location/{location}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(content);
            
            Assert.True(result.ValueKind == JsonValueKind.Array);
            
            // All returned market prices should be for the specified location
            foreach (var marketPrice in result.EnumerateArray())
            {
                Assert.Equal(location, marketPrice.GetProperty("location").GetString());
            }
        }

        [Fact]
        public async Task GetFilteredMarketPrices_WithValidFilter_ShouldReturnFilteredMarketPrices()
        {
            // Arrange
            var admin = await CreateTestAdminAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(admin);

            var filterRequest = new
            {
                cropName = "Rice",
                location = "भद्रपुर नगरपालिका",
                startDate = DateTime.UtcNow.AddDays(-7).Date,
                endDate = DateTime.UtcNow.Date,
                minPrice = 2000.0m,
                maxPrice = 3000.0m,
                isActive = true
            };

            // Act
            var response = await authenticatedClient.PostAsJsonAsync("/api/marketprice/filter", filterRequest);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(content);
            
            Assert.True(result.ValueKind == JsonValueKind.Array);
        }

        [Fact]
        public async Task GetFilteredMarketPrices_WithoutAdminRole_ShouldReturnForbidden()
        {
            // Arrange
            var farmer = await CreateTestUserAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(farmer);

            var filterRequest = new
            {
                cropName = "Rice",
                location = "भद्रपुर नगरपालिका"
            };

            // Act
            var response = await authenticatedClient.PostAsJsonAsync("/api/marketprice/filter", filterRequest);

            // Assert
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [Fact]
        public async Task UpdateMarketPrice_WithValidData_ShouldUpdateMarketPrice()
        {
            // Arrange
            var admin = await CreateTestAdminAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(admin);

            // First create a market price
            var marketPriceRequest = new
            {
                cropName = "Original Rice",
                location = "भद्रपुर नगरपालिका",
                price = 2500.0m,
                unit = "Quintal",
                date = DateTime.UtcNow.Date,
                isActive = true
            };

            var createResponse = await authenticatedClient.PostAsJsonAsync("/api/marketprice", marketPriceRequest);
            var createContent = await createResponse.Content.ReadAsStringAsync();
            var createdMarketPrice = JsonSerializer.Deserialize<JsonElement>(createContent);
            var marketPriceId = createdMarketPrice.GetProperty("id").GetInt32();

            // Update request
            var updateRequest = new
            {
                cropName = "Updated Rice",
                location = "मेचीनगर नगरपालिका",
                price = 3000.0m,
                unit = "Quintal",
                date = DateTime.UtcNow.Date,
                isActive = false,
                notes = "Updated notes"
            };

            // Act
            var response = await authenticatedClient.PutAsJsonAsync($"/api/marketprice/{marketPriceId}", updateRequest);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(content);
            
            Assert.Equal("Updated Rice", result.GetProperty("cropName").GetString());
            Assert.Equal(3000.0m, result.GetProperty("price").GetDecimal());
            Assert.False(result.GetProperty("isActive").GetBoolean());
        }

        [Fact]
        public async Task UpdateMarketPrice_WithoutAdminRole_ShouldReturnForbidden()
        {
            // Arrange
            var farmer = await CreateTestUserAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(farmer);

            var updateRequest = new
            {
                cropName = "Updated Rice",
                location = "भद्रपुर नगरपालिका",
                price = 3000.0m,
                unit = "Quintal",
                date = DateTime.UtcNow.Date,
                isActive = true
            };

            // Act
            var response = await authenticatedClient.PutAsJsonAsync("/api/marketprice/1", updateRequest);

            // Assert
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [Fact]
        public async Task UpdateMarketPrice_WithInvalidData_ShouldReturnBadRequest()
        {
            // Arrange
            var admin = await CreateTestAdminAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(admin);

            var updateRequest = new
            {
                // Missing required fields
                cropName = "",
                price = -100.0m
            };

            // Act
            var response = await authenticatedClient.PutAsJsonAsync("/api/marketprice/1", updateRequest);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task DeleteMarketPrice_WithValidId_ShouldDeleteMarketPrice()
        {
            // Arrange
            var admin = await CreateTestAdminAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(admin);

            // First create a market price
            var marketPriceRequest = new
            {
                cropName = "Rice to Delete",
                location = "भद्रपुर नगरपालिका",
                price = 2500.0m,
                unit = "Quintal",
                date = DateTime.UtcNow.Date,
                isActive = true
            };

            var createResponse = await authenticatedClient.PostAsJsonAsync("/api/marketprice", marketPriceRequest);
            var createContent = await createResponse.Content.ReadAsStringAsync();
            var createdMarketPrice = JsonSerializer.Deserialize<JsonElement>(createContent);
            var marketPriceId = createdMarketPrice.GetProperty("id").GetInt32();

            // Act
            var response = await authenticatedClient.DeleteAsync($"/api/marketprice/{marketPriceId}");

            // Assert
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        }

        [Fact]
        public async Task DeleteMarketPrice_WithoutAdminRole_ShouldReturnForbidden()
        {
            // Arrange
            var farmer = await CreateTestUserAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(farmer);

            // Act
            var response = await authenticatedClient.DeleteAsync("/api/marketprice/1");

            // Assert
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [Fact]
        public async Task DeleteMarketPrice_WithInvalidId_ShouldReturnNotFound()
        {
            // Arrange
            var admin = await CreateTestAdminAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(admin);

            var invalidId = 99999;

            // Act
            var response = await authenticatedClient.DeleteAsync($"/api/marketprice/{invalidId}");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task ActivateMarketPrice_WithValidId_ShouldActivateMarketPrice()
        {
            // Arrange
            var admin = await CreateTestAdminAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(admin);

            // First create an inactive market price
            var marketPriceRequest = new
            {
                cropName = "Inactive Rice",
                location = "भद्रपुर नगरपालिका",
                price = 2500.0m,
                unit = "Quintal",
                date = DateTime.UtcNow.Date,
                isActive = false
            };

            var createResponse = await authenticatedClient.PostAsJsonAsync("/api/marketprice", marketPriceRequest);
            var createContent = await createResponse.Content.ReadAsStringAsync();
            var createdMarketPrice = JsonSerializer.Deserialize<JsonElement>(createContent);
            var marketPriceId = createdMarketPrice.GetProperty("id").GetInt32();

            // Act
            var response = await authenticatedClient.PostAsync($"/api/marketprice/{marketPriceId}/activate", null);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(content);
            
            Assert.Equal("Market price activated successfully", result.GetProperty("message").GetString());
        }

        [Fact]
        public async Task ActivateMarketPrice_WithoutAdminRole_ShouldReturnForbidden()
        {
            // Arrange
            var farmer = await CreateTestUserAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(farmer);

            // Act
            var response = await authenticatedClient.PostAsync("/api/marketprice/1/activate", null);

            // Assert
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [Fact]
        public async Task DeactivateMarketPrice_WithValidId_ShouldDeactivateMarketPrice()
        {
            // Arrange
            var admin = await CreateTestAdminAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(admin);

            // First create an active market price
            var marketPriceRequest = new
            {
                cropName = "Active Rice",
                location = "भद्रपुर नगरपालिका",
                price = 2500.0m,
                unit = "Quintal",
                date = DateTime.UtcNow.Date,
                isActive = true
            };

            var createResponse = await authenticatedClient.PostAsJsonAsync("/api/marketprice", marketPriceRequest);
            var createContent = await createResponse.Content.ReadAsStringAsync();
            var createdMarketPrice = JsonSerializer.Deserialize<JsonElement>(createContent);
            var marketPriceId = createdMarketPrice.GetProperty("id").GetInt32();

            // Act
            var response = await authenticatedClient.PostAsync($"/api/marketprice/{marketPriceId}/deactivate", null);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(content);
            
            Assert.Equal("Market price deactivated successfully", result.GetProperty("message").GetString());
        }

        [Fact]
        public async Task DeactivateMarketPrice_WithoutAdminRole_ShouldReturnForbidden()
        {
            // Arrange
            var farmer = await CreateTestUserAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(farmer);

            // Act
            var response = await authenticatedClient.PostAsync("/api/marketprice/1/deactivate", null);

            // Assert
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [Fact]
        public async Task BulkUpdateMarketPrices_WithValidData_ShouldUpdateMarketPrices()
        {
            // Arrange
            var admin = await CreateTestAdminAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(admin);

            var bulkUpdateRequest = new
            {
                cropName = "Rice",
                location = "भद्रपुर नगरपालिका",
                priceChange = 100.0m,
                changeType = "Increase",
                notes = "Bulk price update"
            };

            // Act
            var response = await authenticatedClient.PostAsJsonAsync("/api/marketprice/bulk-update", bulkUpdateRequest);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(content);
            
            Assert.Equal("Market prices updated successfully", result.GetProperty("message").GetString());
        }

        [Fact]
        public async Task BulkUpdateMarketPrices_WithoutAdminRole_ShouldReturnForbidden()
        {
            // Arrange
            var farmer = await CreateTestUserAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(farmer);

            var bulkUpdateRequest = new
            {
                cropName = "Rice",
                location = "भद्रपुर नगरपालिका",
                priceChange = 100.0m,
                changeType = "Increase"
            };

            // Act
            var response = await authenticatedClient.PostAsJsonAsync("/api/marketprice/bulk-update", bulkUpdateRequest);

            // Assert
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [Fact]
        public async Task GetDistinctCropNames_ShouldReturnCropNames()
        {
            // Act
            var response = await Client.GetAsync("/api/marketprice/crops");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(content);
            
            Assert.True(result.ValueKind == JsonValueKind.Array);
        }

        [Fact]
        public async Task GetDistinctLocations_ShouldReturnLocations()
        {
            // Act
            var response = await Client.GetAsync("/api/marketprice/locations");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(content);
            
            Assert.True(result.ValueKind == JsonValueKind.Array);
        }

        [Fact]
        public async Task GetLatestPriceByCropAndLocation_WithValidData_ShouldReturnLatestPrice()
        {
            // Arrange
            var admin = await CreateTestAdminAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(admin);

            var cropName = "Rice";
            var location = "भद्रपुर नगरपालिका";

            // Create a market price
            var marketPriceRequest = new
            {
                cropName = cropName,
                location = location,
                price = 2500.0m,
                unit = "Quintal",
                date = DateTime.UtcNow.Date,
                isActive = true
            };

            await authenticatedClient.PostAsJsonAsync("/api/marketprice", marketPriceRequest);

            // Act
            var response = await Client.GetAsync($"/api/marketprice/latest?cropName={cropName}&location={location}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(content);
            
            Assert.Equal(cropName, result.GetProperty("cropName").GetString());
            Assert.Equal(location, result.GetProperty("location").GetString());
        }

        [Fact]
        public async Task GetLatestPriceByCropAndLocation_WithInvalidData_ShouldReturnNotFound()
        {
            // Arrange
            var cropName = "NonexistentCrop";
            var location = "NonexistentLocation";

            // Act
            var response = await Client.GetAsync($"/api/marketprice/latest?cropName={cropName}&location={location}");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }
}
