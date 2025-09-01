using System.Net;
using System.Text.Json;
using AgriFairConnect.API.Models;
using Xunit;

namespace AgriFairConnect.Tests.Controllers
{
    public class GrantControllerTests : TestBase
    {
        [Fact]
        public async Task CreateGrant_WithValidData_ShouldCreateGrant()
        {
            // Arrange
            var admin = await CreateTestAdminAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(admin);

            var grantRequest = new
            {
                title = "Test Grant",
                description = "Test grant description",
                amount = 50000.0m,
                targetAreas = new List<string> { "भद्रपुर नगरपालिका", "मेचीनगर नगरपालिका" },
                eligibilityCriteria = "Test eligibility criteria",
                applicationDeadline = DateTime.UtcNow.AddDays(30),
                isActive = true
            };

            // Act
            var response = await authenticatedClient.PostAsJsonAsync("/api/grant", grantRequest);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(content);
            
            Assert.True(result.TryGetProperty("id", out _));
            Assert.Equal("Test Grant", result.GetProperty("title").GetString());
        }

        [Fact]
        public async Task CreateGrant_WithoutAdminAccess_ShouldReturnForbidden()
        {
            // Arrange
            var farmer = await CreateTestUserAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(farmer);

            var grantRequest = new
            {
                title = "Test Grant",
                description = "Test grant description",
                amount = 50000.0m,
                targetAreas = new List<string> { "भद्रपुर नगरपालिका" },
                eligibilityCriteria = "Test eligibility criteria",
                applicationDeadline = DateTime.UtcNow.AddDays(30),
                isActive = true
            };

            // Act
            var response = await authenticatedClient.PostAsJsonAsync("/api/grant", grantRequest);

            // Assert
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [Fact]
        public async Task GetGrantById_WithValidId_ShouldReturnGrant()
        {
            // Arrange
            var admin = await CreateTestAdminAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(admin);

            // First create a grant
            var grantRequest = new
            {
                title = "Test Grant",
                description = "Test grant description",
                amount = 50000.0m,
                targetAreas = new List<string> { "भद्रपुर नगरपालिका" },
                eligibilityCriteria = "Test eligibility criteria",
                applicationDeadline = DateTime.UtcNow.AddDays(30),
                isActive = true
            };

            var createResponse = await authenticatedClient.PostAsJsonAsync("/api/grant", grantRequest);
            var createContent = await createResponse.Content.ReadAsStringAsync();
            var createdGrant = JsonSerializer.Deserialize<JsonElement>(createContent);
            var grantId = createdGrant.GetProperty("id").GetInt32();

            // Act
            var response = await authenticatedClient.GetAsync($"/api/grant/{grantId}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(content);
            
            Assert.Equal(grantId, result.GetProperty("id").GetInt32());
            Assert.Equal("Test Grant", result.GetProperty("title").GetString());
        }

        [Fact]
        public async Task GetGrantById_WithInvalidId_ShouldReturnNotFound()
        {
            // Arrange
            var admin = await CreateTestAdminAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(admin);

            // Act
            var response = await authenticatedClient.GetAsync("/api/grant/99999");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task GetAllGrants_ShouldReturnAllGrants()
        {
            // Arrange
            var admin = await CreateTestAdminAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(admin);

            // Create some test grants
            var grantRequest1 = new
            {
                title = "Grant 1",
                description = "First grant",
                amount = 50000.0m,
                targetAreas = new List<string> { "भद्रपुर नगरपालिका" },
                eligibilityCriteria = "Test criteria",
                applicationDeadline = DateTime.UtcNow.AddDays(30),
                isActive = true
            };

            var grantRequest2 = new
            {
                title = "Grant 2",
                description = "Second grant",
                amount = 75000.0m,
                targetAreas = new List<string> { "मेचीनगर नगरपालिका" },
                eligibilityCriteria = "Test criteria",
                applicationDeadline = DateTime.UtcNow.AddDays(30),
                isActive = true
            };

            await authenticatedClient.PostAsJsonAsync("/api/grant", grantRequest1);
            await authenticatedClient.PostAsJsonAsync("/api/grant", grantRequest2);

            // Act
            var response = await authenticatedClient.GetAsync("/api/grant");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(content);
            
            Assert.True(result.ValueKind == JsonValueKind.Array);
            Assert.True(result.GetArrayLength() >= 2);
        }

        [Fact]
        public async Task GetActiveGrants_ShouldReturnOnlyActiveGrants()
        {
            // Arrange
            var admin = await CreateTestAdminAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(admin);

            // Create active and inactive grants
            var activeGrantRequest = new
            {
                title = "Active Grant",
                description = "Active grant",
                amount = 50000.0m,
                targetAreas = new List<string> { "भद्रपुर नगरपालिका" },
                eligibilityCriteria = "Test criteria",
                applicationDeadline = DateTime.UtcNow.AddDays(30),
                isActive = true
            };

            var inactiveGrantRequest = new
            {
                title = "Inactive Grant",
                description = "Inactive grant",
                amount = 50000.0m,
                targetAreas = new List<string> { "भद्रपुर नगरपालिका" },
                eligibilityCriteria = "Test criteria",
                applicationDeadline = DateTime.UtcNow.AddDays(30),
                isActive = false
            };

            await authenticatedClient.PostAsJsonAsync("/api/grant", activeGrantRequest);
            await authenticatedClient.PostAsJsonAsync("/api/grant", inactiveGrantRequest);

            // Act
            var response = await authenticatedClient.GetAsync("/api/grant/active");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(content);
            
            Assert.True(result.ValueKind == JsonValueKind.Array);
            
            // All returned grants should be active
            foreach (var grant in result.EnumerateArray())
            {
                Assert.True(grant.GetProperty("isActive").GetBoolean());
            }
        }

        [Fact]
        public async Task UpdateGrant_WithValidData_ShouldUpdateGrant()
        {
            // Arrange
            var admin = await CreateTestAdminAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(admin);

            // First create a grant
            var grantRequest = new
            {
                title = "Original Grant",
                description = "Original description",
                amount = 50000.0m,
                targetAreas = new List<string> { "भद्रपुर नगरपालिका" },
                eligibilityCriteria = "Original criteria",
                applicationDeadline = DateTime.UtcNow.AddDays(30),
                isActive = true
            };

            var createResponse = await authenticatedClient.PostAsJsonAsync("/api/grant", grantRequest);
            var createContent = await createResponse.Content.ReadAsStringAsync();
            var createdGrant = JsonSerializer.Deserialize<JsonElement>(createContent);
            var grantId = createdGrant.GetProperty("id").GetInt32();

            // Update request
            var updateRequest = new
            {
                title = "Updated Grant",
                description = "Updated description",
                amount = 75000.0m,
                targetAreas = new List<string> { "मेचीनगर नगरपालिका" },
                eligibilityCriteria = "Updated criteria",
                applicationDeadline = DateTime.UtcNow.AddDays(60),
                isActive = false
            };

            // Act
            var response = await authenticatedClient.PutAsJsonAsync($"/api/grant/{grantId}", updateRequest);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(content);
            
            Assert.Equal("Updated Grant", result.GetProperty("title").GetString());
            Assert.Equal(75000.0m, result.GetProperty("amount").GetDecimal());
            Assert.False(result.GetProperty("isActive").GetBoolean());
        }

        [Fact]
        public async Task DeleteGrant_WithValidId_ShouldDeleteGrant()
        {
            // Arrange
            var admin = await CreateTestAdminAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(admin);

            // First create a grant
            var grantRequest = new
            {
                title = "Grant to Delete",
                description = "Grant to delete",
                amount = 50000.0m,
                targetAreas = new List<string> { "भद्रपुर नगरपालिका" },
                eligibilityCriteria = "Test criteria",
                applicationDeadline = DateTime.UtcNow.AddDays(30),
                isActive = true
            };

            var createResponse = await authenticatedClient.PostAsJsonAsync("/api/grant", grantRequest);
            var createContent = await createResponse.Content.ReadAsStringAsync();
            var createdGrant = JsonSerializer.Deserialize<JsonElement>(createContent);
            var grantId = createdGrant.GetProperty("id").GetInt32();

            // Act
            var response = await authenticatedClient.DeleteAsync($"/api/grant/{grantId}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(content);
            
            Assert.True(result.GetProperty("success").GetBoolean());
        }

        [Fact]
        public async Task ActivateGrant_WithValidId_ShouldActivateGrant()
        {
            // Arrange
            var admin = await CreateTestAdminAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(admin);

            // First create an inactive grant
            var grantRequest = new
            {
                title = "Inactive Grant",
                description = "Inactive grant",
                amount = 50000.0m,
                targetAreas = new List<string> { "भद्रपुर नगरपालिका" },
                eligibilityCriteria = "Test criteria",
                applicationDeadline = DateTime.UtcNow.AddDays(30),
                isActive = false
            };

            var createResponse = await authenticatedClient.PostAsJsonAsync("/api/grant", grantRequest);
            var createContent = await createResponse.Content.ReadAsStringAsync();
            var createdGrant = JsonSerializer.Deserialize<JsonElement>(createContent);
            var grantId = createdGrant.GetProperty("id").GetInt32();

            // Act
            var response = await authenticatedClient.PostAsync($"/api/grant/{grantId}/activate", null);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(content);
            
            Assert.True(result.GetProperty("success").GetBoolean());
        }

        [Fact]
        public async Task DeactivateGrant_WithValidId_ShouldDeactivateGrant()
        {
            // Arrange
            var admin = await CreateTestAdminAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(admin);

            // First create an active grant
            var grantRequest = new
            {
                title = "Active Grant",
                description = "Active grant",
                amount = 50000.0m,
                targetAreas = new List<string> { "भद्रपुर नगरपालिका" },
                eligibilityCriteria = "Test criteria",
                applicationDeadline = DateTime.UtcNow.AddDays(30),
                isActive = true
            };

            var createResponse = await authenticatedClient.PostAsJsonAsync("/api/grant", grantRequest);
            var createContent = await createResponse.Content.ReadAsStringAsync();
            var createdGrant = JsonSerializer.Deserialize<JsonElement>(createContent);
            var grantId = createdGrant.GetProperty("id").GetInt32();

            // Act
            var response = await authenticatedClient.PostAsync($"/api/grant/{grantId}/deactivate", null);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(content);
            
            Assert.True(result.GetProperty("success").GetBoolean());
        }
    }
}


