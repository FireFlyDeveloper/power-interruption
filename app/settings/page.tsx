'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

interface Settings {
  notifications: boolean;
  emailAlerts: boolean;
  darkMode: boolean;
  autoRefresh: boolean;
  refreshInterval: string;
  gridLocation: string;
  alertThreshold: string;
}

const defaultSettings: Settings = {
  notifications: true,
  emailAlerts: false,
  darkMode: true,
  autoRefresh: true,
  refreshInterval: '30',
  gridLocation: 'Balayan, Batangas',
  alertThreshold: 'Low (All incidents)',
};

export default function SettingsPage() {
  const { user, changePassword, updateProfile, logout } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  
  
  
  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileDisplayName, setProfileDisplayName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('power_monitoring_settings');
    if (stored) {
      setSettings({ ...defaultSettings, ...JSON.parse(stored) });
    }
  }, []);

  // Save settings to localStorage when changed
  useEffect(() => {
    localStorage.setItem('power_monitoring_settings', JSON.stringify(settings));
  }, [settings]);

  const handleSettingChange = (key: keyof Settings, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setIsSavingPassword(true);
    const success = await changePassword({
      currentPassword,
      newPassword,
      confirmPassword,
    });
    setIsSavingPassword(false);

    if (success) {
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess(false);
      }, 2000);
    } else {
      setPasswordError('Current password is incorrect');
    }
  };

  const handleSaveProfile = async () => {
    const success = await updateProfile({
      displayName: profileDisplayName,
      email: profileEmail,
    });
    if (success) {
      setIsEditingProfile(false);
    }
  };

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

            {/* Notification Settings */}
            <div className="bg-[#141C28] border border-[#273953] rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">Notifications</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Push Notifications</p>
                    <p className="text-sm text-gray-400">Receive alerts for new incidents</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('notifications', !settings.notifications)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.notifications ? 'bg-[#1E5F4A]' : 'bg-[#3D4F5F]'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.notifications ? 'translate-x-6' : 'translate-x-0.5'
                    }`}></div>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Email Alerts</p>
                    <p className="text-sm text-gray-400">Receive email for critical events</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('emailAlerts', !settings.emailAlerts)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.emailAlerts ? 'bg-[#1E5F4A]' : 'bg-[#3D4F5F]'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.emailAlerts ? 'translate-x-6' : 'translate-x-0.5'
                    }`}></div>
                  </button>
                </div>
              </div>
            </div>

            {/* Display Settings */}
            <div className="bg-[#141C28] border border-[#273953] rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">Display</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Dark Mode</p>
                    <p className="text-sm text-gray-400">Use dark theme for the dashboard</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('darkMode', !settings.darkMode)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.darkMode ? 'bg-[#1E5F4A]' : 'bg-[#3D4F5F]'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.darkMode ? 'translate-x-6' : 'translate-x-0.5'
                    }`}></div>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Auto Refresh</p>
                    <p className="text-sm text-gray-400">Automatically refresh data</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('autoRefresh', !settings.autoRefresh)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.autoRefresh ? 'bg-[#1E5F4A]' : 'bg-[#3D4F5F]'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.autoRefresh ? 'translate-x-6' : 'translate-x-0.5'
                    }`}></div>
                  </button>
                </div>
                {settings.autoRefresh && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Refresh Interval</p>
                      <p className="text-sm text-gray-400">Time in seconds between refreshes</p>
                    </div>
                    <select
                      value={settings.refreshInterval}
                      onChange={(e) => handleSettingChange('refreshInterval', e.target.value)}
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
            <div className="bg-[#141C28] border border-[#273953] rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">Grid Configuration</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Grid Location</label>
                  <select 
                    value={settings.gridLocation}
                    onChange={(e) => handleSettingChange('gridLocation', e.target.value)}
                    className="w-full bg-[#1F314F] border border-[#3E5D88] rounded-lg px-4 py-2 text-white"
                  >
                    <option>Balayan, Batangas</option>
                    <option>Lipa City, Batangas</option>
                    <option>Batangas City</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Alert Threshold</label>
                  <select 
                    value={settings.alertThreshold}
                    onChange={(e) => handleSettingChange('alertThreshold', e.target.value)}
                    className="w-full bg-[#1F314F] border border-[#3E5D88] rounded-lg px-4 py-2 text-white"
                  >
                    <option>Low (All incidents)</option>
                    <option>Medium (Critical & High)</option>
                    <option>High (Critical only)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-[#141C28] border border-[#273953] rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">Account</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Display Name</label>
                  {isEditingProfile ? (
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={profileDisplayName}
                        onChange={(e) => setProfileDisplayName(e.target.value)}
                        className="flex-1 bg-[#1F314F] border border-[#3E5D88] rounded-lg px-4 py-2 text-white"
                      />
                      <button 
                        onClick={handleSaveProfile}
                        className="px-3 py-2 bg-[#1E5F4A] text-white rounded-lg hover:bg-[#2A7A5F] transition-colors"
                      >
                        <i className="fas fa-check"></i>
                      </button>
                      <button 
                        onClick={() => {
                          setIsEditingProfile(false);
                          setProfileDisplayName(user?.displayName || '');
                        }}
                        className="px-3 py-2 bg-[#3D4F5F] text-white rounded-lg hover:bg-[#4D5F6F] transition-colors"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="flex-1 text-white py-2">{user?.displayName || 'User'}</span>
                      <button 
                        onClick={() => {
                          setIsEditingProfile(true);
                          setProfileDisplayName(user?.displayName || '');
                        }}
                        className="px-3 py-2 bg-[#1F314F] text-gray-300 rounded-lg hover:bg-[#2A4A6F] transition-colors"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Email</label>
                  {isEditingProfile ? (
                    <div className="flex gap-2">
                      <input 
                        type="email" 
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        className="flex-1 bg-[#1F314F] border border-[#3E5D88] rounded-lg px-4 py-2 text-white"
                      />
                      <button 
                        onClick={handleSaveProfile}
                        className="px-3 py-2 bg-[#1E5F4A] text-white rounded-lg hover:bg-[#2A7A5F] transition-colors"
                      >
                        <i className="fas fa-check"></i>
                      </button>
                      <button 
                        onClick={() => {
                          setIsEditingProfile(false);
                          setProfileEmail(user?.email || '');
                        }}
                        className="px-3 py-2 bg-[#3D4F5F] text-white rounded-lg hover:bg-[#4D5F6F] transition-colors"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="flex-1 text-white py-2">{user?.email || ''}</span>
                      <button 
                        onClick={() => {
                          setIsEditingProfile(true);
                          setProfileEmail(user?.email || '');
                        }}
                        className="px-3 py-2 bg-[#1F314F] text-gray-300 rounded-lg hover:bg-[#2A4A6F] transition-colors"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                    </div>
                  )}
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

            <div className="h-24 md:h-6"></div>
          </main>
        </div>

        <MobileNav />

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#141C28] border border-[#273953] rounded-2xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Change Password</h2>
                <button 
                  onClick={() => setShowPasswordModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              {passwordError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm">
                  Password changed successfully!
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Current Password</label>
                  <input 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-[#1F314F] border border-[#3E5D88] rounded-lg px-4 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">New Password</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#1F314F] border border-[#3E5D88] rounded-lg px-4 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Confirm New Password</label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#1F314F] border border-[#3E5D88] rounded-lg px-4 py-2 text-white"
                    required
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
                    disabled={isSavingPassword}
                    className="flex-1 px-6 py-2 bg-[#1E5F4A] text-white rounded-lg font-medium hover:bg-[#2A7A5F] transition-colors disabled:opacity-50"
                  >
                    {isSavingPassword ? 'Saving...' : 'Save Password'}
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
