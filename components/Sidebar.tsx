'use client';

import { useState } from 'react';

const navItems = [
  { icon: 'fa-chart-pie', label: 'Dashboard', active: true },
  { icon: 'fa-list', label: 'Events', active: false },
  { icon: 'fa-map', label: 'Map', active: false },
  { icon: 'fa-file-alt', label: 'Reports', active: false },
  { icon: 'fa-cog', label: 'Settings', active: false },
];

export default function Sidebar() {
  const [active, setActive] = useState('Dashboard');

  return (
    <aside className="hidden md:flex flex-col w-28 bg-[#0F1724] border-r border-[#25344A] py-10 items-center gap-8 shrink-0 relative z-10">
      <nav className="flex flex-col gap-8 w-full items-center">
        {navItems.map((item) => (
          <div
            key={item.label}
            onClick={() => setActive(item.label)}
            className={`group flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              active === item.label ? 'text-[#B6D0F5]' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <i className={`fas ${item.icon} text-3xl`}></i>
            <span className={`text-xs font-medium uppercase tracking-wider ${
              active === item.label ? 'text-gray-300' : ''
            }`}>
              {item.label}
            </span>
          </div>
        ))}
      </nav>
      <div className="mt-auto mb-6 text-gray-600 text-xs font-medium">v.2</div>
    </aside>
  );
}