import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImageGallery } from '../components/ImageGallery';
import { ImageUpload } from '../components/ImageUpload';
import ErrorBoundary from '../components/ErrorBoundary';
import ReportCard from '../components/ReportCard';


interface Image {
  url: string;
  publicId?: string;
}

interface Report {
  _id: string;
  accommodationName: string;
  issueType: string;
  description: string;
  images?: Image[];
  createdAt: string;
  upvotes?: number;
  upvotedBy?: string[];
  user?: string;
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
  const [editImages, setEditImages] = useState<{url: string; publicId: string}[]>([]);
  const [editLoading, setEditLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.user?.id || payload.id || payload.userId || '');
      }
    } catch {
      setCurrentUserId('');
    }
  }, []);

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

    setEditImages((report.images || []).map(img => ({
      url: img.url,
      publicId: img.publicId || img.url
    })));
  };

  const handleCancelEdit = () => {
    setEditingReport(null);
    setEditFormData({
      accommodationName: '',
      issueType: '',
      description: ''
    });
    setEditImages([]);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingReport) return;

    const token = localStorage.getItem('token');
    setEditLoading(true);

    // Filter out any invalid images instead of blocking submission
    const validImages = editImages.filter(img => img.url && img.publicId);

    // Preserve existing images
    const imagesToSend = editImages.length > 0 ? editImages : (editingReport.images || []);

    try {
      const response = await fetch(`http://localhost:5000/api/reports/${editingReport._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...editFormData,
          images: imagesToSend
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Report updated successfully!');
        setEditingReport(null);
        setEditImages([]);
        fetchMyReports(); // Refresh the list
      } else {
        alert(data.message || 'Failed to update report');
      }
    } catch (err) {
      alert('Error updating report');
      console.error(err);
    } finally {
      setEditLoading(false);
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
              <div className="form-group">
                <label>Evidence Photos</label>
                {editImages && editImages.length > 0 && (
                  <div style={{marginBottom: '15px'}}>
                    <label style={{display: 'block', marginBottom: '8px', fontWeight: '600'}}>
                      Current Images:
                    </label>
                    <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                      {editImages.map((img, index) => (
                        <div key={index} style={{position: 'relative', width: '100px', height: '100px'}}>
                          <img
                            src={img.url}
                            alt={'Report image ' + (index + 1)}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              border: '1px solid #e5e7eb'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setEditImages(prev => prev.filter((_, i) => i !== index))}
                            style={{
                              position: 'absolute',
                              top: '-8px',
                              right: '-8px',
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '22px',
                              height: '22px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                            }}
                          >✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <ImageUpload
                  uploadedImages={editImages}
                  onImagesChange={setEditImages}
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary" disabled={editLoading}>
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
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
            <ReportCard
              key={report._id}
              report={report}
              onEdit={handleEdit}
              onDelete={handleDelete}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
