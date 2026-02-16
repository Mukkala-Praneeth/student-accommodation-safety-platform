import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAccommodation } from '../contexts/AccommodationContext';
import { FiAlertTriangle, FiShield, FiFileText, FiMap, FiTrendingUp, FiClock } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import UpvoteButton from '../components/UpvoteButton';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { accommodations } = useAccommodation();
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'alerts'>('overview');
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>('');

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

  const fetchReports = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/reports");
      const data = await res.json();
      if (data.success) {
        setReports(data.data);
      } else {
        setError("Failed to load reports");
      }
    } catch (err) {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) return <h2 className="text-center mt-10 text-xl font-semibold">Loading reports...</h2>;
  if (error) return <h2 className="text-center mt-10 text-xl font-semibold text-red-600">{error}</h2>;
  


  // Get recent reports from state
  const recentReports = reports.slice(0, 5);

  // Get safety alerts
  const safetyAlerts = accommodations
    .filter(acc => acc.safetyClassification !== 'Safe')
    .sort((a, b) => b.riskScore - a.riskScore);

  // Get user's role-based stats
  const totalAccommodations = accommodations.length;
  const highRiskCount = accommodations.filter(acc => acc.safetyClassification === 'High Risk').length;
  const riskyCount = accommodations.filter(acc => acc.safetyClassification === 'Risky').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600 mt-2">Your student accommodation safety dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <FiShield className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Accommodations</p>
              <p className="text-2xl font-bold text-gray-900">{totalAccommodations}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full">
              <FiAlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">High Risk</p>
              <p className="text-2xl font-bold text-gray-900">{highRiskCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <FiAlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Risky</p>
              <p className="text-2xl font-bold text-gray-900">{riskyCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <FiFileText className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Recent Reports</p>
              <p className="text-2xl font-bold text-gray-900">{recentReports.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/report"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiFileText className="mr-2" />
            Report Safety Issue
          </Link>
          <Link
            to="/accommodations"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiMap className="mr-2" />
            View All Accommodations
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Safety Reports</h2>
          <div className="space-y-4">
            {reports.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No reports yet</p>
            ) : (
              reports.map((report) => (
                <div key={report._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <h3 className="font-medium text-gray-900">{report.accommodationName}</h3>
                  <p className="text-sm text-gray-600 mt-1">Issue: {report.issueType}</p>
                  <p className="text-sm text-gray-600">Description: {report.description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500">
                      Date: {new Date(report.createdAt).toLocaleString()}
                    </p>
                    {currentUserId && (
                      <UpvoteButton
                        reportId={report._id}
                        initialUpvotes={report.upvotes || 0}
                        initialHasUpvoted={(report.upvotedBy || []).includes(currentUserId)}
                        isOwnReport={(report.user === currentUserId) || (report.user?._id === currentUserId)}
                      />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Safety Alerts</h2>
          <div className="space-y-4">
            {safetyAlerts.slice(0, 5).map(accommodation => (
              <div key={accommodation.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{accommodation.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{accommodation.location}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    accommodation.safetyClassification === 'High Risk' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {accommodation.safetyClassification}
                  </span>
                </div>
                <div className="mt-2">
                  <div className="flex items-center">
                    <FiTrendingUp className="h-4 w-4 text-red-600 mr-1" />
                    <span className="text-sm text-gray-600">Risk Score: {accommodation.riskScore}</span>
                  </div>
                </div>
              </div>
            ))}
            {safetyAlerts.length === 0 && (
              <p className="text-gray-500 text-center py-4">No safety alerts</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};