import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiUpload, FiAlertTriangle, FiHome, FiDroplet, FiUser, FiSearch, 
  FiShield, FiCamera, FiCheckCircle, FiArrowRight, FiArrowLeft, FiInfo,
  FiMail, FiX
} from 'react-icons/fi';
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
  const { user, token } = useAuth();
  
  const [step, setStep] = useState(1);
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
  const [submitError, setSubmitError] = useState('');

  // ✅ Check if user is verified
  const isVerified = user?.isCollegeVerified || (user as any)?.isVerified;

  useEffect(() => {
    if (!user || !token) {
      navigate('/login');
      return;
    }

    if (user.role !== 'student') {
      navigate('/');
      return;
    }

    fetchAccommodations();
  }, [user, token, navigate]);

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
      setStep(1);
      return;
    }

    if (!formData.description.trim()) {
      alert("Please provide a description");
      setStep(2);
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      const res = await fetch(`${API}/api/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
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
        }, 2500);
      } else {
        // ✅ Handle verification required error
        if (data.requiresVerification) {
          setSubmitError(data.message);
          // Optionally redirect to verification page after 3 seconds
          setTimeout(() => {
            navigate('/verify-email');
          }, 3000);
        } else {
          setSubmitError(data.message || "Failed to submit report");
        }
      }
    } catch (error) {
      setSubmitError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { id: 'Food Safety', name: 'Food Safety', icon: <FiAlertTriangle />, desc: 'Unhygienic kitchen, food poisoning, pest issues', color: 'bg-orange-50 text-orange-600 border-orange-100' },
    { id: 'Water Quality', name: 'Water Quality', icon: <FiDroplet />, desc: 'Contaminated water, irregular supply, dirty tanks', color: 'bg-blue-50 text-blue-600 border-blue-100' },
    { id: 'Security', name: 'Security', icon: <FiShield />, desc: 'Broken locks, no CCTV, unauthorized access', color: 'bg-red-50 text-red-600 border-red-100' },
    { id: 'Hygiene', name: 'Hygiene', icon: <FiCheckCircle />, desc: 'Dirty bathrooms, garbage issues, pest infestation', color: 'bg-green-50 text-green-600 border-green-100' },
    { id: 'Infrastructure', name: 'Infrastructure', icon: <FiHome />, desc: 'Electrical hazards, broken furniture, leaks', color: 'bg-purple-50 text-purple-600 border-purple-100' },
  ];

  const filteredAccommodations = accommodations.filter(acc =>
    acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ NOT VERIFIED - Show verification required screen
  if (!isVerified) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 text-center">
            <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiShield className="text-yellow-600 text-3xl" />
            </div>
            
            <h1 className="text-3xl font-black text-slate-900 mb-4">
              Verification Required
            </h1>
            
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              To ensure authentic reviews and protect our community, only <strong>verified students</strong> can submit safety reports.
            </p>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 mb-8 text-left">
              <h3 className="font-bold text-yellow-800 mb-4 flex items-center gap-2">
                <FiInfo className="text-xl" /> Why verification matters:
              </h3>
              <ul className="text-yellow-700 space-y-2">
                <li className="flex items-start gap-2">
                  <FiCheckCircle className="mt-1 flex-shrink-0" />
                  <span>Prevents fake or malicious reports</span>
                </li>
                <li className="flex items-start gap-2">
                  <FiCheckCircle className="mt-1 flex-shrink-0" />
                  <span>Ensures reports come from real students</span>
                </li>
                <li className="flex items-start gap-2">
                  <FiCheckCircle className="mt-1 flex-shrink-0" />
                  <span>Builds trust in the platform</span>
                </li>
                <li className="flex items-start gap-2">
                  <FiCheckCircle className="mt-1 flex-shrink-0" />
                  <span>Protects accommodation providers from false claims</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-8 text-left">
              <p className="text-sm text-blue-700">
                <strong className="text-blue-900">Your account:</strong> {user?.email}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Status: <span className="font-bold text-red-600">Not Verified</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/verify-email')}
                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <FiMail /> Verify College Email
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="bg-slate-100 text-slate-700 px-8 py-4 rounded-xl font-bold hover:bg-slate-200 transition-all"
              >
                Go to Profile
              </button>
            </div>

            <p className="text-slate-400 text-sm mt-6">
              Already verified? Try refreshing the page or{' '}
              <button 
                onClick={() => window.location.reload()} 
                className="text-blue-600 hover:underline font-semibold"
              >
                click here to reload
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-slate-900 text-white pt-12 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/dashboard" className="inline-flex items-center text-blue-300 hover:text-white mb-6 transition-colors">
            <FiArrowLeft className="mr-2" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold">Report a Safety Concern</h1>
          <p className="text-blue-200 mt-2">Help make student housing safer by sharing your experience.</p>
          
          {/* ✅ Verified Badge */}
          <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/30 text-green-300 px-4 py-2 rounded-full text-sm font-bold mt-4">
            <FiCheckCircle /> Verified Student: {user?.collegeName || user?.email}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          
          {/* Step Indicator */}
          <div className="bg-gray-50/50 border-b border-gray-100 px-8 py-6">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {[
                { s: 1, label: "Place" },
                { s: 2, label: "Describe" },
                { s: 3, label: "Evidence" }
              ].map((item) => (
                <div key={item.s} className="flex flex-col items-center relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    step >= item.s ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step > item.s ? <FiCheckCircle className="h-5 w-5" /> : item.s}
                  </div>
                  <span className={`text-xs mt-2 font-bold uppercase tracking-wider ${
                    step >= item.s ? 'text-blue-600' : 'text-gray-400'
                  }`}>{item.label}</span>
                  {item.s < 3 && (
                    <div className={`absolute top-5 left-10 w-[calc(100vw/4)] md:w-32 h-0.5 -z-10 ${
                      step > item.s ? 'bg-blue-600' : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 sm:p-12">
            {/* ✅ Verification Error Alert */}
            {submitError && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-6 flex items-start gap-3">
                <FiAlertTriangle className="mt-0.5 flex-shrink-0 text-xl" />
                <div>
                  <p className="font-bold mb-1">Error submitting report</p>
                  <p className="text-sm">{submitError}</p>
                  {submitError.includes('verify') && (
                    <button
                      onClick={() => navigate('/verify-email')}
                      className="mt-3 text-sm bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition-all"
                    >
                      Verify Now →
                    </button>
                  )}
                </div>
                <button 
                  onClick={() => setSubmitError('')}
                  className="ml-auto text-red-600 hover:text-red-800"
                >
                  <FiX />
                </button>
              </div>
            )}

            {submitSuccess ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <FiCheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Report Submitted!</h2>
                <p className="text-gray-600 max-w-md mx-auto">
                  Your safety report has been recorded. Our moderators will review it shortly. Redirecting you...
                </p>
              </div>
            ) : (
              <div className="min-h-[400px] flex flex-col">
                
                {/* Step 1: Select Place & Category */}
                {step === 1 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">1</span>
                        Which property has the issue?
                      </h3>
                      
                      {accommodationsLoading ? (
                        <div className="h-12 w-full bg-gray-50 rounded-xl animate-pulse"></div>
                      ) : (
                        <div className="space-y-3">
                          <div className="relative">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search by location, name, or city..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                          </div>
                          <select
                            name="accommodation"
                            value={formData.accommodation}
                            onChange={handleInputChange}
                            className="w-full px-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
                          >
                            <option value="">-- Choose Accommodation --</option>
                            {(searchTerm ? filteredAccommodations : accommodations).map((acc) => (
                              <option key={acc._id} value={acc._id}>
                                {acc.name} - {acc.address}, {acc.city}
                              </option>
                            ))}
                          </select>
                          {accommodations.length === 0 && (
                            <p className="text-sm text-orange-600 font-medium bg-orange-50 p-4 rounded-xl border border-orange-100">
                              No accommodations registered yet. Know one? Tell owners to register!
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">2</span>
                        What kind of issue is it?
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, issueType: cat.id as any }))}
                            className={`p-5 rounded-2xl border-2 text-left transition-all hover:shadow-lg ${
                              formData.issueType === cat.id
                                ? `ring-2 ring-blue-500 ${cat.color}`
                                : 'border-gray-100 bg-white text-gray-700 hover:border-gray-200'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                              formData.issueType === cat.id ? 'bg-white shadow-sm' : 'bg-gray-50'
                            }`}>
                              {React.cloneElement(cat.icon as React.ReactElement, { className: 'h-6 w-6' })}
                            </div>
                            <h4 className="font-bold mb-1">{cat.name}</h4>
                            <p className="text-[11px] leading-tight opacity-70">{cat.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Description */}
                {step === 2 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">3</span>
                        Describe what happened (be specific - it helps!)
                      </h3>
                      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6 flex gap-3">
                        <FiInfo className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-700">
                          Your identity stays anonymous. Only <span className="font-bold text-blue-900">"Verified Resident"</span> is shown to others.
                        </p>
                      </div>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={8}
                        maxLength={2000}
                        placeholder="What happened? When did it occur? Have you spoken to the owner? Be as detailed as possible to help other students."
                        className="w-full p-6 bg-gray-50 border border-gray-200 rounded-3xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-gray-900"
                        required
                      />
                      <div className="flex justify-between mt-2 text-xs font-bold uppercase tracking-wider">
                        <span className="text-gray-400">Be objective and factual</span>
                        <span className={formData.description.length > 1800 ? 'text-red-500' : 'text-gray-400'}>
                          {formData.description.length}/2000
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Evidence */}
                {step === 3 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">4</span>
                        Add Evidence
                      </h3>
                      <div className="bg-green-50 border border-green-100 p-4 rounded-xl mb-6 flex gap-3">
                        <FiCamera className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-green-700">
                          <span className="font-bold text-green-900">📸 Photos increase report credibility by 3x.</span> Evidence helps owners resolve issues faster.
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 p-8 rounded-3xl border-2 border-dashed border-gray-200">
                        <ImageUpload 
                          onImagesChange={setUploadedImages} 
                          uploadedImages={uploadedImages}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="mt-auto pt-12 flex justify-between items-center">
                  {step > 1 ? (
                    <button
                      onClick={() => setStep(step - 1)}
                      className="px-6 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2"
                    >
                      <FiArrowLeft /> Back
                    </button>
                  ) : <div></div>}

                  {step < 3 ? (
                    <button
                      onClick={() => {
                        if (step === 1 && !formData.accommodation) {
                          alert("Please select an accommodation");
                          return;
                        }
                        setStep(step + 1);
                      }}
                      className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200"
                    >
                      Next Step <FiArrowRight />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-bold rounded-xl hover:from-yellow-300 hover:to-orange-400 transition-all flex items-center gap-2 shadow-lg shadow-orange-200 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </span>
                      ) : (
                        <>Submit Report <FiArrowRight /></>
                      )}
                    </button>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};