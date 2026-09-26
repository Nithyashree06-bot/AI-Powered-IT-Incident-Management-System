import { Ticket, TicketComment, TicketHistory, Severity, Category, User, TicketStatus } from '../types';
import { api, SEED_USERS, classifyIncidentApi } from './api';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 1, name: 'Network', description: 'Network switches, VPN, internet connectivity, and routers', slaHours: 4 },
  { id: 2, name: 'Hardware', description: 'Physical workstations, monitors, docks, and peripheral equipment', slaHours: 8 },
  { id: 3, name: 'Software', description: 'Operating system anomalies, office suites, and corporate tools', slaHours: 8 },
  { id: 4, name: 'Security', description: 'Unauthorized access, malicious software alerts, and identity breaches', slaHours: 1 },
];

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: 1,
    title: 'Core Data Center Network Switch Offline',
    description: 'The primary 10GbE network core switch in DC-1 rack B3 has experienced an unexpected hardware power failure causing severe packet loss and outage across regional office services.',
    severity: 'CRITICAL',
    status: 'OPEN',
    category: INITIAL_CATEGORIES[0],
    raisedBy: SEED_USERS.EMPLOYEE,
    assignedTo: SEED_USERS.IT_STAFF,
    aiResolution: JSON.stringify([
      'Inspect redundant power supplies and PDU feed lines.',
      'Connect via serial console to diagnose kernel panic or hardware faults.',
      'Failover gateway routes to backup core switch B4 immediately.',
      'Replace faulty PSU module or switch unit if unrecoverable.',
    ]),
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    slaDeadline: new Date(Date.now() + 40 * 60 * 1000).toISOString(),
    slaBreached: false,
  },
  {
    id: 2,
    title: 'Global VPN Gateway Unresponsive for Remote Engineers',
    description: 'Remote employees and developers are unable to establish IPsec/SSL VPN tunnels. The RADIUS authentication requests time out after 30 seconds.',
    severity: 'HIGH',
    status: 'IN_PROGRESS',
    category: INITIAL_CATEGORIES[0],
    raisedBy: SEED_USERS.EMPLOYEE,
    assignedTo: SEED_USERS.IT_STAFF,
    aiResolution: JSON.stringify([
      'Check IPsec tunnel process status on perimeter firewall.',
      'Verify RADIUS and Active Directory directory sync services.',
      'Restart VPN gateway daemon and monitor incoming handshakes.',
      'Allocate additional buffer connections in cluster.',
    ]),
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    slaDeadline: new Date(Date.now() + 180 * 60 * 1000).toISOString(),
    slaBreached: false,
  },
  {
    id: 3,
    title: 'Outlook & Teams Desktop Apps Crashing on Windows 11 Update',
    description: 'Multiple users in the Finance department report Outlook and Microsoft Teams crash immediately upon launch following yesterday cumulative OS security patch.',
    severity: 'MEDIUM',
    status: 'OPEN',
    category: INITIAL_CATEGORIES[2],
    raisedBy: SEED_USERS.EMPLOYEE,
    assignedTo: SEED_USERS.IT_STAFF,
    aiResolution: JSON.stringify([
      'Run Outlook in Safe Mode using outlook.exe /safe.',
      'Clear corrupt local Teams cache under %appdata%\\Microsoft\\Teams.',
      'Roll back or reinstall patch KB5034123 via PowerShell if fault persists.',
      'Push Office quick repair script across affected host group.',
    ]),
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    slaDeadline: new Date(Date.now() + 360 * 60 * 1000).toISOString(),
    slaBreached: false,
  },
  {
    id: 4,
    title: 'Secondary Dell 4K Monitor Display Flickering via DisplayPort',
    description: 'Second external monitor intermittently flickers black every 20-30 seconds during intensive spreadsheet work on workstation WS-402.',
    severity: 'LOW',
    status: 'RESOLVED',
    category: INITIAL_CATEGORIES[1],
    raisedBy: SEED_USERS.EMPLOYEE,
    assignedTo: SEED_USERS.IT_STAFF,
    aiResolution: JSON.stringify([
      'Replace DisplayPort cable with certified VESA 1.4 rated cable.',
      'Update Intel/NVIDIA UHD Graphics display drivers to latest enterprise driver.',
      'Test display refresh rate set to 60Hz instead of 59.94Hz in display settings.',
    ]),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    slaDeadline: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    slaBreached: false,
  },
  {
    id: 5,
    title: 'Anomalous Database Query Volume & Unauthorized Port Scan',
    description: 'Intrusion Detection System (IDS) alerted to repeated unauthorized connection attempts on MySQL production port 3306 originating from internal staging IP subnet.',
    severity: 'CRITICAL',
    status: 'IN_PROGRESS',
    category: INITIAL_CATEGORIES[3],
    raisedBy: SEED_USERS.EMPLOYEE,
    assignedTo: SEED_USERS.IT_STAFF,
    aiResolution: JSON.stringify([
      'Immediately isolate source IP subnet via host firewall rule.',
      'Dump active database connections and inspect slow query audit logs.',
      'Revoke exposed credentials and rotate DB secret keys.',
      'Initiate full root cause analysis security review.',
    ]),
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    slaDeadline: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    slaBreached: false,
  },
];

