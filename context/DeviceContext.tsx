'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Device, PowerEvent } from '@/types';

interface DeviceContextType {
  devices: Device[];
  powerEvents: PowerEvent[];
  addDevice: (device: Omit<Device, 'id' | 'lastSeen'>) => void;
  removeDevice: (id: string) => void;
  updateDevice: (id: string, updates: Partial<Device>) => void;
  getDevice: (id: string) => Device | undefined;
  reportPowerOutage: (deviceId: string, severity: 'Critical' | 'Medium' | 'Low') => void;
  resolvePowerOutage: (eventId: string) => void;
  addPowerEvent: (event: Omit<PowerEvent, 'id' | 'status' | 'start' | 'duration'>) => void;
  updateEventStatus: (eventId: string, status: 'Active' | 'Investigating' | 'Resolved') => void;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

// Sample initial devices
const initialDevices: Device[] = [
  {
    id: 'DEV-001',
    name: 'Grid Monitor Alpha',
    status: 'online',
    grid: 'Balayan North',
    lat: 13.9432,
    lng: 120.7389,
    lastSeen: new Date().toISOString(),
    signalStrength: 4,
  },
  {
    id: 'DEV-002',
    name: 'Grid Monitor Beta',
    status: 'online',
    grid: 'Balayan Central',
    lat: 13.9375,
    lng: 120.7256,
    lastSeen: new Date().toISOString(),
    signalStrength: 3,
  },
  {
    id: 'DEV-003',
    name: 'Grid Monitor Gamma',
    status: 'offline',
    grid: 'Balayan South',
    lat: 13.9289,
    lng: 120.7412,
    lastSeen: new Date(Date.now() - 3600000).toISOString(),
    signalStrength: 0,
  },
  {
    id: 'DEV-004',
    name: 'Grid Monitor Delta',
    status: 'online',
    grid: 'Balayan East',
    lat: 13.9456,
    lng: 120.7501,
    lastSeen: new Date().toISOString(),
    signalStrength: 5,
  },
];

// Sample initial power events
const initialPowerEvents: PowerEvent[] = [
  {
    id: 'EVT-001-1700000000000',
    status: 'Active',
    severity: 'Critical',
    location: 'Balayan North',
    grid: 'Balayan North',
    start: new Date().toISOString(),
    duration: '15 min',
    lat: 13.9432,
    lng: 120.7389,
    affectedCustomers: 245,
  },
];

export function DeviceProvider({ children }: { children: ReactNode }) {
  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [powerEvents, setPowerEvents] = useState<PowerEvent[]>(initialPowerEvents);

  const addDevice = useCallback((deviceData: Omit<Device, 'id' | 'lastSeen'>) => {
    const newDevice: Device = {
      ...deviceData,
      id: `DEV-${String(devices.length + 1).padStart(3, '0')}`,
      lastSeen: new Date().toISOString(),
    };
    setDevices(prev => [...prev, newDevice]);
  }, [devices.length]);

  const removeDevice = useCallback((id: string) => {
    setDevices(prev => prev.filter(d => d.id !== id));
  }, []);

  const updateDevice = useCallback((id: string, updates: Partial<Device>) => {
    setDevices(prev => prev.map(d => 
      d.id === id ? { ...d, ...updates } : d
    ));
  }, []);

  const getDevice = useCallback((id: string) => {
    return devices.find(d => d.id === id);
  }, [devices]);

  // Device reports power outage - creates a power event
  const reportPowerOutage = useCallback((deviceId: string, severity: 'Critical' | 'Medium' | 'Low') => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    // Check if there's already an active event for this device
    const existingEvent = powerEvents.find(
      e => e.id.startsWith(deviceId) && e.status === 'Active'
    );
    
    if (existingEvent) return; // Already reported

    const newEvent: PowerEvent = {
      id: `EVT-${deviceId.replace('DEV-', '')}-${Date.now()}`,
      status: 'Active',
      severity,
      location: device.grid,
      grid: device.grid,
      start: new Date().toISOString(),
      duration: '0 min',
      lat: device.lat,
      lng: device.lng,
    };

    setPowerEvents(prev => [...prev, newEvent]);
  }, [devices, powerEvents]);

  // Resolve a power outage event
  const resolvePowerOutage = useCallback((eventId: string) => {
    setPowerEvents(prev => prev.map(e => 
      e.id === eventId 
        ? { ...e, status: 'Resolved' as const, duration: 'Resolved' }
        : e
    ));
  }, []);

  // Add a new power event
  const addPowerEvent = useCallback((eventData: Omit<PowerEvent, 'id' | 'status' | 'start' | 'duration'>) => {
    const newEvent: PowerEvent = {
      ...eventData,
      id: `EVT-${Date.now()}`,
      status: 'Active',
      start: new Date().toISOString(),
      duration: '0 min',
    };
    setPowerEvents(prev => [...prev, newEvent]);
  }, []);

  // Update event status
  const updateEventStatus = useCallback((eventId: string, status: 'Active' | 'Investigating' | 'Resolved') => {
    setPowerEvents(prev => prev.map(e => 
      e.id === eventId 
        ? { 
            ...e, 
            status, 
            duration: status === 'Resolved' ? 'Resolved' : e.duration 
          }
        : e
    ));
  }, []);

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
