import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import api from '../utils/api';
import { 
  Users, 
  Building2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Calendar,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/leaves/stats');
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      </DashboardLayout>
    );
  }

  // --- RENDER ADMIN DASHBOARD ---
  if (user?.role === 'Admin') {
    const { stats, departmentChartData, monthlyChartData } = data;
    return (
      <DashboardLayout title="Admin Dashboard">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Employees</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.totalEmployees}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Building2 size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Departments</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.totalDepartments}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={22} className="animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Leaves</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.pending}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved Leaves</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.approved}</h3>
            </div>
          </div>
        </div>

        {/* Charts & Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Trends */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Calendar size={16} className="text-emerald-500" />
              Monthly Approved Leaves Trend ({new Date().getFullYear()})
            </h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ background: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
                    labelStyle={{ fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="leaves" name="Approved Days" stroke="#10b981" strokeWidth={3} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
              <FileSpreadsheet size={16} className="text-emerald-500" />
              Total Leave Days by Department
            </h4>
            {departmentChartData.length === 0 ? (
              <div className="h-80 flex flex-col items-center justify-center text-slate-400">
                <p className="text-sm">No approved leaves yet to plot department metrics.</p>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
                    />
                    <Bar dataKey="days" name="Total Days Approved" radius={[8, 8, 0, 0]}>
                      {departmentChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // --- RENDER MANAGER DASHBOARD ---
  if (user?.role === 'Manager') {
    const { stats, onLeaveToday } = data;
    return (
      <DashboardLayout title="Manager Dashboard">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Direct Reports</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.teamSize}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={22} className={stats.pendingApprovals > 0 ? "animate-pulse" : ""} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Team Approvals</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.pendingApprovals}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved this Year</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.approvedThisYear}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <XCircle size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rejected this Year</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.rejectedThisYear}</h3>
            </div>
          </div>
        </div>

        {/* Team Members On Leave Today */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Calendar size={16} className="text-emerald-500" />
            Who is on Leave Today
          </h4>
          {onLeaveToday.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              All team members are present today.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {onLeaveToday.map((req) => (
                <div key={req._id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
                    {req.employee.name.charAt(0)}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">{req.employee.name}</h5>
                    <p className="text-[10px] text-slate-500 mt-0.5">On Active Leave</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // --- RENDER EMPLOYEE DASHBOARD ---
  if (user?.role === 'Employee') {
    const { stats, balances } = data;
    
    // Format balances chart data
    const chartData = balances.map(b => ({
      name: b.leaveType,
      value: b.used,
    })).filter(item => item.value > 0);

    return (
      <DashboardLayout title="Employee Dashboard">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Applied</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.totalApplied}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Approval</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.pending}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved Requests</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.approved}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <XCircle size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rejected Requests</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.rejected}</h3>
            </div>
          </div>
        </div>

        {/* Balance Grid & Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Balances list */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2">
            <h4 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Clock size={16} className="text-emerald-500" />
              Your Active Leave Balances
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {balances.map((b, idx) => (
                <div key={b.leaveType} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      {b.leaveType}
                    </span>
                    <div className="flex items-baseline gap-2 mt-2">
                      <h3 className="text-3xl font-extrabold text-slate-800">{b.remaining}</h3>
                      <span className="text-xs font-semibold text-slate-500">days left</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-200/50 flex justify-between text-xs font-medium text-slate-500">
                    <span>Quota: {b.allocated} days</span>
                    <span>Used: {b.used} days</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Used Distribution */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                <BarChart3Icon size={16} className="text-emerald-500" />
                Used Leaves Distribution
              </h4>
            </div>
            
            {chartData.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs flex-1 text-center">
                <p>No leave days taken yet this year.</p>
              </div>
            ) : (
              <div className="h-60 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Legend in middle */}
                <div className="absolute text-center">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Total Used</span>
                  <p className="text-2xl font-black text-slate-700">
                    {chartData.reduce((acc, curr) => acc + curr.value, 0)}
                  </p>
                </div>
              </div>
            )}
            
            {chartData.length > 0 && (
              <div className="mt-4 space-y-1.5">
                {chartData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-600 font-medium">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span>{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-800">{item.value} days</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }
};

// Internal Lucide alias helper since we loaded BarChart3 as BarChart3Icon
const BarChart3Icon = ({ size, className }) => {
  return (
    <svg className={className} width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
    </svg>
  );
};

export default Dashboard;
