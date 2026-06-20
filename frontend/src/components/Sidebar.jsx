import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  Building2, 
  FileKey, 
  BarChart3, 
  KeyRound, 
  LogOut,
  Shield
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const getNavigation = () => {
    const navItems = [
      {
        name: 'Dashboard',
        path: '/',
        icon: LayoutDashboard,
        roles: ['Admin', 'Manager', 'Employee']
      },
      {
        name: 'Leaves Portal',
        path: '/leaves',
        icon: CalendarDays,
        roles: ['Admin', 'Manager', 'Employee']
      },
      {
        name: 'Employees',
        path: '/employees',
        icon: Users,
        roles: ['Admin', 'Manager']
      },
      {
        name: 'Departments',
        path: '/departments',
        icon: Building2,
        roles: ['Admin']
      },
      {
        name: 'Policies',
        path: '/policies',
        icon: FileKey,
        roles: ['Admin']
      },
      {
        name: 'Reports & Analytics',
        path: '/reports',
        icon: BarChart3,
        roles: ['Admin']
      },
      {
        name: 'Change Password',
        path: '/change-password',
        icon: KeyRound,
        roles: ['Admin', 'Manager', 'Employee']
      }
    ];

    return navItems.filter(item => item.roles.includes(user?.role));
  };

  const navItems = getNavigation();

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col h-screen sticky top-0 border-r border-slate-800">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800 bg-slate-950">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
          <Shield size={20} className="stroke-[2.5]" />
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-wide bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            LEAVE PORTAL
          </h1>
          <p className="text-[10px] text-emerald-400 font-semibold tracking-widest uppercase">
            MERN Enterprise
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition duration-200 group
                ${isActive 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'}
              `}
            >
              <Icon size={18} className="transition group-hover:scale-105" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Profile Footer Summary & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-base shadow-inner">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
          <div className="truncate">
            <h4 className="text-sm font-semibold text-slate-200 truncate">{user?.name}</h4>
            <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 hover:border-red-500/30 hover:bg-red-500/10 text-slate-400 hover:text-red-400 text-xs font-semibold tracking-wide uppercase transition duration-200 cursor-pointer"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
