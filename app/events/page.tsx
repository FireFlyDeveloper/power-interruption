'use client';

import { useState, FormEvent } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import EventTable from '@/components/EventTable';
import { PowerEvent } from '@/types';
import DetailPanel from '@/components/DetailPanel';
import { useDevices } from '@/context/DeviceContext';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function EventsPage() {
  const { powerEvents, addPowerEvent } = useDevices();
  const [selectedEvent, setSelectedEvent] = useState<PowerEvent | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Add Event form state
  const [location, setLocation] = useState('');
  const [grid, setGrid] = useState('Balayan North');
  const [severity, setSeverity] = useState<'Critical' | 'Medium' | 'Low'>('Medium');
  const [notes, setNotes] = useState('');

  const handleEventClick = (event: PowerEvent) => {
    setSelectedEvent(event);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setTimeout(() => setSelectedEvent(null), 300);
  };

  const filteredEvents = statusFilter === 'all' 
    ? powerEvents 
    : powerEvents.filter(event => event.status.toLowerCase() === statusFilter);

  const handleAddEvent = (e: FormEvent) => {
    e.preventDefault();
    
    // Get default coordinates based on grid selection
    const gridCoords: Record<string, { lat: number; lng: number }> = {
      'Balayan North': { lat: 13.9432, lng: 120.7389 },
      'Balayan Central': { lat: 13.9375, lng: 120.7256 },
      'Balayan South': { lat: 13.9289, lng: 120.7412 },
      'Balayan East': { lat: 13.9456, lng: 120.7501 },
    };
    
    const coords = gridCoords[grid] || gridCoords['Balayan North'];
    
    addPowerEvent({
      location: location || grid,
      grid,
      severity,
      lat: coords.lat,
      lng: coords.lng,
      notes: notes || undefined,
      affectedCustomers: undefined,
    });
    
    // Reset form and close modal
    setLocation('');
    setGrid('Balayan North');
    setSeverity('Medium');
    setNotes('');
    setShowAddModal(false);
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen overflow-hidden bg-[#0C1119] text-gray-200 antialiased text-base">
        <Header />
        
        <div className="flex flex-1 overflow-hidden relative">
          <Sidebar pathname="/events" />
          
          <main className="flex-1 overflow-y-auto thin-scroll bg-[#0C1119] px-4 sm:px-6 pb-28 md:pb-6 relative">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white">Events</h1>
                <p className="text-gray-400 mt-1">Manage and view all power interruption events</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-[#1E5F4A] text-white rounded-lg font-medium hover:bg-[#2A7A5F] transition-colors flex items-center gap-2"
              >
                <i className="fas fa-plus"></i>
                Add Event
              </button>
            </div>

            <div className="flex gap-3 mb-4">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  statusFilter === 'all' 
                    ? 'bg-[#1F314F] text-white border border-[#3E5D88]' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                All Events
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  statusFilter === 'active' 
                    ? 'bg-[#4A2E2E] text-[#FCC5C5] border border-[#B45F5F]' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter('investigating')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  statusFilter === 'investigating' 
                    ? 'bg-[#4A4024] text-[#FCE6B4] border border-[#C6993A]' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Investigating
              </button>
              <button
                onClick={() => setStatusFilter('resolved')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  statusFilter === 'resolved' 
                    ? 'bg-[#1F4733] text-[#BCF0D5] border border-[#479A6E]' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Resolved
              </button>
            </div>

            <EventTable 
              events={filteredEvents} 
              onEventClick={handleEventClick} 
            />

            <div className="h-24 md:h-6"></div>
          </main>
        </div>

        <MobileNav />
        
        <DetailPanel 
          event={selectedEvent} 
          isOpen={isPanelOpen} 
          onClose={handleClosePanel} 
        />

        {/* Add Event Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#141C28] border border-[#273953] rounded-2xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Add New Event</h2>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleAddEvent} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Location</label>
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter location name"
                    className="w-full bg-[#1F314F] border border-[#3E5D88] rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Grid</label>
                  <select 
                    value={grid}
                    onChange={(e) => setGrid(e.target.value)}
                    className="w-full bg-[#1F314F] border border-[#3E5D88] rounded-lg px-4 py-2 text-white"
                  >
                    <option>Balayan North</option>
                    <option>Balayan Central</option>
                    <option>Balayan South</option>
                    <option>Balayan East</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Severity</label>
                  <select 
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as 'Critical' | 'Medium' | 'Low')}
                    className="w-full bg-[#1F314F] border border-[#3E5D88] rounded-lg px-4 py-2 text-white"
                  >
                    <option value="Critical">Critical</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Notes</label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional notes (optional)"
                    rows={3}
                    className="w-full bg-[#1F314F] border border-[#3E5D88] rounded-lg px-4 py-2 text-white resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-6 py-2 bg-[#3D4F5F] text-white rounded-lg font-medium hover:bg-[#4D5F6F] transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-2 bg-[#1E5F4A] text-white rounded-lg font-medium hover:bg-[#2A7A5F] transition-colors"
                  >
                    Create Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}