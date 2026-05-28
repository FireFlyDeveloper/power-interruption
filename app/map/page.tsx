'use client';

import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import { useDevices } from '@/context/DeviceContext';
import ProtectedRoute from '@/components/ProtectedRoute';

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full w-full bg-[#0C1119]">
      <div className="text-gray-500 text-lg">Loading map...</div>
    </div>
  ),
});

export default function MapPage() {
  const { powerEvents } = useDevices();

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen overflow-hidden bg-[#0C1119] text-gray-200 antialiased text-base">
        <Header />

        <div className="flex flex-1 overflow-hidden relative">
          <Sidebar pathname="/map" />

          {/* Full-height map container */}
          <main className="flex-1 relative bg-[#0C1119] overflow-hidden">
            <div className="absolute inset-0">
              <Map
                events={powerEvents}
                fullscreen={true}
              />
            </div>
          </main>
        </div>

        <MobileNav />
      </div>
    </ProtectedRoute>
  );
}
