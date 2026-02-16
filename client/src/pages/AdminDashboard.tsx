import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ImageGallery } from '../components/ImageGallery';

interface Stats {
  totalReports: number;
  pendingReports: number;
  approvedReports: number;
  rejectedReports: number;
  totalUsers: number;
  bannedUsers: number;
  issueStats: { _id: string; count: number }[];
}

interface Report {
  _id: string;
  accommodationName: string;
  issueType: string;
  description: string;
  images?: Array<{ url: string; publicId?: string }>;
  status: string;
  createdAt: string;
  user: { name: string; email: string } | null;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isBanned: boolean;
  createdAt: string;
}

export default function AdminDashboard() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = (queryParams.get('tab') as any) || 'overview';

  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'users' | 'counterReports'>(initialTab);
  const [stats, setStats] = useState<Stats | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [adminCounterReports, setAdminCounterReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { user, loading: authLoading } = useAuth();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!authLoading && user && user.role === 'admin') {
      fetchStats();
      fetchReports();
      fetchUsers();
      fetchAdminCounterReports();
    }
  }, [authLoading, user]);

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error fetching stats');
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/reports', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setReports(data.data);
      }
    } catch (err) {
      console.error('Error fetching reports');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (err) {
      console.error('Error fetching users');
    }
  };

  const fetchAdminCounterReports = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/counter-reports', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAdminCounterReports(data.data);
      }
    } catch (err) {
      console.error('Error fetching counter reports');
    }
  };

  const updateReportStatus = async (reportId: string, status: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/reports/${reportId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Report ${status} successfully!`);
        fetchReports();
        fetchStats();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error updating report');
    }
  };

  const deleteReport = async (reportId: string) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/reports/${reportId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert('Report deleted successfully!');
        fetchReports();
        fetchStats();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error deleting report');
    }
  };

  const toggleBanUser = async (userId: string, currentlyBanned: boolean) => {
    const action = currentlyBanned ? 'unban' : 'ban';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/ban`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isBanned: !currentlyBanned })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchUsers();
        fetchStats();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error updating user');
    }
  };

  const handleReviewCounter = async (counterId: string, status: string) => {
    const adminNotes = prompt(`Add notes (optional) for this ${status} decision:`);

    try {
      const res = await fetch(`http://localhost:5000/api/admin/counter-reports/${counterId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, adminNotes: adminNotes || '' })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Counter report ${status} successfully!`);
        fetchAdminCounterReports();
        fetchStats();
        fetchReports();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error reviewing counter report');
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading admin dashboard...</div>;
  }

  if (error) {
    return <div className="admin-error">{error}</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage reports and users</p>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`admin-tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Reports ({reports.length})
        </button>
        <button
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users ({users.length})
        </button>
      </div>

      {activeTab === 'overview' && stats && (
        <div className="admin-overview">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-info">
                <h3>{stats.totalReports}</h3>
                <p>Total Reports</p>
              </div>
            </div>
            <div className="stat-card pending">
              <div className="stat-info">
                <h3>{stats.pendingReports}</h3>
                <p>Pending</p>
              </div>
            </div>
            <div className="stat-card approved">
              <div className="stat-info">
                <h3>{stats.approvedReports}</h3>
                <p>Approved</p>
              </div>
            </div>
            <div className="stat-card rejected">
              <div className="stat-info">
                <h3>{stats.rejectedReports}</h3>
                <p>Rejected</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-info">
                <h3>{stats.totalUsers}</h3>
                <p>Total Users</p>
              </div>
            </div>
            <div className="stat-card banned">
              <div className="stat-info">
                <h3>{stats.bannedUsers}</h3>
                <p>Banned Users</p>
              </div>
            </div>
          </div>

          <div className="issue-stats">
            <h2>Reports by Issue Type</h2>
            <div className="issue-bars">
              {stats.issueStats.map((issue) => (
                <div key={issue._id} className="issue-bar">
                  <span className="issue-name">{issue._id}</span>
                  <div className="bar-container">
                    <div
                      className="bar-fill"
                      style={{ width: `${(issue.count / stats.totalReports) * 100}%` }}
                    ></div>
                  </div>
                  <span className="issue-count">{issue.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="admin-reports">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Accommodation</th>
                <th>Issue</th>
                <th>User</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report._id}>
                  <td>{report.accommodationName}</td>
                  <td>{report.issueType}</td>
                  <td>{report.user?.name || 'Unknown'}</td>
                  <td>
                    <span className={`status-badge status-${report.status}`}>
                      {report.status}
                    </span>
                  </td>
                  <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                  <td className="action-buttons">
                    {report.status === 'pending' && (
                      <>
                        <button className="btn-approve" onClick={() => updateReportStatus(report._id, 'approved')}>
                          Approve
                        </button>
                        <button className="btn-reject" onClick={() => updateReportStatus(report._id, 'rejected')}>
                          Reject
                        </button>
                      </>
                    )}
                    <button className="btn-delete" onClick={() => deleteReport(report._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="admin-users">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className={user.isBanned ? 'banned-row' : ''}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`status-badge ${user.isBanned ? 'status-banned' : 'status-active'}`}>
                      {user.isBanned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className={user.isBanned ? 'btn-unban' : 'btn-ban'}
                      onClick={() => toggleBanUser(user._id, user.isBanned)}
                    >
                      {user.isBanned ? 'Unban' : 'Ban'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'counterReports' && (
        <div className="admin-counter-reports">
          <h2>Review Counter Reports</h2>
          {adminCounterReports.length === 0 ? (
            <div className="empty-state">
              <p>No counter reports to review.</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Accommodation</th>
                  <th>Owner</th>
                  <th>Reason</th>
                  <th>Original Report</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {adminCounterReports.map((counter) => (
                  <tr key={counter._id}>
                    <td>{counter.accommodation?.name || 'N/A'}</td>
                    <td>{counter.owner?.name}<br/><small>{counter.owner?.email}</small></td>
                    <td>{counter.reason.replace(/_/g, ' ')}</td>
                    <td>
                      <div className="original-report-preview">
                        <strong>{counter.originalReport?.issueType}</strong>
                        <p>{counter.originalReport?.description?.substring(0, 50)}...</p>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge status-${counter.status}`}>
                        {counter.status}
                      </span>
                    </td>
                    <td>{new Date(counter.createdAt).toLocaleDateString()}</td>
                    <td className="action-buttons">
                      {counter.status === 'pending' && (
                        <>
                          <button
                            className="btn-approve"
                            onClick={() => handleReviewCounter(counter._id, 'accepted')}
                          >
                            Accept
                          </button>
                          <button
                            className="btn-reject"
                            onClick={() => handleReviewCounter(counter._id, 'rejected')}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {counter.status !== 'pending' && (
                        <span className="status-text">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
