using System.Net;
using System.Text.Json;
using AgriFairConnect.API.Models;
using Xunit;

namespace AgriFairConnect.Tests.Controllers
{
    public class AuthControllerTests : TestBase
    {
        [Fact]
        public async Task Login_WithValidCredentials_ShouldReturnSuccess()
        {
            // Arrange
            var user = await CreateTestUserAsync();
            var loginRequest = new
            {
                username = user.UserName,
                password = "TestPassword123!",
                userType = user.UserType.ToString().ToLower()
            };

            // Act
            var response = await Client.PostAsJsonAsync("/api/auth/login", loginRequest);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(content);
            
            Assert.True(result.GetProperty("success").GetBoolean());
            Assert.True(result.TryGetProperty("token", out _));
        }

        [Fact]
        public async Task Login_WithInvalidCredentials_ShouldReturnUnauthorized()
        {
            // Arrange
            var loginRequest = new
            {
                username = "nonexistent",
                password = "wrongpassword",
                userType = "farmer"
            };

            // Act
            var response = await Client.PostAsJsonAsync("/api/auth/login", loginRequest);

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task Login_WithInvalidModel_ShouldReturnBadRequest()
        {
            // Arrange
            var loginRequest = new
            {
                username = "", // Invalid: empty username
                password = "TestPassword123!",
                userType = "farmer"
            };

            // Act
            var response = await Client.PostAsJsonAsync("/api/auth/login", loginRequest);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task Signup_WithValidData_ShouldCreateFarmer()
        {
            // Arrange
            var signupRequest = new
            {
                username = "newfarmer",
                email = "newfarmer@example.com",
                password = "TestPassword123!",
                fullName = "New Farmer",
                phoneNumber = "9876543210",
                address = "New Address",
                wardNumber = 2,
                municipality = "New Municipality"
            };

            // Act
            var response = await Client.PostAsJsonAsync("/api/auth/signup", signupRequest);

            // Assert
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(content);
            
            Assert.True(result.GetProperty("success").GetBoolean());
        }

        [Fact]
        public async Task Signup_WithExistingUsername_ShouldReturnBadRequest()
        {
            // Arrange
            var existingUser = await CreateTestUserAsync("existinguser", "existing@example.com");
            
            var signupRequest = new
            {
                username = existingUser.UserName, // Already exists
                email = "different@example.com",
                password = "TestPassword123!",
                fullName = "Different User",
                phoneNumber = "1111111111",
                address = "Different Address",
                wardNumber = 3,
                municipality = "Different Municipality"
            };

            // Act
            var response = await Client.PostAsJsonAsync("/api/auth/signup", signupRequest);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task Signup_WithInvalidModel_ShouldReturnBadRequest()
        {
            // Arrange
            var signupRequest = new
            {
                username = "", // Invalid: empty username
                email = "invalid-email", // Invalid email format
                password = "short", // Too short password
                fullName = "", // Empty name
                phoneNumber = "", // Empty phone
                address = "", // Empty address
                wardNumber = -1, // Invalid ward number
                municipality = "" // Empty municipality
            };

            // Act
            var response = await Client.PostAsJsonAsync("/api/auth/signup", signupRequest);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task CheckUsernameExists_WithExistingUsername_ShouldReturnTrue()
        {
            // Arrange
            var existingUser = await CreateTestUserAsync("existinguser", "existing@example.com");

            // Act
            var response = await Client.GetAsync($"/api/auth/check-username/{existingUser.UserName}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var exists = JsonSerializer.Deserialize<bool>(content);
            Assert.True(exists);
        }

        [Fact]
        public async Task CheckUsernameExists_WithNonExistingUsername_ShouldReturnFalse()
        {
            // Arrange
            var nonExistingUsername = "nonexistentuser";

            // Act
            var response = await Client.GetAsync($"/api/auth/check-username/{nonExistingUsername}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var exists = JsonSerializer.Deserialize<bool>(content);
            Assert.False(exists);
        }

        [Fact]
        public async Task CheckUsernameExists_WithEmptyUsername_ShouldReturnBadRequest()
        {
            // Arrange
            var emptyUsername = "";

            // Act
            var response = await Client.GetAsync($"/api/auth/check-username/{emptyUsername}");

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task Logout_WithValidToken_ShouldReturnSuccess()
        {
            // Arrange
            var user = await CreateTestUserAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(user);

            // Act
            var response = await authenticatedClient.PostAsync("/api/auth/logout", null);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<bool>(content);
            Assert.True(result);
        }

        [Fact]
        public async Task Logout_WithoutToken_ShouldReturnUnauthorized()
        {
            // Act
            var response = await Client.PostAsync("/api/auth/logout", null);

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task ValidateToken_WithValidToken_ShouldReturnTrue()
        {
            // Arrange
            var user = await CreateTestUserAsync();
            var token = await GetAuthTokenAsync(user);

            // Act
            var response = await Client.PostAsJsonAsync("/api/auth/validate-token", token);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var isValid = JsonSerializer.Deserialize<bool>(content);
            Assert.True(isValid);
        }

        [Fact]
        public async Task ValidateToken_WithInvalidToken_ShouldReturnFalse()
        {
            // Arrange
            var invalidToken = "invalid.token.here";

            // Act
            var response = await Client.PostAsJsonAsync("/api/auth/validate-token", invalidToken);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var isValid = JsonSerializer.Deserialize<bool>(content);
            Assert.False(isValid);
        }

        [Fact]
        public async Task ValidateToken_WithEmptyToken_ShouldReturnBadRequest()
        {
            // Arrange
            var emptyToken = "";

            // Act
            var response = await Client.PostAsJsonAsync("/api/auth/validate-token", emptyToken);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task DebugAdmin_ShouldReturnAdminUserInfo()
        {
            // Arrange
            var admin = await CreateTestAdminAsync();

            // Act
            var response = await Client.GetAsync("/api/auth/debug-admin");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(content);
            
            Assert.True(result.TryGetProperty("userId", out _));
            Assert.True(result.TryGetProperty("username", out _));
            Assert.True(result.TryGetProperty("userType", out _));
            Assert.True(result.TryGetProperty("roles", out _));
        }

        [Fact]
        public async Task DebugToken_WithValidToken_ShouldReturnTokenInfo()
        {
            // Arrange
            var user = await CreateTestUserAsync();
            var authenticatedClient = await CreateAuthenticatedClientAsync(user);

            // Act
            var response = await authenticatedClient.GetAsync("/api/auth/debug-token");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(content);
            
            Assert.True(result.GetProperty("tokenExists").GetBoolean());
            Assert.True(result.TryGetProperty("claims", out _));
            Assert.True(result.TryGetProperty("expires", out _));
        }

        [Fact]
        public async Task DebugToken_WithoutToken_ShouldReturnNoTokenMessage()
        {
            // Act
            var response = await Client.GetAsync("/api/auth/debug-token");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(content);
            
            Assert.Equal("No token provided", result.GetProperty("message").GetString());
        }
    }
}


