'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { icon: 'fa-chart-pie', href: '/' },
  { icon: 'fa-list', href: '/events' },
  { icon: 'fa-map', href: '/map' },
  { icon: 'fa-file-alt', href: '/reports' },
  { icon: 'fa-cog', href: '/settings' },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#101C2C] border-t border-[#34537A] py-3 px-4 flex justify-around items-center text-gray-300 z-30 text-lg">
      {navItems.map((item, index) => (
        <Link
          key={index}
          href={item.href}
          className={`fas ${item.icon} text-2xl transition-colors ${
            pathname === item.href ? 'text-[#B6D0F5]' : ''
          }`}
        ></Link>
      ))}
    </nav>
  );
}