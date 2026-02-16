import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ProfileData {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  totalReports: number;
  totalUpvotes: number;
}

export default function Profile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [nameLoading, setNameLoading] = useState(false);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');

  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${API}/api/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setProfile(data.data);
        setNewName(data.data.name);
      } else {
        setError(data.message || 'Failed to load profile');
      }
    } catch {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleNameUpdate = async () => {
    if (!newName.trim() || newName.trim() === profile?.name) {
      setEditingName(false);
      return;
    }

    const token = localStorage.getItem('token');
    setNameLoading(true);

    try {
      const response = await fetch(`${API}/api/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newName.trim() })
      });

      const data = await response.json();

      if (data.success) {
        setProfile(prev => prev ? { ...prev, name: data.data.name } : null);
        setEditingName(false);
      } else {
        alert(data.message || 'Failed to update name');
      }
    } catch {
      alert('Error updating name');
    } finally {
      setNameLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage('');

    if (newPassword !== confirmPassword) {
      setPasswordMessage('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage('Password must be at least 6 characters');
      return;
    }

    const token = localStorage.getItem('token');
    setPasswordLoading(true);

    try {
      const response = await fetch(`${API}/api/profile/password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();

      if (data.success) {
        setPasswordMessage('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setShowPasswordForm(false);
          setPasswordMessage('');
        }, 2000);
      } else {
        setPasswordMessage(data.message || 'Failed to change password');
      }
    } catch {
      setPasswordMessage('Error changing password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const styles: { [key: string]: string } = {
      student: 'bg-blue-100 text-blue-800',
      owner: 'bg-purple-100 text-purple-800',
      admin: 'bg-red-100 text-red-800'
    };
    return styles[role] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          <p className="font-bold">Error</p>
          <p>{error || 'Could not load profile'}</p>
          <button onClick={fetchProfile} className="mt-3 text-sm font-semibold underline">Try again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-lg"
                  autoFocus
                />
                <button
                  onClick={handleNameUpdate}
                  disabled={nameLoading}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-blue-400"
                >
                  {nameLoading ? '...' : 'Save'}
                </button>
                <button
                  onClick={() => { setEditingName(false); setNewName(profile.name); }}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
                <button
                  onClick={() => setEditingName(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  ✏️ Edit
                </button>
              </div>
            )}
            <span className={`inline-block mt-1 text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wide ${getRoleBadge(profile.role)}`}>
              {profile.role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Email</p>
            <p className="text-gray-800 font-medium">{profile.email}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Member Since</p>
            <p className="text-gray-800 font-medium">
              {new Date(profile.createdAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Activity Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-xl p-5 text-center">
            <p className="text-3xl font-bold text-blue-700">{profile.totalReports}</p>
            <p className="text-sm text-blue-600 font-medium mt-1">Reports Submitted</p>
          </div>
          <div className="bg-green-50 rounded-xl p-5 text-center">
            <p className="text-3xl font-bold text-green-700">{profile.totalUpvotes}</p>
            <p className="text-sm text-green-600 font-medium mt-1">Upvotes Received</p>
          </div>
        </div>
      </div>

      {/* Password Change Card */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Security</h3>
          {!showPasswordForm && (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              🔒 Change Password
            </button>
          )}
        </div>

        {showPasswordForm && (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
                minLength={6}
              />
            </div>

            {passwordMessage && (
              <p className={`text-sm font-medium ${
                passwordMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'
              }`}>
                {passwordMessage}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={passwordLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-colors disabled:bg-blue-400"
              >
                {passwordLoading ? 'Changing...' : 'Change Password'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setPasswordMessage('');
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}