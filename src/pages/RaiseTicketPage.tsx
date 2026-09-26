import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { ticketService, INITIAL_CATEGORIES } from '../services/ticketStore';
import { classifyIncidentApi } from '../services/api';
import { IncidentClassificationResponse } from '../types';
import { AiResolutionBox } from '../components/AiResolutionBox';
import { SeverityBadge } from '../components/SeverityBadge';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, AlertCircle, HelpCircle, CheckCircle } from 'lucide-react';

export const RaiseTicketPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [aiPreview, setAiPreview] = useState<IncidentClassificationResponse | null>(null);
  const [analyzingAi, setAnalyzingAi] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAiAnalyze = async () => {
    if (description.trim().length < 20) {
      setError('Please provide at least 20 characters in the description before running AI diagnosis.');
      return;
    }
    setError(null);
    setAnalyzingAi(true);
    try {
      const result = await classifyIncidentApi(description);
      setAiPreview(result);
      // Auto-select category if none selected
      if (!categoryId) {
        const found = INITIAL_CATEGORIES.find(
          (c) => c.name.toLowerCase() === result.category.toLowerCase()
        );
        if (found) setCategoryId(found.id);
      }
    } catch (err) {
      console.error('AI diagnosis error', err);
    } finally {
      setAnalyzingAi(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Incident title is required.');
      return;
    }

    if (description.trim().length < 20) {
      setError('Incident description must contain at least 20 characters for accurate AI classification.');
      return;
    }

    if (!user) {
      setError('You must be logged in to raise an incident ticket.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await ticketService.createTicket(
        title,
        description,
        categoryId ? Number(categoryId) : null,
        user
      );
      navigate(`/tickets/${created.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create ticket.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1E293B] tracking-tight">
            Raise New Incident
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Submit incident symptoms. Gemini AI will automatically categorize, assign severity, and calculate the SLA window.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-[#DC2626] text-xs rounded-md flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-2xs space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Incident Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Primary VPN Tunnel Gateway Dropouts During Peak Hours"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#1E40AF]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Detailed Incident Description <span className="text-red-500">*</span>
                </label>
                <span className={`text-[11px] font-mono ${description.length < 20 ? 'text-amber-600' : 'text-slate-400'}`}>
                  {description.length} / min 20 chars
                </span>
              </div>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what occurred, affected applications/hosts, error messages received, and scope of impact..."
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#1E40AF]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Suspected Category (Optional)
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-[#1E40AF]"
                >
                  <option value="">Auto-Detect via Gemini AI</option>
                  {INITIAL_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.slaHours}h SLA)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleAiAnalyze}
                  disabled={analyzingAi || description.length < 20}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-[#0D9488] bg-teal-50 hover:bg-teal-100 text-[#0D9488] rounded-md text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
                >
                  {analyzingAi ? (
                    <div className="w-4 h-4 border-2 border-[#0D9488] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Preview Gemini AI Diagnosis
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* AI Live Preview Card */}
          {aiPreview && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600 px-1">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-teal-600" />
                  Gemini AI Pre-Classification Result:
                </span>
                <span className="text-slate-400">Target SLA: {aiPreview.severity === 'CRITICAL' ? '1 hour' : aiPreview.severity === 'HIGH' ? '4 hours' : aiPreview.severity === 'MEDIUM' ? '8 hours' : '24 hours'}</span>
              </div>
              <AiResolutionBox
                stepsJson={JSON.stringify(aiPreview.resolution_steps)}
                categoryName={aiPreview.category}
                severity={aiPreview.severity}
              />
            </div>
          )}

          {/* Submission Bar */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/tickets')}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || description.length < 20 || !title.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1E40AF] hover:bg-blue-900 text-white rounded-md text-sm font-semibold shadow-xs transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Submit Incident Ticket <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};
