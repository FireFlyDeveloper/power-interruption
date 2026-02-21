'use client';

import { useState } from 'react';
import { PowerEvent } from '@/types';
import { powerEvents } from '@/data/events';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import StatCards from './StatCards';
import EventTable from './EventTable';
import MapPanel from './MapPanel';
import DetailPanel from './DetailPanel';

export default function Dashboard() {
  const [selectedEvent, setSelectedEvent] = useState<PowerEvent | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleEventClick = (event: PowerEvent) => {
    setSelectedEvent(event);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    // Delay clearing the event to allow animation to finish
    setTimeout(() => setSelectedEvent(null), 300);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0C1119] text-gray-200 antialiased text-base">
      <Header />
      
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        
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