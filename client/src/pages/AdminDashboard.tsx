import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiShield, FiUsers, FiFileText, FiCheckCircle, FiAlertTriangle, 
  FiTrendingUp, FiSearch, FiFilter, FiMoreVertical, FiTrash2, FiEye
} from 'react-icons/fi';

interface Stats {
  totalUsers: number;
  totalAccommodations: number;
  totalReports: number;
  pendingReports: number;
}

interface Report {
  _id: string;
  category: string;
  description: string;
  status: string;
  createdAt: string;
  userId: {
    name: string;
  };
  accommodationId: {
    name: string;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    
    if (!token || role !== 'admin') {
      navigate('/login');
      return;
    }
    
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    const token = localStorage.getItem('token');
    try {
      const [statsRes, reportsRes] = await Promise.all([
        fetch(`${API}/api/admin/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API}/api/admin/reports`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      const statsData = await statsRes.json();
      const reportsData = await reportsRes.json();
      
      if (statsData.success) setStats(statsData.data);
      if (reportsData.success) setReports(reportsData.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (id: string, status: string) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API}/api/admin/reports/${id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        setReports(reports.map(r => r._id === id ? { ...r, status } : r));
      }
    } catch (err) {
      console.error('Error updating report:', err);
    }
  };

  const filteredReports = reports.filter(r => {
    const matchesFilter = filter === 'all' || r.status === filter;
    const matchesSearch = r.accommodationId.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-slate-900 text-white pt-12 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-600 rounded-2xl shadow-lg shadow-red-900/20">
                <FiShield className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight">Platform Moderation Center</h1>
                <p className="text-slate-400 font-bold">Zencoder Admin Access Restricted</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl font-bold transition-all border border-white/10">Export Data</button>
              <button className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold shadow-lg transition-all">Bulk Actions</button>
            </div>
          </div>

          {/* Top Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {[
              { label: 'Total Users', value: stats?.totalUsers, icon: <FiUsers />, color: 'text-blue-400' },
              { label: 'Accommodations', value: stats?.totalAccommodations, icon: <FiFileText />, color: 'text-emerald-400' },
              { label: 'Total Reports', value: stats?.totalReports, icon: <FiFileText />, color: 'text-purple-400' },
              { label: 'Pending Review', value: stats?.pendingReports, icon: <FiAlertTriangle />, color: 'text-red-400' }
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl bg-white/5 ${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
                <p className="text-3xl font-black text-white">{stat.value || 0}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          
          {/* Toolbar */}
          <div className="p-8 border-b border-slate-50 flex flex-col lg:flex-row justify-between items-center gap-6">
            <h2 className="text-xl font-black text-slate-900 whitespace-nowrap">Reports Requiring Review</h2>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              {/* Search */}
              <div className="relative w-full sm:w-64 group">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search reports..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-slate-300 transition-all text-sm font-semibold"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filters */}
              <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
                {['all', 'pending', 'approved', 'disputed'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Reporter</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Accommodation</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Category</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredReports.map(report => (
                  <tr key={report._id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xs">
                          {report.userId?.name.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-900 text-sm">{report.userId?.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-bold text-slate-700 text-sm">{report.accommodationId?.name}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {report.category}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        report.status === 'pending' ? 'bg-yellow-50 text-yellow-600' :
                        report.status === 'approved' ? 'bg-blue-50 text-blue-600' :
                        report.status === 'resolved' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-slate-400 font-bold text-xs">{new Date(report.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => updateReportStatus(report._id, 'approved')}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Approve"
                        >
                          <FiCheckCircle />
                        </button>
                        <button 
                          onClick={() => updateReportStatus(report._id, 'disputed')}
                          className="p-2 text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all"
                          title="Flag / Dispute"
                        >
                          <FiAlertTriangle />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
                          <FiEye />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredReports.length === 0 && (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <FiCheckCircle className="text-slate-200 text-3xl" />
              </div>
              <p className="text-slate-400 font-bold">No reports found matching your criteria.</p>
            </div>
          )}

          <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Showing {filteredReports.length} of {reports.length} reports</p>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 disabled:opacity-50">Previous</button>
              <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600">Next</button>
            </div>
          </div>
        </div>

        {/* Audit Log / Activity */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <FiTrendingUp className="text-emerald-600" /> Platform Growth
            </h3>
            <div className="h-64 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
              <p className="text-slate-400 font-bold text-sm italic">Analytics Visualization (Chart.js placeholder)</p>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
            <h3 className="text-lg font-black text-slate-900 mb-6">System Health</h3>
            <div className="space-y-6">
              {[
                { label: 'API Server', status: 'Operational', color: 'text-emerald-500' },
                { label: 'Database', status: 'Operational', color: 'text-emerald-500' },
                { label: 'Storage', status: '92% Free', color: 'text-blue-500' },
                { label: 'Email Service', status: 'Operational', color: 'text-emerald-500' }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-500">{item.label}</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${item.color}`}>{item.status}</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-all">
              View Audit Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
