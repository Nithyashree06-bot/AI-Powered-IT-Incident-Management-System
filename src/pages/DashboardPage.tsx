import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';
import { ticketService } from '../services/ticketStore';
import { Ticket } from '../types';
import { SeverityBadge, StatusChip } from '../components/SeverityBadge';
import { SlaCountdown } from '../components/SlaCountdown';
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  BarChart3,
  Users,
  Sparkles,
  Inbox,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await ticketService.fetchTickets();
        setTickets(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const safeTickets = Array.isArray(tickets) ? tickets : [];
  const total = safeTickets.length;
  const openCount = safeTickets.filter((t) => t.status === 'OPEN').length;
  const inProgressCount = safeTickets.filter((t) => t.status === 'IN_PROGRESS').length;
  const resolvedCount = safeTickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
  const breachedCount = safeTickets.filter((t) => Boolean(t.slaBreached)).length;

  const criticalAndHigh = safeTickets
    .filter((t) => (t.severity === 'CRITICAL' || t.severity === 'HIGH') && t.status !== 'RESOLVED' && t.status !== 'CLOSED')
    .slice(0, 5);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top welcome */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-extrabold text-[#1E293B] tracking-tight">
              Incident Management Overview
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Welcome back, <strong className="text-slate-700">{user?.name}</strong>. Here is the operational state of IT infrastructure.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/tickets/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#1E40AF] hover:bg-blue-900 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Raise Incident
            </Link>

            <Link
              to="/tickets"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold shadow-2xs transition-colors"
            >
              <Inbox className="w-4 h-4 text-slate-500" />
              View Queue
            </Link>
          </div>
        </div>

        {/* 4 Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Incidents</span>
              <div className="p-2 bg-blue-50 text-[#1E40AF] rounded-md">
                <Inbox className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[#1E293B]">{total}</span>
              <span className="text-[11px] text-slate-500">logged in system</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Queue</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-md">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-amber-700">{openCount + inProgressCount}</span>
              <span className="text-[11px] text-slate-500">
                ({openCount} open, {inProgressCount} in progress)
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Resolved Rate</span>
              <div className="p-2 bg-emerald-50 text-[#16A34A] rounded-md">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[#16A34A]">{resolvedCount}</span>
              <span className="text-[11px] text-slate-500">
                ({total > 0 ? Math.round((resolvedCount / total) * 100) : 0}% compliance)
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">SLA Breaches</span>
              <div className="p-2 bg-red-50 text-[#DC2626] rounded-md">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className={`text-2xl font-extrabold ${breachedCount > 0 ? 'text-[#DC2626]' : 'text-slate-800'}`}>
                {breachedCount}
              </span>
              <span className="text-[11px] text-slate-500">
                {breachedCount > 0 ? 'Urgent attention' : 'Zero breaches'}
              </span>
            </div>
          </div>
        </div>

        {/* Gemini AI Triage Banner */}
        <div className="rounded-lg p-4 bg-gradient-to-r from-teal-900 to-blue-900 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-lg text-teal-300">
              <Sparkles className="w-6 h-6 text-teal-300" />
            </div>
            <div>
              <h2 className="text-sm font-bold flex items-center gap-2">
                Google Gemini AI Triage Engine Active
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-teal-500/20 text-teal-300 rounded border border-teal-500/40">
                  Real-Time
                </span>
              </h2>
              <p className="text-xs text-blue-200 mt-0.5">
                Every incident is classified into Network, Hardware, Software, or Security with auto-assigned SLA windows and step-by-step resolution playbooks.
              </p>
            </div>
          </div>

          <Link
            to="/tickets/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-teal-950 font-bold text-xs rounded-md shadow-xs transition-colors shrink-0"
          >
            Test AI Triage <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Urgent Attention Incidents */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#DC2626]" />
              <h2 className="text-sm font-bold text-slate-800">
                High Priority & Urgent Incidents ({criticalAndHigh.length})
              </h2>
            </div>
            <Link to="/tickets" className="text-xs font-semibold text-[#0EA5E9] hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {criticalAndHigh.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center italic">
              No Critical or High priority active incidents. Systems running smoothly.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {criticalAndHigh.map((ticket) => (
                <div key={ticket.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400 font-bold">#{ticket.id}</span>
                      <SeverityBadge severity={ticket.severity} />
                      <StatusChip status={ticket.status} />
                      <span className="text-xs font-medium text-slate-500">{ticket.category?.name}</span>
                    </div>
                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="text-sm font-bold text-slate-900 hover:text-[#1E40AF] transition-colors block"
                    >
                      {ticket.title}
                    </Link>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <SlaCountdown
                      deadline={ticket.slaDeadline}
                      isBreached={ticket.slaBreached}
                      status={ticket.status}
                      resolvedAt={ticket.resolvedAt}
                    />
                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="px-2.5 py-1 text-xs font-semibold text-[#1E40AF] bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                    >
                      View Detail
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};
