'use client';

import { useState } from 'react';

const navItems = [
  { icon: 'fa-chart-pie', active: true },
  { icon: 'fa-list', active: false },
  { icon: 'fa-map', active: false },
  { icon: 'fa-file-alt', active: false },
  { icon: 'fa-cog', active: false },
];

export default function MobileNav() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#101C2C] border-t border-[#34537A] py-3 px-4 flex justify-around items-center text-gray-300 z-30 text-lg">
      {navItems.map((item, index) => (
        <i
          key={index}
          onClick={() => setActiveIndex(index)}
          className={`fas ${item.icon} text-2xl cursor-pointer transition-colors ${
            activeIndex === index ? 'text-[#B6D0F5]' : ''
          }`}
        ></i>
      ))}
    </nav>
  );
}