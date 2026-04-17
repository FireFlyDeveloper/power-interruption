'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { logout } = useAuth();
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
        <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="p-2 bg-[#1F3149] rounded-lg border border-[#3F5B83] hover:bg-red-500/20 hover:border-red-500/50 transition-colors"
              title="Logout"
            >
              <i className="fas fa-sign-out-alt text-gray-300 text-sm"></i>
            </button>
          </div>
      </div>
    </header>
  );
}