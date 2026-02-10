import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Stats {
  totalAccommodations: number;
  totalRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
  totalReports: number;
  pendingCounters: number;
}

interface Accommodation {
  _id: string;
  name: string;
  address: string;
  city: string;
  description: string;
  amenities: string[];
  totalRooms: number;
  occupiedRooms: number;
  pricePerMonth: number;
  contactPhone: string;
  isVerified: boolean;
  riskScore: number;
  createdAt: string;
}

interface Report {
  _id: string;
  accommodationName: string;
  issueType: string;
  description: string;
  status: string;
  isCountered: boolean;
  counterStatus: string;
  createdAt: string;
  user: { name: string; email: string } | null;
}

interface CounterReport {
  _id: string;
  reason: string;
  explanation: string;
  status: string;
  createdAt: string;
  originalReport: Report;
  accommodation: { name: string };
}

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'accommodations' | 'reports' | 'counters'>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [counterReports, setCounterReports] = useState<CounterReport[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const [newAccommodation, setNewAccommodation] = useState({
    name: '',
    address: '',
    city: '',
    description: '',
    amenities: '',
    totalRooms: 0,
    pricePerMonth: 0,
    contactPhone: ''
  });

  const [counterForm, setCounterForm] = useState({
    reason: 'false_information',
    explanation: '',
    evidenceDescription: ''
  });

  const token = localStorage.getItem('token');
  const { logout, user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/owner/login');
      return;
    }
    if (user.role !== 'owner') {
      navigate('/login');
      return;
    }
    fetchAll();
  }, [user]);

  const fetchAll = () => {
    fetchStats();
    fetchAccommodations();
    fetchReports();
    fetchCounterReports();
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/owner/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (err) {
      console.error('Error fetching stats');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccommodations = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/owner/accommodations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setAccommodations(data.data);
    } catch (err) {
      console.error('Error fetching accommodations');
    }
  };

  const fetchReports = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/owner/reports', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setReports(data.data);
    } catch (err) {
      console.error('Error fetching reports');
    }
  };

  const fetchCounterReports = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/owner/counter-reports', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setCounterReports(data.data);
    } catch (err) {
      console.error('Error fetching counter reports');
    }
  };

  const handleAddAccommodation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/owner/accommodations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newAccommodation,
          amenities: newAccommodation.amenities.split(',').map(a => a.trim()).filter(a => a)
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Accommodation added successfully!');
        setShowAddModal(false);
        setNewAccommodation({
          name: '', address: '', city: '', description: '',
          amenities: '', totalRooms: 0, pricePerMonth: 0, contactPhone: ''
        });
        fetchAll();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error adding accommodation');
    }
  };

  const handleUpdateOccupancy = async (accId: string, occupiedRooms: number) => {
    try {
      const res = await fetch(`http://localhost:5000/api/owner/accommodations/${accId}/occupancy`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ occupiedRooms })
      });
      const data = await res.json();
      if (data.success) {
        fetchAll();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error updating occupancy');
    }
  };

  const handleDeleteAccommodation = async (accId: string) => {
    if (!window.confirm('Are you sure you want to delete this accommodation?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/owner/accommodations/${accId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert('Accommodation deleted');
        fetchAll();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error deleting accommodation');
    }
  };

  const handleSubmitCounter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    try {
      const res = await fetch('http://localhost:5000/api/owner/counter-report', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reportId: selectedReport._id,
          ...counterForm
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Counter report submitted successfully!');
        setShowCounterModal(false);
        setSelectedReport(null);
        setCounterForm({ reason: 'false_information', explanation: '', evidenceDescription: '' });
        fetchAll();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error submitting counter report');
    }
  };
  if (loading) {
    return <div className="owner-loading">Loading dashboard...</div>;
  }

  return (
    <div className="owner-dashboard">
      <div className="owner-header">
        <div>
          <h1>Owner Dashboard</h1>
          <p>Manage your accommodations and respond to reports</p>
        </div>
      </div>

      <div className="owner-tabs">
        <button className={`owner-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          Overview
        </button>
        <button className={`owner-tab ${activeTab === 'accommodations' ? 'active' : ''}`} onClick={() => setActiveTab('accommodations')}>
          My Accommodations ({accommodations.length})
        </button>
        <button className={`owner-tab ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
          Reports ({reports.length})
        </button>
        <button className={`owner-tab ${activeTab === 'counters' ? 'active' : ''}`} onClick={() => setActiveTab('counters')}>
          Counter Reports ({counterReports.length})
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="owner-overview">
          <div className="owner-stats-grid">
            <div className="owner-stat-card">
              <h3>{stats.totalAccommodations}</h3>
              <p>Accommodations</p>
            </div>
            <div className="owner-stat-card">
              <h3>{stats.totalRooms}</h3>
              <p>Total Rooms</p>
            </div>
            <div className="owner-stat-card">
              <h3>{stats.occupiedRooms}</h3>
              <p>Occupied Rooms</p>
            </div>
            <div className="owner-stat-card highlight">
              <h3>{stats.occupancyRate}%</h3>
              <p>Occupancy Rate</p>
            </div>
            <div className="owner-stat-card warning">
              <h3>{stats.totalReports}</h3>
              <p>Total Reports</p>
            </div>
            <div className="owner-stat-card">
              <h3>{stats.pendingCounters}</h3>
              <p>Pending Counters</p>
            </div>
          </div>
        </div>
      )}

      {/* Accommodations Tab */}
      {activeTab === 'accommodations' && (
        <div className="owner-accommodations">
          <div className="section-header">
            <h2>My Accommodations</h2>
            <button onClick={() => setShowAddModal(true)} className="btn-add">+ Add Accommodation</button>
          </div>

          {accommodations.length === 0 ? (
            <div className="empty-state">
              <p>No accommodations added yet.</p>
              <button onClick={() => setShowAddModal(true)} className="btn-add">Add Your First Accommodation</button>
            </div>
          ) : (
            <div className="accommodations-grid">
              {accommodations.map(acc => (
                <div key={acc._id} className="accommodation-card">
                  <div className="acc-header">
                    <h3>{acc.name}</h3>
                    {acc.isVerified && <span className="verified-badge">✓ Verified</span>}
                  </div>
                  <p className="acc-location">{acc.address}, {acc.city}</p>
                  <p className="acc-description">{acc.description}</p>
                  
                  <div className="acc-stats">
                    <div className="acc-stat">
                      <span className="stat-label">Rooms:</span>
                      <span className="stat-value">{acc.occupiedRooms}/{acc.totalRooms}</span>
                    </div>
                    <div className="acc-stat">
                      <span className="stat-label">Price:</span>
                      <span className="stat-value">₹{acc.pricePerMonth}/mo</span>
                    </div>
                    <div className="acc-stat">
                      <span className="stat-label">Risk Score:</span>
                      <span className={`stat-value ${acc.riskScore > 50 ? 'high-risk' : 'low-risk'}`}>
                        {acc.riskScore}
                      </span>
                    </div>
                  </div>

                  {acc.amenities.length > 0 && (
                    <div className="acc-amenities">
                      {acc.amenities.map((amenity, i) => (
                        <span key={i} className="amenity-tag">{amenity}</span>
                      ))}
                    </div>
                  )}

                  <div className="acc-occupancy">
                    <label>Update Occupancy:</label>
                    <input
                      type="number"
                      min="0"
                      max={acc.totalRooms}
                      value={acc.occupiedRooms}
                      onChange={(e) => handleUpdateOccupancy(acc._id, parseInt(e.target.value))}
                    />
                    <span>/ {acc.totalRooms} rooms</span>
                  </div>

                  <div className="acc-actions">
                    <button onClick={() => handleDeleteAccommodation(acc._id)} className="btn-delete-small">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="owner-reports">
          <h2>Reports on Your Accommodations</h2>
          
          {reports.length === 0 ? (
            <div className="empty-state">
              <p>No reports on your accommodations. Great job!</p>
            </div>
          ) : (
            <div className="reports-list">
              {reports.map(report => (
                <div key={report._id} className={`report-item ${report.isCountered ? 'countered' : ''}`}>
                  <div className="report-header">
                    <h3>{report.accommodationName}</h3>
                    <div className="report-badges">
                      <span className="issue-badge">{report.issueType}</span>
                      <span className={`status-badge status-${report.status}`}>{report.status}</span>
                      {report.isCountered && (
                        <span className={`counter-badge counter-${report.counterStatus}`}>
                          Counter: {report.counterStatus}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="report-description">{report.description}</p>
                  <div className="report-meta">
                    <span>Reported by: {report.user?.name || 'Anonymous'}</span>
                    <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                  {!report.isCountered && report.status !== 'rejected' && (
                    <button
                      onClick={() => { setSelectedReport(report); setShowCounterModal(true); }}
                      className="btn-counter"
                    >
                      🛡️ Counter This Report
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Counter Reports Tab */}
      {activeTab === 'counters' && (
        <div className="owner-counters">
          <h2>Your Counter Reports</h2>
          
          {counterReports.length === 0 ? (
            <div className="empty-state">
              <p>No counter reports submitted yet.</p>
            </div>
          ) : (
            <div className="counters-list">
              {counterReports.map(counter => (
                <div key={counter._id} className={`counter-item status-${counter.status}`}>
                  <div className="counter-header">
                    <h3>{counter.accommodation?.name}</h3>
                    <span className={`status-badge status-${counter.status}`}>{counter.status}</span>
                  </div>
                  <p><strong>Reason:</strong> {counter.reason.replace(/_/g, ' ')}</p>
                  <p><strong>Explanation:</strong> {counter.explanation}</p>
                  <p className="counter-date">Submitted: {new Date(counter.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Accommodation Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            <h2>Add New Accommodation</h2>
            <form onSubmit={handleAddAccommodation}>
              <div className="form-row">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={newAccommodation.name}
                    onChange={(e) => setNewAccommodation({...newAccommodation, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={newAccommodation.city}
                    onChange={(e) => setNewAccommodation({...newAccommodation, city: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  value={newAccommodation.address}
                  onChange={(e) => setNewAccommodation({...newAccommodation, address: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newAccommodation.description}
                  onChange={(e) => setNewAccommodation({...newAccommodation, description: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Amenities (comma separated)</label>
                <input
                  type="text"
                  value={newAccommodation.amenities}
                  onChange={(e) => setNewAccommodation({...newAccommodation, amenities: e.target.value})}
                  placeholder="WiFi, AC, Laundry, Gym"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Total Rooms</label>
                  <input
                    type="number"
                    value={newAccommodation.totalRooms}
                    onChange={(e) => setNewAccommodation({...newAccommodation, totalRooms: parseInt(e.target.value)})}
                    required
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Price Per Month (₹)</label>
                  <input
                    type="number"
                    value={newAccommodation.pricePerMonth}
                    onChange={(e) => setNewAccommodation({...newAccommodation, pricePerMonth: parseInt(e.target.value)})}
                    required
                    min="0"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Contact Phone</label>
                <input
                  type="tel"
                  value={newAccommodation.contactPhone}
                  onChange={(e) => setNewAccommodation({...newAccommodation, contactPhone: e.target.value})}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Add Accommodation</button>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Counter Report Modal */}
      {showCounterModal && selectedReport && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Submit Counter Report</h2>
            <p className="counter-info">
              Countering report on <strong>{selectedReport.accommodationName}</strong> 
              regarding <strong>{selectedReport.issueType}</strong>
            </p>
            <form onSubmit={handleSubmitCounter}>
              <div className="form-group">
                <label>Reason for Counter</label>
                <select
                  value={counterForm.reason}
                  onChange={(e) => setCounterForm({...counterForm, reason: e.target.value})}
                  required
                >
                  <option value="false_information">False Information</option>
                  <option value="outdated_issue">Issue Already Resolved</option>
                  <option value="mistaken_identity">Wrong Accommodation</option>
                  <option value="resolved_issue">Issue Fixed After Report</option>
                  <option value="malicious_intent">Malicious/Fake Report</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Detailed Explanation</label>
                <textarea
                  value={counterForm.explanation}
                  onChange={(e) => setCounterForm({...counterForm, explanation: e.target.value})}
                  placeholder="Explain why this report should be reviewed/removed..."
                  rows={4}
                  required
                />
              </div>
              <div className="form-group">
                <label>Evidence Description (Optional)</label>
                <textarea
                  value={counterForm.evidenceDescription}
                  onChange={(e) => setCounterForm({...counterForm, evidenceDescription: e.target.value})}
                  placeholder="Describe any evidence you have (photos, documents, etc.)"
                  rows={2}
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Submit Counter Report</button>
                <button type="button" onClick={() => { setShowCounterModal(false); setSelectedReport(null); }} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
