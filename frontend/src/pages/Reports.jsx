import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../utils/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  Printer, 
  Download, 
  Filter, 
  Calendar, 
  Building2, 
  Briefcase,
  AlertCircle
} from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const Reports = () => {
  const [data, setData] = useState(null);
  const [requests, setRequests] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [policies, setPolicies] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Report Filters
  const [deptFilter, setDeptFilter] = useState('All');
  const [policyFilter, setPolicyFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsRes = await api.get('/leaves/stats');
      setData(statsRes.data);

      // Fetch all requests
      const leavesRes = await api.get('/leaves');
      setRequests(leavesRes.data);

      // Fetch departments
      const deptRes = await api.get('/departments');
      setDepartments(deptRes.data);

      // Fetch policies
      const policyRes = await api.get('/policies');
      setPolicies(policyRes.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to generate report databases.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  // Export to CSV helper
  const handleExportCSV = () => {
    const headers = ['Employee', 'Department', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Reason', 'Status', 'Approved By'];
    const rows = filteredRequests.map(r => {
      const start = new Date(r.startDate);
      const end = new Date(r.endDate);
      const days = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;
      return [
        r.employee?.name || 'Unknown',
        r.employee?.department?.name || 'Unassigned',
        r.leaveType?.name || 'Unknown',
        start.toLocaleDateString(),
        end.toLocaleDateString(),
        days,
        `"${r.reason.replace(/"/g, '""')}"`,
        r.status,
        r.approvedBy?.name || 'N/A'
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Leave_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter requests
  const filteredRequests = requests.filter(req => {
    // Department Filter
    if (deptFilter !== 'All' && req.employee?.department?._id !== deptFilter) return false;

    // Policy/Leave Type Filter
    if (policyFilter !== 'All' && req.leaveType?._id !== policyFilter) return false;

    // Status Filter
    if (statusFilter !== 'All' && req.status !== statusFilter) return false;

    // Date Filters
    const reqStart = new Date(req.startDate);
    const reqEnd = new Date(req.endDate);

    if (startDate && reqStart < new Date(startDate)) return false;
    if (endDate && reqEnd > new Date(endDate)) return false;

    return true;
  });

  if (loading) {
    return (
      <DashboardLayout title="Reports & Analytics">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (errorMsg) {
    return (
      <DashboardLayout title="Reports & Analytics">
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{errorMsg}</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Reports & Analytics">
      {/* Printable Report Styles override */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      <div id="print-area">
        {/* Printable Header - only visible during print */}
        <div className="hidden print:block mb-8 border-b pb-4">
          <h1 className="text-2xl font-black text-slate-800">Enterprise Leave Report</h1>
          <p className="text-slate-400 text-xs mt-1">Generated on {new Date().toLocaleString()}</p>
        </div>

        {/* Filter Toolbar Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-8 no-print">
          <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Filter size={16} className="text-emerald-500" />
            Report Configuration & Filters
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {/* Department */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">Department</label>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 transition"
              >
                <option value="All">All Departments</option>
                {departments.map(d => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Leave Type */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">Leave Type</label>
              <select
                value={policyFilter}
                onChange={(e) => setPolicyFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 transition"
              >
                <option value="All">All Types</option>
                {policies.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 transition"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Start Date */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            {/* End Date */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              onClick={handlePrint}
              className="border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
            >
              <Printer size={14} />
              Print Report
            </button>
            <button
              onClick={handleExportCSV}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md shadow-emerald-600/10 transition cursor-pointer flex items-center gap-1.5"
            >
              <Download size={14} />
              Export to CSV
            </button>
          </div>
        </div>

        {/* Charts & Graphical summaries */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 print:hidden">
          {/* Dept distribution chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm md:col-span-2">
            <h4 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Building2 size={16} className="text-emerald-500" />
              Department Leave Quotas (Approved Days)
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.departmentChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }} />
                  <Bar dataKey="days" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick breakdown metrics */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <h4 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Briefcase size={16} className="text-emerald-500" />
              System Breakdown
            </h4>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-slate-500">Filtered Records:</span>
                <span className="font-extrabold text-slate-800">{filteredRequests.length} requests</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-slate-500">Pending Actions:</span>
                <span className="font-extrabold text-amber-600">
                  {filteredRequests.filter(r => r.status === 'Pending').length} pending
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-slate-500">Approved Leaves:</span>
                <span className="font-extrabold text-emerald-600">
                  {filteredRequests.filter(r => r.status === 'Approved').length} approved
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-slate-500">Rejected Leaves:</span>
                <span className="font-extrabold text-red-600">
                  {filteredRequests.filter(r => r.status === 'Rejected').length} rejected
                </span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Company Headcount</span>
              <h3 className="text-3xl font-black text-slate-700 mt-1">{data.stats.totalEmployees}</h3>
            </div>
          </div>
        </div>

        {/* Report List Grid Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800">Leave Requests Ledger</h4>
            <span className="text-xs font-semibold text-slate-400 bg-slate-50 border px-2.5 py-1 rounded-lg">
              Showing {filteredRequests.length} entries
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Leave Type</th>
                  <th className="px-6 py-4">Dates</th>
                  <th className="px-6 py-4">Days</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Reviewer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredRequests.map((req) => {
                  const start = new Date(req.startDate);
                  const end = new Date(req.endDate);
                  const days = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;

                  return (
                    <tr key={req._id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-semibold text-slate-800">{req.employee?.name}</td>
                      <td className="px-6 py-4 text-slate-600">{req.employee?.department?.name || 'Unassigned'}</td>
                      <td className="px-6 py-4 text-slate-700">{req.leaveType?.name}</td>
                      <td className="px-6 py-4 text-slate-500">
                        {start.toLocaleDateString()} - {end.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-600">{days} days</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                          req.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-600'
                            : req.status === 'Rejected'
                            ? 'bg-red-50 text-red-600'
                            : 'bg-amber-50 text-amber-600'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {req.approvedBy?.name || 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
