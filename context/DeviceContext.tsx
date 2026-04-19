'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Device, PowerEvent } from '@/types';
import { useAuth } from './AuthContext';

interface DeviceContextType {
  devices: Device[];
  powerEvents: PowerEvent[];
  addDevice: (device: Omit<Device, 'id' | 'lastSeen'>) => Promise<void>;
  removeDevice: (id: string) => Promise<void>;
  updateDevice: (id: string, updates: Partial<Device>) => Promise<void>;
  getDevice: (id: string) => Device | undefined;
  reportPowerOutage: (deviceId: string, severity: 'Critical' | 'Medium' | 'Low') => Promise<void>;
  resolvePowerOutage: (eventId: string) => Promise<void>;
  addPowerEvent: (event: Omit<PowerEvent, 'id' | 'status' | 'start' | 'duration'>) => Promise<void>;
  updateEventStatus: (eventId: string, status: 'Active' | 'Investigating' | 'Resolved') => Promise<void>;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export function DeviceProvider({ children }: { children: ReactNode }) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [powerEvents, setPowerEvents] = useState<PowerEvent[]>([]);
  const { isAuthenticated } = useAuth();

  const fetchDevices = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch('https://power-interruption-backend.onrender.com/api/devices', {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setDevices(data);
      }
    } catch (e) {
      console.error(e);
    }
  }, [isAuthenticated]);

  const fetchEvents = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch('https://power-interruption-backend.onrender.com/api/events', {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setPowerEvents(data);
      }
    } catch (e) {
      console.error(e);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchDevices();
    fetchEvents();
  }, [fetchDevices, fetchEvents]);

  const addDevice = useCallback(async (deviceData: Omit<Device, 'id' | 'lastSeen'>) => {
    try {
      const res = await fetch('https://power-interruption-backend.onrender.com/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deviceData),
        credentials: 'include'
      });
      if (res.ok) {
        await fetchDevices();
      }
    } catch (e) {
      console.error(e);
    }
  }, [fetchDevices]);

  const removeDevice = useCallback(async (id: string) => {
    try {
      const res = await fetch(`https://power-interruption-backend.onrender.com/api/devices/${id}`, { 
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        await fetchDevices();
      }
    } catch (e) {
      console.error(e);
    }
  }, [fetchDevices]);

  const updateDevice = useCallback(async (id: string, updates: Partial<Device>) => {
    try {
      const res = await fetch(`https://power-interruption-backend.onrender.com/api/devices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        credentials: 'include'
      });
      if (res.ok) {
        await fetchDevices();
      }
    } catch (e) {
      console.error(e);
    }
  }, [fetchDevices]);

  const getDevice = useCallback((id: string) => {
    return devices.find(d => d.id === id);
  }, [devices]);

  const reportPowerOutage = useCallback(async (deviceId: string, severity: 'Critical' | 'Medium' | 'Low') => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    try {
      const res = await fetch('https://power-interruption-backend.onrender.com/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `EVT-${deviceId.replace('DEV-', '')}-${Date.now()}`,
          severity,
          location: device.grid,
          grid: device.grid,
          lat: device.lat,
          lng: device.lng,
          status: 'Active',
        }),
        credentials: 'include'
      });
      if (res.ok) {
        await fetchEvents();
      }
    } catch (e) {
      console.error(e);
    }
  }, [devices, fetchEvents]);

  const resolvePowerOutage = useCallback(async (eventId: string) => {
    try {
      const res = await fetch(`https://power-interruption-backend.onrender.com/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Resolved', duration: 'Resolved' }),
        credentials: 'include'
      });
      if (res.ok) {
        await fetchEvents();
      }
    } catch (e) {
      console.error(e);
    }
  }, [fetchEvents]);

  const addPowerEvent = useCallback(async (eventData: Omit<PowerEvent, 'id' | 'status' | 'start' | 'duration'>) => {
    try {
      const res = await fetch('https://power-interruption-backend.onrender.com/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
        credentials: 'include'
      });
      if (res.ok) {
        await fetchEvents();
      }
    } catch (e) {
      console.error(e);
    }
  }, [fetchEvents]);

  const updateEventStatus = useCallback(async (eventId: string, status: 'Active' | 'Investigating' | 'Resolved') => {
    try {
      const res = await fetch(`https://power-interruption-backend.onrender.com/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, duration: status === 'Resolved' ? 'Resolved' : undefined }),
        credentials: 'include'
      });
      if (res.ok) {
        await fetchEvents();
      }
    } catch (e) {
      console.error(e);
    }
  }, [fetchEvents]);

  return (
    <DeviceContext.Provider value={{ 
      devices, 
      powerEvents,
      addDevice, 
      removeDevice, 
      updateDevice, 
      getDevice,
      reportPowerOutage,
      resolvePowerOutage,
      addPowerEvent,
      updateEventStatus,
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
