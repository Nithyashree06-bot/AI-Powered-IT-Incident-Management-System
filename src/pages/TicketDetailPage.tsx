import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { ticketService } from '../services/ticketStore';
import { Ticket, TicketComment, TicketHistory, TicketStatus } from '../types';
import { SeverityBadge, StatusChip } from '../components/SeverityBadge';
import { SlaCountdown } from '../components/SlaCountdown';
import { AiResolutionBox } from '../components/AiResolutionBox';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Clock,
  User,
  Send,
  CheckCircle2,
  Play,
  RotateCcw,
  AlertTriangle,
  History,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

export const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [history, setHistory] = useState<TicketHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadTicketData = async () => {
    if (!id) return;
    try {
      const data = await ticketService.getTicketDetail(Number(id));
      setTicket(data.ticket);
      setComments(data.comments);
      setHistory(data.history);
    } catch (err) {
      console.error('Failed to load ticket details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicketData();
  }, [id]);

  const handleStatusChange = async (newStatus: TicketStatus, notes?: string) => {
    if (!ticket || !user) return;
    setUpdatingStatus(true);
    try {
      const updated = await ticketService.updateStatus(ticket.id, newStatus, notes, user);
      setTicket(updated);
      await loadTicketData();
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket || !user || !commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const newComment = await ticketService.addComment(ticket.id, commentText, user);
      setComments((prev) => [...prev, newComment]);
      setCommentText('');
    } catch (err) {
      console.error('Failed to post comment', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-[#1E40AF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading ticket details...</p>
        </div>
      </AppLayout>
    );
  }

  if (!ticket) {
    return (
      <AppLayout>
        <div className="bg-white p-8 rounded-lg border border-slate-200 text-center max-w-md mx-auto">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-800">Incident Ticket Not Found</h2>
          <p className="text-xs text-slate-500 mt-1 mb-4">The ticket requested does not exist or has been removed.</p>
          <Link
            to="/tickets"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E40AF] text-white rounded text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Tickets
          </Link>
        </div>
      </AppLayout>
    );
  }

  const isStaffOrAdmin = user?.role === 'IT_STAFF' || user?.role === 'ADMIN';

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Top Back bar & Status Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={() => navigate('/tickets')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Incidents
          </button>

          {/* Quick IT Staff Status Transitions */}
          {isStaffOrAdmin && (
            <div className="flex items-center gap-2">
              {ticket.status === 'OPEN' && (
                <button
                  onClick={() => handleStatusChange('IN_PROGRESS', 'Engineer began troubleshooting steps')}
                  disabled={updatingStatus}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs font-semibold shadow-2xs transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Start Working
                </button>
              )}

              {ticket.status === 'IN_PROGRESS' && (
                <button
                  onClick={() => handleStatusChange('RESOLVED', 'Issue resolved following diagnostic checklist')}
                  disabled={updatingStatus}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#16A34A] hover:bg-green-700 text-white rounded text-xs font-semibold shadow-2xs transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
                </button>
              )}

              {ticket.status === 'RESOLVED' && (
                <>
                  <button
                    onClick={() => handleStatusChange('CLOSED', 'Closed out after user verification')}
                    disabled={updatingStatus}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-2xs transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" /> Close Ticket
                  </button>
                  <button
                    onClick={() => handleStatusChange('IN_PROGRESS', 'Reopened by support engineer for further checks')}
                    disabled={updatingStatus}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Re-open
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* SLA Breach Alert Banner */}
        {ticket.slaBreached && (
          <div className="p-3 bg-red-50 border border-red-300 rounded-lg flex items-center justify-between text-xs text-[#DC2626]">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>SLA Target Breached: Target resolution window was exceeded.</span>
            </div>
            <span className="text-[11px] underline font-medium">Flagged in System Analytics</span>
          </div>
        )}

        {/* Main Incident Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-slate-400">
                Ticket #{ticket.id}
              </span>
              <SeverityBadge severity={ticket.severity} />
              <StatusChip status={ticket.status} />
              <span className="text-xs px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                {ticket.category?.name || 'General'}
              </span>
            </div>

            <SlaCountdown
              deadline={ticket.slaDeadline}
              isBreached={ticket.slaBreached}
              status={ticket.status}
              resolvedAt={ticket.resolvedAt}
            />
          </div>

          <div>
            <h1 className="text-xl font-bold text-[#1E293B] mb-2">{ticket.title}</h1>
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50/70 p-4 rounded-md border border-slate-200 font-mono text-xs">
              {ticket.description}
            </p>
          </div>

          {/* Meta details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 text-xs border-t border-slate-100">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Raised By</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {ticket.raisedBy?.name}
              </span>
              <span className="text-[10px] text-slate-500">{ticket.raisedBy?.department}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Engineer</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                {ticket.assignedTo ? ticket.assignedTo.name : 'Auto-Assigning...'}
              </span>
              <span className="text-[10px] text-slate-500">{ticket.assignedTo?.department || 'IT Helpdesk'}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Created At</span>
              <span className="font-medium text-slate-700 mt-0.5 block">
                {new Date(ticket.createdAt).toLocaleString()}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">SLA Deadline</span>
              <span className="font-medium text-slate-700 mt-0.5 block">
                {new Date(ticket.slaDeadline).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Gemini AI Resolution Section */}
        <AiResolutionBox
          stepsJson={ticket.aiResolution}
          categoryName={ticket.category?.name}
          severity={ticket.severity}
        />

        {/* Two-Column: Comments Thread & Audit History */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Comments (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#1E40AF]" />
                Incident Communication & Notes ({comments.length})
              </h3>

              <div className="space-y-3">
                {comments.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center italic">
                    No comments yet. Post an update or resolution note below.
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-3 rounded-md border border-slate-100 bg-slate-50 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          {comment.user.name}
                          <span className="text-[9px] uppercase font-semibold px-1 py-0.2 rounded bg-slate-200 text-slate-700">
                            {comment.user.role}
                          </span>
                        </span>
                        <span className="text-slate-400">
                          {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {comment.comment}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="pt-2 border-t border-slate-100 space-y-2">
                <textarea
                  rows={2}
                  required
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add communication note, troubleshooting update, or diagnostic feedback..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#1E40AF]"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingComment || !commentText.trim()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1E40AF] hover:bg-blue-900 text-white rounded text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    <Send className="w-3 h-3" /> Post Note
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Audit History Timeline (1 col) */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <History className="w-4 h-4 text-slate-500" />
                Audit Trail ({history.length})
              </h3>

              <div className="relative pl-4 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {history.map((hist, i) => (
                  <div key={hist.id || i} className="relative text-xs">
                    <div className="absolute -left-4 top-1 w-2.5 h-2.5 rounded-full bg-[#1E40AF] ring-4 ring-white" />
                    <div>
                      <p className="font-semibold text-slate-800 text-[11px]">
                        {hist.oldStatus ? (
                          <>
                            <span className="text-slate-400">{hist.oldStatus}</span> →{' '}
                            <span className="text-[#1E40AF]">{hist.newStatus}</span>
                          </>
                        ) : (
                          <span>Created Ticket ({hist.newStatus})</span>
                        )}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        By {hist.changedBy.name} • {new Date(hist.changedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
