import { PowerEvent, EventTimeline } from '@/types';

export const powerEvents: PowerEvent[] = [
  {
    id: 'E-101',
    status: 'Active',
    severity: 'Critical',
    location: 'Balayan Town Proper',
    grid: 'A7',
    start: '09:42',
    duration: '4h 23m',
    lat: 13.9394,
    lng: 120.7336,
    notes: 'Main transformer overload. 2,400 customers affected. Emergency crew dispatched.',
    affectedCustomers: 2400
  },
  {
    id: 'E-204',
    status: 'Investigating',
    severity: 'Medium',
    location: 'Sambat',
    grid: 'B2',
    start: '11:20',
    duration: '3h 02m',
    lat: 13.9500,
    lng: 120.7200,
    notes: 'Voltage fluctuation reported. Technical team on site assessing distribution lines.',
    affectedCustomers: 850
  },
  {
    id: 'E-342',
    status: 'Active',
    severity: 'Critical',
    location: 'Canda',
    grid: 'D4',
    start: '13:15',
    duration: '1h 07m',
    lat: 13.9200,
    lng: 120.7500,
    notes: 'Transformer T7 failure. Crew dispatched 13:50. Est. repair 30min. 1,240 customers affected.',
    affectedCustomers: 1240
  },
  {
    id: 'E-278',
    status: 'Investigating',
    severity: 'Medium',
    location: 'Munting Tubig',
    grid: 'F6',
    start: '12:45',
    duration: '1h 37m',
    lat: 13.9600,
    lng: 120.7400,
    notes: 'Scheduled maintenance overrun. investigating delay cause.',
    affectedCustomers: 560
  },
  {
    id: 'E-156',
    status: 'Resolved',
    severity: 'Low',
    location: 'Lanatan',
    grid: 'A2',
    start: '10:05',
    duration: '28m',
    lat: 13.9300,
    lng: 120.7100,
    notes: 'Minor line fault. Quick repair completed. Service restored.',
    affectedCustomers: 120
  },
  {
    id: 'E-413',
    status: 'Active',
    severity: 'Critical',
    location: 'District 4',
    grid: 'H11',
    start: '13:50',
    duration: '32m',
    lat: 13.9450,
    lng: 120.7600,
    notes: 'Underground cable damage during construction. Immediate repair in progress.',
    affectedCustomers: 1800
  }
];

export const getEventTimeline = (event: PowerEvent): EventTimeline[] => {
  const baseTime = event.start;
  const [hours, minutes] = baseTime.split(':').map(Number);
  
  return [
    {
      time: baseTime,
      action: `Created (${event.status})`,
      status: 'completed'
    },
    {
      time: `${String(hours + 1).padStart(2, '0')}:${String(minutes + 10).padStart(2, '0')}`,
      action: 'Investigating',
      status: event.status !== 'Active' ? 'completed' : 'current'
    },
    {
      time: '--:--',
      action: 'Pending',
      status: 'pending'
    }
  ];
};