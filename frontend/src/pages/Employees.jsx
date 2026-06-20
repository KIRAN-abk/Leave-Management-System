import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import api from '../utils/api';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  AlertCircle,
  Eye
} from 'lucide-react';

const Employees = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Form Modals State
  const [showModal, setShowModal] = useState(false);
  const [editEmployeeId, setEditEmployeeId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Employee',
    department: '',
    manager: '',
    status: 'Active',
    joinedDate: new Date().toISOString().split('T')[0]
  });

  // View Balance Modal
  const [selectedEmpBalances, setSelectedEmpBalances] = useState(null);

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Get employees list
      const empRes = await api.get('/employees');
      setEmployees(empRes.data);

      if (isAdmin) {
        // 2. Get departments for dropdown
        const deptRes = await api.get('/departments');
        setDepartments(deptRes.data);

        // 3. Get managers list for supervisor assignment
        // A manager can be someone with role Admin or Manager
        const allUsers = empRes.data;
        const supervisorList = allUsers.filter(u => u.role === 'Manager' || u.role === 'Admin');
        setManagers(supervisorList);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to fetch directory data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleOpenAddModal = () => {
    setEditEmployeeId(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'Employee',
      department: '',
      manager: '',
      status: 'Active',
      joinedDate: new Date().toISOString().split('T')[0]
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenEditModal = (emp) => {
    setEditEmployeeId(emp._id);
    setFormData({
      name: emp.name,
      email: emp.email,
      password: '', // Leave blank unless changing
      role: emp.role,
      department: emp.department?._id || '',
      manager: emp.manager?._id || '',
      status: emp.status,
      joinedDate: emp.joinedDate ? new Date(emp.joinedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Form validation
    if (!formData.name || !formData.email) {
      setErrorMsg('Name and email are required');
      return;
    }

    if (!editEmployeeId && !formData.password) {
      setErrorMsg('Password is required for new employees');
      return;
    }

    try {
      const payload = { ...formData };
      // Remove empty password on update so we don't overwrite it
      if (editEmployeeId && !payload.password) {
        delete payload.password;
      }
      
      // Clean up empty fields
      if (!payload.department) payload.department = null;
      if (!payload.manager) payload.manager = null;

      if (editEmployeeId) {
        await api.put(`/employees/${editEmployeeId}`, payload);
      } else {
        await api.post('/employees', payload);
      }
      
      setShowModal(false);
      fetchData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Save failed. Check details and try again.');
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee? All their leave requests will be deleted, and department/team links will be cleared.')) {
      return;
    }

    try {
      await api.delete(`/employees/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete employee');
    }
  };

  // Filters
  const filteredEmployees = employees.filter(emp => {
    const term = searchQuery.toLowerCase();
    return (
      emp.name.toLowerCase().includes(term) ||
      emp.email.toLowerCase().includes(term) ||
      emp.role.toLowerCase().includes(term) ||
      (emp.department?.name && emp.department.name.toLowerCase().includes(term))
    );
  });

  return (
    <DashboardLayout title="Employees Directory">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search by name, email, role, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/10 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            <span>Add Employee</span>
          </button>
        )}
      </div>

      {/* Directory Table */}
      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">
          No records match your search criteria.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Department & Role</th>
                  <th className="px-6 py-4">Direct Manager</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredEmployees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm border border-emerald-100">
                          {emp.name ? emp.name.charAt(0) : 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{emp.name}</p>
                          <p className="text-xs text-slate-400">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-700">{emp.department?.name || 'Unassigned'}</p>
                      <p className="text-xs text-slate-400">{emp.role}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-700">{emp.manager?.name || 'N/A'}</p>
                      <p className="text-xs text-slate-400">{emp.manager?.email || ''}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        emp.status === 'Active' 
                          ? 'bg-emerald-50 text-emerald-600' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${emp.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {emp.joinedDate ? new Date(emp.joinedDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* View Leave Balances Button */}
                        <button
                          onClick={() => setSelectedEmpBalances(emp)}
                          title="View Leave Balances"
                          className="h-8 w-8 rounded-lg border border-slate-200 hover:border-slate-300 flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer"
                        >
                          <Eye size={14} />
                        </button>
                        
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => handleOpenEditModal(emp)}
                              title="Edit Employee"
                              className="h-8 w-8 rounded-lg border border-slate-200 hover:border-slate-300 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:border-emerald-100 transition cursor-pointer"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteEmployee(emp._id)}
                              title="Delete Employee"
                              className="h-8 w-8 rounded-lg border border-slate-200 hover:border-slate-300 flex items-center justify-center text-slate-500 hover:text-red-500 hover:border-red-100 transition cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- ADD / EDIT FORM MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-base">
                {editEmployeeId ? 'Edit Employee Credentials' : 'Register New Employee'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="h-8 w-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {errorMsg && (
                <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Name */}
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                    required
                  />
                </div>

                {/* Email */}
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@company.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                    required
                  />
                </div>

                {/* Password */}
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Password {editEmployeeId && '(leave blank to keep current)'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={editEmployeeId ? '••••••••' : 'Password must be 6+ chars'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                    required={!editEmployeeId}
                  />
                </div>

                {/* Role */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">System Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* Department */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  >
                    <option value="">Unassigned</option>
                    {departments.map(d => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                {/* Direct Manager */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Supervisor / Mgr</label>
                  <select
                    name="manager"
                    value={formData.manager}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  >
                    <option value="">None</option>
                    {managers.map(m => (
                      <option key={m._id} value={m._id}>{m.name} ({m.role})</option>
                    ))}
                  </select>
                </div>

                {/* Joined Date */}
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Joined Date</label>
                  <input
                    type="date"
                    name="joinedDate"
                    value={formData.joinedDate}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-white">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 text-sm font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/10 transition cursor-pointer"
                >
                  {editEmployeeId ? 'Save Changes' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- VIEW BALANCES OVERLAY MODAL --- */}
      {selectedEmpBalances && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-800 text-base">{selectedEmpBalances.name}</h3>
                <p className="text-xs text-slate-400">{selectedEmpBalances.role} • Leave Balances</p>
              </div>
              <button
                onClick={() => setSelectedEmpBalances(null)}
                className="h-8 w-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {selectedEmpBalances.leaveBalances.length === 0 ? (
                <div className="text-center text-slate-400 py-8 text-sm">
                  No active leave policies assigned to this employee.
                </div>
              ) : (
                <div className="space-y-3.5">
                  {selectedEmpBalances.leaveBalances.map((bal) => {
                    const allocated = bal.allocated;
                    const used = bal.used;
                    const remaining = allocated - used;
                    
                    return (
                      <div key={bal._id} className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wide">
                            {bal.leaveType?.name || 'Unknown Policy'}
                          </span>
                          <span className="text-xs font-bold text-emerald-600">{remaining} days left</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] text-slate-400">
                          <span>Allocated: {allocated} days</span>
                          <span>Used: {used} days</span>
                        </div>
                        {/* Simple progress bar */}
                        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2.5 overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, (used / allocated) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedEmpBalances(null)}
                  className="w-full sm:w-auto bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition cursor-pointer text-center"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Employees;
