'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!email || !password) {
      setLocalError('Please enter both email and password');
      return;
    }

    const success = await login({ email, password });
    if (success) {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0C1119]">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 mb-4">
            <i className="fas fa-bolt text-white text-2xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-white">Power Monitor</h1>
          <p className="text-gray-400 mt-2">Balayan, Batangas Grid System</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#1a2234] rounded-xl p-8 shadow-2xl border border-gray-800">
          <h2 className="text-2xl font-semibold text-white mb-6">Sign In</h2>
          
          {(error || localError) && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error || localError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#0C1119] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#0C1119] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <i className="fas fa-circle-notch fa-spin mr-2"></i>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
            <p className="text-xs text-gray-400 mb-2 font-medium">Demo Credentials:</p>
            <div className="space-y-1 text-xs text-gray-500">
              <p><span className="text-gray-400">Admin:</span> admin@power-monitor.com / admin123</p>
              <p><span className="text-gray-400">User:</span> user@power-monitor.com / user123</p>
            </div>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <a href="/" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
