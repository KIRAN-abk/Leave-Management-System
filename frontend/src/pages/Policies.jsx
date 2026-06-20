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
  FileKey,
  CalendarDays
} from 'lucide-react';

const Policies = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editPolicyId, setEditPolicyId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    days: 10,
    description: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/policies');
      setPolicies(res.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to fetch leave policies');
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
      [e.target.name]: e.target.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value
    });
  };

  const handleOpenAddModal = () => {
    setEditPolicyId(null);
    setFormData({
      name: '',
      days: 10,
      description: ''
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenEditModal = (policy) => {
    setEditPolicyId(policy._id);
    setFormData({
      name: policy.name,
      days: policy.days,
      description: policy.description || ''
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name || formData.days === undefined) {
      setErrorMsg('Policy name and allocated days are required');
      return;
    }

    if (formData.days < 0) {
      setErrorMsg('Allocated days cannot be negative');
      return;
    }

    try {
      if (editPolicyId) {
        await api.put(`/policies/${editPolicyId}`, formData);
      } else {
        await api.post('/policies', formData);
      }
      
      setShowModal(false);
      fetchData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save policy');
    }
  };

  const handleDeletePolicy = async (id) => {
    if (!window.confirm('Are you sure you want to delete this leave policy? This will pull this leave type and delete all records for it from all employee records.')) {
      return;
    }

    try {
      await api.delete(`/policies/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete policy');
    }
  };

  const filteredPolicies = policies.filter(policy => {
    const term = searchQuery.toLowerCase();
    return (
      policy.name.toLowerCase().includes(term) ||
      (policy.description && policy.description.toLowerCase().includes(term))
    );
  });

  return (
    <DashboardLayout title="Leave Policies & Quotas">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search policies..."
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
          <span>New Leave Policy</span>
        </button>
      </div>

      {/* Grid Display */}
      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        </div>
      ) : filteredPolicies.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">
          No policies configured yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPolicies.map((policy) => (
            <div key={policy._id} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <FileKey size={20} />
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(policy)}
                      title="Edit"
                      className="h-8 w-8 rounded-lg border border-slate-200 hover:border-slate-300 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-100 transition cursor-pointer"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDeletePolicy(policy._id)}
                      title="Delete"
                      className="h-8 w-8 rounded-lg border border-slate-200 hover:border-slate-300 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-100 transition cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <h4 className="font-bold text-slate-800 text-base mb-1">{policy.name}</h4>
                <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed mb-4">
                  {policy.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <CalendarDays size={12} />
                  Annual Quota
                </span>
                <span className="text-sm font-black text-emerald-600">
                  {policy.days} Days / year
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
                {editPolicyId ? 'Edit Leave Policy' : 'Create Leave Policy'}
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

              {/* Policy Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Policy Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Sick Leave, Annual Leave"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  required
                />
              </div>

              {/* Allocated Days */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Allocated Days (Yearly)</label>
                <input
                  type="number"
                  name="days"
                  value={formData.days}
                  onChange={handleInputChange}
                  placeholder="e.g. 15"
                  min="0"
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
                  placeholder="e.g. Applicable for personal holidays..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition resize-none"
                />
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
                  {editPolicyId ? 'Save Changes' : 'Create Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Policies;
