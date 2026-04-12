'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

interface NavItem {
  label: string;
  icon: string;
  href: string;
}

export default function BottomNavBar() {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { label: 'Trang chủ', icon: 'home',       href: '/' },
    { label: 'Yêu thích',  icon: 'favorite',   href: '/my-recipes' },
    { label: 'Thêm món',   icon: 'add_circle', href: '/add-recipe' },
    { label: 'Hồ sơ',      icon: 'person',     href: '#' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pt-3 pb-8 bg-surface/80 backdrop-blur-xl shadow-[0_-4px_32px_rgba(28,28,22,0.04)] rounded-t-[2rem] border-t border-outline-variant/15">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link 
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center justify-center transition-all active:scale-90 px-5 py-1.5 rounded-full ${
              isActive 
                ? 'bg-primary-container/10 text-primary' 
                : 'text-on-surface/50 hover:text-primary'
            }`} 
          >
            <span 
              className="material-symbols-outlined" 
              style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
            >
              {item.icon}
            </span>
            <span className="font-body text-[11px] font-semibold uppercase tracking-wider mt-1">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
