export type Role = 'EMPLOYEE' | 'IT_STAFF' | 'ADMIN';

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  department?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  slaHours: number;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  severity: Severity;
  status: TicketStatus;
  category: Category;
  raisedBy: User;
  assignedTo?: User | null;
  aiResolution?: string;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string | null;
  slaDeadline: string;
  slaBreached: boolean;
}

export interface TicketComment {
  id: number;
  ticketId: number;
  user: User;
  comment: string;
  createdAt: string;
}

export interface TicketHistory {
  id: number;
  ticketId: number;
  changedBy: User;
  oldStatus?: string | null;
  newStatus: string;
  changedAt: string;
}

export interface IncidentClassificationResponse {
  severity: Severity;
  category: string;
  resolution_steps: string[];
}

export interface AnalyticsSummary {
  totalTickets: number;
  openCount: number;
  inProgressCount: number;
  resolvedCount: number;
  closedCount: number;
  breachedCount: number;
  severityBreakdown: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  resolutionTrends: { date: string; avgHours: number; resolvedCount: number }[];
  teamPerformance: { staffName: string; resolvedCount: number; activeCount: number }[];
}

export interface AuthResponse {
  token: string;
  type: string;
  user: User;
}
