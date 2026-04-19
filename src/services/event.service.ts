import { apiClient } from '../lib/apiClient';
import { PowerEvent } from '../../types';

export interface EventCreateInput {
  severity: 'Critical' | 'Medium' | 'Low';
  location: string;
  grid: string;
  start: string;
  duration: string;
  lat: number;
  lng: number;
  notes?: string;
  affectedCustomers?: number;
}

export const eventService = {
  getAll: async (): Promise<PowerEvent[]> => {
    return apiClient('/api/events');
  },

  getById: async (id: string): Promise<PowerEvent> => {
    return apiClient(`/api/events/${id}`);
  },

  create: async (data: Omit<EventCreateInput, 'status'>): Promise<PowerEvent> => {
    return apiClient('/api/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<PowerEvent>): Promise<PowerEvent> => {
    return apiClient(`/api/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiClient(`/api/events/${id}`, {
      method: 'DELETE',
    });
  },
};

export default eventService;