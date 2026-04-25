import { PowerEvent } from '@/types';
import { apiClient } from '../lib/apiClient';

export interface EventCreateInput {
  title: string;
  description: string;
  startTime: string;
  severity: string;
  location: string;
  grid?: string;
  lat?: number;
  lng?: number;
  device_id?: string;
  deviceId?: string;
  notes?: string;
  affectedCustomers?: number;
  affected_customers?: number;
}

export interface DashboardStats {
  activeCount: number;
  criticalCount: number;
  resolvedToday: number;
  avgDuration: number;
  resolvedWithDurationCount: number;
}

export interface StatsResponse {
  total: number;
  byStatus: { status: string; count: number }[];
  bySeverity: { severity: string; count: number }[];
  byGrid: { grid: string; count: number }[];
  recent: any[];
  dashboard: DashboardStats;
}

export const eventService = {
  async getAll(page = 1, limit = 50): Promise<{ events: PowerEvent[]; pagination: { page: number; limit: number; total: number; totalPages: number; hasMore: boolean } }> {
    return apiClient(`/api/events?page=${page}&limit=${limit}`);
  },

  async getStats(): Promise<StatsResponse> {
    return apiClient('/api/events/stats');
  },

  async getById(id: string): Promise<PowerEvent> {
    return apiClient(`/api/events/${id}`);
  },

  async updateStatus(id: string, status: string): Promise<PowerEvent> {
    return apiClient(`/api/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  async create(input: EventCreateInput): Promise<PowerEvent> {
    return apiClient('/api/events', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async resolve(eventId: string, startTime?: string): Promise<PowerEvent> {
    return apiClient(`/api/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'Resolved', ...(startTime ? { endTime: startTime } : {}) }),
    });
  },
};
