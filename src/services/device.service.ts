import { apiClient } from '../lib/apiClient';
import { Device } from '../../types';

export interface DeviceCreateInput {
  name: string;
  grid: string;
  lat: number;
  lng: number;
}

export const deviceService = {
  getAll: async (): Promise<Device[]> => {
    return apiClient('/api/devices');
  },

  getById: async (id: string): Promise<Device> => {
    return apiClient(`/api/devices/${id}`);
  },

  create: async (data: Omit<DeviceCreateInput, 'status'>): Promise<Device> => {
    return apiClient('/api/devices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<Device>): Promise<Device> => {
    return apiClient(`/api/devices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiClient(`/api/devices/${id}`, {
      method: 'DELETE',
    });
  },
};

export default deviceService;