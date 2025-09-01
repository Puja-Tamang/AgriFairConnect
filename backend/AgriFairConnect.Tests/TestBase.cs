global using System.Net.Http.Json;
global using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using AgriFairConnect.API.Data;
using AgriFairConnect.API.Models;
using Microsoft.AspNetCore.Identity;
using System.Text.Json;

namespace AgriFairConnect.Tests
{
    public abstract class TestBase : IDisposable
    {
        protected TestHost Factory { get; }skip
        
        protected HttpClient Client { get; }
        protected ApplicationDbContext DbContext { get; }
        protected UserManager<AppUser> UserManager { get; }

        protected TestBase()
        {
            Factory = new TestHost();

            Client = Factory.CreateClient();
            
            var scope = Factory.Services.CreateScope();
            DbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            UserManager = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
            
            // Ensure database is created
            DbContext.Database.EnsureCreated();
        }

        protected async Task<AppUser> CreateTestUserAsync(string username = "testuser", string email = "test@example.com")
        {
            var user = new AppUser
            {
                UserName = username,
                Email = email,
                FullName = "Test User",
                PhoneNumber = "1234567890",
                Address = "Test Address",
                WardNumber = 1,
                Municipality = "Test Municipality",
                UserType = UserType.Farmer,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            var result = await UserManager.CreateAsync(user, "TestPassword123!");
            if (!result.Succeeded)
            {
                throw new Exception($"Failed to create test user: {string.Join(", ", result.Errors.Select(e => e.Description))}");
            }

            return user;
        }

        protected async Task<AppUser> CreateTestAdminAsync(string username = "admin", string email = "admin@example.com")
        {
            var user = new AppUser
            {
                UserName = username,
                Email = email,
                FullName = "Test Admin",
                PhoneNumber = "1234567890",
                Address = "Test Address",
                WardNumber = 1,
                Municipality = "Test Municipality",
                UserType = UserType.Admin,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            var result = await UserManager.CreateAsync(user, "TestPassword123!");
            if (!result.Succeeded)
            {
                throw new Exception($"Failed to create test admin: {string.Join(", ", result.Errors.Select(e => e.Description))}");
            }

            return user;
        }

        protected async Task<string> GetAuthTokenAsync(AppUser user)
        {
            // This is a simplified token generation for testing
            // In a real scenario, you'd use the actual JWT token generation
            var loginData = new
            {
                username = user.UserName,
                password = "TestPassword123!",
                userType = user.UserType.ToString().ToLower()
            };

            var response = await Client.PostAsJsonAsync("/api/auth/login", loginData);
            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadAsStringAsync();
                var loginResponse = JsonSerializer.Deserialize<JsonElement>(result);
                if (loginResponse.TryGetProperty("token", out var tokenElement))
                {
                    return tokenElement.GetString() ?? "";
                }
            }

            return "";
        }

        protected async Task<HttpClient> CreateAuthenticatedClientAsync(AppUser user)
        {
            var token = await GetAuthTokenAsync(user);
            var client = Factory.CreateClient();
            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {token}");
            return client;
        }

        public void Dispose()
        {
            Client?.Dispose();
            Factory?.Dispose();
        }
    }
}
