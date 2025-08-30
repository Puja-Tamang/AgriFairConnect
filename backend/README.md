# AgriFairConnect Backend API

A comprehensive .NET Core Web API for the AgriFairConnect platform - an AI-Powered Agricultural Grant Platform.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Complete user registration, login, and profile management
- **Farmer Profiles**: Detailed farmer information with crop preferences and document management
- **Crop Management**: Comprehensive crop catalog with bilingual support (English/Nepali)
- **Document Management**: File upload and management for farmer documents
- **Grant System**: Agricultural grant management and application system
- **Market Prices**: Crop market price tracking and management
- **Notifications**: User notification system
- **API Documentation**: Swagger/OpenAPI documentation

## 🏗️ Architecture

- **Framework**: .NET 8.0
- **Database**: PostgreSQL with Entity Framework Core
- **Authentication**: ASP.NET Core Identity with JWT
- **API Documentation**: Swagger/OpenAPI
- **Pattern**: Repository pattern with service layer
- **Validation**: Data annotations and FluentValidation

## 📋 Prerequisites

- .NET 8.0 SDK
- PostgreSQL 12 or higher
- Visual Studio 2022 or VS Code
- Git

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd backend/AgriFairConnect.API
```

### 2. Install Dependencies
```bash
dotnet restore
```

### 3. Database Configuration

#### PostgreSQL Setup
1. **Install PostgreSQL** (if not already installed):
   - Windows: Download from https://www.postgresql.org/download/windows/
   - macOS: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql postgresql-contrib`

2. **Create Database**:
   ```sql
   CREATE DATABASE "AgriFairConnect";
   ```

3. **Update Connection String** in `appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost; Port=5432; Database=AgriFairConnect; Username=postgres; Password=12345"
     }
   }
   ```

**Note**: Make sure PostgreSQL service is running and accessible on port 5432.

### 4. JWT Configuration
Update the JWT settings in `appsettings.json`:
```json
{
  "Jwt": {
    "Key": "YourSuperSecretKeyHere123!@#$%^&*()_+QWERTYUIOPASDFGHJKLZXCVBNM",
    "Issuer": "AgriFairConnect",
    "Audience": "AgriFairConnectUsers",
    "ExpiryInHours": 24
  }
}
```

### 5. Run the Application
```bash
dotnet run
```

The API will be available at:
- **API**: https://localhost:7001
- **Swagger UI**: https://localhost:7001/swagger

## 🗄️ Database

The application uses Entity Framework Core with the following main entities:

### Core Models
- **AppUser**: Base user model extending IdentityUser
- **FarmerProfile**: Extended farmer information
- **Crop**: Available crops with bilingual names
- **FarmerCrop**: Many-to-many relationship between farmers and crops
- **FarmerDocument**: Document management for farmers
- **Grant**: Agricultural grant programs
- **Application**: Grant applications
- **MarketPrice**: Crop market prices
- **Notification**: User notifications

