'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import AppLayout from '@/components/AppLayout';
import { powerEvents } from '@/data/events';
import { PowerEvent } from '@/types';
import DetailPanel from '@/components/DetailPanel';

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-[#141C28] rounded-2xl">
      <div className="text-gray-500">Loading map...</div>
    </div>
  ),
});

const markerColors = {
  Active: { border: '#dc2626', bg: '#fee2e2' },
  Investigating: { border: '#d97706', bg: '#fef3c7' },
  Resolved: { border: '#059669', bg: '#d1fae5' }
};

export default function MapPage() {
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
        <h1 className="text-2xl font-bold text-white">Incident Map</h1>
        <p className="text-gray-400 mt-1">View all power interruption incidents on the map</p>
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
          All
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

      <div className="bg-[#141C28] border border-[#273953] rounded-2xl overflow-hidden h-[600px]">
        <Map 
          events={filteredEvents} 
          onMarkerClick={handleEventClick} 
        />
      </div>

      <div className="mt-4 flex gap-4 text-sm">
        {Object.entries(markerColors).map(([status, colors]) => (
          <span key={status} className="flex items-center">
            <i className={`fas fa-circle mr-2`} style={{ color: colors.border }}></i>
            {status}
          </span>
        ))}
      </div>

      <div className="h-24 md:h-6"></div>
      
      <DetailPanel 
        event={selectedEvent} 
        isOpen={isPanelOpen} 
        onClose={handleClosePanel} 
      />
    </AppLayout>
  );
}
