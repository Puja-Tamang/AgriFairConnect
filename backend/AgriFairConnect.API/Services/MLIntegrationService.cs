using AgriFairConnect.API.Data;
using AgriFairConnect.API.Models;
using AgriFairConnect.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Text.Json;

namespace AgriFairConnect.API.Services
{
    public class MLIntegrationService : IMLIntegrationService
    {
        private readonly ApplicationDbContext _context;
        private readonly HttpClient _httpClient;
        private readonly ILogger<MLIntegrationService> _logger;
        private readonly string _priorityServiceUrl = "http://localhost:8001";
        private readonly string _fraudDetectionServiceUrl = "http://localhost:8002";

        public MLIntegrationService(
            ApplicationDbContext context, 
            HttpClient httpClient, 
            ILogger<MLIntegrationService> logger)
        {
            _context = context;
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task<MLPredictionResult> GetPriorityScoreAsync(Application application)
        {
            try
            {
                var farmerData = await MapApplicationToFarmerData(application);
                
                var requestPayload = new
                {
                    farmer_data = farmerData,
                    grant_id = application.GrantId.ToString()
                };

                var json = JsonSerializer.Serialize(requestPayload);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync($"{_priorityServiceUrl}/predict", content);
                
                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Priority service error: {StatusCode} - {Content}", response.StatusCode, errorContent);
                    
                    return new MLPredictionResult
                    {
                        ApplicationId = application.Id,
                        FarmerId = application.FarmerId,
                        FarmerName = application.FarmerName,
                        Success = false,
                        ErrorMessage = $"Priority service error: {response.StatusCode}"
                    };
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<PriorityServiceResponse>(responseContent, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                return new MLPredictionResult
                {
                    ApplicationId = application.Id,
                    FarmerId = application.FarmerId,
                    FarmerName = application.FarmerName,
                    PriorityScore = result?.PriorityScore ?? 0,
                    ApprovalProbability = result?.ApprovalProbability ?? 0,
                    PredictedStatus = result?.PredictedStatus ?? "pending",
                    Confidence = result?.Confidence ?? 0,
                    Recommendation = result?.Recommendation ?? "No recommendation",
                    Reasoning = result?.Reasoning ?? new List<string>(),
                    Success = true
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting priority score for application {ApplicationId}", application.Id);
                
                return new MLPredictionResult
                {
                    ApplicationId = application.Id,
                    FarmerId = application.FarmerId,
                    FarmerName = application.FarmerName,
                    Success = false,
                    ErrorMessage = ex.Message
                };
            }
        }

        public async Task<FraudDetectionResult> GetFraudRiskAsync(Application application)
        {
            try
            {
                var applicationData = new
                {
                    applications = new[]
                    {
                        new
                        {
                            farmer_id = application.FarmerId,
                            farmer_name = application.FarmerName,
                            monthly_income = (double)application.MonthlyIncome,
                            land_size_bigha = (double)application.LandSize,
                            previous_grants = application.HasReceivedGrantBefore ? 1 : 0,
                            phone = application.FarmerPhone,
                            email = application.FarmerEmail,
                            municipality = application.FarmerMunicipality,
                            ward = application.FarmerWard,
                            crop_details = application.CropDetails
                        }
                    }
                };

                var json = JsonSerializer.Serialize(applicationData);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync($"{_fraudDetectionServiceUrl}/detect", content);
                
                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Fraud detection service error: {StatusCode} - {Content}", response.StatusCode, errorContent);
                    
                    return new FraudDetectionResult
                    {
                        ApplicationId = application.Id,
                        FarmerId = application.FarmerId,
                        FarmerName = application.FarmerName,
                        Success = false,
                        ErrorMessage = $"Fraud detection service error: {response.StatusCode}"
                    };
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<FraudDetectionServiceResponse>(responseContent, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                var firstResult = result?.Results?.FirstOrDefault();
                
                return new FraudDetectionResult
                {
                    ApplicationId = application.Id,
                    FarmerId = application.FarmerId,
                    FarmerName = application.FarmerName,
                    IsFraudulent = firstResult?.IsFraudulent ?? false,
                    AnomalyScore = firstResult?.AnomalyScore ?? 0,
                    RiskLevel = firstResult?.RiskLevel ?? "Low Risk",
                    RiskFactors = firstResult?.RiskFactors ?? new List<string>(),
                    Success = true
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting fraud risk for application {ApplicationId}", application.Id);
                
                return new FraudDetectionResult
                {
                    ApplicationId = application.Id,
                    FarmerId = application.FarmerId,
                    FarmerName = application.FarmerName,
                    Success = false,
                    ErrorMessage = ex.Message
                };
            }
        }

        public async Task<List<MLPredictionResult>> GetBatchPriorityScoresAsync(List<Application> applications)
        {
            var results = new List<MLPredictionResult>();
            
            foreach (var application in applications)
            {
                var result = await GetPriorityScoreAsync(application);
                results.Add(result);
                
                // Small delay to avoid overwhelming the ML service
                await Task.Delay(100);
            }
            
            return results;
        }

        public async Task<List<FraudDetectionResult>> GetBatchFraudRisksAsync(List<Application> applications)
        {
            try
            {
                var applicationData = new
                {
                    applications = applications.Select(app => new
                    {
                        farmer_id = app.FarmerId,
                        farmer_name = app.FarmerName,
                        monthly_income = (double)app.MonthlyIncome,
                        land_size_bigha = (double)app.LandSize,
                        previous_grants = app.HasReceivedGrantBefore ? 1 : 0,
                        phone = app.FarmerPhone,
                        email = app.FarmerEmail,
                        municipality = app.FarmerMunicipality,
                        ward = app.FarmerWard,
                        crop_details = app.CropDetails
                    }).ToArray()
                };

                var json = JsonSerializer.Serialize(applicationData);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync($"{_fraudDetectionServiceUrl}/detect", content);
                
                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Batch fraud detection service error: {StatusCode} - {Content}", response.StatusCode, errorContent);
                    
                    return applications.Select(app => new FraudDetectionResult
                    {
                        ApplicationId = app.Id,
                        FarmerId = app.FarmerId,
                        FarmerName = app.FarmerName,
                        Success = false,
                        ErrorMessage = $"Fraud detection service error: {response.StatusCode}"
                    }).ToList();
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<FraudDetectionServiceResponse>(responseContent, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                var results = new List<FraudDetectionResult>();
                
                for (int i = 0; i < applications.Count; i++)
                {
                    var app = applications[i];
                    var fraudResult = result?.Results?.ElementAtOrDefault(i);
                    
                    results.Add(new FraudDetectionResult
                    {
                        ApplicationId = app.Id,
                        FarmerId = app.FarmerId,
                        FarmerName = app.FarmerName,
                        IsFraudulent = fraudResult?.IsFraudulent ?? false,
                        AnomalyScore = fraudResult?.AnomalyScore ?? 0,
                        RiskLevel = fraudResult?.RiskLevel ?? "Low Risk",
                        RiskFactors = fraudResult?.RiskFactors ?? new List<string>(),
                        Success = true
                    });
                }
                
                return results;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting batch fraud risks");
                
                return applications.Select(app => new FraudDetectionResult
                {
                    ApplicationId = app.Id,
                    FarmerId = app.FarmerId,
                    FarmerName = app.FarmerName,
                    Success = false,
                    ErrorMessage = ex.Message
                }).ToList();
            }
        }

        public async Task<bool> UpdateApplicationWithAIScoreAsync(int applicationId, decimal aiScore)
        {
            try
            {
                var application = await _context.Applications.FindAsync(applicationId);
                if (application == null)
                {
                    _logger.LogWarning("Application {ApplicationId} not found for AI score update", applicationId);
                    return false;
                }

                application.AiScore = aiScore;
                application.UpdatedAt = DateTime.UtcNow;
                
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating AI score for application {ApplicationId}", applicationId);
                return false;
            }
        }

        private async Task<object> MapApplicationToFarmerData(Application application)
        {
            // Get additional farmer profile data if available
            var farmerProfile = await _context.FarmerProfiles
                .FirstOrDefaultAsync(fp => fp.AppUserId == application.FarmerId);

            return new
            {
                farmer_id = application.FarmerId,
                full_name = application.FarmerName,
                phone = application.FarmerPhone,
                email = application.FarmerEmail ?? "",
                address = application.FarmerAddress,
                municipality = application.FarmerMunicipality,
                ward = application.FarmerWard,
                monthly_income = (double)application.MonthlyIncome,
                land_size_bigha = (double)application.LandSize,
                previous_grants = application.HasReceivedGrantBefore ? 1 : 0,
                crop_yield = "average", // Default value since not in Application model
                current_crops = application.CropDetails,
                education_level = "secondary", // Default value since not in Application model
                family_size = 4, // Default value since not in Application model
                age = 35, // Default value since not in Application model
                farming_experience_years = 10, // Default value since not in Application model
                credit_score = 500, // Default value since not in Application model
                market_distance_km = 5.0, // Default value since not in Application model
                has_irrigation = false, // Default value since not in Application model
                uses_modern_technology = false, // Default value since not in Application model
                social_category = "general", // Default value since not in Application model
                has_disability = false // Default value since not in Application model
            };
        }
    }

    // Response models for ML services
    public class PriorityServiceResponse
    {
        public string FarmerId { get; set; } = string.Empty;
        public double ApprovalProbability { get; set; }
        public string PredictedStatus { get; set; } = string.Empty;
        public double PriorityScore { get; set; }
        public double Confidence { get; set; }
        public string Recommendation { get; set; } = string.Empty;
        public List<string> Reasoning { get; set; } = new List<string>();
    }

    public class FraudDetectionServiceResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public int TotalApplications { get; set; }
        public int FraudDetected { get; set; }
        public Dictionary<string, int> RiskDistribution { get; set; } = new Dictionary<string, int>();
        public double AverageAnomalyScore { get; set; }
        public List<FraudDetectionResultItem> Results { get; set; } = new List<FraudDetectionResultItem>();
        public string Timestamp { get; set; } = string.Empty;
    }

    public class FraudDetectionResultItem
    {
        public string FarmerId { get; set; } = string.Empty;
        public string FarmerName { get; set; } = string.Empty;
        public double MonthlyIncome { get; set; }
        public double LandSizeBigha { get; set; }
        public int PreviousGrants { get; set; }
        public bool IsFraudulent { get; set; }
        public double AnomalyScore { get; set; }
        public string RiskLevel { get; set; } = string.Empty;
        public List<string> RiskFactors { get; set; } = new List<string>();
    }
}
