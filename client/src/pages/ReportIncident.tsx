import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccommodation } from '../contexts/AccommodationContext';
import { useAuth } from '../contexts/AuthContext';
import { FiUpload, FiAlertTriangle, FiHome, FiDroplet, FiUser } from 'react-icons/fi';

export const ReportIncident: React.FC = () => {
  const navigate = useNavigate();
  const { accommodations, addReport } = useAccommodation();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    accommodationId: '',
    category: 'Security' as 'Food' | 'Water' | 'Hygiene' | 'Security' | 'Infrastructure',
    description: '',
    imageUrl: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // In a real app, this would upload to a server
      // For demo, we'll just store the filename
      setFormData(prev => ({ ...prev, imageUrl: file.name }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.accommodationId || !formData.description.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addReport(formData.accommodationId, {
        accommodationId: formData.accommodationId,
        category: formData.category,
        description: formData.description,
        imageUrl: formData.imageUrl || undefined,
        status: 'active'
      });
      
      setSubmitSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error submitting report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Report Safety Issue</h1>
        
        {submitSuccess ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Report Submitted Successfully!</h2>
            <p className="text-gray-600">Your safety report has been recorded. Thank you for helping keep students safe.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Accommodation Selection */}
              <div>
                <label htmlFor="accommodationId" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Accommodation
                </label>
                <select
                  id="accommodationId"
                  name="accommodationId"
                  value={formData.accommodationId}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose an accommodation</option>
                  {accommodations.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} - {acc.location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Selection */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Incident Category
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {(['Security', 'Infrastructure', 'Water', 'Food', 'Hygiene'] as const).map(category => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, category }))}
                      className={`p-3 border rounded-md flex flex-col items-center space-y-2 transition-colors ${
                        formData.category === category
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-300 hover:border-gray-400 text-gray-700'
                      }`}
                    >
                      {category === 'Security' && <FiAlertTriangle className="h-5 w-5" />}
                      {category === 'Infrastructure' && <FiHome className="h-5 w-5" />}
                      {category === 'Water' && <FiDroplet className="h-5 w-5" />}
                      {category === 'Food' && <FiUser className="h-5 w-5" />}
                      {category === 'Hygiene' && <FiUser className="h-5 w-5" />}
                      <span className="text-sm font-medium">{category}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={6}
                  placeholder="Please provide a detailed description of the safety issue..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Evidence Upload */}
              <div>
                <label htmlFor="evidence" className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Evidence (Optional)
                </label>
                <div className="flex items-center">
                  <label className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                    <FiUpload className="mr-2" />
                    <span>Choose File</span>
                    <input
                      type="file"
                      id="evidence"
                      name="evidence"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {formData.imageUrl && (
                    <span className="ml-3 text-sm text-gray-600">{formData.imageUrl}</span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Upload photos or documents that support your report. Files will be securely stored.
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    'Submit Report'
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};