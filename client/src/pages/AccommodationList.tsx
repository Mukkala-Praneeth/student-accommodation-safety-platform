import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccommodation } from '../contexts/AccommodationContext';
import { FiSearch, FiMapPin, FiShield, FiAlertTriangle, FiTrendingUp } from 'react-icons/fi';

export const AccommodationList: React.FC = () => {
  const { accommodations } = useAccommodation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassification, setSelectedClassification] = useState<string>('all');

  // Filter accommodations based on search and classification
  const filteredAccommodations = accommodations.filter(acc => {
    const matchesSearch = acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         acc.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClassification = selectedClassification === 'all' || 
                                 acc.safetyClassification === selectedClassification;
    return matchesSearch && matchesClassification;
  });

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'Safe':
        return 'bg-green-100 text-green-800';
      case 'Risky':
        return 'bg-yellow-100 text-yellow-800';
      case 'High Risk':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Student Accommodations</h1>
        <p className="text-gray-600">Browse and search for student accommodations with verified safety ratings.</p>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or location..."
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
              <option value="Risky">Risky</option>
              <option value="High Risk">High Risk</option>
            </select>
          </div>
        </div>
      </div>

      {/* Accommodation List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAccommodations.map(accommodation => (
          <Link 
            key={accommodation.id} 
            to={`/accommodations/${accommodation.id}`}
            className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{accommodation.name}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded ${getClassificationColor(accommodation.safetyClassification)}`}>
                  {accommodation.safetyClassification}
                </span>
              </div>
              <div className="flex items-center text-gray-600 mb-3">
                <FiMapPin className="h-4 w-4 mr-1" />
                <span className="text-sm">{accommodation.location}</span>
              </div>
              <div className="flex items-center text-gray-600 mb-3">
                <FiTrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm">Risk Score: {accommodation.riskScore}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FiShield className="h-4 w-4 mr-1" />
                <span className="text-sm">{accommodation.reports.length} safety reports</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredAccommodations.length === 0 && (
        <div className="text-center py-12">
          <FiAlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No accommodations found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};