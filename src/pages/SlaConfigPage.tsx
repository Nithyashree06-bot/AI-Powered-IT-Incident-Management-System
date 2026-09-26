import React, { useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { INITIAL_CATEGORIES } from '../services/ticketStore';
import {
  Clock,
  Save,
  CheckCircle2,
  AlertTriangle,
  BellRing,
  Sliders,
  ShieldAlert,
} from 'lucide-react';

export const SlaConfigPage: React.FC = () => {
  const [severityHours, setSeverityHours] = useState({
    CRITICAL: 1,
    HIGH: 4,
    MEDIUM: 8,
    LOW: 24,
  });

  const [categorySlas, setCategorySlas] = useState(
    INITIAL_CATEGORIES.map((c) => ({ ...c }))
  );

  const [escalationWarningPercent, setEscalationWarningPercent] = useState(80);
  const [notifyOnBreach, setNotifyOnBreach] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleCategoryHourChange = (id: number, hours: number) => {
    setCategorySlas((prev) =>
      prev.map((c) => (c.id === id ? { ...c, slaHours: Math.max(1, hours) } : c))
    );
  };

  const handleSeverityChange = (sev: keyof typeof severityHours, val: number) => {
    setSeverityHours((prev) => ({
      ...prev,
      [sev]: Math.max(1, val),
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-extrabold text-[#1E293B] tracking-tight">
              SLA Threshold & Escalation Configuration
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Define corporate resolution timeframes, auto-calculation rules, and breach alerts
            </p>
          </div>

          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E40AF] hover:bg-blue-900 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" /> Save Configuration
          </button>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-[#16A34A] rounded-lg text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            SLA policy rules and category thresholds updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Standard Severity Thresholds */}
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#1E40AF]" />
                Severity Target Windows (Rule 8 Standard)
              </h2>
              <span className="text-xs text-slate-400">Used by Gemini AI auto-assignment</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-md border border-red-200 bg-red-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#DC2626] uppercase">CRITICAL Severity</span>
                  <span className="text-[10px] text-red-600 font-semibold">Immediate Priority</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Total system outage, core switch offline, security intrusion.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="number"
                    min={1}
                    max={48}
                    value={severityHours.CRITICAL}
                    onChange={(e) => handleSeverityChange('CRITICAL', Number(e.target.value))}
                    className="w-20 px-2 py-1 border border-red-300 rounded text-xs bg-white font-bold"
                  />
                  <span className="text-xs text-slate-700 font-medium">Hour(s) Max SLA</span>
                </div>
              </div>

              <div className="p-4 rounded-md border border-orange-200 bg-orange-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#EA580C] uppercase">HIGH Severity</span>
                  <span className="text-[10px] text-orange-600 font-semibold">Urgent Workstation/VPN</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Multiple users affected, primary business tool degraded.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="number"
                    min={1}
                    max={72}
                    value={severityHours.HIGH}
                    onChange={(e) => handleSeverityChange('HIGH', Number(e.target.value))}
                    className="w-20 px-2 py-1 border border-orange-300 rounded text-xs bg-white font-bold"
                  />
                  <span className="text-xs text-slate-700 font-medium">Hour(s) Max SLA</span>
                </div>
              </div>

              <div className="p-4 rounded-md border border-amber-200 bg-amber-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#D97706] uppercase">MEDIUM Severity</span>
                  <span className="text-[10px] text-amber-700 font-semibold">Normal Workflow</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Individual application errors with viable workaround.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="number"
                    min={1}
                    max={96}
                    value={severityHours.MEDIUM}
                    onChange={(e) => handleSeverityChange('MEDIUM', Number(e.target.value))}
                    className="w-20 px-2 py-1 border border-amber-300 rounded text-xs bg-white font-bold"
                  />
                  <span className="text-xs text-slate-700 font-medium">Hour(s) Max SLA</span>
                </div>
              </div>

              <div className="p-4 rounded-md border border-green-200 bg-green-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#16A34A] uppercase">LOW Severity</span>
                  <span className="text-[10px] text-green-700 font-semibold">Routine Request</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Peripheral adjustments, cosmetic fixes, non-urgent inquiries.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={severityHours.LOW}
                    onChange={(e) => handleSeverityChange('LOW', Number(e.target.value))}
                    className="w-20 px-2 py-1 border border-green-300 rounded text-xs bg-white font-bold"
                  />
                  <span className="text-xs text-slate-700 font-medium">Hour(s) Max SLA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Category Base Targets */}
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0EA5E9]" />
                Category Default Windows
              </h2>
              <span className="text-xs text-slate-400">Baseline hours when unclassified</span>
            </div>

            <div className="divide-y divide-slate-100">
              {categorySlas.map((cat) => (
                <div key={cat.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-slate-900">{cat.name}</span>
                    <p className="text-[11px] text-slate-500">{cat.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="number"
                      min={1}
                      max={48}
                      value={cat.slaHours}
                      onChange={(e) => handleCategoryHourChange(cat.id, Number(e.target.value))}
                      className="w-16 px-2 py-1 border border-slate-300 rounded text-xs text-center font-bold"
                    />
                    <span className="text-xs text-slate-600">Hours Baseline</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Escalation & Notifications */}
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <BellRing className="w-4 h-4 text-amber-500" />
                Escalation Triggers & Breach Protocols
              </h2>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Yellow Urgency Warning Threshold</span>
                  <p className="text-slate-500 text-[11px]">
                    Turn SLA countdown amber and alert engineer when time elapsed reaches percentage
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={50}
                    max={95}
                    value={escalationWarningPercent}
                    onChange={(e) => setEscalationWarningPercent(Number(e.target.value))}
                    className="w-16 px-2 py-1 border border-slate-300 rounded text-xs text-center font-bold"
                  />
                  <span className="text-slate-700 font-semibold">% elapsed</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <span className="font-bold text-slate-800 block">Automated SLA Breach Escalation</span>
                  <p className="text-slate-500 text-[11px]">
                    Highlight ticket red, record breach event, and notify IT lead immediately
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyOnBreach}
                    onChange={(e) => setNotifyOnBreach(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1E40AF]"></div>
                </label>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};
