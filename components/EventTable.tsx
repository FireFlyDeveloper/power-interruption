'use client';

import { useCallback, useMemo } from 'react';
import { PowerEvent } from '@/types';

interface EventTableProps {
  events: PowerEvent[];
  onEventClick: (event: PowerEvent) => void;
}

const getBadgeClass = (status: string) => {
  switch (status) {
    case 'Active':
      return 'bg-[#4A2E2E] text-[#FCC5C5] border-[#B45F5F]';
    case 'Investigating':
      return 'bg-[#4A4024] text-[#FCE6B4] border-[#C6993A]';
    case 'Resolved':
      return 'bg-[#1F4733] text-[#BCF0D5] border-[#479A6E]';
    default:
      return 'bg-gray-700 text-gray-300';
  }
};

const getSeverityClass = (severity: string) => {
  switch (severity) {
    case 'Critical':
      return 'text-[#F9B5B5] font-semibold';
    case 'Medium':
      return 'text-[#FCDBA0] font-semibold';
    case 'Low':
      return 'text-[#B2D2F5] font-semibold';
    default:
      return 'text-gray-400';
  }
};

export default function EventTable({ events, onEventClick }: EventTableProps) {
  // Memoize events to prevent unnecessary re-renders
  const memoizedEvents = useMemo(() => events, [events]);
  
  // Memoize the callback to prevent re-renders
  const handleEventClick = useCallback((event: PowerEvent) => {
    onEventClick(event);
  }, [onEventClick]);
  
  return (
    <div className="flex-1 bg-[#141C28] border border-[#273953] rounded-2xl overflow-hidden flex flex-col min-h-100">
      {/* Toolbar */}
      <div className="p-4 border-b border-[#2F4565] flex flex-wrap items-center gap-3 bg-[#101E30]">
        <div className="flex items-center bg-[#1F314F] rounded-full px-4 py-2.5 flex-1 min-w-45 border border-[#3E5D88]">
          <i className="fas fa-search text-gray-400 mr-2 text-base"></i>
          <input
            type="text"
            placeholder="Search ID, location..."
            className="w-full bg-transparent border-0 text-base text-white placeholder-gray-500 focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <span className="bg-[#1F314F] text-sm px-4 py-2.5 rounded-full flex items-center gap-2 border border-[#3E5D88] font-medium cursor-pointer hover:bg-[#2A3E5A] transition-colors">
            <span>Status</span>
            <i className="fas fa-chevron-down text-xs"></i>
          </span>
          <span className="bg-[#1F314F] text-sm px-4 py-2.5 rounded-full hidden sm:flex items-center gap-2 border border-[#3E5D88] font-medium cursor-pointer hover:bg-[#2A3E5A] transition-colors">
            <span>Severity</span>
            <i className="fas fa-chevron-down text-xs"></i>
          </span>
          <span className="bg-[#1F314F] text-sm px-4 py-2.5 rounded-full flex items-center gap-2 border border-[#3E5D88] cursor-pointer hover:bg-[#2A3E5A] transition-colors">
            <i className="fas fa-calendar-alt text-base"></i>
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-base">
          <thead className="bg-[#0F1E30] text-gray-300 text-sm uppercase border-b border-[#2C4668]">
            <tr>
              <th className="px-4 py-4 text-left font-semibold">ID</th>
              <th className="px-4 py-4 text-left font-semibold">Status</th>
              <th className="px-4 py-4 text-left hidden sm:table-cell font-semibold">Sev</th>
              <th className="px-4 py-4 text-left font-semibold">Location</th>
              <th className="px-4 py-4 text-left hidden md:table-cell font-semibold">Grid</th>
              <th className="px-4 py-4 text-left font-semibold">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2D4567]">
            {memoizedEvents.map((event) => (
              <tr
                key={event.id}
                onClick={() => handleEventClick(event)}
                className="hover:bg-[#1F3450] cursor-pointer transition-colors text-base"
              >
                <td className="px-4 py-4 font-mono text-[#B6D0F5] font-medium">{event.id}</td>
                <td className="px-4 py-4">
                  <span className={`text-xs px-3 py-1 rounded-full border font-semibold ${getBadgeClass(event.status)}`}>
                    {event.status === 'Investigating' ? 'Invest.' : event.status}
                  </span>
                </td>
                <td className={`px-4 py-4 hidden sm:table-cell ${getSeverityClass(event.severity)}`}>
                  {event.severity}
                </td>
                <td className="px-4 py-4 text-gray-200">{event.location}</td>
                <td className="px-4 py-4 hidden md:table-cell text-gray-300">{event.grid}</td>
                <td className="px-4 py-4 font-mono text-gray-200">{event.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#2F4565] flex justify-between items-center text-sm bg-[#0F1D2F]">
        <div className="flex items-center gap-3">
          <i className="fas fa-circle text-emerald-700 text-[10px]"></i>
          <span className="text-base">live 32s</span>
          <span className="bg-[#253D60] px-3 py-1 rounded-full text-sm font-medium">23 total</span>
        </div>
        <div>
          <span className="text-base">1-6 of 18</span>
          <i className="fas fa-chevron-left ml-4 mr-3 text-gray-500 text-lg cursor-pointer hover:text-gray-300"></i>
          <i className="fas fa-chevron-right text-gray-400 text-lg cursor-pointer hover:text-gray-300"></i>
        </div>
      </div>
    </div>
  );
}