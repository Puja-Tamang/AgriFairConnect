# AgriFairConnect Backend Tests

This project contains comprehensive unit tests for the AgriFairConnect backend API using xUnit.

## Test Structure

### TestBase.cs
- Base class for all tests
- Provides in-memory database setup
- Handles authentication and test user creation
- Manages test client setup

### Controllers Tests
- **AuthControllerTests.cs**: Tests authentication endpoints (login, signup, token validation)
- **FarmerControllerTests.cs**: Tests farmer profile management
- **GrantControllerTests.cs**: Tests grant management functionality

### Services Tests
- **AuthServiceTests.cs**: Tests authentication service logic

## Running Tests

### Run All Tests
```bash
dotnet test
```

### Run Tests with Verbose Output
```bash
dotnet test --verbosity normal
```

### Run Tests with Coverage
```bash
dotnet test --collect:"XPlat Code Coverage"
```

### Run Specific Test Class
```bash
dotnet test --filter "FullyQualifiedName~AuthControllerTests"
```

### Run Specific Test Method
```bash
dotnet test --filter "FullyQualifiedName~AuthControllerTests.Login_WithValidCredentials_ShouldReturnSuccess"
```

## Test Categories

### Authentication Tests
- User login with valid/invalid credentials
- User signup with validation
- Token validation
- Username availability checking

### Farmer Profile Tests
- Profile retrieval
- Profile updates
- Document upload/management
- Authorization checks

### Grant Management Tests
- Grant creation, reading, updating, deletion
- Grant activation/deactivation
- Authorization for admin-only operations

## Test Data

Tests use in-memory database with isolated test data:
- Each test gets a fresh database instance
- Test users are created with simplified password requirements
- No external dependencies required

## Dependencies

- **xUnit**: Testing framework
- **Microsoft.AspNetCore.Mvc.Testing**: Integration testing
- **Microsoft.EntityFrameworkCore.InMemory**: In-memory database
- **Moq**: Mocking framework

## Best Practices

1. **Arrange-Act-Assert**: All tests follow AAA pattern
2. **Isolation**: Each test is independent
3. **Descriptive Names**: Test names clearly describe what is being tested
4. **Proper Cleanup**: Tests clean up after themselves
5. **Mocking**: External dependencies are mocked when appropriate


