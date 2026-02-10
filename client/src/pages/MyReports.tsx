import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Report {
  _id: string;
  accommodationName: string;
  issueType: string;
  description: string;
  createdAt: string;
}

export default function MyReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [editFormData, setEditFormData] = useState({
    accommodationName: '',
    issueType: '',
    description: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyReports();
  }, []);

  const fetchMyReports = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('Please login to view your reports');
      setLoading(false);
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/reports/my-reports', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setReports(data.data);
      } else {
        setError(data.message || 'Failed to fetch reports');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (report: Report) => {
    setEditingReport(report);
    setEditFormData({
      accommodationName: report.accommodationName,
      issueType: report.issueType,
      description: report.description
    });
  };

  const handleCancelEdit = () => {
    setEditingReport(null);
    setEditFormData({
      accommodationName: '',
      issueType: '',
      description: ''
    });
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingReport) return;

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`http://localhost:5000/api/reports/${editingReport._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editFormData)
      });

      const data = await response.json();

      if (data.success) {
        alert('Report updated successfully!');
        setEditingReport(null);
        fetchMyReports(); // Refresh the list
      } else {
        alert(data.message || 'Failed to update report');
      }
    } catch (err) {
      alert('Error updating report');
      console.error(err);
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`http://localhost:5000/api/reports/${reportId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        alert('Report deleted successfully!');
        fetchMyReports(); // Refresh the list
      } else {
        alert(data.message || 'Failed to delete report');
      }
    } catch (err) {
      alert('Error deleting report');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading your reports...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="my-reports-header">
        <h1>My Safety Reports</h1>
        <p className="subtitle">Total Reports: {reports.length}</p>
      </div>

      {/* Edit Modal */}
      {editingReport && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Report</h2>
            <form onSubmit={handleUpdateSubmit}>
              <div className="form-group">
                <label>Accommodation Name</label>
                <input
                  type="text"
                  value={editFormData.accommodationName}
                  onChange={(e) => setEditFormData({...editFormData, accommodationName: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Issue Type</label>
                <select
                  value={editFormData.issueType}
                  onChange={(e) => setEditFormData({...editFormData, issueType: e.target.value})}
                  required
                >
                  <option value="Food Safety">Food Safety</option>
                  <option value="Water Quality">Water Quality</option>
                  <option value="Hygiene">Hygiene</option>
                  <option value="Security">Security</option>
                  <option value="Infrastructure">Infrastructure</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                  rows={4}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Save Changes</button>
                <button type="button" onClick={handleCancelEdit} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {reports.length === 0 ? (
        <div className="empty-state">
          <p>You haven't submitted any reports yet.</p>
          <button 
            onClick={() => navigate('/report')}
            className="btn-primary"
          >
            Submit Your First Report
          </button>
        </div>
      ) : (
        <div className="reports-grid">
          {reports.map((report) => (
            <div key={report._id} className="report-card my-report-card">
              <div className="report-header">
                <h3>{report.accommodationName}</h3>
                <span className={`badge ${getIssueBadgeClass(report.issueType)}`}>
                  {report.issueType}
                </span>
              </div>
              
              <div className="report-body">
                <p className="description">{report.description}</p>
              </div>

              <div className="report-footer">
                <span className="date">
                  📅 {new Date(report.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <span className="time">
                  🕒 {new Date(report.createdAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              <div className="report-actions">
                <button 
                  className="btn-secondary btn-sm"
                  onClick={() => handleEdit(report)}
                >
                  Edit
                </button>
                <button 
                  className="btn-danger btn-sm"
                  onClick={() => handleDelete(report._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getIssueBadgeClass(issueType: string): string {
  const classes: { [key: string]: string } = {
    'Food Safety': 'badge-danger',
    'Water Quality': 'badge-warning',
    'Hygiene': 'badge-info',
    'Security': 'badge-danger',
    'Infrastructure': 'badge-warning'
  };
  return classes[issueType] || 'badge-default';
}
