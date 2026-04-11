'use client';

import { useClock } from '@/hooks/useClock';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Header() {
  const time = useClock();
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="bg-[#0F1A28] border-b border-[#2A3E5A] px-4 sm:px-6 py-3 flex items-center justify-between shrink-0 z-20">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#1E314A] flex items-center justify-center border border-[#46648B]">
          <i className="fas fa-bolt text-[#B6D0F5] text-xl"></i>
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">POWER MONITOR</h1>
          <p className="text-xs text-gray-500 hidden sm:block">Balayan, Batangas Grid</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3 sm:gap-5">
        <div className="hidden md:flex items-center bg-[#1F3149] rounded-full px-5 py-2 border border-[#3F5B83]">
          <i className="far fa-clock text-gray-300 mr-2 text-base"></i>
          <span className="font-mono text-base text-white">{time}</span>
        </div>

        {isAuthenticated && (
          <div className="flex items-center gap-2">
            <a 
              href="/profile"
              className="flex items-center gap-2 px-3 py-2 bg-[#1F3149] rounded-lg border border-[#3F5B83] hover:bg-[#2A4170] transition-colors"
            >
              <i className="fas fa-user text-gray-300 text-sm"></i>
              <span className="hidden sm:block text-sm text-gray-300">{user?.displayName}</span>
            </a>
            <button
              onClick={handleLogout}
              className="p-2 bg-[#1F3149] rounded-lg border border-[#3F5B83] hover:bg-red-500/20 hover:border-red-500/50 transition-colors"
              title="Logout"
            >
              <i className="fas fa-sign-out-alt text-gray-300 text-sm"></i>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}