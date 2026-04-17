'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState('30');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen overflow-hidden bg-[#0C1119] text-gray-200 antialiased text-base">
        <Header />
        
        <div className="flex flex-1 overflow-hidden relative">
          <Sidebar pathname="/settings" />
          
          <main className="flex-1 overflow-y-auto thin-scroll bg-[#0C1119] px-4 sm:px-6 pb-28 md:pb-6 relative">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white">Settings</h1>
              <p className="text-gray-400 mt-1">Configure your dashboard preferences</p>
            </div>

            <div className="space-y-6">
            {/* Notification Settings */}
            <div className="bg-[#141C28] border border-[#273953] rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Push Notifications</p>
                <p className="text-sm text-gray-400">Receive alerts for new incidents</p>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  notifications ? 'bg-[#1E5F4A]' : 'bg-[#3D4F5F]'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  notifications ? 'translate-x-6' : 'translate-x-0.5'
                }`}></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Email Alerts</p>
                <p className="text-sm text-gray-400">Receive email for critical events</p>
              </div>
              <button
                onClick={() => setEmailAlerts(!emailAlerts)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  emailAlerts ? 'bg-[#1E5F4A]' : 'bg-[#3D4F5F]'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  emailAlerts ? 'translate-x-6' : 'translate-x-0.5'
                }`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="bg-[#141C28] border border-[#273953] rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Display</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Dark Mode</p>
                <p className="text-sm text-gray-400">Use dark theme for the dashboard</p>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  darkMode ? 'bg-[#1E5F4A]' : 'bg-[#3D4F5F]'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-0.5'
                }`}></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Auto Refresh</p>
                <p className="text-sm text-gray-400">Automatically refresh data</p>
              </div>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  autoRefresh ? 'bg-[#1E5F4A]' : 'bg-[#3D4F5F]'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  autoRefresh ? 'translate-x-6' : 'translate-x-0.5'
                }`}></div>
              </button>
            </div>
            {autoRefresh && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Refresh Interval</p>
                  <p className="text-sm text-gray-400">Time in seconds between refreshes</p>
                </div>
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(e.target.value)}
                  className="bg-[#1F314F] border border-[#3E5D88] rounded-lg px-4 py-2 text-white"
                >
                  <option value="15">15 seconds</option>
                  <option value="30">30 seconds</option>
                  <option value="60">1 minute</option>
                  <option value="300">5 minutes</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Grid Settings */}
        <div className="bg-[#141C28] border border-[#273953] rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Grid Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Grid Location</label>
              <select className="w-full bg-[#1F314F] border border-[#3E5D88] rounded-lg px-4 py-2 text-white">
                <option>Balayan, Batangas</option>
                <option>Lipa City, Batangas</option>
                <option>Batangas City</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Alert Threshold</label>
              <select className="w-full bg-[#1F314F] border border-[#3E5D88] rounded-lg px-4 py-2 text-white">
                <option>Low (All incidents)</option>
                <option>Medium (Critical & High)</option>
                <option>High (Critical only)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-[#141C28] border border-[#273953] rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Account</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Display Name</label>
              <input 
                type="text" 
                defaultValue={user?.displayName || "Admin User"}
                className="w-full bg-[#1F314F] border border-[#3E5D88] rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <span className="text-white py-2 block">{user?.email || ''}</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPasswordModal(true)}
                className="px-6 py-2 bg-[#1E5F4A] text-white rounded-lg font-medium hover:bg-[#2A7A5F] transition-colors"
              >
                Change Password
              </button>
              <button
                onClick={() => {
                  logout();
                  router.push('/login');
                }}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="h-24 md:h-6"></div>
    </main>
  </div>

  <MobileNav />
</div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#141C28] border border-[#273953] rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-white mb-4">Change Password</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">New Password</label>
                <input
                  type="password"
                  className="w-full bg-[#1F314F] border border-[#3E5D88] rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Confirm Password</label>
                <input
                  type="password"
                  className="w-full bg-[#1F314F] border border-[#3E5D88] rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-6 py-2 bg-[#3D4F5F] text-white rounded-lg font-medium hover:bg-[#4D5F6F] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-2 bg-[#1E5F4A] text-white rounded-lg font-medium hover:bg-[#2A7A5F] transition-colors"
                >
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
