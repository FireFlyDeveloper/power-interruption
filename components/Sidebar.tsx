'use client';

import { useState } from 'react';
import Link from 'next/link';

interface SidebarProps {
  pathname: string;
}

const navItems = [
  { icon: 'fa-chart-pie', label: 'Dashboard', href: '/' },
  { icon: 'fa-list', label: 'Events', href: '/events' },
  { icon: 'fa-map', label: 'Map', href: '/map' },
  { icon: 'fa-file-alt', label: 'Reports', href: '/reports' },
  { icon: 'fa-cog', label: 'Settings', href: '/settings' },
];

export default function Sidebar({ pathname }: SidebarProps) {
  const getActiveLabel = () => {
    const activeItem = navItems.find(item => item.href === pathname);
    return activeItem ? activeItem.label : 'Dashboard';
  };

  const [active] = useState(getActiveLabel());

  return (
    <aside className="hidden md:flex flex-col w-28 bg-[#0F1724] border-r border-[#25344A] py-10 items-center gap-8 shrink-0 relative z-10">
      <nav className="flex flex-col gap-8 w-full items-center">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`group flex flex-col items-center gap-1 transition-colors ${
              pathname === item.href ? 'text-[#B6D0F5]' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <i className={`fas ${item.icon} text-3xl`}></i>
            <span className={`text-xs font-medium uppercase tracking-wider ${
              pathname === item.href ? 'text-gray-300' : ''
            }`}>
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
      <div className="mt-auto mb-6 text-gray-600 text-xs font-medium">v.2</div>
    </aside>
  );
}