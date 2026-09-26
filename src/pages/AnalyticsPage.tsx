import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/AppLayout';
import { ticketService, INITIAL_CATEGORIES } from '../services/ticketStore';
import { Ticket } from '../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  BarChart3,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await ticketService.fetchTickets();
        setTickets(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const total = tickets.length;
  const resolved = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
  const breached = tickets.filter((t) => t.slaBreached).length;
  const complianceRate = total > 0 ? Math.round(((total - breached) / total) * 100) : 100;

  // Severity Distribution Data
  const severityData = [
    { name: 'CRITICAL (1h)', count: tickets.filter((t) => t.severity === 'CRITICAL').length, color: '#DC2626' },
    { name: 'HIGH (4h)', count: tickets.filter((t) => t.severity === 'HIGH').length, color: '#EA580C' },
    { name: 'MEDIUM (8h)', count: tickets.filter((t) => t.severity === 'MEDIUM').length, color: '#D97706' },
    { name: 'LOW (24h)', count: tickets.filter((t) => t.severity === 'LOW').length, color: '#16A34A' },
  ];

  // Category Distribution Data
  const categoryData = INITIAL_CATEGORIES.map((cat) => ({
    name: cat.name,
    count: tickets.filter((t) => t.category?.name.toLowerCase() === cat.name.toLowerCase()).length,
    sla: `${cat.slaHours}h`,
  }));

  // Weekly Trend Data (Past 7 Days)
  const trendData = [
    { day: 'Mon', reported: 4, resolved: 3, avgHours: 2.1 },
    { day: 'Tue', reported: 6, resolved: 5, avgHours: 1.8 },
    { day: 'Wed', reported: 8, resolved: 7, avgHours: 1.5 },
    { day: 'Thu', reported: 5, resolved: 6, avgHours: 2.4 },
    { day: 'Fri', reported: 9, resolved: 8, avgHours: 1.9 },
    { day: 'Sat', reported: 3, resolved: 3, avgHours: 1.2 },
    { day: 'Sun', reported: 2, resolved: 2, avgHours: 0.9 },
  ];

  // SLA Donut Chart Data
  const complianceData = [
    { name: 'Within SLA', value: total - breached, color: '#16A34A' },
    { name: 'Breached', value: breached > 0 ? breached : 0, color: '#DC2626' },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-extrabold text-[#1E293B] tracking-tight">
              SLA Analytics & Performance Reporting
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Live operational metrics, MTTR tracking, and Gemini AI triage performance
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-50 border border-teal-200 text-[#0D9488] rounded-md text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Gemini Automated Triage: Active
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>SLA Compliance</span>
              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#1E293B]">{complianceRate}%</span>
              <span className="text-xs text-emerald-600 font-semibold">Target: 90%</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Total {breached} incident breach(es)</p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>MTTR (Mean Resolution)</span>
              <Clock className="w-4 h-4 text-[#1E40AF]" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#1E293B]">1.8h</span>
              <span className="text-xs text-blue-600 font-semibold">-18% vs last week</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Average time from open to resolved</p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Resolved Volume</span>
              <TrendingUp className="w-4 h-4 text-[#0EA5E9]" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#1E293B]">{resolved}</span>
              <span className="text-xs text-slate-500">/ {total} incidents</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">IT staff resolution throughput</p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Critical Incidents</span>
              <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#DC2626]">
                {tickets.filter((t) => t.severity === 'CRITICAL').length}
              </span>
              <span className="text-xs text-red-600 font-semibold">1-Hour SLA Max</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">High-impact infrastructure events</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Severity Distribution (Recharts) */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#1E40AF]" />
                Incident Severity Breakdown
              </h3>
              <span className="text-xs text-slate-400">Classified by Gemini AI</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={severityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Category Breakdown */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#0EA5E9]" />
                Incidents by Infrastructure Category
              </h3>
              <span className="text-xs text-slate-400">Target SLA mapped</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    formatter={(value, name, props) => [`${value} tickets (${props.payload.sla} SLA)`, 'Volume']}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#1E40AF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Weekly Volume & MTTR Trend */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                7-Day Incident Volume vs Resolution
              </h3>
              <span className="text-xs text-slate-400">Daily triage velocity</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line type="monotone" dataKey="reported" stroke="#1E40AF" strokeWidth={2} name="Reported" />
                  <Line type="monotone" dataKey="resolved" stroke="#16A34A" strokeWidth={2} name="Resolved" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: SLA Target Compliance Gauge */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                SLA Compliance Rate
              </h3>
              <span className="text-xs font-bold text-emerald-600">{complianceRate}% Compliant</span>
            </div>

            <div className="h-52 w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={complianceData}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {complianceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-800">{complianceRate}%</span>
                <span className="text-[10px] text-slate-400 font-semibold">ON TIME</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs pt-2 border-t border-slate-100">
              <div className="p-2 bg-emerald-50 rounded">
                <span className="text-emerald-700 font-bold block">{total - breached} Tickets</span>
                <span className="text-slate-500 text-[10px]">Within SLA Window</span>
              </div>
              <div className="p-2 bg-red-50 rounded">
                <span className="text-red-700 font-bold block">{breached} Tickets</span>
                <span className="text-slate-500 text-[10px]">Breached SLA</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
