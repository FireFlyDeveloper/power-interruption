'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Device } from '@/types';

interface DeviceContextType {
  devices: Device[];
  addDevice: (device: Omit<Device, 'id' | 'lastSeen'>) => void;
  removeDevice: (id: string) => void;
  updateDevice: (id: string, updates: Partial<Device>) => void;
  getDevice: (id: string) => Device | undefined;
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
    batteryLevel: 85,
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
    batteryLevel: 72,
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
    batteryLevel: 15,
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
    batteryLevel: 91,
    signalStrength: 5,
  },
];

export function DeviceProvider({ children }: { children: ReactNode }) {
  const [devices, setDevices] = useState<Device[]>(initialDevices);

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

  return (
    <DeviceContext.Provider value={{ devices, addDevice, removeDevice, updateDevice, getDevice }}>
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
