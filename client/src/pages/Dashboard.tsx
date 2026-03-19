import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiFileText,
  FiShield,
  FiAlertTriangle,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiPlus,
  FiArrowRight,
  FiList,
  FiTrendingUp,
  FiActivity
} from 'react-icons/fi';
import UpvoteButton from '../components/UpvoteButton';

interface Accommodation {
  _id: string;
  name: string;
  location: string;
  trustScore: number;
  type?: string;
}

interface Report {
  _id: string;
  accommodationName: string;
  issueType: string;
  description: string;
  createdAt: string;
  upvotes: number;
  upvotedBy: string[];
  user: string | { _id: string };
}

// Calculate safety classification based on trust score
const getSafetyClassification = (trustScore: number): 'Safe' | 'Caution' | 'Unsafe' => {
  if (trustScore >= 80) return 'Safe';
  if (trustScore >= 50) return 'Caution';
  return 'Unsafe';
};

export const Dashboard: React.FC = () => {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const { user } = useAuth();
  
  const [reports, setReports] = useState<Report[]>([]);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>('');

  // Get current user ID from token
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.user?.id || payload.id || payload.userId || '');
      }
    } catch {
      setCurrentUserId('');
    }
  }, []);

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    setError("");
    
    try {
      // Fetch reports
      const reportsRes = await fetch(`${API}/api/reports`);
      const reportsData = await reportsRes.json();
      
      // Fetch accommodations
      const accommodationsRes = await fetch(`${API}/api/accommodations`);
      const accommodationsData = await accommodationsRes.json();
      
      if (reportsData.success) {
        setReports(reportsData.data || []);
      }
      
      if (accommodationsData.success) {
        setAccommodations(accommodationsData.data || []);
      } else if (Array.isArray(accommodationsData)) {
        // Some APIs return array directly
        setAccommodations(accommodationsData);
      }
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [API]);

  // Calculate real statistics from actual data
  const totalAccommodations = accommodations.length;
  
  // High Risk = Trust Score < 50 (Unsafe)
  const highRiskCount = accommodations.filter(acc => {
    const score = acc.trustScore ?? 100; // Default to 100 if no score
    return score < 50;
  }).length;
  
  // Risky/Caution = Trust Score 50-79
  const riskyCount = accommodations.filter(acc => {
    const score = acc.trustScore ?? 100;
    return score >= 50 && score < 80;
  }).length;
  
  // Safe = Trust Score >= 80
  const safeCount = accommodations.filter(acc => {
    const score = acc.trustScore ?? 100;
    return score >= 80;
  }).length;
  
  // User's contribution count
  const userImpactCount = reports.filter(r => {
    const reportUserId = typeof r.user === 'string' ? r.user : r.user?._id;
    return reportUserId === currentUserId;
  }).length;

  // Get accommodations that need attention (Unsafe or Caution)
  const safetyAlerts = accommodations
    .filter(acc => {
      const score = acc.trustScore ?? 100;
      return score < 80; // Show Caution and Unsafe
    })
    .sort((a, b) => (a.trustScore ?? 100) - (b.trustScore ?? 100)) // Sort by worst first
    .slice(0, 5);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Loading your safety dashboard...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
        <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiAlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{error}</h2>
        <p className="text-gray-600 mb-6">We couldn't load your dashboard data. Please check your connection and try again.</p>
        <button 
          onClick={fetchData}
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header Section */}
      <div className="bg-slate-900 text-white pt-12 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue-900/20">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <h1 className="text-3xl font-bold">Welcome back, {user?.name}! 👋</h1>
                <p className="text-blue-200 mt-1 flex items-center gap-2">
                  <FiCheckCircle className="text-green-400" />
                  {userImpactCount > 0 
                    ? `You've filed ${userImpactCount} safety report${userImpactCount > 1 ? 's' : ''}`
                    : 'Start contributing to student safety'
                  }
                </p>
              </div>
            </div>
            <Link
              to="/report"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-bold rounded-xl hover:from-yellow-300 hover:to-orange-400 transition-all shadow-lg shadow-orange-900/20"
            >
              <FiPlus className="h-5 w-5" />
              🚨 Report an Issue
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards - Overlapping the header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Accommodations */}
          <div className="bg-white p-6 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 group hover:border-blue-200 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <FiShield className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Total</span>
            </div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Accommodations</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">{totalAccommodations}</p>
          </div>
          
          {/* High Risk (Unsafe) - Trust Score < 50 */}
          <div className="bg-white p-6 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 group hover:border-red-200 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-50 rounded-xl text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all">
                <FiAlertTriangle className="h-6 w-6" />
              </div>
              {highRiskCount > 0 ? (
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">Urgent</span>
              ) : (
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">All Clear</span>
              )}
            </div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">High Risk (&lt;50)</p>
            <p className={`text-3xl font-extrabold mt-1 ${highRiskCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {highRiskCount}
            </p>
          </div>

          {/* Caution - Trust Score 50-79 */}
          <div className="bg-white p-6 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 group hover:border-yellow-200 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-50 rounded-xl text-yellow-600 group-hover:bg-yellow-600 group-hover:text-white transition-all">
                <FiAlertCircle className="h-6 w-6" />
              </div>
              {riskyCount > 0 ? (
                <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">Caution</span>
              ) : (
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">None</span>
              )}
            </div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Caution (50-79)</p>
            <p className={`text-3xl font-extrabold mt-1 ${riskyCount > 0 ? 'text-yellow-600' : 'text-gray-900'}`}>
              {riskyCount}
            </p>
          </div>

          {/* Safe - Trust Score >= 80 */}
          <div className="bg-white p-6 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 group hover:border-green-200 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-xl text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all">
                <FiCheckCircle className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">Safe</span>
            </div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Safe (80+)</p>
            <p className="text-3xl font-extrabold text-green-600 mt-1">{safeCount}</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Quick Actions & Activity */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Quick Navigation Card */}
            <Link to="/my-reports" className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-gray-100 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <FiList className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">My Safety Contributions</h3>
                <p className="text-sm text-gray-500">
                  {userImpactCount > 0 
                    ? `You have ${userImpactCount} report${userImpactCount > 1 ? 's' : ''} - track their status`
                    : 'Track your reported issues and their status'
                  }
                </p>
              </div>
              <FiArrowRight className="ml-auto text-gray-300 group-hover:text-indigo-500 transition-colors" />
            </Link>

            {/* Recent Activity Feed */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FiActivity className="h-5 w-5 text-indigo-600" />
                  <h2 className="text-xl font-bold text-gray-900">Recent Safety Reports</h2>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-semibold">
                    {reports.length} total
                  </span>
                </div>
                <Link to="/accommodations" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  View All <FiArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="divide-y divide-gray-50">
                {reports.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiFileText className="h-8 w-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">No reports filed yet. Be the first to help!</p>
                    <Link 
                      to="/report" 
                      className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                    >
                      <FiPlus /> Report an Issue
                    </Link>
                  </div>
                ) : (
                  reports.slice(0, 5).map((report) => (
                    <div key={report._id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{report.accommodationName}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full border border-red-100">
                              {report.issueType}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <FiClock className="h-3 w-3" />
                              {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Today'}
                            </span>
                          </div>
                        </div>
                        {currentUserId && (
                          <UpvoteButton
                            reportId={report._id}
                            initialUpvotes={report.upvotes || 0}
                            initialHasUpvoted={(report.upvotedBy || []).includes(currentUserId)}
                            isOwnReport={
                              (typeof report.user === 'string' ? report.user : report.user?._id) === currentUserId
                            }
                          />
                        )}
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2 mt-3">{report.description}</p>
                    </div>
                  ))
                )}
              </div>
              {reports.length > 5 && (
                <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                  <Link to="/accommodations" className="text-sm font-bold text-blue-600 hover:text-blue-700">
                    View All {reports.length} Reports →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Alerts & Tips */}
          <div className="space-y-8">
            {/* Safety Alerts */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className={`p-6 text-white flex items-center justify-between ${
                safetyAlerts.length > 0 ? 'bg-red-600' : 'bg-green-600'
              }`}>
                <div className="flex items-center gap-2">
                  {safetyAlerts.length > 0 ? (
                    <FiAlertTriangle className="h-5 w-5 animate-pulse" />
                  ) : (
                    <FiCheckCircle className="h-5 w-5" />
                  )}
                  <h2 className="font-bold">
                    {safetyAlerts.length > 0 ? 'Properties Need Attention' : 'All Properties Safe!'}
                  </h2>
                </div>
                {safetyAlerts.length > 0 && (
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-semibold">
                    {safetyAlerts.length}
                  </span>
                )}
              </div>
              <div className="p-2 divide-y divide-gray-50">
                {safetyAlerts.length > 0 ? (
                  safetyAlerts.map(accommodation => {
                    const score = accommodation.trustScore ?? 100;
                    const isUnsafe = score < 50;
                    
                    return (
                      <Link 
                        to={`/accommodations/${accommodation._id}`} 
                        key={accommodation._id} 
                        className={`flex items-center gap-4 p-4 transition-all rounded-xl group ${
                          isUnsafe ? 'hover:bg-red-50' : 'hover:bg-yellow-50'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                          isUnsafe 
                            ? 'bg-red-100 text-red-600 group-hover:bg-red-600 group-hover:text-white' 
                            : 'bg-yellow-100 text-yellow-600 group-hover:bg-yellow-600 group-hover:text-white'
                        }`}>
                          <FiTrendingUp className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-gray-900 truncate">{accommodation.name}</h3>
                          <p className="text-xs text-gray-500 truncate">{accommodation.location}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="h-1.5 flex-grow bg-gray-100 rounded-full overflow-hidden max-w-[100px]">
                              <div 
                                className={`h-full ${isUnsafe ? 'bg-red-500' : 'bg-yellow-500'}`}
                                style={{ width: `${score}%` }}
                              ></div>
                            </div>
                            <span className={`text-[10px] font-bold whitespace-nowrap ${
                              isUnsafe ? 'text-red-600' : 'text-yellow-600'
                            }`}>
                              Score: {score}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <div className="p-8 text-center">
                    <FiCheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
                    <p className="text-gray-600 font-medium">All accommodations have good safety ratings!</p>
                    <p className="text-xs text-gray-400 mt-1">Trust scores are 80 or above</p>
                  </div>
                )}
              </div>
            </div>

            {/* Safety Tips Card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <FiShield className="h-12 w-12 text-blue-200/40 mb-4" />
              <h3 className="text-xl font-bold mb-2">Safety Pro Tip</h3>
              <p className="text-blue-100 text-sm leading-relaxed mb-6">
                Always check the water quality and electrical wiring before moving into a new PG. If you spot an issue, report it here to help others.
              </p>
              <Link 
                to="/report" 
                className="inline-flex items-center text-sm font-bold text-yellow-400 hover:text-yellow-300"
              >
                File a Report <FiArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {/* Your Impact Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiActivity className="text-blue-600" /> Your Impact
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Reports Filed</span>
                  <span className="font-bold text-gray-900">{userImpactCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Platform Reports</span>
                  <span className="font-bold text-blue-600">{reports.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Safe Properties</span>
                  <span className="font-bold text-green-600">{safeCount} / {totalAccommodations}</span>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Your Status</span>
                    <span className={`font-bold px-3 py-1 rounded-full text-xs ${
                      userImpactCount >= 5 
                        ? 'bg-yellow-100 text-yellow-700' 
                        : userImpactCount >= 2 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-gray-100 text-gray-700'
                    }`}>
                      {userImpactCount >= 5 ? '🏆 Champion' : userImpactCount >= 2 ? '⭐ Contributor' : '🌱 Getting Started'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};