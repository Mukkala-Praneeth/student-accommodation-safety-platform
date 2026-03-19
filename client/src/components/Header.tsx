import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiLogIn, FiLogOut, FiUser, FiHome, FiList, FiAlertTriangle, 
  FiShield, FiBell, FiChevronDown, FiMenu, FiX, FiActivity,
  FiCheckCircle, FiThumbsUp, FiAlertCircle, FiInfo
} from 'react-icons/fi';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Sample notifications - In production, fetch from API
  const [notifications] = useState([
    {
      id: 1,
      type: 'success',
      title: 'Report Approved',
      message: 'Your water quality report was verified',
      time: '2 hours ago',
      read: false
    },
    {
      id: 2,
      type: 'info',
      title: 'New Confirmation',
      message: 'Someone confirmed your safety report',
      time: '5 hours ago',
      read: false
    },
    {
      id: 3,
      type: 'warning',
      title: 'Safety Alert',
      message: 'New report filed in your area',
      time: '1 day ago',
      read: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setIsNotificationsOpen(false);
    setIsProfileOpen(false);
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsProfileOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="text-green-600" />;
      case 'info':
        return <FiThumbsUp className="text-blue-600" />;
      case 'warning':
        return <FiAlertCircle className="text-yellow-600" />;
      default:
        return <FiInfo className="text-gray-600" />;
    }
  };

  const getNotificationBg = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100';
      case 'info':
        return 'bg-blue-100';
      case 'warning':
        return 'bg-yellow-100';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2 rounded-xl shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
                <FiShield className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-black tracking-tighter text-slate-900 uppercase">
                Safe<span className="text-blue-600">Stay</span>
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link 
              to="/" 
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${isActive('/') ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
            >
              Home
            </Link>
            <Link 
              to="/accommodations" 
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${isActive('/accommodations') ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
            >
              Explore
            </Link>

            {/* Auth-specific links */}
            {user?.role === 'student' && (
              <>
                <Link 
                  to="/dashboard" 
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${isActive('/dashboard') ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/report" 
                  className="ml-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                >
                  <FiAlertTriangle /> Report Issue
                </Link>
              </>
            )}

            {user?.role === 'owner' && (
              <Link 
                to="/owner/dashboard" 
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${isActive('/owner/dashboard') ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
              >
                Owner Panel
              </Link>
            )}

            {user?.role === 'admin' && (
              <Link 
                to="/admin" 
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${isActive('/admin') ? 'text-red-600 bg-red-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
              >
                Moderation
              </Link>
            )}
          </nav>

          {/* Right Section: Notifications & Profile */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                {/* Notification Bell */}
                <div className="relative" ref={notificationRef}>
                  <button 
                    onClick={() => {
                      setIsNotificationsOpen(!isNotificationsOpen);
                      setIsProfileOpen(false);
                    }}
                    className={`p-2.5 rounded-xl transition-all relative ${
                      isNotificationsOpen 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <FiBell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                      {/* Header */}
                      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-slate-900">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-semibold">
                            {unreadCount} New
                          </span>
                        )}
                      </div>
                      
                      {/* Notification List */}
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <div 
                              key={notification.id}
                              className={`p-4 border-b border-slate-50 cursor-pointer transition-colors hover:bg-slate-50 ${
                                !notification.read ? 'bg-blue-50/30' : ''
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationBg(notification.type)}`}>
                                  {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                                    {!notification.read && (
                                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{notification.message}</p>
                                  <p className="text-xs text-slate-400 mt-1">{notification.time}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                              <FiBell className="text-slate-400" />
                            </div>
                            <p className="text-sm text-slate-500">No notifications yet</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Footer */}
                      {notifications.length > 0 && (
                        <div className="p-3 bg-slate-50 border-t border-slate-100">
                          <button 
                            onClick={() => {
                              setIsNotificationsOpen(false);
                              // Navigate to notifications page if you have one
                              // navigate('/notifications');
                            }}
                            className="w-full text-center text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            View All Notifications
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button 
                    onClick={() => {
                      setIsProfileOpen(!isProfileOpen);
                      setIsNotificationsOpen(false);
                    }}
                    className="flex items-center gap-2 p-1.5 pl-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition-all"
                  >
                    <div className="flex flex-col items-end hidden sm:flex">
                      <span className="text-xs font-black text-slate-900 leading-none">{user.name.split(' ')[0]}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{user.role}</span>
                    </div>
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-blue-100">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <FiChevronDown className={`text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl shadow-slate-200 border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                      <div className="px-4 py-3 border-b border-slate-50">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Signed in as</p>
                        <p className="text-sm font-black text-slate-900 truncate">{user.email}</p>
                      </div>
                      <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all" onClick={() => setIsProfileOpen(false)}>
                        <FiUser className="text-slate-400" /> My Profile
                      </Link>
                      {user.role === 'student' && (
                        <Link to="/my-reports" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all" onClick={() => setIsProfileOpen(false)}>
                          <FiActivity className="text-slate-400" /> My Contributions
                        </Link>
                      )}
                      <div className="border-t border-slate-50 mt-2 pt-2">
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-all"
                        >
                          <FiLogOut /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-5 py-2.5 text-slate-600 font-bold text-sm hover:text-slate-900 transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-slate-200 transition-all"
                >
                  Join Now
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2.5 bg-slate-50 text-slate-600 rounded-xl"
            >
              {isMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-50 px-4 py-6 space-y-2 animate-in slide-in-from-top-4 duration-300">
          <Link to="/" className="block px-4 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link to="/accommodations" className="block px-4 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>Explore</Link>
          
          {user ? (
            <>
              <div className="h-px bg-slate-50 my-4"></div>
              {user.role === 'student' && (
                <>
                  <Link to="/dashboard" className="block px-4 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                  <Link to="/report" className="block px-4 py-3 rounded-xl font-bold text-red-600 hover:bg-red-50" onClick={() => setIsMenuOpen(false)}>Report Issue</Link>
                </>
              )}
              {user.role === 'owner' && (
                <Link to="/owner/dashboard" className="block px-4 py-3 rounded-xl font-bold text-emerald-600 hover:bg-emerald-50" onClick={() => setIsMenuOpen(false)}>Owner Dashboard</Link>
              )}
              {user.role === 'admin' && (
                <Link to="/admin" className="block px-4 py-3 rounded-xl font-bold text-red-600 hover:bg-red-50" onClick={() => setIsMenuOpen(false)}>Admin Panel</Link>
              )}
              <Link to="/profile" className="block px-4 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-50" onClick={() => setIsMenuOpen(false)}>My Profile</Link>
              <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl font-bold text-red-600 hover:bg-red-50 transition-all">Logout</button>
            </>
          ) : (
            <div className="pt-4 flex flex-col gap-2">
              <Link to="/login" className="block w-full text-center py-3 rounded-xl font-bold text-slate-600 border border-slate-200" onClick={() => setIsMenuOpen(false)}>Login</Link>
              <Link to="/register" className="block w-full text-center py-3 rounded-xl font-bold text-white bg-blue-600 shadow-lg shadow-blue-100" onClick={() => setIsMenuOpen(false)}>Join Now</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};