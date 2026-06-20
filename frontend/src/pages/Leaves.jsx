import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import api from '../utils/api';
import { 
  Plus, 
  Calendar, 
  Paperclip, 
  Check, 
  X, 
  AlertCircle,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter
} from 'lucide-react';

const Leaves = () => {
  const { user, refreshUser } = useAuth();
  const isEmployee = user?.role === 'Employee';
  const isManager = user?.role === 'Manager';
  const isAdmin = user?.role === 'Admin';

  const [requests, setRequests] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Apply Leave Modal Form
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [applyForm, setApplyForm] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  // Action Modal Form (Approve/Reject)
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionComments, setActionComments] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState(isEmployee ? 'history' : 'pending');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchFilter, setSearchFilter] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const reqRes = await api.get('/leaves');
      setRequests(reqRes.data);

      // Fetch active policies for application dropdown
      const policyRes = await api.get('/policies');
      setPolicies(policyRes.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to fetch leaves data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApplyInputChange = (e) => {
    setApplyForm({
      ...applyForm,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setAttachment(e.target.files[0]);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!applyForm.leaveType || !applyForm.startDate || !applyForm.endDate || !applyForm.reason) {
      setErrorMsg('All text fields are required');
      return;
    }

    const start = new Date(applyForm.startDate);
    const end = new Date(applyForm.endDate);
    if (start > end) {
      setErrorMsg('Start date cannot be after the end date');
      return;
    }

    try {
      // Use FormData for file uploads
      const data = new FormData();
      data.append('leaveType', applyForm.leaveType);
      data.append('startDate', applyForm.startDate);
      data.append('endDate', applyForm.endDate);
      data.append('reason', applyForm.reason);
      if (attachment) {
        data.append('attachment', attachment);
      }

      await api.post('/leaves', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccessMsg('Leave request submitted successfully!');
      setShowApplyModal(false);
      
      // Reset form
      setApplyForm({
        leaveType: '',
        startDate: '',
        endDate: '',
        reason: ''
      });
      setAttachment(null);
      
      // Refresh user balance in context & reload requests
      await refreshUser();
      fetchData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Application failed. Verify details and try again.');
    }
  };

  const handleOpenActionModal = (req) => {
    setSelectedRequest(req);
    setActionComments('');
    setErrorMsg('');
  };

  const handleRequestAction = async (action) => {
    setErrorMsg('');
    setIsSubmittingAction(true);

    try {
      await api.put(`/leaves/${selectedRequest._id}/action`, {
        action,
        comments: actionComments
      });

      setSelectedRequest(null);
      await refreshUser();
      fetchData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit decision.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Helper: Live leave days preview in form
  const getDurationDays = () => {
    if (!applyForm.startDate || !applyForm.endDate) return 0;
    const start = new Date(applyForm.startDate);
    const end = new Date(applyForm.endDate);
    if (start > end) return 0;
    const diff = Math.abs(end - start);
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle size={12} />
            Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-100">
            <XCircle size={12} />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100 animate-pulse">
            <Clock size={12} />
            Pending
          </span>
        );
    }
  };

  // Filter requests based on tab and inputs
  const filteredRequests = requests.filter((req) => {
    // 1. Role-specific Tabs
    if (activeTab === 'pending' && req.status !== 'Pending') return false;
    if (activeTab === 'history' && req.status === 'Pending') return false;
    
    // 2. Status dropdown
    if (statusFilter !== 'All' && req.status !== statusFilter) return false;

    // 3. Search Bar (Employee Name / Leave Type)
    const term = searchFilter.toLowerCase();
    const empName = req.employee?.name?.toLowerCase() || '';
    const policyName = req.leaveType?.name?.toLowerCase() || '';
    return empName.includes(term) || policyName.includes(term);
  });

  return (
    <DashboardLayout title="Leaves Portal">
      {successMsg && (
        <div className="mb-6 px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-semibold flex items-center gap-2">
          <CheckCircle size={16} />
          {successMsg}
        </div>
      )}

      {/* Tabs & Apply Button */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
        {/* Navigation Tabs */}
        {!isEmployee && (
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => { setActiveTab('pending'); setStatusFilter('All'); }}
              className={`px-4 py-2.5 font-semibold text-sm border-b-2 cursor-pointer transition ${
                activeTab === 'pending'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Pending Reviews
            </button>
            <button
              onClick={() => { setActiveTab('history'); setStatusFilter('All'); }}
              className={`px-4 py-2.5 font-semibold text-sm border-b-2 cursor-pointer transition ${
                activeTab === 'history'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Actioned History
            </button>
          </div>
        )}

        {/* Employee sees simple title or apply button */}
        {isEmployee && (
          <div className="text-sm font-semibold text-slate-500">
            Track and apply for your leaves below.
          </div>
        )}

        {/* Apply Leave Button */}
        <button
          onClick={() => { setShowApplyModal(true); setErrorMsg(''); setSuccessMsg(''); }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/10 transition cursor-pointer flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-stretch sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search by employee or leave type..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {activeTab === 'history' && (
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm font-medium text-slate-700 focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="All">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        )}
      </div>

      {/* Requests Table */}
      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">
          No leave requests found.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Leave Details</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Reason & Attachment</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredRequests.map((req) => {
                  const start = new Date(req.startDate);
                  const end = new Date(req.endDate);
                  const diff = Math.abs(end - start);
                  const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;

                  return (
                    <tr key={req._id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">{req.employee?.name || 'Self'}</p>
                        <p className="text-xs text-slate-400">{req.employee?.email || ''}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-700">{req.leaveType?.name || 'Unknown Type'}</p>
                        <p className="text-xs text-slate-400">
                          {start.toLocaleDateString()} to {end.toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-600">
                        {days} {days === 1 ? 'day' : 'days'}
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-slate-600 truncate" title={req.reason}>
                          {req.reason}
                        </p>
                        {req.attachment && (
                          <a
                            href={`http://localhost:5000${req.attachment}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-bold mt-1"
                          >
                            <Paperclip size={12} />
                            View Certificate
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(req.status)}
                        {req.status !== 'Pending' && req.comments && (
                          <p className="text-[10px] text-slate-400 mt-1 italic max-w-[150px] truncate" title={req.comments}>
                            Note: "{req.comments}"
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {req.status === 'Pending' && (isAdmin || (isManager && req.employee?.manager === user._id)) ? (
                          <button
                            onClick={() => handleOpenActionModal(req)}
                            className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                          >
                            Review
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">No action</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- APPLY FOR LEAVE MODAL --- */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-base">Submit Leave Application</h3>
              <button
                onClick={() => setShowApplyModal(false)}
                className="h-8 w-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Leave Type */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Leave Type</label>
                <select
                  name="leaveType"
                  value={applyForm.leaveType}
                  onChange={handleApplyInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  required
                >
                  <option value="">Select Type</option>
                  {policies.map(p => {
                    const balance = user?.leaveBalances?.find(b => b.leaveType?._id === p._id || b.leaveType === p._id);
                    const remaining = balance ? (balance.allocated - balance.used) : p.days;
                    return (
                      <option key={p._id} value={p._id}>
                        {p.name} ({remaining} days left)
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Start Date */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={applyForm.startDate}
                  onChange={handleApplyInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  required
                />
              </div>

              {/* End Date */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={applyForm.endDate}
                  onChange={handleApplyInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  required
                />
              </div>

              {/* Live Duration Preview */}
              {getDurationDays() > 0 && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs font-bold flex justify-between">
                  <span>Leave Duration:</span>
                  <span>{getDurationDays()} Days</span>
                </div>
              )}

              {/* Reason */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Reason for Leave</label>
                <textarea
                  name="reason"
                  value={applyForm.reason}
                  onChange={handleApplyInputChange}
                  placeholder="Summarize the reason for request..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition resize-none"
                  required
                />
              </div>

              {/* File Attachment */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Supporting Certificate (Optional)
                </label>
                <div className="relative border border-dashed border-slate-300 rounded-xl p-3 bg-slate-50 hover:bg-slate-100/50 transition flex items-center justify-center">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex items-center gap-2 text-slate-500 pointer-events-none">
                    <Paperclip size={14} />
                    <span className="text-xs font-semibold">
                      {attachment ? attachment.name : 'Choose PDF, DOC, or Image file'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-white">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 text-sm font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/10 transition cursor-pointer"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- REVIEW ACTIONS MODAL (MANAGER/ADMIN) --- */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Review Leave Application</h3>
                <p className="text-xs text-slate-400">Employee: {selectedRequest.employee?.name}</p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="h-8 w-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {errorMsg && (
                <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Leave summary review */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-2 text-slate-600">
                <p><strong>Type:</strong> {selectedRequest.leaveType?.name}</p>
                <p>
                  <strong>Dates:</strong> {new Date(selectedRequest.startDate).toLocaleDateString()} to {new Date(selectedRequest.endDate).toLocaleDateString()}
                </p>
                <p><strong>Reason:</strong> "{selectedRequest.reason}"</p>
                {selectedRequest.attachment && (
                  <p>
                    <strong>Attachment:</strong>{' '}
                    <a
                      href={`http://localhost:5000${selectedRequest.attachment}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:text-emerald-700 underline font-bold"
                    >
                      View certificate file
                    </a>
                  </p>
                )}
              </div>

              {/* Review Comments */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Comments / Notes</label>
                <textarea
                  value={actionComments}
                  onChange={(e) => setActionComments(e.target.value)}
                  placeholder="Specify feedback or justification details..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition resize-none"
                />
              </div>

              {/* Review Decision Buttons */}
              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 bg-white">
                <button
                  type="button"
                  onClick={() => handleRequestAction('Rejected')}
                  disabled={isSubmittingAction}
                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 font-bold text-sm py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <X size={16} />
                  Reject Request
                </button>
                <button
                  type="button"
                  onClick={() => handleRequestAction('Approved')}
                  disabled={isSubmittingAction}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-2.5 rounded-xl shadow-lg shadow-emerald-600/10 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check size={16} />
                  Approve Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Leaves;
