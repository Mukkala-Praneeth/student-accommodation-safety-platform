import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiUser, FiMail, FiLock, FiArrowRight, FiShield, FiHome, FiCheck, FiAlertCircle } from 'react-icons/fi';

export default function OwnerRegister() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    propertyName: '',
    propertyCount: '1-2'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuth();
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    
    try {
      // Use the correct endpoint from your README
      const response = await fetch(`${API}/api/auth/register-owner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          propertyName: formData.propertyName,
          propertyCount: formData.propertyCount,
          role: 'owner'  // Explicitly set role
        }),
      });
      
      const data = await response.json();
      
      console.log('Registration response:', data);
      
      if (response.ok && data.success) {
        // Store token and user
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Update auth context
        await login(formData.email.trim().toLowerCase(), formData.password);
        
        // Redirect to owner dashboard
        window.location.href = '/owner/dashboard';
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Connection error. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10">
        
        {/* Left Side: Benefits Sidebar */}
        <div className="md:w-5/12 bg-slate-900 p-8 lg:p-12 flex flex-col justify-between text-white border-r border-white/5">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 mb-12 group">
              <div className="bg-emerald-500 p-2 rounded-xl">
                <FiShield className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-black tracking-tighter">SAFE<span className="text-emerald-500">STAY</span></span>
            </Link>
            
            <h1 className="text-3xl lg:text-4xl font-extrabold mb-8 leading-tight">
              Start Building <span className="text-emerald-500">Tenant Trust.</span>
            </h1>

            <div className="space-y-8">
              {[
                { title: "Public Accountability", desc: "Respond to student concerns publicly and show your commitment." },
                { title: "Boost Your Rating", desc: "Resolve issues quickly to improve your property's safety score." },
                { title: "Competitive Edge", desc: "Stand out from unverified competitors with a verified profile." },
                { title: "Quality Tenants", desc: "Attract safety-conscious tenants who value transparency." }
              ].map((benefit, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mt-1">
                    <FiCheck className="h-3 w-3 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100">{benefit.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
            <p className="text-sm font-medium text-emerald-400 italic">
              "Since joining SafeStay, my property's trust rating increased by 40%, and my vacancy rate dropped significantly."
            </p>
            <p className="text-xs font-bold text-slate-300 mt-3">— Sarah J., Property Manager</p>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="md:w-7/12 p-8 lg:p-12 bg-white flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-8 text-center md:text-left">
              <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Register Your Property</h2>
              <p className="text-slate-500 font-medium">Join the platform trusted by 10,000+ students</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                <FiAlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-bold text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2 ml-1">Full Name</label>
                  <div className="relative group">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      name="name"
                      type="text"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all font-semibold text-sm"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2 ml-1">Work Email</label>
                  <div className="relative group">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      name="email"
                      type="email"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all font-semibold text-sm"
                      placeholder="john@company.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2 ml-1">Main Property Name</label>
                  <div className="relative group">
                    <FiHome className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      name="propertyName"
                      type="text"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all font-semibold text-sm"
                      placeholder="Evergreen Apartments"
                      value={formData.propertyName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2 ml-1">Properties Managed</label>
                  <select
                    name="propertyCount"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all font-semibold text-sm appearance-none cursor-pointer"
                    value={formData.propertyCount}
                    onChange={handleChange}
                  >
                    <option value="1-2">1-2 Properties</option>
                    <option value="3-5">3-5 Properties</option>
                    <option value="5-10">5-10 Properties</option>
                    <option value="10+">10+ Properties</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2 ml-1">Password</label>
                  <div className="relative group">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      name="password"
                      type="password"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all font-semibold text-sm"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2 ml-1">Confirm Password</label>
                  <div className="relative group">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      name="confirmPassword"
                      type="password"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all font-semibold text-sm"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      minLength={6}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg shadow-xl shadow-emerald-200 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Start Building Trust <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-slate-500 font-medium">
                Already have an account?{' '}
                <Link to="/owner/login" className="text-emerald-600 font-bold hover:underline">
                  Sign in
                </Link>
              </p>
              <p className="mt-4 text-slate-500 text-sm">
                Are you a student?{' '}
                <Link to="/register" className="text-blue-600 font-semibold hover:underline">
                  Register here
                </Link>
              </p>
              <p className="mt-6 text-[10px] text-slate-400 leading-relaxed font-bold uppercase tracking-widest">
                By registering, you agree to our Terms of Service and Privacy Policy regarding property ownership verification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}