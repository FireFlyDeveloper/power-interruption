'use client';

import { useCallback } from 'react';
import { PowerEvent } from '@/types';
import { useDevices } from '@/context/DeviceContext';

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
  const { eventPage, eventTotal, eventTotalPages, goToEventPage } = useDevices();

  const handleEventClick = useCallback((event: PowerEvent) => {
    onEventClick(event);
  }, [onEventClick]);

  return (
    <div className="flex-1 bg-[#141C28] border border-[#273953] rounded-2xl overflow-hidden flex flex-col min-h-100">
      {/* Header - simplified without filters */}
      <div className="p-4 border-b border-[#2F4565] bg-[#101E30]">
        <h3 className="text-lg font-semibold text-white">Power Events</h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-base">
          <thead className="bg-[#0F1E30] text-gray-300 text-sm uppercase border-b border-[#2C4668]">
            <tr>
              <th className="px-4 py-4 text-left font-semibold">Status</th>
              <th className="px-4 py-4 text-left hidden sm:table-cell font-semibold">Sev</th>
              <th className="px-4 py-4 text-left font-semibold">Location</th>
              <th className="px-4 py-4 text-left font-semibold">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2D4567]">
            {events.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No events found
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  className="hover:bg-[#1F3450] cursor-pointer transition-colors text-base"
                >
                  <td className="px-4 py-4">
                    <span className={`text-xs px-3 py-1 rounded-full border font-semibold ${getBadgeClass(event.status)}`}>
                      {event.status === 'Investigating' ? 'Invest.' : event.status}
                    </span>
                  </td>
                  <td className={`px-4 py-4 hidden sm:table-cell ${getSeverityClass(event.severity)}`}>
                    {event.severity}
                  </td>
                  <td className="px-4 py-4 text-gray-200">{event.location}</td>
                  <td className="px-4 py-4 font-mono text-gray-200">{event.duration}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#2F4565] flex justify-between items-center text-sm bg-[#0F1D2F]">
        <div className="flex items-center gap-3">
          <i className="fas fa-circle text-emerald-700 text-[10px]"></i>
          <span className="text-base">live 32s</span>
          <span className="bg-[#253D60] px-3 py-1 rounded-full text-sm font-medium">{eventTotal} total</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base">{eventTotal > 0 ? `${(eventPage - 1) * 50 + 1}-${Math.min(eventPage * 50, eventTotal)}` : '0'} of {eventTotal}</span>
          <button
            onClick={() => goToEventPage(eventPage - 1)}
            disabled={eventPage <= 1}
            className={`text-lg cursor-pointer ${eventPage <= 1 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <i className="fas fa-chevron-left ml-4 mr-3"></i>
          </button>
          <button
            onClick={() => goToEventPage(eventPage + 1)}
            disabled={eventPage >= eventTotalPages}
            className={`text-lg cursor-pointer ${eventPage >= eventTotalPages ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
}