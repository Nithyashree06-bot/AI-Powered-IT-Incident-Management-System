import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { Shield, Sparkles, Lock, Mail, ArrowRight, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, demoLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if redirected due to session expiry
  const queryParams = new URLSearchParams(location.search);
  const isSessionExpired = queryParams.get('sessionExpired') === 'true';

  const routeByRole = (role: Role) => {
    switch (role) {
      case 'EMPLOYEE':
        navigate('/tickets/new');
        break;
      case 'IT_STAFF':
        navigate('/tickets');
        break;
      case 'ADMIN':
        navigate('/dashboard');
        break;
      default:
        navigate('/dashboard');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      // Determine destination based on email or role
      if (email.includes('admin')) {
        routeByRole('ADMIN');
      } else if (email.includes('staff')) {
        routeByRole('IT_STAFF');
      } else {
        routeByRole('EMPLOYEE');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid email or password. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = (role: Role) => {
    demoLogin(role);
    routeByRole(role);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center gap-2 p-3 bg-blue-50 text-[#1E40AF] rounded-xl mb-4 shadow-sm border border-blue-100">
          <Shield className="w-8 h-8 text-[#1E40AF]" />
          <Sparkles className="w-5 h-5 text-[#0EA5E9]" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#1E293B]">IncidentIQ</h1>
        <p className="mt-1 text-sm text-slate-500 font-medium">
          Raise it. Classify it. Resolve it. Automatically.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-lg sm:px-10">
          {isSessionExpired && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-md">
              Your session has expired. Please sign in again to continue.
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-[#DC2626] text-xs rounded-md font-medium">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Corporate Email
              </label>
              <div className="relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="employee@incidentiq.com"
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md text-sm placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#1E40AF] focus:border-[#1E40AF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md text-sm placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#1E40AF] focus:border-[#1E40AF]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-md shadow-xs text-sm font-semibold text-white bg-[#1E40AF] hover:bg-blue-900 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-[#1E40AF] transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Personas */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center mb-3">
              One-Click Demo Switcher
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoSelect('EMPLOYEE')}
                className="flex flex-col items-center justify-center p-2 rounded-md border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-all text-left"
              >
                <UserCheck className="w-4 h-4 text-blue-600 mb-1" />
                <span className="text-xs font-bold text-slate-800">Employee</span>
                <span className="text-[10px] text-slate-500">Alex Rivers</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('IT_STAFF')}
                className="flex flex-col items-center justify-center p-2 rounded-md border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 transition-all text-left"
              >
                <UserCheck className="w-4 h-4 text-amber-600 mb-1" />
                <span className="text-xs font-bold text-slate-800">IT Staff</span>
                <span className="text-[10px] text-slate-500">Marcus Vance</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('ADMIN')}
                className="flex flex-col items-center justify-center p-2 rounded-md border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 transition-all text-left"
              >
                <UserCheck className="w-4 h-4 text-purple-600 mb-1" />
                <span className="text-xs font-bold text-slate-800">Admin</span>
                <span className="text-[10px] text-slate-500">Elena Rostova</span>
              </button>
            </div>
            <p className="mt-2 text-[11px] text-slate-400 text-center">
              Seed Password: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">password123</code>
            </p>
          </div>

          <div className="mt-6 text-center">
            <span className="text-xs text-slate-600">Don't have an account? </span>
            <Link to="/register" className="text-xs font-semibold text-[#0EA5E9] hover:underline">
              Register here
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-400">
          IncidentIQ · Team Pivot 4 · J.J. College of Engineering and Technology
        </div>
      </div>
    </div>
  );
};
