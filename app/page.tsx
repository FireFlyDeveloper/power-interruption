'use client';

import { useState, useCallback } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import StatCards from '@/components/StatCards';
import EventTable from '@/components/EventTable';
import MapPanel from '@/components/MapPanel';
import { PowerEvent } from '@/types';
import DetailPanel from '@/components/DetailPanel';
import { useDevices } from '@/context/DeviceContext';

export default function DashboardPage() {
  const { powerEvents } = useDevices();
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
    <div className="flex flex-col h-screen overflow-hidden bg-[#0C1119] text-gray-200 antialiased text-base">
      <Header />
      
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar pathname="/" />
        
        <main className="flex-1 overflow-y-auto thin-scroll bg-[#0C1119] px-4 sm:px-6 pb-28 md:pb-6 relative">
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
        </main>
      </div>

      <MobileNav />
      
      <DetailPanel 
        event={selectedEvent} 
        isOpen={isPanelOpen} 
        onClose={handleClosePanel} 
      />
    </div>
  );
}