import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#1E40AF] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 font-medium text-sm">Authenticating session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg border border-slate-200 shadow-sm p-8 text-center">
          <div className="w-14 h-14 bg-red-50 text-[#DC2626] rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-[#1E293B] mb-2">403 — Access Denied</h1>
          <p className="text-slate-600 text-sm mb-6">
            You don't have permission to view this page. This resource is restricted to authorized roles.
          </p>
          <div className="bg-slate-50 rounded p-3 mb-6 text-xs text-slate-500 font-mono">
            Current Role: <span className="font-semibold text-slate-700">{user.role}</span> | Required: {allowedRoles.join(', ')}
          </div>
          <Link
            to={user.role === 'ADMIN' ? '/dashboard' : user.role === 'IT_STAFF' ? '/tickets' : '/tickets/new'}
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#1E40AF] hover:bg-blue-900 text-white rounded-md text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Authorized Portal
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
