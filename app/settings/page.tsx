'use client';

import { useState } from 'react';
import AppLayout from '@/components/AppLayout';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState('30');

  return (
    <AppLayout>
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
                defaultValue="Admin User"
                className="w-full bg-[#1F314F] border border-[#3E5D88] rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <input 
                type="email" 
                defaultValue="admin@balayanpower.ph"
                className="w-full bg-[#1F314F] border border-[#3E5D88] rounded-lg px-4 py-2 text-white"
              />
            </div>
            <button className="px-6 py-2 bg-[#1E5F4A] text-white rounded-lg font-medium hover:bg-[#2A7A5F] transition-colors">
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <div className="h-24 md:h-6"></div>
    </AppLayout>
  );
}
