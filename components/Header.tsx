'use client';

import { useClock } from '@/hooks/useClock';

export default function Header() {
  const time = useClock();

  return (
    <header className="bg-[#0F1A28] border-b border-[#2A3E5A] px-4 sm:px-6 py-3 flex items-center justify-between shrink-0 z-20">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#1E314A] flex items-center justify-center border border-[#46648B]">
          <i className="fas fa-bolt text-[#B6D0F5] text-xl"></i>
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">POWER MONITOR</h1>
          <p className="text-xs text-gray-500 hidden sm:block">Balayan, Batangas Grid</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3 sm:gap-5">
        <div className="hidden md:flex items-center bg-[#1F3149] rounded-full px-5 py-2 border border-[#3F5B83]">
          <i className="far fa-clock text-gray-300 mr-2 text-base"></i>
          <span className="font-mono text-base text-white">{time}</span>
        </div>
        
        <div className="flex items-center gap-2 bg-[#1F3149] pr-4 pl-2 py-1.5 rounded-full border border-[#405F89]">
          <div className="w-10 h-10 rounded-full bg-[#2F4870] flex items-center justify-center text-white text-base border border-gray-500 font-semibold">
            MO
          </div>
          <span className="hidden sm:inline text-base text-white font-medium">Marcus O.</span>
        </div>
        
        <div className="w-10 h-10 rounded-xl bg-[#1F3149] flex items-center justify-center border border-[#3F5B83] cursor-pointer hover:bg-[#2A3E5A] transition-colors">
          <i className="fas fa-moon text-white text-lg"></i>
        </div>
      </div>
    </header>
  );
}