export const INITIAL_COMMENTS: Record<number, TicketComment[]> = {
  1: [
    {
      id: 1,
      ticketId: 1,
      user: SEED_USERS.EMPLOYEE,
      comment: 'Outage began at approximately 02:00 UTC. Secondary failover did not trigger automatically.',
      createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      ticketId: 1,
      user: SEED_USERS.IT_STAFF,
      comment: 'Acknowledged. IT Network team is dispatched to data center rack B3 with replacement power modules.',
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    },
  ],
  2: [
    {
      id: 3,
      ticketId: 2,
      user: SEED_USERS.IT_STAFF,
      comment: 'Restarted primary RADIUS daemon. Monitoring VPN connection pool utilization now.',
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
  ],
  4: [
    {
      id: 4,
      ticketId: 4,
      user: SEED_USERS.IT_STAFF,
      comment: 'Replaced DisplayPort cable and updated Dell display drivers. Verified issue resolved with user.',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
  ],
};

export const INITIAL_HISTORY: Record<number, TicketHistory[]> = {
  1: [
    { id: 1, ticketId: 1, changedBy: SEED_USERS.EMPLOYEE, oldStatus: null, newStatus: 'OPEN', changedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString() },
  ],
  2: [
    { id: 2, ticketId: 2, changedBy: SEED_USERS.EMPLOYEE, oldStatus: null, newStatus: 'OPEN', changedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
    { id: 3, ticketId: 2, changedBy: SEED_USERS.IT_STAFF, oldStatus: 'OPEN', newStatus: 'IN_PROGRESS', changedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
  ],
  4: [
    { id: 4, ticketId: 4, changedBy: SEED_USERS.EMPLOYEE, oldStatus: null, newStatus: 'OPEN', changedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
    { id: 5, ticketId: 4, changedBy: SEED_USERS.IT_STAFF, oldStatus: 'OPEN', newStatus: 'IN_PROGRESS', changedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString() },
    { id: 6, ticketId: 4, changedBy: SEED_USERS.IT_STAFF, oldStatus: 'IN_PROGRESS', newStatus: 'RESOLVED', changedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
  ],
  5: [
    { id: 7, ticketId: 5, changedBy: SEED_USERS.EMPLOYEE, oldStatus: null, newStatus: 'OPEN', changedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
    { id: 8, ticketId: 5, changedBy: SEED_USERS.IT_STAFF, oldStatus: 'OPEN', newStatus: 'IN_PROGRESS', changedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
  ],
};

// Client-side local storage fallback layer
const getStorageTickets = (): Ticket[] => {
  const data = localStorage.getItem('incidentiq_local_tickets');
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      // ignore
    }
  }
  localStorage.setItem('incidentiq_local_tickets', JSON.stringify(INITIAL_TICKETS));
  return INITIAL_TICKETS;
};

const saveStorageTickets = (tickets: Ticket[]) => {
  localStorage.setItem('incidentiq_local_tickets', JSON.stringify(tickets));
};

export const ticketService = {
  async fetchTickets(status?: string, severity?: string, categoryId?: number): Promise<Ticket[]> {
    try {
      const res = await api.get('/tickets', {
        params: { status, severity, categoryId },
      });
      return res.data.data;
    } catch {
      // Local fallback
      let tickets = getStorageTickets();
      if (status && status !== 'ALL') {
        tickets = tickets.filter((t) => t.status === status);
      }
      if (severity && severity !== 'ALL') {
        tickets = tickets.filter((t) => t.severity === severity);
      }
      if (categoryId) {
        tickets = tickets.filter((t) => t.category.id === categoryId);
      }
      return tickets;
    }
  },

  async getTicketDetail(id: number): Promise<{ ticket: Ticket; comments: TicketComment[]; history: TicketHistory[] }> {
    try {
      const res = await api.get(`/tickets/${id}`);
      return res.data.data;
    } catch {
      const tickets = getStorageTickets();
      const ticket = tickets.find((t) => t.id === id);
      if (!ticket) throw new Error('Ticket not found');

      const rawComments = localStorage.getItem('incidentiq_comments_' + id);
      const comments: TicketComment[] = rawComments ? JSON.parse(rawComments) : (INITIAL_COMMENTS[id] || []);

      const rawHistory = localStorage.getItem('incidentiq_history_' + id);
      const history: TicketHistory[] = rawHistory ? JSON.parse(rawHistory) : (INITIAL_HISTORY[id] || []);

      return { ticket, comments, history };
    }
  },

  async createTicket(title: string, description: string, categoryId: number | null, user: User): Promise<Ticket> {
    try {
      const res = await api.post('/tickets', { title, description, categoryId });
      return res.data.data;
    } catch {
      // Client-side fallback with live AI classification
      const aiResult = await classifyIncidentApi(description);
      const cat = INITIAL_CATEGORIES.find((c) => c.name.toLowerCase() === aiResult.category.toLowerCase()) || INITIAL_CATEGORIES[2];
      
      const now = new Date();
      let slaHours = 8;
      if (aiResult.severity === 'CRITICAL') slaHours = 1;
      else if (aiResult.severity === 'HIGH') slaHours = 4;
      else if (aiResult.severity === 'MEDIUM') slaHours = 8;
      else if (aiResult.severity === 'LOW') slaHours = 24;

      const deadline = new Date(now.getTime() + slaHours * 60 * 60 * 1000);

      const newTicket: Ticket = {
        id: Date.now(),
        title,
        description,
        severity: aiResult.severity,
        status: 'OPEN',
        category: cat,
        raisedBy: user,
        assignedTo: SEED_USERS.IT_STAFF,
        aiResolution: JSON.stringify(aiResult.resolution_steps),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        slaDeadline: deadline.toISOString(),
        slaBreached: false,
      };

      const tickets = getStorageTickets();
      const updated = [newTicket, ...tickets];
      saveStorageTickets(updated);

      // Create initial history
      const hist: TicketHistory = {
        id: Date.now(),
        ticketId: newTicket.id,
        changedBy: user,
        oldStatus: null,
        newStatus: 'OPEN',
        changedAt: now.toISOString(),
      };
      localStorage.setItem('incidentiq_history_' + newTicket.id, JSON.stringify([hist]));

      return newTicket;
    }
  },

  async updateStatus(id: number, status: TicketStatus, notes: string | undefined, user: User): Promise<Ticket> {
    try {
      const res = await api.put(`/tickets/${id}/status`, { status, notes });
      return res.data.data;
    } catch {
      const tickets = getStorageTickets();
      const ticket = tickets.find((t) => t.id === id);
      if (!ticket) throw new Error('Ticket not found');

      const oldStatus = ticket.status;
      ticket.status = status;
      ticket.updatedAt = new Date().toISOString();
      if (status === 'RESOLVED') {
        ticket.resolvedAt = new Date().toISOString();
        if (new Date(ticket.resolvedAt) > new Date(ticket.slaDeadline)) {
          ticket.slaBreached = true;
        }
      }

      saveStorageTickets(tickets);

      // Append history
      const rawHistory = localStorage.getItem('incidentiq_history_' + id);
      const historyList: TicketHistory[] = rawHistory ? JSON.parse(rawHistory) : (INITIAL_HISTORY[id] || []);
      historyList.push({
        id: Date.now(),
        ticketId: id,
        changedBy: user,
        oldStatus,
        newStatus: status,
        changedAt: new Date().toISOString(),
      });
      localStorage.setItem('incidentiq_history_' + id, JSON.stringify(historyList));

      if (notes) {
        const rawComments = localStorage.getItem('incidentiq_comments_' + id);
        const commentsList: TicketComment[] = rawComments ? JSON.parse(rawComments) : (INITIAL_COMMENTS[id] || []);
        commentsList.push({
          id: Date.now(),
          ticketId: id,
          user,
          comment: `Status updated to ${status}: ${notes}`,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem('incidentiq_comments_' + id, JSON.stringify(commentsList));
      }

      return ticket;
    }
  },

  async addComment(ticketId: number, commentText: string, user: User): Promise<TicketComment> {
    try {
      const res = await api.post(`/tickets/${ticketId}/comments`, { comment: commentText });
      return res.data.data;
    } catch {
      const newComment: TicketComment = {
        id: Date.now(),
        ticketId,
        user,
        comment: commentText,
        createdAt: new Date().toISOString(),
      };

      const rawComments = localStorage.getItem('incidentiq_comments_' + ticketId);
      const commentsList: TicketComment[] = rawComments ? JSON.parse(rawComments) : (INITIAL_COMMENTS[ticketId] || []);
      commentsList.push(newComment);
      localStorage.setItem('incidentiq_comments_' + ticketId, JSON.stringify(commentsList));

      return newComment;
    }
  },
};
