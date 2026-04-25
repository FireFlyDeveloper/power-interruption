import { apiClient } from './apiClient';

export interface Metadata {
  siteName?: string;
  name: string;
  description: string;
  location: string;
}

export type SiteMetadata = Metadata;

export interface StatusOption {
  value: string;
  label: string;
  color: string;
}

export interface SeverityOption {
  value: string;
  label: string;
  color: string;
  priority: number;
}

export interface DeviceStatusOption {
  value: string;
  label: string;
  color: string;
}

export const metadataService = {
  getAllMetadata: async (): Promise<{
    metadata: Metadata;
    statuses: StatusOption[];
    severities: SeverityOption[];
    deviceStatuses: DeviceStatusOption[];
  }> => {
    return apiClient('/api/metadata/all');
  },

  getMetadata: async (): Promise<Metadata> => {
    return apiClient('/api/metadata');
  },

  getStatuses: async (): Promise<StatusOption[]> => {
    return apiClient('/api/metadata/statuses');
  },

  getSeverities: async (): Promise<SeverityOption[]> => {
    return apiClient('/api/metadata/severities');
  },

  getDeviceStatuses: async (): Promise<DeviceStatusOption[]> => {
    return apiClient('/api/metadata/device-statuses');
  },
};

export default metadataService;