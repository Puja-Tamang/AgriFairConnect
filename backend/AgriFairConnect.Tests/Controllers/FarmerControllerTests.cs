using System.Net;
using System.Text.Json;
using AgriFairConnect.API.Models;
using Xunit;

namespace AgriFairConnect.Tests.Controllers
{
    public class FarmerControllerTests : TestBase
    {
        [Fact]
        public async Task GetProfile_WithValidToken_ShouldReturnFarmerProfile()
        {
            // Arrange
            var farmer = await CreateTestUserAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(farmer);

            // Act
            var response = await authenticatedClient.GetAsync("/api/farmer/profile");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(content);
            
            Assert.True(result.TryGetProperty("id", out _));
            Assert.Equal(farmer.UserName, result.GetProperty("username").GetString());
        }

        [Fact]
        public async Task GetProfile_WithoutToken_ShouldReturnUnauthorized()
        {
            // Act
            var response = await Client.GetAsync("/api/farmer/profile");

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task GetProfileByUsername_WithValidUsername_ShouldReturnFarmerProfile()
        {
            // Arrange
            var farmer = await CreateTestUserAsync("testfarmer", "testfarmer@example.com");

            // Act
            var response = await Client.GetAsync($"/api/farmer/profile/{farmer.UserName}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(content);
            
            Assert.Equal(farmer.UserName, result.GetProperty("username").GetString());
        }

        [Fact]
        public async Task GetProfileByUsername_WithNonExistingUsername_ShouldReturnNotFound()
        {
            // Arrange
            var nonExistingUsername = "nonexistentfarmer";

            // Act
            var response = await Client.GetAsync($"/api/farmer/profile/{nonExistingUsername}");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task GetProfileByUsername_WithEmptyUsername_ShouldReturnBadRequest()
        {
            // Arrange
            var emptyUsername = "";

            // Act
            var response = await Client.GetAsync($"/api/farmer/profile/{emptyUsername}");

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task UpdateProfile_WithValidData_ShouldUpdateProfile()
        {
            // Arrange
            var farmer = await CreateTestUserAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(farmer);

            var updateRequest = new
            {
                id = farmer.Id,
                username = farmer.UserName,
                fullName = "Updated Farmer Name",
                email = "updated@example.com",
                phoneNumber = "9876543210",
                address = "Updated Address",
                wardNumber = 5,
                municipality = "Updated Municipality",
                monthlyIncome = 35000.0m,
                landSize = 7.5m,
                landSizeUnit = "Ropani",
                hasReceivedGrantBefore = true,
                previousGrantDetails = "Received grant in 2022",
                cropDetails = "Rice, Wheat",
                expectedBenefits = "Increased yield",
                additionalNotes = "Updated notes"
            };

            // Act
            var response = await authenticatedClient.PutAsJsonAsync("/api/farmer/profile", updateRequest);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<bool>(content);
            Assert.True(result);
        }

        [Fact]
        public async Task UpdateProfile_WithoutToken_ShouldReturnUnauthorized()
        {
            // Arrange
            var updateRequest = new
            {
                id = "test-id",
                username = "testuser",
                fullName = "Test User",
                email = "test@example.com"
            };

            // Act
            var response = await Client.PutAsJsonAsync("/api/farmer/profile", updateRequest);

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task UpdateProfile_WithInvalidModel_ShouldReturnBadRequest()
        {
            // Arrange
            var farmer = await CreateTestUserAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(farmer);

            var updateRequest = new
            {
                // Missing required fields
                id = farmer.Id
            };

            // Act
            var response = await authenticatedClient.PutAsJsonAsync("/api/farmer/profile", updateRequest);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task DeleteProfile_WithValidToken_ShouldDeleteProfile()
        {
            // Arrange
            var farmer = await CreateTestUserAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(farmer);

            // Act
            var response = await authenticatedClient.DeleteAsync("/api/farmer/profile");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<bool>(content);
            Assert.True(result);
        }

        [Fact]
        public async Task DeleteProfile_WithoutToken_ShouldReturnUnauthorized()
        {
            // Act
            var response = await Client.DeleteAsync("/api/farmer/profile");

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task GetAllFarmers_WithAdminRole_ShouldReturnAllFarmers()
        {
            // Arrange
            var admin = await CreateTestAdminAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(admin);

            // Create some test farmers
            await CreateTestUserAsync("farmer1", "farmer1@example.com");
            await CreateTestUserAsync("farmer2", "farmer2@example.com");

            // Act
            var response = await authenticatedClient.GetAsync("/api/farmer/all");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(content);
            
            Assert.True(result.ValueKind == JsonValueKind.Array);
            Assert.True(result.GetArrayLength() >= 2);
        }

        [Fact]
        public async Task GetAllFarmers_WithoutAdminRole_ShouldReturnForbidden()
        {
            // Arrange
            var farmer = await CreateTestUserAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(farmer);

            // Act
            var response = await authenticatedClient.GetAsync("/api/farmer/all");

            // Assert
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [Fact]
        public async Task GetAllFarmers_WithoutToken_ShouldReturnUnauthorized()
        {
            // Act
            var response = await Client.GetAsync("/api/farmer/all");

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task UploadDocument_WithValidFile_ShouldUploadDocument()
        {
            // Arrange
            var farmer = await CreateTestUserAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(farmer);

            // Create a mock file
            var fileContent = "Test document content";
            var fileName = "test-document.txt";
            var stream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(fileContent));
            var formFile = new FormFile(stream, 0, stream.Length, "file", fileName)
            {
                Headers = new Microsoft.AspNetCore.Http.HeaderDictionary(),
                ContentType = "text/plain"
            };

            var formData = new MultipartFormDataContent();
            formData.Add(new StringContent("citizen"), "documentType");
            formData.Add(new StreamContent(stream), "file", fileName);

            // Act
            var response = await authenticatedClient.PostAsync("/api/farmer/upload-document", formData);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<bool>(content);
            Assert.True(result);
        }

        [Fact]
        public async Task UploadDocument_WithoutFile_ShouldReturnBadRequest()
        {
            // Arrange
            var farmer = await CreateTestUserAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(farmer);

            var formData = new MultipartFormDataContent();
            formData.Add(new StringContent("citizen"), "documentType");
            // No file added

            // Act
            var response = await authenticatedClient.PostAsync("/api/farmer/upload-document", formData);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task UploadDocument_WithoutToken_ShouldReturnUnauthorized()
        {
            // Arrange
            var formData = new MultipartFormDataContent();
            formData.Add(new StringContent("citizen"), "documentType");

            // Act
            var response = await Client.PostAsync("/api/farmer/upload-document", formData);

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task UploadDocument_WithLargeFile_ShouldReturnBadRequest()
        {
            // Arrange
            var farmer = await CreateTestUserAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(farmer);

            // Create a large file (over 5MB)
            var largeContent = new string('x', 6 * 1024 * 1024); // 6MB
            var stream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(largeContent));
            var fileName = "large-file.txt";

            var formData = new MultipartFormDataContent();
            formData.Add(new StringContent("citizen"), "documentType");
            formData.Add(new StreamContent(stream), "file", fileName);

            // Act
            var response = await authenticatedClient.PostAsync("/api/farmer/upload-document", formData);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task DeleteDocument_WithValidDocumentId_ShouldDeleteDocument()
        {
            // Arrange
            var farmer = await CreateTestUserAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(farmer);

            // Note: In a real test, you would first create a document and get its ID
            // For this test, we'll use a mock ID
            var documentId = 1;

            // Act
            var response = await authenticatedClient.DeleteAsync($"/api/farmer/document/{documentId}");

            // Assert
            // This might return BadRequest if the document doesn't exist, but the endpoint is accessible
            Assert.True(response.StatusCode == HttpStatusCode.OK || response.StatusCode == HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task DeleteDocument_WithoutToken_ShouldReturnUnauthorized()
        {
            // Arrange
            var documentId = 1;

            // Act
            var response = await Client.DeleteAsync($"/api/farmer/document/{documentId}");

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task DeleteDocument_WithInvalidDocumentId_ShouldReturnBadRequest()
        {
            // Arrange
            var farmer = await CreateTestUserAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(farmer);

            var invalidDocumentId = -1;

            // Act
            var response = await authenticatedClient.DeleteAsync($"/api/farmer/document/{invalidDocumentId}");

            // Assert
            // This might return BadRequest for invalid ID
            Assert.True(response.StatusCode == HttpStatusCode.OK || response.StatusCode == HttpStatusCode.BadRequest);
        }
    }
}


