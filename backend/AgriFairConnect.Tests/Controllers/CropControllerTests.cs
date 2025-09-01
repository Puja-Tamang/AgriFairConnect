using System.Net;
using System.Text.Json;
using AgriFairConnect.API.Models;
using Xunit;

namespace AgriFairConnect.Tests.Controllers
{
    public class CropControllerTests : TestBase
    {
        [Fact]
        public async Task GetAllCrops_ShouldReturnAllCrops()
        {
            // Act
            var response = await Client.GetAsync("/api/crop");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(content);
            
            Assert.True(result.ValueKind == JsonValueKind.Array);
        }

        [Fact]
        public async Task GetCropById_WithValidId_ShouldReturnCrop()
        {
            // Arrange
            var admin = await CreateTestAdminAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(admin);

            // First create a crop
            var cropRequest = new
            {
                name = "Test Crop",
                description = "Test crop description",
                category = "Grains",
                isActive = true
            };

            var createResponse = await authenticatedClient.PostAsJsonAsync("/api/crop", cropRequest);
            var createContent = await createResponse.Content.ReadAsStringAsync();
            var createdCrop = JsonSerializer.Deserialize<JsonElement>(createContent);
            var cropId = createdCrop.GetProperty("id").GetInt32();

            // Act
            var response = await Client.GetAsync($"/api/crop/{cropId}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(content);
            
            Assert.Equal(cropId, result.GetProperty("id").GetInt32());
            Assert.Equal("Test Crop", result.GetProperty("name").GetString());
        }

        [Fact]
        public async Task GetCropById_WithInvalidId_ShouldReturnNotFound()
        {
            // Arrange
            var invalidId = 99999;

            // Act
            var response = await Client.GetAsync($"/api/crop/{invalidId}");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task CreateCrop_WithValidData_ShouldCreateCrop()
        {
            // Arrange
            var admin = await CreateTestAdminAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(admin);

            var cropRequest = new
            {
                name = "New Crop",
                description = "New crop description",
                category = "Vegetables",
                isActive = true
            };

            // Act
            var response = await authenticatedClient.PostAsJsonAsync("/api/crop", cropRequest);

            // Assert
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(content);
            
            Assert.True(result.TryGetProperty("id", out _));
            Assert.Equal("New Crop", result.GetProperty("name").GetString());
        }

        [Fact]
        public async Task CreateCrop_WithoutAdminRole_ShouldReturnForbidden()
        {
            // Arrange
            var farmer = await CreateTestUserAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(farmer);

            var cropRequest = new
            {
                name = "New Crop",
                description = "New crop description",
                category = "Vegetables",
                isActive = true
            };

            // Act
            var response = await authenticatedClient.PostAsJsonAsync("/api/crop", cropRequest);

            // Assert
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [Fact]
        public async Task CreateCrop_WithoutToken_ShouldReturnUnauthorized()
        {
            // Arrange
            var cropRequest = new
            {
                name = "New Crop",
                description = "New crop description",
                category = "Vegetables",
                isActive = true
            };

            // Act
            var response = await Client.PostAsJsonAsync("/api/crop", cropRequest);

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task CreateCrop_WithInvalidModel_ShouldReturnBadRequest()
        {
            // Arrange
            var admin = await CreateTestAdminAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(admin);

            var cropRequest = new
            {
                // Missing required fields
                description = "New crop description"
            };

            // Act
            var response = await authenticatedClient.PostAsJsonAsync("/api/crop", cropRequest);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task UpdateCrop_WithValidData_ShouldUpdateCrop()
        {
            // Arrange
            var admin = await CreateTestAdminAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(admin);

            // First create a crop
            var cropRequest = new
            {
                name = "Original Crop",
                description = "Original description",
                category = "Grains",
                isActive = true
            };

            var createResponse = await authenticatedClient.PostAsJsonAsync("/api/crop", cropRequest);
            var createContent = await createResponse.Content.ReadAsStringAsync();
            var createdCrop = JsonSerializer.Deserialize<JsonElement>(createContent);
            var cropId = createdCrop.GetProperty("id").GetInt32();

            // Update request
            var updateRequest = new
            {
                id = cropId,
                name = "Updated Crop",
                description = "Updated description",
                category = "Vegetables",
                isActive = false
            };

            // Act
            var response = await authenticatedClient.PutAsJsonAsync($"/api/crop/{cropId}", updateRequest);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<bool>(content);
            Assert.True(result);
        }

        [Fact]
        public async Task UpdateCrop_WithIdMismatch_ShouldReturnBadRequest()
        {
            // Arrange
            var admin = await CreateTestAdminAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(admin);

            var updateRequest = new
            {
                id = 1,
                name = "Updated Crop",
                description = "Updated description",
                category = "Vegetables",
                isActive = false
            };

            // Act
            var response = await authenticatedClient.PutAsJsonAsync("/api/crop/2", updateRequest); // ID mismatch

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task UpdateCrop_WithoutAdminRole_ShouldReturnForbidden()
        {
            // Arrange
            var farmer = await CreateTestUserAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(farmer);

            var updateRequest = new
            {
                id = 1,
                name = "Updated Crop",
                description = "Updated description",
                category = "Vegetables",
                isActive = false
            };

            // Act
            var response = await authenticatedClient.PutAsJsonAsync("/api/crop/1", updateRequest);

            // Assert
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [Fact]
        public async Task UpdateCrop_WithInvalidModel_ShouldReturnBadRequest()
        {
            // Arrange
            var admin = await CreateTestAdminAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(admin);

            var updateRequest = new
            {
                id = 1,
                // Missing required fields
            };

            // Act
            var response = await authenticatedClient.PutAsJsonAsync("/api/crop/1", updateRequest);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task DeleteCrop_WithValidId_ShouldDeleteCrop()
        {
            // Arrange
            var admin = await CreateTestAdminAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(admin);

            // First create a crop
            var cropRequest = new
            {
                name = "Crop to Delete",
                description = "Crop to delete",
                category = "Grains",
                isActive = true
            };

            var createResponse = await authenticatedClient.PostAsJsonAsync("/api/crop", cropRequest);
            var createContent = await createResponse.Content.ReadAsStringAsync();
            var createdCrop = JsonSerializer.Deserialize<JsonElement>(createContent);
            var cropId = createdCrop.GetProperty("id").GetInt32();

            // Act
            var response = await authenticatedClient.DeleteAsync($"/api/crop/{cropId}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<bool>(content);
            Assert.True(result);
        }

        [Fact]
        public async Task DeleteCrop_WithoutAdminRole_ShouldReturnForbidden()
        {
            // Arrange
            var farmer = await CreateTestUserAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(farmer);

            // Act
            var response = await authenticatedClient.DeleteAsync("/api/crop/1");

            // Assert
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [Fact]
        public async Task DeleteCrop_WithoutToken_ShouldReturnUnauthorized()
        {
            // Act
            var response = await Client.DeleteAsync("/api/crop/1");

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task ActivateCrop_WithValidId_ShouldActivateCrop()
        {
            // Arrange
            var admin = await CreateTestAdminAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(admin);

            // First create an inactive crop
            var cropRequest = new
            {
                name = "Inactive Crop",
                description = "Inactive crop",
                category = "Grains",
                isActive = false
            };

            var createResponse = await authenticatedClient.PostAsJsonAsync("/api/crop", cropRequest);
            var createContent = await createResponse.Content.ReadAsStringAsync();
            var createdCrop = JsonSerializer.Deserialize<JsonElement>(createContent);
            var cropId = createdCrop.GetProperty("id").GetInt32();

            // Act
            var response = await authenticatedClient.PostAsync($"/api/crop/{cropId}/activate", null);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<bool>(content);
            Assert.True(result);
        }

        [Fact]
        public async Task ActivateCrop_WithoutAdminRole_ShouldReturnForbidden()
        {
            // Arrange
            var farmer = await CreateTestUserAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(farmer);

            // Act
            var response = await authenticatedClient.PostAsync("/api/crop/1/activate", null);

            // Assert
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [Fact]
        public async Task ActivateCrop_WithInvalidId_ShouldReturnNotFound()
        {
            // Arrange
            var admin = await CreateTestAdminAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(admin);

            var invalidId = 99999;

            // Act
            var response = await authenticatedClient.PostAsync($"/api/crop/{invalidId}/activate", null);

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task DeactivateCrop_WithValidId_ShouldDeactivateCrop()
        {
            // Arrange
            var admin = await CreateTestAdminAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(admin);

            // First create an active crop
            var cropRequest = new
            {
                name = "Active Crop",
                description = "Active crop",
                category = "Grains",
                isActive = true
            };

            var createResponse = await authenticatedClient.PostAsJsonAsync("/api/crop", cropRequest);
            var createContent = await createResponse.Content.ReadAsStringAsync();
            var createdCrop = JsonSerializer.Deserialize<JsonElement>(createContent);
            var cropId = createdCrop.GetProperty("id").GetInt32();

            // Act
            var response = await authenticatedClient.PostAsync($"/api/crop/{cropId}/deactivate", null);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<bool>(content);
            Assert.True(result);
        }

        [Fact]
        public async Task DeactivateCrop_WithoutAdminRole_ShouldReturnForbidden()
        {
            // Arrange
            var farmer = await CreateTestUserAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(farmer);

            // Act
            var response = await authenticatedClient.PostAsync("/api/crop/1/deactivate", null);

            // Assert
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [Fact]
        public async Task DeactivateCrop_WithInvalidId_ShouldReturnNotFound()
        {
            // Arrange
            var admin = await CreateTestAdminAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(admin);

            var invalidId = 99999;

            // Act
            var response = await authenticatedClient.PostAsync($"/api/crop/{invalidId}/deactivate", null);

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }
}
