export interface PowerEvent {
  id: string;
  status: 'Active' | 'Investigating' | 'Resolved';
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

export interface EventTimeline {
  time: string;
  action: string;
  status: 'completed' | 'pending' | 'current';
}