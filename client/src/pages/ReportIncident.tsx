import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiAlertTriangle, FiHome, FiDroplet, FiUser, FiSearch } from 'react-icons/fi';
import { ImageUpload } from '../components/ImageUpload';

interface Image {
  url: string;
  publicId: string;
}

interface Accommodation {
  _id: string;
  name: string;
  address: string;
  city: string;
  type?: string;
}

export const ReportIncident: React.FC = () => {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    accommodation: '',
    issueType: 'Security' as 'Food Safety' | 'Water Quality' | 'Hygiene' | 'Security' | 'Infrastructure',
    description: '',
  });
  
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [accommodationsLoading, setAccommodationsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadedImages, setUploadedImages] = useState<Image[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetchAccommodations();
  }, []);

  const fetchAccommodations = async () => {
    try {
      const response = await fetch(`${API}/api/accommodations/dropdown`);
      const data = await response.json();
      if (data.success) {
        setAccommodations(data.data);
      }
    } catch (error) {
      console.error('Error fetching accommodations:', error);
    } finally {
      setAccommodationsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.accommodation) {
      alert("Please select an accommodation");
      return;
    }

    if (!formData.description.trim()) {
      alert("Please provide a description");
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
        body: JSON.stringify({ 
          accommodation: formData.accommodation,
          issueType: formData.issueType,
          description: formData.description,
          images: uploadedImages 
        }),
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

  const filteredAccommodations = accommodations.filter(acc =>
    acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              {/* Accommodation Selection Dropdown */}
              <div>
                <label htmlFor="accommodation" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Accommodation <span className="text-red-500">*</span>
                </label>
                
                {accommodationsLoading ? (
                  <div className="w-full p-3 border border-gray-300 rounded-md bg-gray-50">
                    <div className="animate-pulse flex items-center">
                      <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                    </div>
                  </div>
                ) : accommodations.length === 0 ? (
                  <div className="w-full p-4 border-2 border-amber-200 bg-amber-50 rounded-md">
                    <p className="text-amber-700 font-medium mb-1">⚠️ No accommodations registered yet</p>
                    <p className="text-amber-600 text-sm">
                      Accommodation owners must register their properties first before you can file a report.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Search Input */}
                    {accommodations.length > 5 && (
                      <div className="relative mb-2">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search accommodations..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    )}
                    
                    {/* Dropdown */}
                    <select
                      id="accommodation"
                      name="accommodation"
                      value={formData.accommodation}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">-- Select an accommodation --</option>
                      {(searchTerm ? filteredAccommodations : accommodations).map((acc) => (
                        <option key={acc._id} value={acc._id}>
                          {acc.name} - {acc.address}, {acc.city}
                          {acc.type ? ` (${acc.type})` : ''}
                        </option>
                      ))}
                    </select>
                    
                    {searchTerm && filteredAccommodations.length === 0 && (
                      <p className="text-sm text-gray-500 mt-1">No accommodations match your search</p>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Can't find the accommodation? Contact the owner to register their property first.
                    </p>
                  </>
                )}
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Incident Category <span className="text-red-500">*</span>
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
                  Description <span className="text-red-500">*</span>
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
                  disabled={isSubmitting || accommodations.length === 0}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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