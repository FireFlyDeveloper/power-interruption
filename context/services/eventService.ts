import { apiClient } from '../lib/apiClient';
import { PowerEvent } from '@/types/index';

export interface EventCreateInput {
  deviceId?: string;
  title: string;
  description: string;
  severity: string;
  grid: string;
  location: string;
  startTime: string;
  lat?: number;
  lng?: number;
  notes?: string;
  affectedCustomers?: number;
  endTime?: string;
}

export interface PaginatedResponse<T> {
  events: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export const eventService = {
  async getAll(page = 1, limit = 50): Promise<PaginatedResponse<PowerEvent>> {
    return apiClient(`/api/events?page=${page}&limit=${limit}`);
  },

  async getById(id: string): Promise<PowerEvent> {
    return apiClient(`/api/events/${id}`);
  },

  async create(event: EventCreateInput): Promise<PowerEvent> {
    return apiClient('/api/events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  },

  async updateStatus(id: string, status: string, duration?: string): Promise<PowerEvent> {
    return apiClient(`/api/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, duration }),
    });
  },

  async resolve(id: string, startTime?: string): Promise<PowerEvent> {
    let duration: string | undefined = undefined;
    if (startTime) {
      const start = new Date(startTime).getTime();
      const now = Date.now();
      const diffMs = now - start;
      const hours = Math.floor(diffMs / 3600000);
      const minutes = Math.floor((diffMs % 3600000) / 60000);
      duration = `${hours}h ${minutes}m`;
    }
    return apiClient(`/api/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'Resolved', duration }),
    });
  },
};