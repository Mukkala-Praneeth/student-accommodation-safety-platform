import React from 'react';
import { Link } from 'react-router-dom';
import { FiShield, FiAlertTriangle, FiMap, FiFileText, FiUsers } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

export const Home: React.FC = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: <FiShield className="h-8 w-8 text-blue-600" />,
      title: "Verified Safety Reports",
      description: "Anonymous but verified reporting system ensures authenticity while protecting privacy."
    },
    {
      icon: <FiAlertTriangle className="h-8 w-8 text-red-600" />,
      title: "Real-time Risk Assessment",
      description: "Dynamic safety classification updates based on incident reports and severity."
    },
    {
      icon: <FiMap className="h-8 w-8 text-green-600" />,
      title: "Map-based Visualization",
      description: "View accommodations on interactive maps with color-coded safety indicators."
    },
    {
      icon: <FiFileText className="h-8 w-8 text-purple-600" />,
      title: "Evidence Documentation",
      description: "Upload photos and documents as evidence to support your safety reports."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Student Accommodation
            <span className="text-blue-600 block">Safety Platform</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Report safety issues, view verified accommodation ratings, and ensure a safe living environment for students everywhere.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Get Started
                </Link>
                <Link
                  to="/accommodations"
                  className="inline-flex items-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  View Accommodations
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our platform empowers students to report safety concerns while maintaining their privacy and ensuring report authenticity.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600">10K+</div>
            <div className="text-gray-600">Students Protected</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">500+</div>
            <div className="text-gray-600">Accommodations Rated</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-red-600">2K+</div>
            <div className="text-gray-600">Safety Reports</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600">95%</div>
            <div className="text-gray-600">Resolution Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};