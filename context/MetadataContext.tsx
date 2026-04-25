'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { metadataService, SiteMetadata, StatusOption, SeverityOption, DeviceStatusOption } from './lib/metadataService';

interface MetadataContextType {
  metadata: SiteMetadata | null;
  statuses: StatusOption[];
  severities: SeverityOption[];
  deviceStatuses: DeviceStatusOption[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const MetadataContext = createContext<MetadataContextType | undefined>(undefined);

export function MetadataProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [metadata, setMetadata] = useState<SiteMetadata | null>(null);
  const [statuses, setStatuses] = useState<StatusOption[]>([]);
  const [severities, setSeverities] = useState<SeverityOption[]>([]);
  const [deviceStatuses, setDeviceStatuses] = useState<DeviceStatusOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetadata = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const allData = await metadataService.getAllMetadata();
      setMetadata({
        name: allData.metadata.name,
        description: allData.metadata.description,
        location: allData.metadata.location,
      });
      setStatuses(allData.statuses);
      setSeverities(allData.severities);
      setDeviceStatuses(allData.deviceStatuses);
    } catch (e) {
      console.error('Failed to fetch metadata:', e);
      setError(e instanceof Error ? e.message : 'Failed to fetch metadata');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchMetadata();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, fetchMetadata]);

  return (
    <MetadataContext.Provider value={{ metadata, statuses, severities, deviceStatuses, loading, error, refetch: fetchMetadata }}>
      {children}
    </MetadataContext.Provider>
  );
}

export function useMetadata() {
  const context = useContext(MetadataContext);
  if (context === undefined) {
    throw new Error('useMetadata must be used within a MetadataProvider');
  }
  return context;
}