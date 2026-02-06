import React from 'react';
import { useAccommodation } from '../contexts/AccommodationContext';
import { FiAlertTriangle, FiShield, FiUser, FiFileText, FiClock } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

export const AdminPanel: React.FC = () => {
  const { accommodations } = useAccommodation();

  // Get all reports across all accommodations
  const allReports = accommodations.flatMap(acc => 
    acc.reports.map(report => ({ ...report, accommodationName: acc.name }))
  );

  // Get high-risk accommodations
  const highRiskAccommodations = accommodations.filter(acc => acc.safetyClassification === 'High Risk');
  
  // Get reports under review
  const reportsUnderReview = allReports.filter(report => report.status === 'under_review');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600">Monitor and manage safety reports and accommodations</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full">
              <FiAlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">High Risk Accommodations</p>
              <p className="text-2xl font-bold text-gray-900">{highRiskAccommodations.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <FiClock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Reports Under Review</p>
              <p className="text-2xl font-bold text-gray-900">{reportsUnderReview.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <FiFileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{allReports.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <FiShield className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Accommodations</p>
              <p className="text-2xl font-bold text-gray-900">{accommodations.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* High Risk Accommodations */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">High Risk Accommodations</h2>
        {highRiskAccommodations.length > 0 ? (
          <div className="space-y-4">
            {highRiskAccommodations.map(acc => (
              <div key={acc.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{acc.name}</h3>
                    <p className="text-sm text-gray-600">{acc.location}</p>
                    <p className="text-sm text-gray-600 mt-1">Risk Score: {acc.riskScore}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                      High Risk
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      {acc.reports.length} reports
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No high-risk accommodations found.</p>
        )}
      </div>

      {/* Reports Under Review */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Reports Under Review</h2>
        {reportsUnderReview.length > 0 ? (
          <div className="space-y-4">
            {reportsUnderReview.map(report => (
              <div key={report.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{report.accommodationName}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded mr-2">
                        {report.category}
                      </span>
                      {report.description.substring(0, 100)}...
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Reported by: {report.userName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(report.timestamp))} ago
                    </p>
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded mt-1 inline-block">
                      Under Review
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No reports under review.</p>
        )}
      </div>

      {/* All Recent Reports */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">All Recent Reports</h2>
        {allReports.length > 0 ? (
          <div className="space-y-4">
            {allReports.slice(0, 10).map(report => (
              <div key={report.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{report.accommodationName}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded mr-2 ${
                        report.category === 'Security' ? 'bg-red-100 text-red-800' :
                        report.category === 'Infrastructure' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {report.category}
                      </span>
                      {report.description.substring(0, 100)}...
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Reported by: {report.userName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(report.timestamp))} ago
                    </p>
                    <span className={`px-2 py-1 text-xs font-medium rounded mt-1 inline-block ${
                      report.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {report.status === 'under_review' ? 'Under Review' : 'Active'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No reports found.</p>
        )}
      </div>
    </div>
  );
};