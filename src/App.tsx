import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { TicketListPage } from './pages/TicketListPage';
import { RaiseTicketPage } from './pages/RaiseTicketPage';
import { TicketDetailPage } from './pages/TicketDetailPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { SlaConfigPage } from './pages/SlaConfigPage';
import { TestSuitePage } from './pages/TestSuitePage';

const RootRedirect: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role === 'ADMIN') return <Navigate to="/dashboard" replace />;
  if (user.role === 'IT_STAFF') return <Navigate to="/tickets" replace />;
  return <Navigate to="/tickets/new" replace />;
};

// Placeholder for protected routes while building phases
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-lg border border-slate-200 p-6 shadow-xs">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div>
            <h1 className="text-xl font-bold text-slate-800">{title}</h1>
            <p className="text-xs text-slate-500 mt-1">Logged in as {user?.name} ({user?.role})</p>
          </div>
          <button
            onClick={logout}
            className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded transition-colors"
          >
            Logout
          </button>
        </div>
        <p className="mt-4 text-sm text-slate-600">
          Phase 3 Authentication is active! This module will be wired in the upcoming phase.
        </p>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'IT_STAFF', 'EMPLOYEE']}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'IT_STAFF', 'EMPLOYEE']}>
                <TicketListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/new"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE', 'ADMIN', 'IT_STAFF']}>
                <RaiseTicketPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/:id"
            element={
              <ProtectedRoute>
                <TicketDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'IT_STAFF']}>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <UserManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/sla"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <SlaConfigPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test-suite"
            element={
              <ProtectedRoute>
                <TestSuitePage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
