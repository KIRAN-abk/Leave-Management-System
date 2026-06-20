import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../utils/api';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  AlertCircle,
  Building2
} from 'lucide-react';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editDeptId, setEditDeptId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    manager: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const deptRes = await api.get('/departments');
      setDepartments(deptRes.data);

      const empRes = await api.get('/employees');
      // Filter potential department heads (Admins & Managers)
      const potentialHeads = empRes.data.filter(
        emp => emp.role === 'Manager' || emp.role === 'Admin'
      );
      setManagers(potentialHeads);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to fetch department info');
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
    setEditDeptId(null);
    setFormData({
      name: '',
      description: '',
      manager: ''
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenEditModal = (dept) => {
    setEditDeptId(dept._id);
    setFormData({
      name: dept.name,
      description: dept.description || '',
      manager: dept.manager?._id || ''
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name) {
      setErrorMsg('Department name is required');
      return;
    }

    try {
      const payload = { ...formData };
      if (!payload.manager) payload.manager = null;

      if (editDeptId) {
        await api.put(`/departments/${editDeptId}`, payload);
      } else {
        await api.post('/departments', payload);
      }
      
      setShowModal(false);
      fetchData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save department details.');
    }
  };

  const handleDeleteDept = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department? Employees belonging to this department will be unassigned.')) {
      return;
    }

    try {
      await api.delete(`/departments/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete department');
    }
  };

  const filteredDepts = departments.filter(dept => {
    const term = searchQuery.toLowerCase();
    return (
      dept.name.toLowerCase().includes(term) ||
      (dept.description && dept.description.toLowerCase().includes(term)) ||
      (dept.manager?.name && dept.manager.name.toLowerCase().includes(term))
    );
  });

  return (
    <DashboardLayout title="Departments Management">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/10 transition cursor-pointer flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          <span>Add Department</span>
        </button>
      </div>

      {/* Grid Display */}
      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        </div>
      ) : filteredDepts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">
          No departments registered.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepts.map((dept) => (
            <div key={dept._id} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Building2 size={20} />
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(dept)}
                      title="Edit"
                      className="h-8 w-8 rounded-lg border border-slate-200 hover:border-slate-300 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-100 transition cursor-pointer"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteDept(dept._id)}
                      title="Delete"
                      className="h-8 w-8 rounded-lg border border-slate-200 hover:border-slate-300 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-100 transition cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <h4 className="font-bold text-slate-800 text-base mb-1">{dept.name}</h4>
                <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed mb-4">
                  {dept.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Department Head</span>
                <span className="text-xs font-semibold text-slate-700">
                  {dept.manager?.name || 'Unassigned'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- ADD / EDIT FORM MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-base">
                {editDeptId ? 'Edit Department Details' : 'Create Department'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="h-8 w-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Department Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Department Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Engineering, Sales"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Summary of responsibilities..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition resize-none"
                />
              </div>

              {/* Department Head (Manager) */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Department Manager / Head</label>
                <select
                  name="manager"
                  value={formData.manager}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                >
                  <option value="">Unassigned (None)</option>
                  {managers.map(mgr => (
                    <option key={mgr._id} value={mgr._id}>{mgr.name}</option>
                  ))}
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
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
                  {editDeptId ? 'Save Changes' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Departments;