### Database Initialization
The application automatically:
- Creates the database on first run (if it doesn't exist)
- Seeds initial crop data (15 crops in English and Nepali)
- Seeds sample market prices
- Creates admin and farmer roles
- Creates a default admin user (admin/Admin123!)

**Note**: With PostgreSQL, the database must exist before running the application. The `EnsureCreated()` method will create tables but not the database itself.

## 🔐 Authentication

### JWT Token Structure
```json
{
  "sub": "user-id",
  "name": "username",
  "email": "user@example.com",
  "UserType": "Farmer|Admin",
  "FullName": "User Full Name",
  "exp": "expiration-timestamp"
}
```

### Default Admin Account
- **Username**: admin
- **Password**: Admin123!
- **Role**: Admin

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /login` - User login
- `POST /signup` - Farmer registration
- `GET /check-username/{username}` - Check username availability
- `POST /logout` - User logout
- `POST /validate-token` - Validate JWT token

### Farmer Management (`/api/farmer`)
- `GET /profile` - Get current farmer profile
- `GET /profile/{username}` - Get farmer profile by username
- `PUT /profile` - Update farmer profile
- `DELETE /profile` - Delete farmer profile
- `GET /all` - Get all farmers (Admin only)
- `POST /upload-document` - Upload farmer document
- `DELETE /document/{documentId}` - Delete farmer document

### Crop Management (`/api/crop`)
- `GET /` - Get all active crops
- `GET /{id}` - Get crop by ID
- `POST /` - Create new crop (Admin only)
- `PUT /{id}` - Update crop (Admin only)
- `DELETE /{id}` - Delete crop (Admin only)
- `POST /{id}/activate` - Activate crop (Admin only)
- `POST /{id}/deactivate` - Deactivate crop (Admin only)

## 🔧 Configuration

### Environment Variables
- `ASPNETCORE_ENVIRONMENT`: Development/Production
- `ConnectionStrings__DefaultConnection`: Database connection string
- `Jwt__Key`: JWT signing key
- `Jwt__Issuer`: JWT issuer
- `Jwt__Audience`: JWT audience

### CORS Policy
The API allows all origins, methods, and headers for development. Configure appropriately for production.

## 📁 Project Structure

```
AgriFairConnect.API/
├── Controllers/           # API Controllers
│   ├── AuthController.cs
│   ├── FarmerController.cs
│   └── CropController.cs
├── Data/                  # Data Access Layer
│   └── ApplicationDbContext.cs
├── Models/                # Entity Models
│   ├── AppUser.cs
│   ├── FarmerProfile.cs
│   ├── Crop.cs
│   ├── Grant.cs
│   └── ...
├── Services/              # Business Logic Layer
│   ├── Interfaces/        # Service Interfaces
│   ├── AuthService.cs
│   ├── FarmerService.cs
│   └── CropService.cs
├── ViewModels/            # Data Transfer Objects
│   ├── Auth/
│   └── Farmer/
├── Program.cs             # Application Entry Point
├── appsettings.json       # Configuration
└── AgriFairConnect.API.csproj
```

## 🧪 Testing

### Swagger UI
Access the interactive API documentation at `/swagger` to test endpoints.

### Sample Requests

#### Farmer Signup
```json
POST /api/auth/signup
{
  "username": "farmer123",
  "password": "password123",
  "fullName": "John Doe",
  "address": "123 Farm Street",
  "email": "john@example.com",
  "phoneNumber": "9800000000",
  "wardNumber": 1,
        "municipality": "भद्रपुर नगरपालिका",
  "monthlyIncome": 50000,
  "landSize": 5,
  "cropIds": [1, 2, 3],
  "hasReceivedGrantBefore": false
}
```

#### Login
```json
POST /api/auth/login
{
  "username": "farmer123",
  "password": "password123",
  "userType": "farmer"
}
```

## 🚀 Deployment

### Production Considerations
1. **Security**: Change default JWT key and admin password
2. **Database**: Use production-grade SQL Server
3. **HTTPS**: Enable HTTPS in production
4. **CORS**: Restrict CORS policy for production
5. **Logging**: Configure appropriate logging levels
6. **Environment**: Set `ASPNETCORE_ENVIRONMENT` to Production

### Docker Support
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["AgriFairConnect.API.csproj", "./"]
RUN dotnet restore "AgriFairConnect.API.csproj"
COPY . .
RUN dotnet build "AgriFairConnect.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "AgriFairConnect.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "AgriFairConnect.API.dll"]
```

### Docker Compose (with PostgreSQL)
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "5000:80"
      - "7001:443"
    depends_on:
      - postgres
    environment:
      - ConnectionStrings__DefaultConnection=Host=postgres;Port=5432;Database=AgriFairConnect;Username=postgres;Password=12345

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: AgriFairConnect
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: 12345
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the Swagger documentation

## 🔄 Updates

### Version 1.0.0
- Initial release with core functionality
- User authentication and authorization
- Farmer profile management
- Crop management system
- Basic grant and application system
- Document upload functionality
- Market price tracking
- Notification system

---

**AgriFairConnect** - Empowering farmers through technology and grants.
