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

interface Resolution {
  description: string;
  actionTaken: string;
  images: Array<{ url: string; publicId?: string }>;
  resolvedBy?: { name: string } | string;
  resolvedAt?: string;
}

interface Verification {
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  feedback?: string;
  isDisputed: boolean;
  disputeReason?: string;
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
  resolution?: Resolution;
  verification?: Verification;
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
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
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
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
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
      const res = await fetch(`${API}/api/admin/stats`, {
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
      const res = await fetch(`${API}/api/admin/reports`, {
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
      const res = await fetch(`${API}/api/admin/users`, {
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
      const res = await fetch(`${API}/api/admin/counter-reports`, {
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
      const res = await fetch(`${API}/api/admin/reports/${reportId}/status`, {
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
      const res = await fetch(`${API}/api/admin/reports/${reportId}`, {
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
      const res = await fetch(`${API}/api/admin/users/${userId}/ban`, {
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
      const res = await fetch(`${API}/api/admin/counter-reports/${counterId}`, {
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

  // NEW: Reopen disputed report for owner to resolve again
  const handleReopenReport = async (reportId: string) => {
    if (!window.confirm('Reopen this report for the owner to resolve again?')) return;

    try {
      const res = await fetch(`${API}/api/admin/reports/${reportId}/reopen`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (data.success) {
        alert('Report reopened! Owner can now submit a new resolution.');
        fetchReports();
        fetchStats();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error reopening report');
    }
  };

  // Get status badge class with new statuses
  const getStatusBadgeClass = (status: string): string => {
    const classes: { [key: string]: string } = {
      'pending': 'status-pending',
      'approved': 'status-approved',
      'rejected': 'status-rejected',
      'resolved': 'status-resolved',
      'verified': 'status-verified',
      'disputed': 'status-disputed'
    };
    return classes[status] || 'status-pending';
  };

  // Get status display text
  const getStatusDisplayText = (status: string): string => {
    const texts: { [key: string]: string } = {
      'pending': '⏳ Pending',
      'approved': '✅ Approved',
      'rejected': '❌ Rejected',
      'resolved': '🔧 Resolved (Awaiting Verification)',
      'verified': '✅ Verified & Closed',
      'disputed': '⚠️ Disputed'
    };
    return texts[status] || status;
  };

  // Filter reports by status
  const filteredReports = statusFilter === 'all' 
    ? reports 
    : reports.filter(r => r.status === statusFilter);

  // Count reports by status
  const getStatusCount = (status: string): number => {
    return reports.filter(r => r.status === status).length;
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
        <p>Manage reports, users, and resolutions</p>
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
        <button
          className={`admin-tab ${activeTab === 'counterReports' ? 'active' : ''}`}
          onClick={() => setActiveTab('counterReports')}
        >
          Counter Reports ({adminCounterReports.filter(c => c.status === 'pending').length})
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
            <div className="stat-card resolved">
              <div className="stat-info">
                <h3>{getStatusCount('resolved')}</h3>
                <p>Resolved</p>
              </div>
            </div>
            <div className="stat-card verified">
              <div className="stat-info">
                <h3>{getStatusCount('verified')}</h3>
                <p>Verified</p>
              </div>
            </div>
            <div className="stat-card disputed">
              <div className="stat-info">
                <h3>{getStatusCount('disputed')}</h3>
                <p>Disputed</p>
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
          {/* Status Filter */}
          <div className="reports-filter" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button 
              className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
              style={{ 
                padding: '0.5rem 1rem', 
                borderRadius: '0.5rem', 
                border: statusFilter === 'all' ? '2px solid #3b82f6' : '1px solid #d1d5db',
                background: statusFilter === 'all' ? '#eff6ff' : '#fff',
                cursor: 'pointer'
              }}
            >
              All ({reports.length})
            </button>
            {['pending', 'approved', 'resolved', 'verified', 'disputed', 'rejected'].map(status => (
              <button 
                key={status}
                className={`filter-btn ${statusFilter === status ? 'active' : ''}`}
                onClick={() => setStatusFilter(status)}
                style={{ 
                  padding: '0.5rem 1rem', 
                  borderRadius: '0.5rem', 
                  border: statusFilter === status ? '2px solid #3b82f6' : '1px solid #d1d5db',
                  background: statusFilter === status ? '#eff6ff' : '#fff',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {status} ({getStatusCount(status)})
              </button>
            ))}
          </div>

          {/* Reports List - Card View for better details */}
          <div className="reports-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredReports.length === 0 ? (
              <div className="empty-state" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                <p>No reports found for this filter.</p>
              </div>
            ) : (
              filteredReports.map((report) => (
                <div 
                  key={report._id} 
                  className={`report-card status-${report.status}`}
                  style={{ 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '0.75rem', 
                    padding: '1rem',
                    background: '#fff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                >
                  {/* Report Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                        {report.accommodationName}
                      </h3>
                      <span style={{ 
                        display: 'inline-block',
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '0.25rem', 
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        background: '#fee2e2',
                        color: '#991b1b'
                      }}>
                        {report.issueType}
                      </span>
                    </div>
                    <span 
                      className={`status-badge ${getStatusBadgeClass(report.status)}`}
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        background: 
                          report.status === 'pending' ? '#fef3c7' :
                          report.status === 'approved' ? '#dbeafe' :
                          report.status === 'resolved' ? '#fef9c3' :
                          report.status === 'verified' ? '#d1fae5' :
                          report.status === 'disputed' ? '#fee2e2' :
                          '#fee2e2',
                        color:
                          report.status === 'pending' ? '#92400e' :
                          report.status === 'approved' ? '#1e40af' :
                          report.status === 'resolved' ? '#854d0e' :
                          report.status === 'verified' ? '#065f46' :
                          report.status === 'disputed' ? '#991b1b' :
                          '#991b1b'
                      }}
                    >
                      {getStatusDisplayText(report.status)}
                    </span>
                  </div>

                  {/* Report Meta */}
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                    <span>👤 {report.user?.name || 'Anonymous'}</span>
                    <span style={{ margin: '0 0.5rem' }}>•</span>
                    <span>📅 {new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Report Description */}
                  <p style={{ 
                    color: '#374151', 
                    marginBottom: '0.75rem',
                    lineHeight: '1.5'
                  }}>
                    {report.description}
                  </p>

                  {/* Report Images */}
                  {report.images && report.images.length > 0 && (
                    <div style={{ marginBottom: '0.75rem' }}>
                      <ImageGallery images={report.images} />
                    </div>
                  )}

                  {/* Resolution Section - Show if report has resolution */}
                  {report.resolution && report.resolution.actionTaken && (
                    <div style={{ 
                      background: '#eff6ff', 
                      border: '1px solid #bfdbfe',
                      borderRadius: '0.5rem', 
                      padding: '0.75rem',
                      marginBottom: '0.75rem'
                    }}>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e40af', margin: '0 0 0.5rem 0' }}>
                        🔧 Owner's Resolution
                      </h4>
                      <p style={{ fontSize: '0.875rem', margin: '0 0 0.25rem 0' }}>
                        <strong>Action Taken:</strong> {report.resolution.actionTaken}
                      </p>
                      <p style={{ fontSize: '0.875rem', color: '#374151', margin: '0 0 0.5rem 0' }}>
                        {report.resolution.description}
                      </p>
                      {report.resolution.resolvedAt && (
                        <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0' }}>
                          Resolved on: {new Date(report.resolution.resolvedAt).toLocaleDateString()}
                        </p>
                      )}
                      {report.resolution.images && report.resolution.images.length > 0 && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <p style={{ fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.25rem' }}>Proof Images:</p>
                          <ImageGallery images={report.resolution.images} />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Verification Section - Show student feedback or dispute */}
                  {report.status === 'verified' && report.verification && (
                    <div style={{ 
                      background: '#d1fae5', 
                      border: '1px solid #6ee7b7',
                      borderRadius: '0.5rem', 
                      padding: '0.75rem',
                      marginBottom: '0.75rem'
                    }}>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#065f46', margin: '0 0 0.5rem 0' }}>
                        ✅ Student Verified
                      </h4>
                      {report.verification.feedback && (
                        <p style={{ fontSize: '0.875rem', color: '#047857', margin: '0', fontStyle: 'italic' }}>
                          "{report.verification.feedback}"
                        </p>
                      )}
                      {report.verification.verifiedAt && (
                        <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                          Verified on: {new Date(report.verification.verifiedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Disputed Section - Show dispute reason and reopen button */}
                  {report.status === 'disputed' && report.verification && (
                    <div style={{ 
                      background: '#fee2e2', 
                      border: '1px solid #fca5a5',
                      borderRadius: '0.5rem', 
                      padding: '0.75rem',
                      marginBottom: '0.75rem'
                    }}>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#991b1b', margin: '0 0 0.5rem 0' }}>
                        ⚠️ Student Disputed Resolution
                      </h4>
                      {report.verification.disputeReason && (
                        <p style={{ fontSize: '0.875rem', color: '#b91c1c', margin: '0', fontStyle: 'italic' }}>
                          "{report.verification.disputeReason}"
                        </p>
                      )}
                      {report.verification.verifiedAt && (
                        <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                          Disputed on: {new Date(report.verification.verifiedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #e5e7eb' }}>
                    {/* Pending: Approve/Reject */}
                    {report.status === 'pending' && (
                      <>
                        <button 
                          className="btn-approve" 
                          onClick={() => updateReportStatus(report._id, 'approved')}
                          style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '0.375rem',
                            border: 'none',
                            background: '#22c55e',
                            color: '#fff',
                            fontWeight: '500',
                            cursor: 'pointer'
                          }}
                        >
                          ✅ Approve
                        </button>
                        <button 
                          className="btn-reject" 
                          onClick={() => updateReportStatus(report._id, 'rejected')}
                          style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '0.375rem',
                            border: 'none',
                            background: '#ef4444',
                            color: '#fff',
                            fontWeight: '500',
                            cursor: 'pointer'
                          }}
                        >
                          ❌ Reject
                        </button>
                      </>
                    )}

                    {/* Disputed: Reopen for Owner */}
                    {report.status === 'disputed' && (
                      <button 
                        className="btn-reopen" 
                        onClick={() => handleReopenReport(report._id)}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '0.375rem',
                          border: 'none',
                          background: '#f59e0b',
                          color: '#fff',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        🔄 Reopen for Owner
                      </button>
                    )}

                    {/* Always show Delete */}
                    <button 
                      className="btn-delete" 
                      onClick={() => deleteReport(report._id)}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '0.375rem',
                        border: '1px solid #ef4444',
                        background: '#fff',
                        color: '#ef4444',
                        fontWeight: '500',
                        cursor: 'pointer',
                        marginLeft: 'auto'
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
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