'use client';

import { useMetadata } from '@/context/MetadataContext';

export default function Header() {
  const { metadata, loading } = useMetadata();
  
  return (
    <header className="bg-[#0F1A28] border-b border-[#2A3E5A] px-4 sm:px-6 py-3 flex items-center justify-between shrink-0 z-20">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#1E314A] flex items-center justify-center border border-[#46648B]">
          <i className="fas fa-bolt text-[#B6D0F5] text-xl"></i>
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {loading ? 'POWER MONITOR' : (metadata?.siteName?.toUpperCase() || 'POWER MONITOR')}
          </h1>
          <p className="text-xs text-gray-500 hidden sm:block">
            {loading ? 'Balayan, Batangas Grid' : (metadata?.location ? `${metadata.location} Grid` : 'Balayan, Batangas Grid')}
          </p>
        </div>
      </div>
    </header>
  );
}
