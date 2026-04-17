'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterSeverity, setFilterSeverity] = useState<string>('All');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showSeverityDropdown, setShowSeverityDropdown] = useState(false);

  // Filter events based on search and filters
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          event.id.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query) ||
          event.grid.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      
      // Status filter
      if (filterStatus !== 'All' && event.status !== filterStatus) {
        return false;
      }
      
      // Severity filter
      if (filterSeverity !== 'All' && event.severity !== filterSeverity) {
        return false;
      }
      
      return true;
    });
  }, [events, searchQuery, filterStatus, filterSeverity]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.status-dropdown')) {
        setShowStatusDropdown(false);
      }
      if (!(e.target as Element).closest('.severity-dropdown')) {
        setShowSeverityDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-0 text-base text-white placeholder-gray-500 focus:outline-none"
          />
        </div>
        <div className="flex gap-2 relative">
          {/* Status Filter */}
          <div className="relative status-dropdown">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowStatusDropdown(!showStatusDropdown);
                setShowSeverityDropdown(false);
              }}
              className="bg-[#1F314F] text-sm px-4 py-2.5 rounded-full flex items-center gap-2 border border-[#3E5D88] font-medium cursor-pointer hover:bg-[#2A3E5A] transition-colors"
            >
              <span>{filterStatus === 'All' ? 'Status' : filterStatus}</span>
              <i className="fas fa-chevron-down text-xs"></i>
            </button>
            {showStatusDropdown && (
              <div className="absolute top-full mt-2 left-0 bg-[#1F314F] border border-[#3E5D88] rounded-lg shadow-xl z-10 min-w-32 overflow-hidden">
                {['All', 'Active', 'Investigating', 'Resolved'].map(status => (
                  <button
                    key={status}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFilterStatus(status);
                      setShowStatusDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-[#2A3E5A] transition-colors ${
                      filterStatus === status ? 'bg-[#2A3E5A] text-white' : 'text-gray-300'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Severity Filter */}
          <div className="relative severity-dropdown">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowSeverityDropdown(!showSeverityDropdown);
                setShowStatusDropdown(false);
              }}
              className="bg-[#1F314F] text-sm px-4 py-2.5 rounded-full flex items-center gap-2 border border-[#3E5D88] font-medium cursor-pointer hover:bg-[#2A3E5A] transition-colors hidden sm:flex"
            >
              <span>{filterSeverity === 'All' ? 'Severity' : filterSeverity}</span>
              <i className="fas fa-chevron-down text-xs"></i>
            </button>
            {showSeverityDropdown && (
              <div className="absolute top-full mt-2 left-0 bg-[#1F314F] border border-[#3E5D88] rounded-lg shadow-xl z-10 min-w-32 overflow-hidden">
                {['All', 'Critical', 'Medium', 'Low'].map(severity => (
                  <button
                    key={severity}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFilterSeverity(severity);
                      setShowSeverityDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-[#2A3E5A] transition-colors ${
                      filterSeverity === severity ? 'bg-[#2A3E5A] text-white' : 'text-gray-300'
                    }`}
                  >
                    {severity}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="bg-[#1F314F] text-sm px-4 py-2.5 rounded-full flex items-center gap-2 border border-[#3E5D88] cursor-pointer hover:bg-[#2A3E5A] transition-colors">
            <i className="fas fa-calendar-alt text-base"></i>
          </button>
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
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No events found
                </td>
              </tr>
            ) : (
              filteredEvents.map((event) => (
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
          <span className="bg-[#253D60] px-3 py-1 rounded-full text-sm font-medium">{filteredEvents.length} total</span>
        </div>
        <div>
          <span className="text-base">1-{filteredEvents.length} of {filteredEvents.length}</span>
          <i className="fas fa-chevron-left ml-4 mr-3 text-gray-500 text-lg cursor-pointer hover:text-gray-300"></i>
          <i className="fas fa-chevron-right text-gray-400 text-lg cursor-pointer hover:text-gray-300"></i>
        </div>
      </div>
    </div>
  );
}