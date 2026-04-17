'use client';

import { useState, FormEvent } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!displayName.trim()) {
      setError('Display name is required');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Valid email is required');
      return;
    }

    setIsSaving(true);
    const result = await updateProfile({
      displayName: displayName.trim(),
      email: email.trim(),
    });
    setIsSaving(false);

    if (result) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError('Failed to update profile. Email may already be in use.');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen overflow-hidden bg-[#0C1119] text-gray-200 antialiased text-base">
        <Header />
        
        <div className="flex flex-1 overflow-hidden relative">
          <Sidebar pathname="/profile" />
          
          <main className="flex-1 overflow-y-auto thin-scroll bg-[#0C1119] px-4 sm:px-6 pb-28 md:pb-6 relative">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white">Profile</h1>
              <p className="text-gray-400 mt-1">Manage your account information</p>
            </div>

            <div className="max-w-2xl space-y-6">
              {/* Profile Avatar */}
              <div className="bg-[#141C28] border border-[#273953] rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">{user?.displayName}</h2>
                    <p className="text-gray-400">{user?.role === 'admin' ? 'Administrator' : 'User'}</p>
                  </div>
                </div>
              </div>

              {/* Profile Form */}
              <div className="bg-[#141C28] border border-[#273953] rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Account Details</h2>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm">
                    Profile updated successfully!
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Display Name</label>
                    <input 
                      type="text" 
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-[#1F314F] border border-[#3E5D88] rounded-lg px-4 py-2 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Email</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#1F314F] border border-[#3E5D88] rounded-lg px-4 py-2 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">User ID</label>
                    <input 
                      type="text" 
                      value={user?.id || ''}
                      disabled
                      className="w-full bg-[#0F1A28] border border-[#273953] rounded-lg px-4 py-2 text-gray-500"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2 bg-[#1E5F4A] text-white rounded-lg font-medium hover:bg-[#2A7A5F] transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>

              {/* Account Info */}
              <div className="bg-[#141C28] border border-[#273953] rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Account Information</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Role</span>
                    <span className="text-white">{user?.role === 'admin' ? 'Administrator' : 'User'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Account Created</span>
                    <span className="text-white">{formatDate(user?.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Login</span>
                    <span className="text-white">{formatDate(user?.lastLogin)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-24 md:h-6"></div>
          </main>
        </div>

        <MobileNav />
      </div>
    </ProtectedRoute>
  );
}