'use client';

import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import EventTable from '@/components/EventTable';
import { PowerEvent } from '@/types';
import DetailPanel from '@/components/DetailPanel';
import { useDevices } from '@/context/DeviceContext';

export default function EventsPage() {
  const { powerEvents } = useDevices();
  const [selectedEvent, setSelectedEvent] = useState<PowerEvent | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleEventClick = (event: PowerEvent) => {
    setSelectedEvent(event);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setTimeout(() => setSelectedEvent(null), 300);
  };

  const filteredEvents = statusFilter === 'all' 
    ? powerEvents 
    : powerEvents.filter(event => event.status.toLowerCase() === statusFilter);

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Events</h1>
        <p className="text-gray-400 mt-1">Manage and view all power interruption events</p>
      </div>

      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            statusFilter === 'all' 
              ? 'bg-[#1F314F] text-white border border-[#3E5D88]' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          All Events
        </button>
        <button
          onClick={() => setStatusFilter('active')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            statusFilter === 'active' 
              ? 'bg-[#4A2E2E] text-[#FCC5C5] border border-[#B45F5F]' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setStatusFilter('investigating')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            statusFilter === 'investigating' 
              ? 'bg-[#4A4024] text-[#FCE6B4] border border-[#C6993A]' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Investigating
        </button>
        <button
          onClick={() => setStatusFilter('resolved')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            statusFilter === 'resolved' 
              ? 'bg-[#1F4733] text-[#BCF0D5] border border-[#479A6E]' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Resolved
        </button>
      </div>

      <EventTable 
        events={filteredEvents} 
        onEventClick={handleEventClick} 
      />

      <div className="h-24 md:h-6"></div>
      
      <DetailPanel 
        event={selectedEvent} 
        isOpen={isPanelOpen} 
        onClose={handleClosePanel} 
      />
    </AppLayout>
  );
}
