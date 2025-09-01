using System.Net;
using System.Text.Json;
using AgriFairConnect.API.Models;
using Xunit;

namespace AgriFairConnect.Tests.Controllers
{
    public class ApplicationControllerTests : TestBase
    {
        [Fact]
        public async Task GetFarmerApplications_WithValidFarmerToken_ShouldReturnApplications()
        {
            // Arrange
            var farmer = await CreateTestUserAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(farmer);

            // Act
            var response = await authenticatedClient.GetAsync("/api/application/grant/farmer");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(content);
            
            Assert.True(result.ValueKind == JsonValueKind.Array);
        }

        [Fact]
        public async Task GetFarmerApplications_WithoutToken_ShouldReturnUnauthorized()
        {
            // Act
            var response = await Client.GetAsync("/api/application/grant/farmer");

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task GetFarmerApplications_WithAdminToken_ShouldReturnForbidden()
        {
            // Arrange
            var admin = await CreateTestAdminAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(admin);

            // Act
            var response = await authenticatedClient.GetAsync("/api/application/grant/farmer");

            // Assert
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [Fact]
        public async Task GetFarmerApplications_WithInvalidToken_ShouldReturnUnauthorized()
        {
            // Arrange
            var client = Factory.CreateClient();
            client.DefaultRequestHeaders.Add("Authorization", "Bearer invalid-token");

            // Act
            var response = await client.GetAsync("/api/application/grant/farmer");

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task GetFarmerApplications_WithExpiredToken_ShouldReturnUnauthorized()
        {
            // Arrange
            var client = Factory.CreateClient();
            client.DefaultRequestHeaders.Add("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c");

            // Act
            var response = await client.GetAsync("/api/application/grant/farmer");

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task GetAllApplications_WithValidAdminToken_ShouldReturnAllApplications()
        {
            // Arrange
            var admin = await CreateTestAdminAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(admin);

            // Act
            var response = await authenticatedClient.GetAsync("/api/application/grant/all");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(content);
            
            Assert.True(result.ValueKind == JsonValueKind.Array);
        }

        [Fact]
        public async Task GetAllApplications_WithoutToken_ShouldReturnUnauthorized()
        {
            // Act
            var response = await Client.GetAsync("/api/application/grant/all");

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task GetAllApplications_WithFarmerToken_ShouldReturnForbidden()
        {
            // Arrange
            var farmer = await CreateTestUserAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(farmer);

            // Act
            var response = await authenticatedClient.GetAsync("/api/application/grant/all");

            // Assert
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [Fact]
        public async Task GetAllApplications_WithInvalidToken_ShouldReturnUnauthorized()
        {
            // Arrange
            var client = Factory.CreateClient();
            client.DefaultRequestHeaders.Add("Authorization", "Bearer invalid-token");

            // Act
            var response = await client.GetAsync("/api/application/grant/all");

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task GetAllApplications_WithExpiredToken_ShouldReturnUnauthorized()
        {
            // Arrange
            var client = Factory.CreateClient();
            client.DefaultRequestHeaders.Add("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c");

            // Act
            var response = await client.GetAsync("/api/application/grant/all");

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task GetFarmerApplications_WithDatabaseError_ShouldReturnInternalServerError()
        {
            // Arrange
            var farmer = await CreateTestUserAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(farmer);

            // Simulate database error by disposing the context
            DbContext.Dispose();

            // Act
            var response = await authenticatedClient.GetAsync("/api/application/grant/farmer");

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(content);
            
            Assert.Contains("An error occurred while retrieving applications", result.GetProperty("message").GetString());
        }

        [Fact]
        public async Task GetAllApplications_WithDatabaseError_ShouldReturnInternalServerError()
        {
            // Arrange
            var admin = await CreateTestAdminAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(admin);

            // Simulate database error by disposing the context
            DbContext.Dispose();

            // Act
            var response = await authenticatedClient.GetAsync("/api/application/grant/all");

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(content);
            
            Assert.Contains("An error occurred while retrieving applications", result.GetProperty("message").GetString());
        }

        [Fact]
        public async Task GetFarmerApplications_WithValidClaims_ShouldReturnApplications()
        {
            // Arrange
            var farmer = await CreateTestUserAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(farmer);

            // Act
            var response = await authenticatedClient.GetAsync("/api/application/grant/farmer");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(content);
            
            Assert.True(result.ValueKind == JsonValueKind.Array);
            
            // Verify the response structure if there are applications
            if (result.GetArrayLength() > 0)
            {
                var firstApplication = result[0];
                Assert.True(firstApplication.TryGetProperty("id", out _));
                Assert.True(firstApplication.TryGetProperty("grantId", out _));
                Assert.True(firstApplication.TryGetProperty("grantTitle", out _));
                Assert.True(firstApplication.TryGetProperty("status", out _));
                Assert.True(firstApplication.TryGetProperty("farmerName", out _));
                Assert.True(firstApplication.TryGetProperty("appliedAt", out _));
            }
        }

        [Fact]
        public async Task GetAllApplications_WithValidClaims_ShouldReturnApplications()
        {
            // Arrange
            var admin = await CreateTestAdminAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(admin);

            // Act
            var response = await authenticatedClient.GetAsync("/api/application/grant/all");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(content);
            
            Assert.True(result.ValueKind == JsonValueKind.Array);
            
            // Verify the response structure if there are applications
            if (result.GetArrayLength() > 0)
            {
                var firstApplication = result[0];
                Assert.True(firstApplication.TryGetProperty("id", out _));
                Assert.True(firstApplication.TryGetProperty("grantId", out _));
                Assert.True(firstApplication.TryGetProperty("grantTitle", out _));
                Assert.True(firstApplication.TryGetProperty("status", out _));
                Assert.True(firstApplication.TryGetProperty("farmerName", out _));
                Assert.True(firstApplication.TryGetProperty("appliedAt", out _));
            }
        }

        [Fact]
        public async Task GetFarmerApplications_WithMissingUserIdClaim_ShouldReturnUnauthorized()
        {
            // Arrange
            var client = Factory.CreateClient();
            // Add a token without the required "sub" claim
            client.DefaultRequestHeaders.Add("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9obiBEb2UiLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c");

            // Act
            var response = await client.GetAsync("/api/application/grant/farmer");

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task GetAllApplications_WithMissingUserIdClaim_ShouldReturnUnauthorized()
        {
            // Arrange
            var client = Factory.CreateClient();
            // Add a token without the required "sub" claim
            client.DefaultRequestHeaders.Add("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9obiBEb2UiLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c");

            // Act
            var response = await client.GetAsync("/api/application/grant/all");

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task GetFarmerApplications_WithEmptyUserIdClaim_ShouldReturnUnauthorized()
        {
            // Arrange
            var client = Factory.CreateClient();
            // Add a token with empty "sub" claim
            client.DefaultRequestHeaders.Add("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIiLCJuYW1lIjoiSm9obiBEb2UiLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c");

            // Act
            var response = await client.GetAsync("/api/application/grant/farmer");

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task GetAllApplications_WithEmptyUserIdClaim_ShouldReturnUnauthorized()
        {
            // Arrange
            var client = Factory.CreateClient();
            // Add a token with empty "sub" claim
            client.DefaultRequestHeaders.Add("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIiLCJuYW1lIjoiSm9obiBEb2UiLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c");

            // Act
            var response = await client.GetAsync("/api/application/grant/all");

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }
    }
}
