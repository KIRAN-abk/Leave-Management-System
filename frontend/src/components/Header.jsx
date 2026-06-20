import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, Shield, Menu } from 'lucide-react';
import { getBackendURL } from '../utils/api';

const Header = ({ title, onMenuClick }) => {
  const { user } = useAuth();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'Admin':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-600 border border-purple-200 shadow-sm animate-pulse">
            <Shield size={12} className="stroke-[2.5]" />
            Administrator
          </span>
        );
      case 'Manager':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200 shadow-sm">
            <ShieldCheck size={12} className="stroke-[2.5]" />
            Manager
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm">
            <UserCheck size={12} className="stroke-[2.5]" />
            Employee
          </span>
        );
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white/70 backdrop-blur-md px-4 md:px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button 
          onClick={onMenuClick}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 block md:hidden transition cursor-pointer"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">{title || 'Dashboard'}</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Role Badge */}
        {getRoleBadge(user?.role)}

        {/* Separator */}
        <div className="h-5 w-px bg-slate-200"></div>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
            <p className="text-[11px] font-medium text-slate-400">
              {user?.department?.name || 'Unassigned'} Dept
            </p>
          </div>
          
          {user?.profileImage ? (
            <img 
              src={`${getBackendURL()}${user.profileImage}`} 
              alt={user.name} 
              className="h-9 w-9 rounded-xl object-cover border border-slate-200 shadow-sm"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80';
              }}
            />
          ) : (
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-400 to-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-emerald-500/20">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
