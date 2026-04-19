import { apiClient } from '../lib/apiClient';
import { PowerEvent } from '@/types/index';

export const eventService = {
  async getAll(): Promise<PowerEvent[]> {
    return apiClient('/api/events');
  },

  async getById(id: string): Promise<PowerEvent> {
    return apiClient(`/api/events/${id}`);
  },

  async create(event: Omit<PowerEvent, 'id' | 'status' | 'start' | 'duration'>): Promise<PowerEvent> {
    return apiClient('/api/events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  },

  async updateStatus(id: string, status: 'Active' | 'Investigating' | 'Resolved', duration?: string): Promise<PowerEvent> {
    return apiClient(`/api/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, duration }),
    });
  },

  async resolve(id: string): Promise<PowerEvent> {
    return apiClient(`/api/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'Resolved', duration: 'Resolved' }),
    });
  },
};