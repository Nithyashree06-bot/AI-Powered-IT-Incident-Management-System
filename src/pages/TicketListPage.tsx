import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { ticketService, INITIAL_CATEGORIES } from '../services/ticketStore';
import { Ticket, TicketStatus, Severity } from '../types';
import { SeverityBadge, StatusChip } from '../components/SeverityBadge';
import { SlaCountdown } from '../components/SlaCountdown';
import { PlusCircle, Search, Filter, RefreshCw, ChevronRight, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const TicketListPage: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await ticketService.fetchTickets();
      const safeData = Array.isArray(data) ? data : [];
      // If employee, filter to their tickets
      if (user?.role === 'EMPLOYEE') {
        setTickets(safeData.filter((t) => t.raisedBy?.id === user.id || t.raisedBy?.email === user.email));
      } else {
        setTickets(safeData);
      }
    } catch (err) {
      console.error('Failed to load tickets', err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [user]);

  const safeTickets = Array.isArray(tickets) ? tickets : [];
  const filteredTickets = safeTickets.filter((t) => {
    const titleStr = t.title || '';
    const descStr = t.description || '';
    const catStr = t.category?.name || '';

    const matchesSearch =
      titleStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      descStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      catStr.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesSeverity = severityFilter === 'ALL' || t.severity === severityFilter;
    const matchesCategory = categoryFilter === 'ALL' || catStr === categoryFilter;

    return matchesSearch && matchesStatus && matchesSeverity && matchesCategory;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-extrabold text-[#1E293B] tracking-tight">
              {user?.role === 'EMPLOYEE' ? 'My Reported Incidents' : 'Incident Triage & Tickets'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Real-time IT incident tracking with Gemini AI classification and SLA countdown monitors
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadTickets}
              className="p-2 border border-slate-300 rounded-md bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs"
              title="Refresh tickets"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <Link
              to="/tickets/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E40AF] hover:bg-blue-900 text-white rounded-md text-sm font-semibold shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Raise Incident
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search incidents by keyword, title, system..."
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-sm placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#1E40AF]"
              />
            </div>

            {/* Filter by Status */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-slate-300 rounded-md py-2 px-3 text-xs bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#1E40AF]"
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
              </select>

              {/* Filter by Severity */}
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="border border-slate-300 rounded-md py-2 px-3 text-xs bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#1E40AF]"
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>

              {/* Filter by Category */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border border-slate-300 rounded-md py-2 px-3 text-xs bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#1E40AF]"
              >
                <option value="ALL">All Categories</option>
                {INITIAL_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tickets List */}
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-4 border-[#1E40AF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-medium">Fetching incident queue...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center shadow-2xs">
            <div className="w-12 h-12 bg-emerald-50 text-[#16A34A] rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">🟢</span>
            </div>
            <h3 className="text-base font-bold text-slate-800">
              No incidents reported yet. Everything looks good!
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              All infrastructure and application systems are operating within target SLA bounds.
            </p>
            <div className="mt-4">
              <Link
                to="/tickets/new"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-[#1E40AF] hover:bg-blue-100 rounded text-xs font-semibold"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Raise New Ticket
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTickets.map((ticket) => (
              <Link
                key={ticket.id}
                to={`/tickets/${ticket.id}`}
                className="block bg-white rounded-lg border border-slate-200 p-5 shadow-2xs hover:shadow-sm hover:border-blue-300 transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        #{ticket.id}
                      </span>
                      <SeverityBadge severity={ticket.severity} />
                      <StatusChip status={ticket.status} />
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {ticket.category?.name || 'General'}
                      </span>
                      {ticket.slaBreached && (
                        <span className="text-[10px] font-bold text-[#DC2626] bg-red-50 border border-red-200 px-1.5 py-0.2 rounded">
                          SLA BREACHED
                        </span>
                      )}
                    </div>

                    <h2 className="text-base font-bold text-[#1E293B] group-hover:text-[#1E40AF] transition-colors">
                      {ticket.title}
                    </h2>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {ticket.description}
                    </p>
                  </div>

                  {/* Right side info */}
                  <div className="flex flex-row md:flex-col md:items-end justify-between items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <SlaCountdown
                      deadline={ticket.slaDeadline}
                      isBreached={ticket.slaBreached}
                      status={ticket.status}
                      resolvedAt={ticket.resolvedAt}
                    />

                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {ticket.assignedTo ? ticket.assignedTo.name : 'Unassigned'}
                      </span>
                      <span className="hidden sm:inline text-slate-300">•</span>
                      <span>
                        {new Date(ticket.createdAt).toLocaleDateString()} {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1E40AF] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};
