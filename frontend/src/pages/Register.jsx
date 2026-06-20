import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, KeyRound, Mail, User, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !email || !password || !confirmPassword) {
      setErrorMsg('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }

    setIsSubmitting(true);

    const attempt = async () => {
      const res = await register(name, email, password);
      if (res.success) {
        navigate('/', { replace: true });
      } else if (res.retrying) {
        // Server cold-starting — show message, then retry in 10 seconds
        setErrorMsg(res.message);
        setTimeout(async () => {
          const retryRes = await register(name, email, password);
          if (retryRes.success) {
            navigate('/', { replace: true });
          } else if (retryRes.retrying) {
            // Still waking up — retry one more time
            setErrorMsg('Server is still starting… retrying once more.');
            setTimeout(async () => {
              const finalRes = await register(name, email, password);
              if (finalRes.success) {
                navigate('/', { replace: true });
              } else {
                setErrorMsg(finalRes.message || 'Registration failed. Please try again.');
                setIsSubmitting(false);
              }
            }, 15000);
          } else {
            setErrorMsg(retryRes.message || 'Registration failed. Please try again.');
            setIsSubmitting(false);
          }
        }, 10000);
      } else {
        setErrorMsg(res.message);
        setIsSubmitting(false);
      }
    };

    attempt();
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
            Create an <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
              Account Today
            </span> <br />
            & Start Booking.
          </h1>
          <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
            Register your credentials to join your organization's panel. Review balances, submit requests, and track schedules effortlessly.
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
              Get Started
            </h2>
            <p className="text-slate-400 text-sm mt-1 text-center md:text-left">
              Sign up below to self-register your workspace profile.
            </p>
          </div>

          {errorMsg && (
            <div className={`mb-6 px-4 py-3 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
              errorMsg.includes('starting up') || errorMsg.includes('retrying')
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl py-2.5 pl-10 pr-4 text-sm font-medium text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1">
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
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl py-2.5 pl-10 pr-4 text-sm font-medium text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <KeyRound size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl py-2.5 pl-10 pr-10 text-sm font-medium text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
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

            {/* Confirm Password Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Confirm Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <KeyRound size={16} />
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl py-2.5 pl-10 pr-10 text-sm font-medium text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-white transition"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 px-4 rounded-2xl shadow-lg shadow-emerald-600/10 active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>
                    {errorMsg.includes('starting') || errorMsg.includes('retrying')
                      ? 'Server Waking Up...'
                      : 'Signing Up...'}
                  </span>
                </>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          {/* Redirect to Login */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-xs">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-bold transition">
                Sign In
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;
