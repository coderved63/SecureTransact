import { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Activity, AlertTriangle, CheckCircle, XCircle, DollarSign, Users } from 'lucide-react';

const RISK_COLORS = ['#22c55e', '#eab308', '#f97316', '#ef4444'];

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [flagged, setFlagged] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [metricsRes, flaggedRes] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getFlagged(),
      ]);
      setMetrics(metricsRes.data);
      setFlagged(flaggedRes.data.content || []);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, decision) => {
    try {
      await adminApi.reviewTransaction(id, decision);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Review failed');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  const statusData = [
    { name: 'Completed', value: metrics?.completedTransactionsToday || 0 },
    { name: 'Flagged', value: metrics?.flaggedTransactionsToday || 0 },
    { name: 'Failed', value: metrics?.failedTransactionsToday || 0 },
  ].filter(d => d.value > 0);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <MetricCard icon={Activity} label="Transactions Today" value={metrics?.totalTransactionsToday || 0} color="blue" />
        <MetricCard icon={DollarSign} label="Volume Today" value={`$${Number(metrics?.totalVolumeToday || 0).toLocaleString()}`} color="green" />
        <MetricCard icon={AlertTriangle} label="Flagged Today" value={metrics?.flaggedTransactionsToday || 0} color="red" />
        <MetricCard icon={Users} label="Active Accounts" value={metrics?.activeAccounts || 0} color="purple" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Transaction Status Breakdown</h2>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={RISK_COLORS[i % RISK_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-400">No data yet</div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Daily Overview</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[{
              name: 'Today',
              Completed: metrics?.completedTransactionsToday || 0,
              Flagged: metrics?.flaggedTransactionsToday || 0,
              Failed: metrics?.failedTransactionsToday || 0,
            }]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Completed" fill="#22c55e" />
              <Bar dataKey="Flagged" fill="#ef4444" />
              <Bar dataKey="Failed" fill="#6b7280" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Flagged Transactions */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Flagged Transactions</h2>
          <span className="bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full">{flagged.length} pending review</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Risk Score</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {flagged.map((txn) => (
                <tr key={txn.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono">#{txn.id}</td>
                  <td className="px-6 py-4">{txn.type}</td>
                  <td className="px-6 py-4 font-medium">${Number(txn.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4">
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">{txn.riskScore}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(txn.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-4 flex gap-2">
                    <button onClick={() => handleReview(txn.id, 'APPROVE')}
                      className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                      <CheckCircle className="w-3 h-3" /> Approve
                    </button>
                    <button onClick={() => handleReview(txn.id, 'REJECT')}
                      className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">
                      <XCircle className="w-3 h-3" /> Reject
                    </button>
                  </td>
                </tr>
              ))}
              {flagged.length === 0 && (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">No flagged transactions</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
