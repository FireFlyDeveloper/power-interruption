export interface Device {
  id: string;
  deviceId?: string;
  name: string;
  status?: string;
  lastSeen: string;
  lat?: number;
  lng?: number;
  signalStrength?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PowerEvent {
  id: string;
  deviceId: string;
  device?: Device;
  title: string;
  description: string;
  severity: string;
  status: string;
  location: string;
  startTime: string;
  endTime?: string;
  createdAt: string;
  updatedAt: string;
  lat: number;
  lng: number;
  start?: string;
  duration?: string | number;
  notes?: string;
  affectedCustomers?: number;
  action?: string;
}
export interface EventTimeline {
  id: string;
  status: string;
  time: string;
  description: string;
}

export function getEventTimeline(event: PowerEvent): EventTimeline[] {
  const timeline: EventTimeline[] = [
    {
      id: `${event.id}-start`,
      status: 'Started',
      time: event.startTime,
      description: `Power interruption reported at ${event.location}`,
    },
  ];

  if (event.status === 'Investigating' || event.status === 'Resolved') {
    timeline.push({
      id: `${event.id}-investigating`,
      status: 'Investigating',
      time: event.updatedAt,
      description: 'Investigating the cause of the power interruption',
    });
  }

  if (event.status === 'Resolved' && event.endTime) {
    timeline.push({
      id: `${event.id}-resolved`,
      status: 'Resolved',
      time: event.endTime,
      description: 'Power has been restored',
    });
  }

  return timeline;
}

export interface DeviceCreateInput {
  name: string;
  location: string;
  lat?: number;
  lng?: number;
}

export interface EventCreateInput {
  deviceId: string;
  title: string;
  description: string;
  severity: string;
  status?: string;
  location: string;
  startTime: string;
  endTime?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}