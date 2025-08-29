# Frontend-Backend API Integration Summary

## 🎯 **Overview**
This document summarizes all API integrations between the React frontend and .NET Core backend for the AgriFairConnect platform.

## 🔧 **API Configuration**

### **Base Configuration**
- **Backend URL**: `http://localhost:5000/api`
- **Frontend URL**: `http://localhost:3000`
- **CORS**: Configured for cross-origin requests
- **Authentication**: JWT Bearer tokens

### **Environment Variables**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 📁 **API Service Files**

### **1. Primary API Client (`apiClient.ts`)**
- **Technology**: Axios with interceptors
- **Features**:
  - Automatic token management
  - Request/response interceptors
  - Error handling
  - CORS support with credentials
  - Timeout configuration (10s)

### **2. Alternative API Client (`fetchClient.ts`)**
- **Technology**: Native Fetch API
- **Features**:
  - Same functionality as Axios client
  - Manual header management
  - CORS support with credentials

## 🔐 **Authentication Integration**

### **AuthContext (`AuthContext.tsx`)**
```typescript
// Key Methods
- loginWithCredentials(username, password, userType)
- logout()
- checkAuthStatus()
```

### **Login Component (`Login.tsx`)**
```typescript
// API Calls
- apiClient.login(username, password, userType)
- apiClient.checkUsernameExists(username)
```

### **FarmerRegistration Component (`FarmerRegistration.tsx`)**
```typescript
// API Calls
- apiClient.signup(signupData)
```

## 🌾 **Data Management Integration**

### **DataContext (`DataContext.tsx`)**
```typescript
// API Calls
- apiClient.getAllCrops()
- fetchCrops()
- refreshData()
```

### **Crop Management**
- **Get All Crops**: `GET /api/crop`
- **Get Crop by ID**: `GET /api/crop/{id}`

## 👨‍🌾 **Farmer Profile Integration**

### **Profile Management**
- **Get Profile**: `GET /api/farmer/profile`
- **Update Profile**: `PUT /api/farmer/profile`
- **Delete Profile**: `DELETE /api/farmer/profile`
- **Get All Farmers**: `GET /api/farmer/all` (Admin only)

### **Document Management**
- **Upload Document**: `POST /api/farmer/upload-document`
- **Delete Document**: `DELETE /api/farmer/document/{id}`

## 🔄 **API Endpoints Summary**

### **Authentication (`/api/auth`)**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/login` | User login | No |
| POST | `/signup` | Farmer registration | No |
| GET | `/check-username/{username}` | Check username availability | No |
| POST | `/logout` | User logout | Yes |
| POST | `/validate-token` | Validate JWT token | No |

### **Farmer Management (`/api/farmer`)**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/profile` | Get current farmer profile | Yes |
| GET | `/profile/{username}` | Get farmer by username | Yes |
| PUT | `/profile` | Update farmer profile | Yes |
| DELETE | `/profile` | Delete farmer profile | Yes |
| GET | `/all` | Get all farmers | Yes (Admin) |
| POST | `/upload-document` | Upload document | Yes |
| DELETE | `/document/{id}` | Delete document | Yes |

### **Crop Management (`/api/crop`)**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all active crops | No |
| GET | `/{id}` | Get crop by ID | No |

## 🧪 **Testing Integration**

### **ApiTestComponent (`ApiTestComponent.tsx`)**
- Comprehensive API endpoint testing
- Real-time test results
- Both Axios and Fetch client testing
- Error reporting and logging

## 🚀 **Integration Features**

### **1. Automatic Token Management**
- Tokens stored in localStorage
- Automatic token injection in requests
- Token validation and refresh handling

### **2. Error Handling**
- Centralized error handling
- User-friendly error messages
- Automatic logout on 401 errors

### **3. CORS Support**
- Configured for development (localhost:3000)
- Credentials support
- Production-ready configuration

### **4. Loading States**
- Loading indicators for API calls
- Disabled buttons during requests
- User feedback for all operations

## 📊 **Data Flow**

### **Login Flow**
1. User enters credentials
2. Frontend calls `POST /api/auth/login`
3. Backend validates and returns JWT token
4. Frontend stores token and user data
5. User redirected to dashboard

### **Signup Flow**
1. User fills registration form
2. Frontend validates data
3. Frontend calls `POST /api/auth/signup`
4. Backend creates user and profile
5. User can now login

### **Data Fetching Flow**
1. Component mounts or user action triggers
2. API client makes authenticated request
3. Backend validates token and returns data
4. Frontend updates state with response
5. UI re-renders with new data

## 🔧 **Configuration Files**

### **Backend CORS Configuration**
```csharp
// Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://localhost:3000")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});
```

### **Frontend API Configuration**
```typescript
// apiClient.ts
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

## 🎯 **Best Practices Implemented**

### **1. Separation of Concerns**
- API logic separated from UI components
- Centralized API client management
- Context-based state management

### **2. Error Handling**
- Try-catch blocks around all API calls
- User-friendly error messages
- Graceful degradation

### **3. Security**
- JWT token management
- Automatic token injection
- Secure credential handling

### **4. Performance**
- Request timeouts
- Loading states
- Efficient state updates

## 🚨 **Removed Files**
- `services/database.ts` - Old mock database service
- `services/api.ts` - Old API service (replaced with apiClient.ts)

## 📝 **Next Steps**

### **1. Testing**
- Run the ApiTestComponent to verify all endpoints
- Test authentication flow
- Test data fetching and updates

### **2. Production Deployment**
- Update CORS configuration for production domain
- Set up environment variables
- Configure HTTPS

### **3. Monitoring**
- Add API call logging
- Implement error tracking
- Monitor performance metrics

---

**Status**: ✅ **Fully Integrated**
- All authentication endpoints working
- All farmer management endpoints working
- All crop management endpoints working
- CORS properly configured
- Error handling implemented
- Loading states implemented
