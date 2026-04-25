'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useAppSettings } from './AppSettingsContext';
import { Device, PowerEvent } from '@/types/index';
import { deviceService } from './services/deviceService';
import { eventService, DashboardStats } from './services/eventService';

interface DeviceContextType {
  devices: Device[];
  powerEvents: PowerEvent[];
  eventPage: number;
  eventTotal: number;
  eventTotalPages: number;
  dashboardStats: DashboardStats | null;
  statsLoading: boolean;
  addDevice: (device: Omit<Device, 'id' | 'lastSeen'>) => Promise<void>;
  removeDevice: (id: string) => Promise<void>;
  updateDevice: (id: string, updates: Partial<Device>) => Promise<void>;
  getDevice: (id: string) => Device | undefined;
  reportPowerOutage: (deviceId: string, severity: string) => Promise<void>;
  resolvePowerOutage: (eventId: string, startTime?: string) => Promise<void>;
  addPowerEvent: (event: import('./services/eventService').EventCreateInput) => Promise<void>;
  updateEventStatus: (eventId: string, status: string) => Promise<void>;
  goToEventPage: (page: number) => Promise<void>;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export function DeviceProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [powerEvents, setPowerEvents] = useState<PowerEvent[]>([]);
  const [eventPage, setEventPage] = useState(1);
  const [eventTotal, setEventTotal] = useState(0);
  const [eventTotalPages, setEventTotalPages] = useState(1);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // tick counter to trigger refreshes

  const fetchDevices = useCallback(async () => {
    try {
      const data = await deviceService.getAll();
      setDevices(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchEvents = useCallback(async (page = 1) => {
    try {
      const data = await eventService.getAll(page, 50);
      setPowerEvents(data.events);
      setEventPage(data.pagination.page);
      setEventTotal(data.pagination.total);
      setEventTotalPages(data.pagination.totalPages);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const goToEventPage = useCallback(async (page: number) => {
    if (page < 1 || page > eventTotalPages) return;
    await fetchEvents(page);
  }, [fetchEvents, eventTotalPages]);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const data = await eventService.getStats();
      setDashboardStats(data.dashboard);
    } catch (e) {
      console.error(e);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchDevices();
      fetchEvents();
      fetchStats();
    }
  }, [authLoading, isAuthenticated, fetchDevices, fetchEvents, fetchStats]);

  // Auto-refresh polling
  const { settings } = useAppSettings();
  useEffect(() => {
    if (!isAuthenticated || !settings.autoRefresh) return;
    const ms = settings.refreshInterval * 1000;
    const interval = setInterval(() => {
      fetchDevices();
      fetchEvents(eventPage);
      fetchStats();
    }, ms);
    return () => clearInterval(interval);
  }, [isAuthenticated, settings.autoRefresh, settings.refreshInterval, fetchDevices, fetchEvents, fetchStats, eventPage]);

  const addDevice = useCallback(async (deviceData: Omit<Device, 'id' | 'lastSeen'>) => {
    try {
      await deviceService.create(deviceData);
      await fetchDevices();
    } catch (e) {
      console.error(e);
    }
  }, [fetchDevices]);

  const removeDevice = useCallback(async (id: string) => {
    try {
      await deviceService.delete(id);
      await fetchDevices();
    } catch (e) {
      console.error(e);
    }
  }, [fetchDevices]);

  const updateDevice = useCallback(async (id: string, updates: Partial<Device>) => {
    try {
      await deviceService.update(id, updates);
      await fetchDevices();
    } catch (e) {
      console.error(e);
    }
  }, [fetchDevices]);

  const getDevice = useCallback((id: string) => {
    return devices.find(d => d.id === id);
  }, [devices]);

  const reportPowerOutage = useCallback(async (deviceId: string, severity: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    try {
      await eventService.create({
        title: `Power Outage - ${device.name}`,
        description: `Power interruption reported on ${device.name}`,
        startTime: new Date().toISOString(),
        severity,
        location: device.name || device.deviceId || 'Unknown',
        lat: device.lat,
        lng: device.lng,
      });
      await fetchEvents();
    } catch (e) {
      console.error(e);
    }
  }, [devices, fetchEvents]);

  const resolvePowerOutage = useCallback(async (eventId: string, startTime?: string) => {
    try {
      await eventService.resolve(eventId, startTime);
      await fetchEvents();
    } catch (e) {
      console.error(e);
    }
  }, [fetchEvents]);

  const addPowerEvent = useCallback(async (eventData: import('./services/eventService').EventCreateInput) => {
    try {
      await eventService.create(eventData);
      await fetchEvents();
    } catch (e) {
      console.error(e);
    }
  }, [fetchEvents]);

  const updateEventStatus = useCallback(async (eventId: string, status: string) => {
    try {
      await eventService.updateStatus(eventId, status);
      await fetchEvents();
    } catch (e) {
      console.error('Failed to update event status:', e);
      throw e;
    }
  }, [fetchEvents]);

  return (
    <DeviceContext.Provider value={{ 
      devices, 
      powerEvents,
      eventPage,
      eventTotal,
      eventTotalPages,
      dashboardStats,
      statsLoading,
      addDevice, 
      removeDevice, 
      updateDevice, 
      getDevice,
      reportPowerOutage,
      resolvePowerOutage,
      addPowerEvent,
      updateEventStatus,
      goToEventPage,
    }}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevices() {
  const context = useContext(DeviceContext);
  if (context === undefined) {
    throw new Error('useDevices must be used within a DeviceProvider');
  }
  return context;
}