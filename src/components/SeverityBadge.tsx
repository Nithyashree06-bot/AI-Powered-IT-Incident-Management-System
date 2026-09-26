import React from 'react';
import { Severity, TicketStatus } from '../types';

export const SeverityBadge: React.FC<{ severity: Severity }> = ({ severity }) => {
  switch (severity) {
    case 'CRITICAL':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-[#DC2626] border border-red-200">
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-[#DC2626]" />
          CRITICAL
        </span>
      );
    case 'HIGH':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-[#EA580C] border border-orange-200">
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-[#EA580C]" />
          HIGH
        </span>
      );
    case 'MEDIUM':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-[#D97706] border border-amber-200">
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-[#D97706]" />
          MEDIUM
        </span>
      );
    case 'LOW':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-[#16A34A] border border-green-200">
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-[#16A34A]" />
          LOW
        </span>
      );
  }
};

export const StatusChip: React.FC<{ status: TicketStatus }> = ({ status }) => {
  switch (status) {
    case 'OPEN':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-[#1E40AF]">
          OPEN
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
          IN PROGRESS
        </span>
      );
    case 'RESOLVED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-[#16A34A]">
          RESOLVED
        </span>
      );
    case 'CLOSED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
          CLOSED
        </span>
      );
  }
};
