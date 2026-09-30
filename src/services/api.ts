import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { User, Role, IncidentClassificationResponse } from '../types';

// Central Axios instance
export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor for JWT Bearer token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('incidentiq_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const isAuthRequest = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
      if (!isAuthRequest) {
        localStorage.removeItem('incidentiq_token');
        localStorage.removeItem('incidentiq_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?sessionExpired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const classifyIncidentApi = async (description: string): Promise<IncidentClassificationResponse> => {
  try {
    const res = await api.post('/ai/classify', { description });
    if (
      res.data &&
      typeof res.data === 'object' &&
      res.data.data &&
      res.data.data.category &&
      Array.isArray(res.data.data.resolution_steps)
    ) {
      return res.data.data;
    }
    throw new Error('Invalid backend response');
  } catch {
    // If backend is not reached, provide simulated classification matching Gemini prompt
    const desc = (description || '').toLowerCase();
    if (desc.includes('switch') || desc.includes('vpn') || desc.includes('network') || desc.includes('dns') || desc.includes('firewall')) {
      const isCritical = desc.includes('offline') || desc.includes('down') || desc.includes('failure') || desc.includes('outage');
      return {
        severity: isCritical ? 'CRITICAL' : 'HIGH',
        category: 'Network',
        resolution_steps: [
          'Inspect physical patch cables and core rack power distribution unit (PDU).',
          'Access serial console to verify switch port flap and gateway route metrics.',
          'Trigger redundant failover route or restart daemon service.',
        ],
      };
    } else if (desc.includes('breach') || desc.includes('hack') || desc.includes('ransom') || desc.includes('unauthorized') || desc.includes('malware') || desc.includes('ids')) {
      return {
        severity: 'CRITICAL',
        category: 'Security',
        resolution_steps: [
          'Immediately isolate the affected workstation/subnet from the corporate VLAN.',
          'Export and preserve active memory dumps and connection audit logs.',
          'Revoke compromised authentication credentials and rotate internal API keys.',
        ],
      };
    } else if (desc.includes('monitor') || desc.includes('display') || desc.includes('laptop') || desc.includes('keyboard') || desc.includes('mouse') || desc.includes('printer') || desc.includes('battery')) {
      return {
        severity: 'LOW',
        category: 'Hardware',
        resolution_steps: [
          'Check hardware cable seating and test with alternate certified cable.',
          'Update OEM device drivers and verify firmware revisions.',
          'Dispatch hardware field technician or schedule replacement.',
        ],
      };
    } else {
      return {
        severity: desc.includes('crash') || desc.includes('corrupt') ? 'HIGH' : 'MEDIUM',
        category: 'Software',
        resolution_steps: [
          'Launch application in safe mode and verify Windows Event Viewer error ID.',
          'Clear corrupt local application data cache and temporary configuration files.',
          'Apply patch hotfix or execute corporate package silent repair script.',
        ],
      };
    }
  }
};

export const SEED_USERS: Record<Role, User> = {
  EMPLOYEE: {
    id: 1,
    name: 'Alex Rivers',
    email: 'employee@incidentiq.com',
    role: 'EMPLOYEE',
    department: 'IT Department',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  IT_STAFF: {
    id: 2,
    name: 'Marcus Vance',
    email: 'staff@incidentiq.com',
    role: 'IT_STAFF',
    department: 'Network Team',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  ADMIN: {
    id: 3,
    name: 'Elena Rostova',
    email: 'admin@incidentiq.com',
    role: 'ADMIN',
    department: 'Management',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
};
