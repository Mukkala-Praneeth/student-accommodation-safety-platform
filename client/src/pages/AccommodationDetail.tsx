import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAccommodation } from '../contexts/AccommodationContext';
import { useAuth } from '../contexts/AuthContext';
import { FiMapPin, FiShield, FiAlertTriangle, FiFileText, FiUpload, FiClock } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

export const AccommodationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { accommodations, addCounterEvidence, updateAccommodationStatus } = useAccommodation();
  const { user } = useAuth();
  const [counterEvidence, setCounterEvidence] = useState('');
  const [showCounterEvidenceForm, setShowCounterEvidenceForm] = useState(false);

  const accommodation = accommodations.find(acc => acc.id === id);
  
  if (!accommodation) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <FiAlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Accommodation not found</p>
          <button
            onClick={() => navigate('/accommodations')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

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

  const handleAddCounterEvidence = () => {
    if (counterEvidence.trim()) {
      addCounterEvidence(accommodation.id, counterEvidence);
      setCounterEvidence('');
      setShowCounterEvidenceForm(false);
    }
  };

  const handleDisputeReport = () => {
    updateAccommodationStatus(accommodation.id, 'under_review');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/accommodations')}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          ← Back to Accommodations
        </button>
      </div>

      {/* Accommodation Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{accommodation.name}</h1>
            <div className="flex items-center text-gray-600 mt-2">
              <FiMapPin className="h-4 w-4 mr-1" />
              <span>{accommodation.location}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className={`px-3 py-1 text-sm font-medium rounded ${getClassificationColor(accommodation.safetyClassification)}`}>
              {accommodation.safetyClassification}
            </span>
            <div className="flex items-center text-gray-600">
              <FiShield className="h-4 w-4 mr-1" />
              <span>Risk Score: {accommodation.riskScore}</span>
            </div>
          </div>
        </div>

        {/* Safety Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-gray-900">{accommodation.reports.length}</div>
            <div className="text-sm text-gray-600">Total Reports</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-red-600">
              {accommodation.reports.filter(r => r.category === 'Security').length}
            </div>
            <div className="text-sm text-gray-600">Security Issues</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-orange-600">
              {accommodation.reports.filter(r => r.category === 'Infrastructure').length}
            </div>
            <div className="text-sm text-gray-600">Infrastructure</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-yellow-600">
              {accommodation.reports.filter(r => ['Food', 'Water', 'Hygiene'].includes(r.category)).length}
            </div>
            <div className="text-sm text-gray-600">Health & Hygiene</div>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Safety Reports</h2>
          {user && (
            <Link
              to="/report"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <FiFileText className="mr-2" />
              Report Issue
            </Link>
          )}
        </div>
        <div className="space-y-4">
          {accommodation.reports.map(report => (
            <div key={report.id} className="border-b border-gray-200 pb-4 last:border-b-0">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded mr-2">
                    {report.category}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(report.timestamp))} ago
                  </span>
                </div>
                {report.status === 'under_review' && (
                  <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                    Under Review
                  </span>
                )}
              </div>
              <p className="text-gray-700">{report.description}</p>
              <p className="text-sm text-gray-600 mt-2">Reported by: {report.userName}</p>
            </div>
          ))}
          {accommodation.reports.length === 0 && (
            <p className="text-gray-500 text-center py-4">No safety reports yet.</p>
          )}
        </div>
      </div>

      {/* Owner Actions */}
      {user?.role === 'owner' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Owner Actions</h2>
          <div className="space-y-4">
            {accommodation.counterEvidence && (
              <div className="bg-blue-50 p-4 rounded">
                <h3 className="font-medium text-blue-900 mb-2">Counter Evidence Provided</h3>
                <p className="text-blue-800">{accommodation.counterEvidence}</p>
              </div>
            )}
            
            {!showCounterEvidenceForm ? (
              <button
                onClick={() => setShowCounterEvidenceForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <FiUpload className="mr-2" />
                Add Counter Evidence
              </button>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={counterEvidence}
                  onChange={(e) => setCounterEvidence(e.target.value)}
                  placeholder="Provide your counter evidence or response to the complaints..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={4}
                />
                <div className="flex space-x-3">
                  <button
                    onClick={handleAddCounterEvidence}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    Submit Evidence
                  </button>
                  <button
                    onClick={() => setShowCounterEvidenceForm(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleDisputeReport}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
            >
              <FiAlertTriangle className="mr-2" />
              Dispute Reports
            </button>
          </div>
        </div>
      )}
    </div>
  );
};