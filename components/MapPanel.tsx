'use client';

import dynamic from 'next/dynamic';
import { useMemo, useCallback } from 'react';
import { PowerEvent } from '@/types';

interface MapPanelProps {
  events: PowerEvent[];
  onMarkerClick: (event: PowerEvent) => void;
}

// Dynamic import with no SSR
const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 w-full h-full bg-[#f5f5f5] flex items-center justify-center">
      <div className="text-gray-500">Loading map...</div>
    </div>
  ),
});

export default function MapPanel({ events, onMarkerClick }: MapPanelProps) {
  // Memoize events to prevent unnecessary re-renders
  const memoizedEvents = useMemo(() => events, [events]);
  
  // Memoize the callback to prevent re-renders
  const handleMarkerClick = useCallback((event: PowerEvent) => {
    onMarkerClick(event);
  }, [onMarkerClick]);
  
  return (
    <div className="lg:w-100 xl:w-110 bg-[#141C28] border border-[#273953] rounded-2xl overflow-hidden flex flex-col h-125 lg:h-auto relative z-0">
      <div className="p-4 border-b border-[#2F4565] flex items-center justify-between bg-[#101E30]">
        <span className="text-lg font-medium text-gray-100">
          <i className="fas fa-map mr-2 text-gray-400"></i>
          INCIDENT MAP
        </span>
        <span className="bg-[#263F63] px-3 py-1.5 rounded-full text-sm border border-[#4D73A5] font-medium">
          Balayan
        </span>
      </div>
      
      <div className="relative z-0">
        <Map events={memoizedEvents} onMarkerClick={handleMarkerClick} />
      </div>
      
      <div className="p-3 border-t border-[#2F4565] flex gap-4 text-sm bg-[#0F1D2F]">
        <span><i className="fas fa-circle text-[#dc2626] mr-1"></i> active</span>
        <span><i className="fas fa-circle text-[#d97706] mr-1"></i> investigating</span>
        <span><i className="fas fa-circle text-[#059669] mr-1"></i> resolved</span>
      </div>
    </div>
  );
}