import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { TicketStatus } from '../types';

interface SlaCountdownProps {
  deadline: string;
  isBreached: boolean;
  status: TicketStatus;
  resolvedAt?: string | null;
}

export const SlaCountdown: React.FC<SlaCountdownProps> = ({ deadline, isBreached, status, resolvedAt }) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isNegative: boolean }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isNegative: false,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = resolvedAt ? new Date(resolvedAt).getTime() : Date.now();
      const target = new Date(deadline).getTime();
      const diff = target - now;

      if (diff <= 0) {
        const absDiff = Math.abs(diff);
        const hours = Math.floor(absDiff / (1000 * 60 * 60));
        const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((absDiff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds, isNegative: true });
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds, isNegative: false });
      }
    };

    updateCountdown();
    if (status === 'RESOLVED' || status === 'CLOSED') {
      return;
    }

    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [deadline, status, resolvedAt]);

  if (status === 'RESOLVED' || status === 'CLOSED') {
    if (isBreached) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#DC2626] bg-red-50 border border-red-200 px-2 py-0.5 rounded">
          <AlertTriangle className="w-3.5 h-3.5" />
          Resolved (SLA Breached)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#16A34A] bg-green-50 border border-green-200 px-2 py-0.5 rounded">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Resolved within SLA
      </span>
    );
  }

  if (isBreached || timeLeft.isNegative) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#DC2626] bg-red-100/90 border border-red-300 px-2 py-0.5 rounded animate-pulse">
        <AlertTriangle className="w-3.5 h-3.5" />
        BREACHED (-{timeLeft.hours}h {timeLeft.minutes}m)
      </span>
    );
  }

  const isUrgent = timeLeft.hours === 0 && timeLeft.minutes < 30;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded border ${
        isUrgent
          ? 'text-[#D97706] bg-amber-50 border-amber-300'
          : 'text-slate-600 bg-slate-100 border-slate-200'
      }`}
    >
      <Clock className="w-3.5 h-3.5" />
      {timeLeft.hours > 0 ? `${timeLeft.hours}h ` : ''}
      {timeLeft.minutes}m {timeLeft.seconds}s remaining
    </span>
  );
};
