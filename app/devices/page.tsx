'use client';

import { useState, useCallback, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { useDevices } from '@/context/DeviceContext';
import { useAuth } from '@/context/AuthContext';
import { useMetadata } from '@/context/MetadataContext';
import { Device } from '@/types';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DevicesPage() {
  const { devices, addDevice, removeDevice, reportPowerOutage, updateDevice } = useDevices();
  const { isAdmin } = useAuth();
  const { grids } = useMetadata();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit form state
  const [editName, setEditName] = useState('');
  const [editGrid, setEditGrid] = useState('');
  // Form state
  const [deviceName, setDeviceName] = useState('');
  const [deviceGrid, setDeviceGrid] = useState(grids[0] || 'Balayan North');

  // Update grid default when metadata loads
  useEffect(() => {
    if (grids.length > 0 && !grids.includes(deviceGrid)) {
      setDeviceGrid(grids[0]);
    }
  }, [grids, deviceGrid]);

  const handleAddDevice = useCallback(() => {
    if (!deviceName.trim()) return;

    // Get current GPS location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          addDevice({
            name: deviceName,
            grid: deviceGrid,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setDeviceName('');
          setDeviceGrid(grids[0] || 'Balayan North');
          setShowAddModal(false);
        },
        (error) => {
          console.error('GPS Error:', error);
          // Use default location if GPS fails
          addDevice({
            name: deviceName,
            grid: deviceGrid,
            lat: 13.9394,
            lng: 120.7336,
          });
          setDeviceName('');
          setDeviceGrid(grids[0] || 'Balayan North');
          setShowAddModal(false);
        }
      );
    } else {
      // Use default location if GPS not available
      addDevice({
        name: deviceName,
        grid: deviceGrid,
        lat: 13.9394,
        lng: 120.7336,
      });
      setDeviceName('');
      setDeviceGrid(grids[0] || 'Balayan North');
      setShowAddModal(false);
    }
  }, [deviceName, deviceGrid, addDevice, grids]);

  const handleDeleteDevice = useCallback((id: string) => {
    removeDevice(id);
    setShowDeleteConfirm(null);
    setSelectedDevice(null);
  }, [removeDevice]);

  const handleEditDevice = useCallback(() => {
    if (!selectedDevice) return;
    setEditName(selectedDevice.name);
    setEditGrid(selectedDevice.grid);
    setIsEditing(true);
  }, [selectedDevice]);

  const handleSaveEdit = useCallback(() => {
    if (!selectedDevice || !editName.trim()) return;
    updateDevice(selectedDevice.id, {
      name: editName,
      grid: editGrid,
    });
    setIsEditing(false);
    setSelectedDevice(null);
  }, [selectedDevice, editName, editGrid, updateDevice]);

  const formatLastSeen = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return date.toLocaleDateString();
  };

  const onlineCount = devices.filter(d => d.status === 'online').length;
  const offlineCount = devices.filter(d => d.status === 'offline').length;

  return (
    <ProtectedRoute>
      <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Devices</h1>
        <p className="text-gray-400 mt-1">Manage grid monitoring devices</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#141C28] border border-[#273953] rounded-xl p-4">
          <div className="text-gray-400 text-sm">Total Devices</div>
          <div className="text-2xl font-bold text-white mt-1">{devices.length}</div>
        </div>
        <div className="bg-[#141C28] border border-[#273953] rounded-xl p-4">
          <div className="text-gray-400 text-sm">Online</div>
          <div className="text-2xl font-bold text-green-400 mt-1">{onlineCount}</div>
        </div>
        <div className="bg-[#141C28] border border-[#273953] rounded-xl p-4">
          <div className="text-gray-400 text-sm">Offline</div>
          <div className="text-2xl font-bold text-red-400 mt-1">{offlineCount}</div>
        </div>
      </div>

      {/* Add Button - Admin only */}
      {isAdmin && (
        <button
          onClick={() => setShowAddModal(true)}
          className="mb-4 px-4 py-2 bg-[#1E5F4A] text-white rounded-lg font-medium hover:bg-[#2A7A5F] transition-colors flex items-center gap-2"
        >
          <i className="fas fa-plus"></i>
          Add Device
        </button>
      )}

      {/* Device List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices.map((device) => (
          <div 
            key={device.id}
            className="bg-[#141C28] border border-[#273953] rounded-xl p-5 hover:border-[#3E5D88] transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-[#1E314A] flex items-center justify-center border border-[#46648B]">
                <i className="fas fa-satellite-dish text-[#B6D0F5] text-xl"></i>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                device.status === 'online' 
                  ? 'bg-[#1F4733] text-[#BCF0D5] border border-[#479A6E]' 
                  : 'bg-[#4A2E2E] text-[#FCC5C5] border border-[#B45F5F]'
              }`}>
                {device.status === 'online' ? 'Online' : 'Offline'}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">{device.name}</h3>
            <p className="text-sm text-gray-400 mb-3">{device.grid}</p>
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-gray-500">{device.id}</span>
              <span className="text-gray-500">{formatLastSeen(device.lastSeen)}</span>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <i className="fas fa-signal text-gray-400"></i>
                <span className="text-sm text-gray-400">
                  {device.signalStrength}/5
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedDevice(device)}
                className="flex-1 px-3 py-2 bg-[#1F314F] text-gray-200 rounded-lg text-sm font-medium hover:bg-[#2A3E5A] transition-colors"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Device Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
          <div className="bg-[#142336] border border-[#375F8F] rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Add New Device</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Device Name</label>
                <input
                  type="text"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder="Enter device name"
                  className="w-full bg-[#1F314F] border border-[#3E5D88] rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#5A8BC9]"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Grid</label>
                <select
                  value={deviceGrid}
                  onChange={(e) => setDeviceGrid(e.target.value)}
                  className="w-full bg-[#1F314F] border border-[#3E5D88] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#5A8BC9]"
                >
                  {grids.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="bg-[#1F314F] rounded-lg p-3 border border-[#3E5D88]">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>GPS location will be captured automatically</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-[#1F314F] text-white rounded-lg font-medium hover:bg-[#2A3E5A] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDevice}
                disabled={!deviceName.trim()}
                className="flex-1 px-4 py-2 bg-[#1E5F4A] text-white rounded-lg font-medium hover:bg-[#2A7A5F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Device
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Device Detail Modal */}
      {selectedDevice && !showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
          <div className="bg-[#142336] border border-[#375F8F] rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedDevice.name}</h2>
                <p className="text-gray-400">{selectedDevice.id}</p>
              </div>
              <button
                onClick={() => setSelectedDevice(null)}
                className="text-gray-400 hover:text-white"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-[#273953]">
                <span className="text-gray-400">Status</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedDevice.status === 'online'
                    ? 'bg-[#1F4733] text-[#BCF0D5] border border-[#479A6E]'
                    : 'bg-[#4A2E2E] text-[#FCC5C5] border border-[#B45F5F]'
                }`}>
                  {selectedDevice.status === 'online' ? 'Online' : 'Offline'}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-[#273953]">
                <span className="text-gray-400">Grid</span>
                <span className="text-white">{selectedDevice.grid}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-[#273953]">
                <span className="text-gray-400">Signal</span>
                <span className="text-white">{selectedDevice.signalStrength}/5</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-[#273953]">
                <span className="text-gray-400">Last Seen</span>
                <span className="text-white">{formatLastSeen(selectedDevice.lastSeen)}</span>
              </div>

              <div className="py-2">
                <span className="text-gray-400">Location</span>
                <p className="text-white mt-1 text-sm">
                  {selectedDevice.lat?.toFixed(6) ?? 'N/A'}, {selectedDevice.lng?.toFixed(6) ?? 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              {isAdmin && (
                <button
                  onClick={() => setShowDeleteConfirm(selectedDevice.id)}
                  className="flex-1 px-4 py-2 bg-[#4A2E2E] text-[#FCC5C5] rounded-lg font-medium hover:bg-[#5A3E3E] transition-colors border border-[#B45F5F]"
                >
                  <i className="fas fa-trash mr-2"></i>
                  Delete
                </button>
              )}
              <button
                onClick={handleEditDevice}
                className={`flex-1 px-4 py-2 bg-[#1E5F4A] text-white rounded-lg font-medium hover:bg-[#2A7A5F] transition-colors ${!isAdmin ? 'w-full' : ''}`}
              >
                <i className="fas fa-edit mr-2"></i>
                Edit
              </button>
              <button
                onClick={() => setSelectedDevice(null)}
                className="flex-1 px-4 py-2 bg-[#1F314F] text-white rounded-lg font-medium hover:bg-[#2A3E5A] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4">
          <div className="bg-[#142336] border border-[#B45F5F] rounded-2xl p-6 w-full max-w-sm">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#4A2E2E] flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-exclamation-triangle text-red-400 text-2xl"></i>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Delete Device?</h2>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete this device? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-[#1F314F] text-white rounded-lg font-medium hover:bg-[#2A3E5A] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteDevice(showDeleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Device Modal */}
      {isEditing && selectedDevice && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
          <div className="bg-[#142336] border border-[#375F8F] rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Edit Device</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Device Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#1F314F] border border-[#3E5D88] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#5A8BC9]"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Grid</label>
                <select
                  value={editGrid}
                  onChange={(e) => setEditGrid(e.target.value)}
                  className="w-full bg-[#1F314F] border border-[#3E5D88] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#5A8BC9]"
                >
                  {grids.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 px-4 py-2 bg-[#1F314F] text-white rounded-lg font-medium hover:bg-[#2A3E5A] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!editName.trim()}
                className="flex-1 px-4 py-2 bg-[#1E5F4A] text-white rounded-lg font-medium hover:bg-[#2A7A5F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="h-24 md:h-6"></div>
    </AppLayout>
    </ProtectedRoute>
  );
}
