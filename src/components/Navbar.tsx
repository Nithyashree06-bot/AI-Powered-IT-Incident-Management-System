import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Sparkles, LogOut, UserCircle } from 'lucide-react';
import { Role } from '../types';

export const Navbar: React.FC = () => {
  const { user, logout, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleRoleSwitch = (r: Role) => {
    demoLogin(r);
    if (r === 'ADMIN') navigate('/dashboard');
    else if (r === 'IT_STAFF') navigate('/tickets');
    else navigate('/tickets/new');
  };

  const getRoleBadgeClass = (role?: Role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'IT_STAFF':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <header className="bg-[#1E40AF] text-white border-b border-blue-900 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
            <Shield className="w-5 h-5 text-sky-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight">IncidentIQ</span>
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <p className="text-[10px] text-blue-200 leading-none">Automated IT Triage</p>
          </div>
        </Link>

        {/* Center / Right controls */}
        <div className="flex items-center gap-4">
          {/* Quick Persona Switcher for evaluation */}
          <div className="hidden md:flex items-center bg-blue-950/50 rounded-lg p-1 border border-blue-800 text-xs">
            <span className="text-[11px] text-blue-300 px-2 font-medium">Role:</span>
            <button
              onClick={() => handleRoleSwitch('EMPLOYEE')}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                user?.role === 'EMPLOYEE' ? 'bg-[#0EA5E9] text-white font-bold' : 'text-blue-200 hover:text-white'
              }`}
            >
              Employee
            </button>
            <button
              onClick={() => handleRoleSwitch('IT_STAFF')}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                user?.role === 'IT_STAFF' ? 'bg-amber-500 text-white font-bold' : 'text-blue-200 hover:text-white'
              }`}
            >
              IT Staff
            </button>
            <button
              onClick={() => handleRoleSwitch('ADMIN')}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                user?.role === 'ADMIN' ? 'bg-purple-600 text-white font-bold' : 'text-blue-200 hover:text-white'
              }`}
            >
              Admin
            </button>
          </div>

          {/* User profile */}
          <div className="flex items-center gap-3 pl-2 border-l border-blue-800">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold leading-tight">{user?.name}</div>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded border ${getRoleBadgeClass(user?.role)}`}>
                  {user?.role}
                </span>
                <span className="text-[10px] text-blue-200">({user?.department})</span>
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xs uppercase">
              {user?.name ? user.name.charAt(0) : <UserCircle className="w-5 h-5" />}
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
