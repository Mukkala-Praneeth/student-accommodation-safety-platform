import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiMapPin, FiShield, FiAlertTriangle, FiTrendingUp } from 'react-icons/fi';
import AccommodationMap from '../components/AccommodationMap';
import TrustScoreBadge from '../components/TrustScoreBadge';

export const AccommodationList: React.FC = () => {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [accommodations, setAccommodations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassification, setSelectedClassification] = useState<string>('all');
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    fetchAccommodations();
  }, []);

  const fetchAccommodations = async () => {
    try {
      const response = await fetch(`${API}/api/accommodations`);
      const data = await response.json();
      if (data.success) {
        setAccommodations(data.data);
      } else {
        setError('Failed to load accommodations');
      }
    } catch {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  // Filter accommodations based on search and classification
  const filteredAccommodations = (accommodations || []).filter(acc => {
    const matchesSearch = !searchTerm || 
      acc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.city?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClassification = selectedClassification === 'all' || 
                                 acc.trustScoreLabel === selectedClassification;
    return matchesSearch && matchesClassification;
  });

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'Safe':
        return 'bg-green-100 text-green-800';
      case 'Caution':
      case 'Risky':
        return 'bg-yellow-100 text-yellow-800';
      case 'Unsafe':
      case 'High Risk':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Student Accommodations</h1>
        <p className="text-gray-600">Browse and search for student accommodations with verified safety ratings.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-8 flex justify-between items-center">
          <span>{error}</span>
          <button 
            onClick={() => { setError(""); setLoading(true); fetchAccommodations(); }}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, address or city..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <label htmlFor="classification" className="text-sm font-medium text-gray-700">Filter by:</label>
            <select
              id="classification"
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedClassification}
              onChange={(e) => setSelectedClassification(e.target.value)}
            >
              <option value="all">All Classifications</option>
              <option value="Safe">Safe</option>
              <option value="Caution">Caution</option>
              <option value="Unsafe">Unsafe</option>
            </select>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="mb-8">
        <button
          onClick={() => setShowMap(!showMap)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
        >
          🗺️ {showMap ? 'Hide Map' : 'View Accommodation Map'}
        </button>
        {showMap && (
          <div className="mt-4">
            <AccommodationMap />
          </div>
        )}
      </div>

      {/* Accommodation List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAccommodations.map(accommodation => (
          <Link 
            key={accommodation._id} 
            to={`/accommodations/${accommodation._id}`}
            className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-semibold text-gray-900">{accommodation.name}</h3>
                  <TrustScoreBadge score={accommodation.trustScore ?? 100} size="sm" />
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${getClassificationColor(accommodation.trustScoreLabel)}`}>
                  {accommodation.trustScoreLabel}
                </span>
              </div>
              <div className="flex items-center text-gray-600 mb-3">
                <FiMapPin className="h-4 w-4 mr-1" />
                <span className="text-sm truncate">{accommodation.address}, {accommodation.city}</span>
              </div>
              <div className="flex items-center text-gray-600 mb-3">
                <FiTrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm">Risk Score: {accommodation.riskScore}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FiShield className="h-4 w-4 mr-1" />
                <span className="text-sm">{accommodation.totalReports || 0} safety reports</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredAccommodations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No accommodations found.</p>
          <p className="text-gray-400 mt-2">Accommodation owners can add properties from their dashboard.</p>
        </div>
      )}
    </div>
  );
};