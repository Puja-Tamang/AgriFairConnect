import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { DataProvider } from './context/DataContext';
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import FarmerRegistration from './components/Auth/FarmerRegistration';
import FarmerDashboard from './components/Farmer/FarmerDashboard';
import AvailableGrants from './components/Farmer/AvailableGrants';
import MarketDashboard from './components/Farmer/MarketDashboard';
import AdminDashboard from './components/Admin/AdminDashboard';
import CreateGrant from './components/Admin/CreateGrant';
import GrantManagement from './components/Admin/GrantManagement';
import MarketPriceManagement from './components/Admin/MarketPriceManagement';
import MarketPrices from './components/Farmer/MarketPrices';
import GrantApplication from './components/Farmer/GrantApplication';
import EditGrantApplication from './components/Farmer/EditGrantApplication';
import FarmerApplications from './components/Farmer/FarmerApplications';
import AdminApplications from './components/Admin/AdminApplications';
import AISelection from './components/Admin/AISelection';
import FraudDetection from './components/Admin/FraudDetection';

const ProtectedRoute: React.FC<{ children: React.ReactNode, userType?: 'farmer' | 'admin' }> = ({ 
  children, 
  userType 
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (userType && user?.type !== userType) {
    return <Navigate to={user?.type === 'farmer' ? '/farmer/dashboard' : '/admin/dashboard'} replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={isAuthenticated ? 
        <Navigate to={user?.type === 'farmer' ? '/farmer/dashboard' : '/admin/dashboard'} replace /> : 
        <Login />
      } />
      
      <Route path="/farmer/register" element={<FarmerRegistration />} />

      {/* Protected Farmer Routes */}
      <Route path="/farmer/dashboard" element={
        <ProtectedRoute userType="farmer">
          <Layout><FarmerDashboard /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/farmer/grants" element={
        <ProtectedRoute userType="farmer">
          <Layout><AvailableGrants /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/farmer/market" element={
        <ProtectedRoute userType="farmer">
          <Layout><MarketPrices /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/farmer/applications" element={
        <ProtectedRoute userType="farmer">
          <Layout><FarmerApplications /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/farmer/grants/apply/:grantId" element={
        <ProtectedRoute userType="farmer">
          <GrantApplication />
        </ProtectedRoute>
      } />
      <Route path="/farmer/applications/edit/:id" element={
        <ProtectedRoute userType="farmer">
          <EditGrantApplication />
        </ProtectedRoute>
      } />
      
      <Route path="/farmer/profile" element={
        <ProtectedRoute userType="farmer">
          <Layout><div className="text-center py-12">Under Development...</div></Layout>
        </ProtectedRoute>
      } />

      {/* Protected Admin Routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute userType="admin">
          <Layout><AdminDashboard /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/applications" element={
        <ProtectedRoute userType="admin">
          <Layout><AdminApplications /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/grants/create" element={
        <ProtectedRoute userType="admin">
          <Layout><CreateGrant /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/grants/manage" element={
        <ProtectedRoute userType="admin">
          <Layout><GrantManagement /></Layout>
        </ProtectedRoute>
      } />
      
              <Route path="/admin/ai-selection" element={
          <ProtectedRoute userType="admin">
            <Layout><AISelection /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/fraud-detection" element={
          <ProtectedRoute userType="admin">
            <Layout><FraudDetection /></Layout>
          </ProtectedRoute>
        } />
      
      <Route path="/admin/market-prices" element={
        <ProtectedRoute userType="admin">
          <Layout><MarketPriceManagement /></Layout>
        </ProtectedRoute>
      } />
      


      {/* Default Routes */}
      <Route path="/" element={
        isAuthenticated ? 
          <Navigate to={user?.type === 'farmer' ? '/farmer/dashboard' : '/admin/dashboard'} replace /> : 
          <Navigate to="/login" replace />
      } />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <DataProvider>
          <Router>
            <AppRoutes />
          </Router>
        </DataProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;