'use client';

import { PowerEvent, EventTimeline, getEventTimeline } from '@/types';
import { useDevices } from '@/context/DeviceContext';

interface DetailPanelProps {
  event: PowerEvent | null;
  isOpen: boolean;
  onClose: () => void;
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
      return 'text-[#F9B5B5]';
    case 'Medium':
      return 'text-[#FCDBA0]';
    case 'Low':
      return 'text-[#B2D2F5]';
    default:
      return 'text-gray-400';
  }
};

const getTimelineIconClass = (status: EventTimeline['status']) => {
  switch (status) {
    case 'completed':
      return 'text-[#E5A5A5]';
    case 'current':
      return 'text-[#F0CF8F]';
    case 'pending':
      return 'text-gray-600';
    default:
      return 'text-gray-600';
  }
};

export default function DetailPanel({ event, isOpen, onClose }: DetailPanelProps) {
  const { updateEventStatus } = useDevices();

  if (!event) return null;

  const timeline = getEventTimeline(event);

  const handleStatusChange = (newStatus: 'Active' | 'Investigating' | 'Resolved') => {
    updateEventStatus(event.id, newStatus);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/80 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 z-[60]' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      ></div>

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 w-full sm:w-96 h-full bg-[#142336] border-l border-[#375F8F] shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0 z-[70]' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-[#375A84] bg-[#0F2037]">
          <div>
            <span className="text-sm text-gray-400">Event details</span>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mt-1">
              {event.id}
              <span className={`text-sm px-3 py-1 rounded-full border font-semibold ${getBadgeClass(event.status)}`}>
                {event.status}
              </span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl transition-colors"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5 thin-scroll text-base">
          {/* Status Update Buttons */}
          {event.status !== 'Resolved' && (
            <div className="flex flex-wrap gap-2">
              {event.status === 'Active' && (
                <button
                  onClick={() => handleStatusChange('Investigating')}
                  className="px-3 py-1.5 bg-[#4A4024] text-[#FCE6B4] rounded-lg text-sm font-medium hover:bg-[#5A5034] transition-colors border border-[#C6993A]"
                >
                  <i className="fas fa-search mr-1"></i>
                  Start Investigating
                </button>
              )}
              {(event.status === 'Active' || event.status === 'Investigating') && (
                <button
                  onClick={() => handleStatusChange('Resolved')}
                  className="px-3 py-1.5 bg-[#1E5F4A] text-[#BCF0D5] rounded-lg text-sm font-medium hover:bg-[#2E7A5F] transition-colors border border-[#479A6E]"
                >
                  <i className="fas fa-check mr-1"></i>
                  Mark Resolved
                </button>
              )}
            </div>
          )}

          <div className="flex justify-between border-b border-[#38618B] pb-3">
            <span className="text-gray-400 text-base">Severity</span>
            <span className={`text-lg font-semibold ${getSeverityClass(event.severity)}`}>
              {event.severity}
            </span>
          </div>
          
          <div className="flex justify-between border-b border-[#38618B] pb-3">
            <span className="text-gray-400 text-base">Location</span>
            <span className="text-white text-lg">{event.location}</span>
          </div>
          
          <div className="flex justify-between border-b border-[#38618B] pb-3">
            <span className="text-gray-400 text-base">Start time</span>
            <span className="text-white text-lg">{event.start}</span>
          </div>
          
          <div className="flex justify-between border-b border-[#38618B] pb-3">
            <span className="text-gray-400 text-base">Duration</span>
            <span className="text-white font-mono text-lg">{event.duration}</span>
          </div>

          <div className="bg-[#122336] p-4 rounded-xl border border-[#3866A0]">
            <span className="text-base text-gray-300 block mb-3 font-medium">Timeline</span>
            <ul className="space-y-3 text-base">
              {timeline.map((item, index) => (
                <li key={index} className="flex items-center">
                  <i className={`far fa-circle mr-3 ${getTimelineIconClass(item.status)}`}></i>
                  <span className={item.status === 'pending' ? 'text-gray-500' : 'text-gray-200'}>
                    {item.time} {item.description}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#122336] p-4 rounded-xl border border-[#3866A0]">
            <span className="text-base text-gray-300 block mb-2 font-medium">Notes</span>
            <p className="text-gray-200 text-base leading-relaxed">
              {event.notes || 'No additional notes available.'}
            </p>
            {event.affectedCustomers && (
              <p className="text-gray-400 text-sm mt-2">
                {event.affectedCustomers.toLocaleString()} customers affected
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}