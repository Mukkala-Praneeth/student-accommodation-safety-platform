import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { AccommodationList } from './pages/AccommodationList';
import { AccommodationDetail } from './pages/AccommodationDetail';
import { ReportIncident } from './pages/ReportIncident';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AccommodationProvider } from './contexts/AccommodationContext';
import MyReports from './pages/MyReports';
import AdminDashboard from './pages/AdminDashboard';
import OwnerRegister from './pages/OwnerRegister';
import OwnerLogin from './pages/OwnerLogin';
import OwnerDashboard from './pages/OwnerDashboard';
import AddProperty from './pages/AddProperty';
import Profile from './pages/Profile';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';

// Interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'owner' | 'admin';
}

export interface Report {
  id: string;
  accommodationId: string;
  userId: string;
  userName: string;
  category: 'Food' | 'Water' | 'Hygiene' | 'Security' | 'Infrastructure';
  description: string;
  images?: Array<{ url: string; publicId?: string }>;
  timestamp: string;
  status: 'active' | 'under_review' | 'resolved';
}

export interface Accommodation {
  id: string;
  name: string;
  location: string;
  address: string;
  safetyClassification: 'Safe' | 'Risky' | 'High Risk';
  riskScore: number;
  ownerId?: string;
  reports: Report[];
  counterEvidence?: string;
  trustScore?: number;
  trustScoreLabel?: string;
  trustScoreColor?: string;
}

// Mock data initialization
const mockAccommodations: Accommodation[] = [
  {
    id: '1',
    name: 'Sunshine Hostel',
    location: 'Downtown Campus Area',
    address: '123 University St, City',
    safetyClassification: 'Safe',
    riskScore: 15,
    reports: []
  }
];

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: string }> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }
  
  // Double-check localStorage if user is null (fallback)
  if (!user) {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      // User exists in localStorage but not in state - this is a timing issue
      // Force a reload to sync state
      console.log('Auth state mismatch - reloading...');
      window.location.reload();
      return null;
    }
    
    // No user, redirect to appropriate login
    if (location.pathname.startsWith('/owner')) {
      return <Navigate to="/owner/login" state={{ from: location }} replace />;
    }
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // User exists but wrong role
  if (requiredRole && user.role !== requiredRole) {
    console.log('Wrong role:', { userRole: user.role, requiredRole });
    switch (user.role) {
      case 'owner':
        return <Navigate to="/owner/dashboard" replace />;
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'student':
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }
  
  // All checks passed
  return <>{children}</>;
};

// Main App Content
function AppContent() {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [backendStatus, setBackendStatus] = useState<string>('Connecting...');
  const location = useLocation();

  // ✅ Check if current page is home
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const checkBackend = async () => {
      setBackendStatus('Connecting to server...');
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(`${API}/api/test`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        const data = await response.json();
        setBackendStatus(data.message || 'Connected');
      } catch (error) {
        setBackendStatus('Reconnecting...');
        setTimeout(() => {
          setBackendStatus('Checking...');
        }, 5000);
      }
    };

    checkBackend();
  }, [API]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Routes>
          {/* ==================== PUBLIC ROUTES ==================== */}
          <Route path="/" element={<Home />} />
          <Route path="/accommodations" element={<AccommodationList />} />
          <Route path="/accommodations/:id" element={<AccommodationDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/owner/register" element={<OwnerRegister />} />
          <Route path="/owner/login" element={<OwnerLogin />} />
          
          {/* ==================== STUDENT PROTECTED ROUTES ==================== */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/report" 
            element={
              <ProtectedRoute>
                <ReportIncident />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-reports" 
            element={
              <ProtectedRoute>
                <MyReports />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          
          {/* ==================== OWNER PROTECTED ROUTES ==================== */}
          <Route 
            path="/owner/dashboard" 
            element={
              <ProtectedRoute requiredRole="owner">
                <OwnerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/owner/add-property" 
            element={
              <ProtectedRoute requiredRole="owner">
                <AddProperty />
              </ProtectedRoute>
            } 
          />
          
          {/* ==================== ADMIN PROTECTED ROUTES ==================== */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* ==================== CATCH ALL ==================== */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      
      {/* ✅ Footer only on Home Page */}
      {isHomePage && <Footer />}
      
      {/* Backend Status Indicator */}
      <div style={{ 
        position: "fixed", 
        bottom: 10, 
        right: 10, 
        fontSize: 12, 
        backgroundColor: backendStatus === 'Connected' ? 'rgba(34, 197, 94, 0.9)' : 'rgba(0,0,0,0.7)', 
        color: 'white', 
        padding: '4px 8px', 
        borderRadius: '4px',
        zIndex: 9999
      }}>
        Backend: {backendStatus}
      </div>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AccommodationProvider initialAccommodations={mockAccommodations}>
        <Router>
          <AppContent />
        </Router>
      </AccommodationProvider>
    </AuthProvider>
  );
}