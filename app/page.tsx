'use client';

import { useState, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import StatCards from '@/components/StatCards';
import EventTable from '@/components/EventTable';
import MapPanel from '@/components/MapPanel';
import { powerEvents } from '@/data/events';
import { PowerEvent } from '@/types';
import DetailPanel from '@/components/DetailPanel';

export default function DashboardPage() {
  const [selectedEvent, setSelectedEvent] = useState<PowerEvent | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleEventClick = useCallback((event: PowerEvent) => {
    setSelectedEvent(event);
    setIsPanelOpen(true);
  }, []);

  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false);
    setTimeout(() => setSelectedEvent(null), 300);
  }, []);

  return (
    <AppLayout>
      <StatCards />
      
      <div className="flex flex-col lg:flex-row gap-5 sm:gap-6 mt-7">
        <EventTable 
          events={powerEvents} 
          onEventClick={handleEventClick} 
        />
        <MapPanel 
          events={powerEvents} 
          onMarkerClick={handleEventClick} 
        />
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