import { apiClient } from '../lib/apiClient';
import { Device } from '@/types/index';

export const deviceService = {
  async getAll(): Promise<Device[]> {
    return apiClient('/api/devices');
  },

  async getById(id: string): Promise<Device> {
    return apiClient(`/api/devices/${id}`);
  },

  async create(device: Omit<Device, 'id' | 'lastSeen'>): Promise<Device> {
    return apiClient('/api/devices', {
      method: 'POST',
      body: JSON.stringify(device),
    });
  },

  async update(id: string, updates: Partial<Device>): Promise<Device> {
    return apiClient(`/api/devices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async delete(id: string): Promise<void> {
    return apiClient(`/api/devices/${id}`, {
      method: 'DELETE',
    });
  },
};