import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, KeyRound, Mail, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const res = await login(email, password);
    if (res.success) {
      navigate('/', { replace: true });
    } else {
      setErrorMsg(res.message);
      setIsSubmitting(false);
    }
  };

  // Quick fill helper for demo ease-of-use
  const handleQuickFill = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen w-screen flex flex-col md:flex-row items-stretch bg-slate-950 font-sans text-slate-100 overflow-hidden relative">
      
      {/* Decorative Blur Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-700/10 blur-[120px] pointer-events-none"></div>

      {/* Brand Left Side Panel */}
      <div className="hidden md:flex flex-col justify-between w-[45%] p-12 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/40 border-r border-slate-900 relative">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
            <Shield size={22} className="stroke-[2.5]" />
          </div>
          <span className="font-bold text-sm tracking-widest text-emerald-400">LEAVE PORTAL</span>
        </div>

        <div className="my-auto space-y-6">
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Streamlined <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
              Leave Workflows
            </span> <br />
            for Modern Teams.
          </h1>
          <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
            Apply for leave, verify team balances, and manage organizational scheduling policies with our secured role-based dashboard.
          </p>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          © 2026 Leave Portal Enterprise. All rights reserved.
        </div>
      </div>

      {/* Form Right Side Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative">
          
          <div className="mb-8">
            {/* Mobile Brand Logo */}
            <div className="flex md:hidden items-center gap-2 mb-4 justify-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md">
                <Shield size={16} />
              </div>
              <span className="font-bold text-xs tracking-wider text-emerald-400">LEAVE PORTAL</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white text-center md:text-left">
              Welcome Back
            </h2>
            <p className="text-slate-400 text-sm mt-1 text-center md:text-left">
              Enter your credentials to access your portal.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2">
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-sm font-medium text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300">Password</label>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <KeyRound size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl py-3 pl-10 pr-10 text-sm font-medium text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-white transition"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm py-3 px-4 rounded-2xl shadow-lg shadow-emerald-600/10 hover:shadow-emerald-500/20 active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Redirect to Signup */}
          <div className="mt-5 text-center">
            <p className="text-slate-400 text-xs">
              Don't have an account?{' '}
              <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-bold transition">
                Sign Up
              </Link>
            </p>
          </div>

          {/* Quick Demo Login Credentials Selector */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <p className="text-[11px] font-bold tracking-widest text-emerald-500 uppercase mb-3 text-center md:text-left">
              Demo Roles (Quick Select)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@company.com', 'admin123')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-800 bg-slate-950/30 hover:border-purple-500/30 hover:bg-purple-500/5 transition cursor-pointer"
              >
                <span className="text-[10px] font-bold text-purple-400">Admin</span>
                <span className="text-[8px] text-slate-500 mt-0.5">Jane Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('manager@company.com', 'manager123')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-800 bg-slate-950/30 hover:border-blue-500/30 hover:bg-blue-500/5 transition cursor-pointer"
              >
                <span className="text-[10px] font-bold text-blue-400">Manager</span>
                <span className="text-[8px] text-slate-500 mt-0.5">John Manager</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('employee@company.com', 'employee123')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-800 bg-slate-950/30 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition cursor-pointer"
              >
                <span className="text-[10px] font-bold text-emerald-400">Employee</span>
                <span className="text-[8px] text-slate-500 mt-0.5">Alice Emp</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
