import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  TicketCheck,
  PlusCircle,
  BarChart3,
  Users,
  Clock,
  Sparkles,
  LifeBuoy,
  Terminal,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'EMPLOYEE';

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
      isActive
        ? 'bg-blue-50 text-[#1E40AF] font-bold shadow-2xs'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
    }`;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Incident Operations
          </p>
          <nav className="space-y-1">
            <NavLink to="/dashboard" className={linkClass}>
              <LayoutDashboard className="w-4 h-4 text-[#1E40AF]" />
              Dashboard
            </NavLink>

            <NavLink to="/tickets" className={linkClass}>
              <TicketCheck className="w-4 h-4 text-[#0EA5E9]" />
              {role === 'EMPLOYEE' ? 'My Tickets' : 'All Tickets'}
            </NavLink>

            <NavLink to="/tickets/new" className={linkClass}>
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              Raise Incident
            </NavLink>

            <NavLink to="/test-suite" className={linkClass}>
              <Terminal className="w-4 h-4 text-slate-700" />
              Test Suite & API
            </NavLink>
          </nav>
        </div>

        {/* Management & Analytics */}
        {(role === 'ADMIN' || role === 'IT_STAFF') && (
          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Performance & SLA
            </p>
            <nav className="space-y-1">
              <NavLink to="/analytics" className={linkClass}>
                <BarChart3 className="w-4 h-4 text-purple-600" />
                Analytics & SLA
              </NavLink>
            </nav>
          </div>
        )}

        {/* Admin only section */}
        {role === 'ADMIN' && (
          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              System Administration
            </p>
            <nav className="space-y-1">
              <NavLink to="/admin/users" className={linkClass}>
                <Users className="w-4 h-4 text-indigo-600" />
                User Management
              </NavLink>

              <NavLink to="/admin/sla" className={linkClass}>
                <Clock className="w-4 h-4 text-amber-600" />
                SLA Configuration
              </NavLink>
            </nav>
          </div>
        )}
      </div>

      {/* AI Triage Information Banner */}
      <div className="rounded-lg p-3 bg-gradient-to-br from-teal-50 to-blue-50 border border-teal-200 text-xs">
        <div className="flex items-center gap-1.5 text-teal-800 font-bold mb-1">
          <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
          Gemini AI Active
        </div>
        <p className="text-slate-600 text-[11px] leading-relaxed">
          Incidents are classified automatically for category, severity, and resolution steps within 3s.
        </p>
        <div className="mt-2 pt-2 border-t border-teal-100 flex items-center justify-between text-[10px] text-teal-700">
          <span>SLA Countdown: Auto</span>
          <LifeBuoy className="w-3 h-3 text-teal-600" />
        </div>
      </div>
    </aside>
  );
};
