import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiAlertTriangle, FiHome, FiDroplet, FiUser } from 'react-icons/fi';
import { ImageUpload } from '../components/ImageUpload';

interface Image {
  url: string;
  publicId: string;
}

export const ReportIncident: React.FC = () => {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    accommodationName: '',
    issueType: 'Security' as 'Food Safety' | 'Water Quality' | 'Hygiene' | 'Security' | 'Infrastructure',
    description: '',
  });
  
  const [uploadedImages, setUploadedImages] = useState<Image[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.accommodationName || !formData.description.trim()) {
      alert("Please fill in all fields");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const res = await fetch(`${API}/api/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ ...formData, images: uploadedImages }),
      });

      const data = await res.json();

      if (data.success) {
        setSubmitSuccess(true);
        setUploadedImages([]);
        setTimeout(() => {
          navigate('/my-reports');
        }, 2000);
      } else {
        alert(data.message || "Failed to submit report");
      }
    } catch (error) {
      alert("Error submitting report");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryMap: { [key: string]: string } = {
    'Security': 'Security',
    'Infrastructure': 'Infrastructure', 
    'Water': 'Water Quality',
    'Food': 'Food Safety',
    'Hygiene': 'Hygiene'
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
            <p className="text-gray-600">Your safety report has been recorded. Redirecting to My Reports...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Accommodation Name Input */}
              <div>
                <label htmlFor="accommodationName" className="block text-sm font-medium text-gray-700 mb-2">
                  Accommodation Name
                </label>
                <input
                  type="text"
                  id="accommodationName"
                  name="accommodationName"
                  value={formData.accommodationName}
                  onChange={handleInputChange}
                  placeholder="Enter accommodation name (e.g., Sunrise PG, XYZ Hostel)"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Incident Category
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {(['Security', 'Infrastructure', 'Water', 'Food', 'Hygiene'] as const).map(category => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, issueType: categoryMap[category] as any }))}
                      className={`p-3 border rounded-md flex flex-col items-center space-y-2 transition-colors ${
                        formData.issueType === categoryMap[category]
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
                  maxLength={2000}
                  placeholder="Please provide a detailed description of the safety issue..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className={`text-xs mt-1 text-right ${
                formData.description.length > 1800
                 ? formData.description.length > 2000
                   ? 'text-red-600 font-bold'
                   : 'text-yellow-600'
                 : 'text-gray-400'
                }`}>
                 {formData.description.length}/2000 characters
                </p>
              </div>

              {/* Image Upload */}
              <ImageUpload 
                onImagesChange={setUploadedImages} 
                uploadedImages={uploadedImages}
              />

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