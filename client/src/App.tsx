import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import Profile from './pages/Profile';


// Mock data for demonstration
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
    reports: [
      {
        id: 'r1',
        userId: 'u1',
        userName: 'John Doe',
        accommodationId: '1',
        category: 'Hygiene',
        description: 'Clean rooms and common areas maintained regularly.',
        timestamp: '2024-01-15T10:30:00Z',
        status: 'active'
      }
    ]
  },
  {
    id: '2',
    name: 'Campus PG House',
    location: 'North Campus',
    address: '456 College Ave, City',
    safetyClassification: 'Risky',
    riskScore: 65,
    reports: [
      {
        id: 'r2',
        userId: 'u2',
        userName: 'Jane Smith',
        accommodationId: '2',
        category: 'Security',
        description: 'Poor lighting in corridors and broken security cameras.',
        timestamp: '2024-01-20T14:20:00Z',
        status: 'active'
      },
      {
        id: 'r3',
        userId: 'u3',
        userName: 'Mike Johnson',
        accommodationId: '2',
        category: 'Water',
        description: 'Water supply contaminated, causing health issues.',
        timestamp: '2024-01-18T09:15:00Z',
        status: 'under_review'
      }
    ]
  },
  {
    id: '3',
    name: 'Student Haven Apartments',
    location: 'South Campus',
    address: '789 Dormitory Rd, City',
    safetyClassification: 'High Risk',
    riskScore: 85,
    reports: [
      {
        id: 'r4',
        userId: 'u4',
        userName: 'Sarah Wilson',
        accommodationId: '3',
        category: 'Infrastructure',
        description: 'Building has structural cracks and electrical hazards.',
        timestamp: '2024-01-10T16:45:00Z',
        status: 'active'
      },
      {
        id: 'r5',
        userId: 'u5',
        userName: 'David Brown',
        accommodationId: '3',
        category: 'Food',
        description: 'Mess food quality extremely poor, multiple food poisoning cases.',
        timestamp: '2024-01-12T12:30:00Z',
        status: 'active'
      }
    ]
  }
];

const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: string }> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

export function App() {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [backendStatus, setBackendStatus] = useState<string>('Connecting...');

  useEffect(() => {
    const checkBackend = async () => {
      setBackendStatus('Connecting to server...');
      
      const maxRetries = 3;
      let attempt = 0;

      while (attempt < maxRetries) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000);

          const response = await fetch(`${API}/api/test`, {
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          const data = await response.json();
          setBackendStatus(data.message || 'Connected');
          return;
        } catch (error) {
          attempt++;
          if (attempt < maxRetries) {
            setBackendStatus(`Server is waking up... Attempt ${attempt + 1}/${maxRetries}`);
            await new Promise(resolve => setTimeout(resolve, 5000));
          } else {
            setBackendStatus('Server is starting up. Please refresh in 30 seconds.');
          }
        }
      }
    };

    checkBackend();
  }, [API]);

  return (
    <AuthProvider>
      <AccommodationProvider initialAccommodations={mockAccommodations}>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/accommodations" 
                  element={<AccommodationList />} 
                />
                <Route 
                  path="/accommodations/:id" 
                  element={<AccommodationDetail />} 
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
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/owner/register" element={<OwnerRegister />} />
                <Route path="/owner/login" element={<OwnerLogin />} />
                <Route path="/profile" element={<Profile />} />
                <Route 
                  path="/owner/dashboard" 
                  element={
                    <ProtectedRoute requiredRole="owner">
                      <OwnerDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
            <Footer />
            <div style={{ 
              position: "fixed", 
              bottom: 10, 
              right: 10, 
              fontSize: 12, 
              backgroundColor: 'rgba(0,0,0,0.7)', 
              color: 'white', 
              padding: '4px 8px', 
              borderRadius: '4px',
              zIndex: 9999
            }}>
              Backend Status: {backendStatus}
            </div>
          </div>
        </Router>
      </AccommodationProvider>
    </AuthProvider>
  );
}