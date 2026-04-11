'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

interface NavItem {
  label: string;
  icon: string;
  href: string;
  activeIcon?: boolean;
}

export default function BottomNavBar() {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { label: 'Trang chủ', icon: 'home', href: '/' },
    { label: 'Tạo món', icon: 'add_circle', href: '/add-recipe' },
    { label: 'Bếp của tôi', icon: 'menu_book', href: '/my-recipes' },
    { label: 'Lịch sử', icon: 'history', href: '#' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-10 flex justify-around items-center px-4 pt-4 pb-10 bg-surface/80 backdrop-blur-xl shadow-[0_-4px_32px_rgba(28,28,22,0.06)] rounded-t-[3rem] border-t border-outline-variant/10">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link 
            key={item.label}
            className={`flex flex-col items-center justify-center transition-all active:scale-90 ${
              isActive 
                ? 'bg-primary-container/20 text-primary rounded-full px-6 py-2' 
                : 'text-on-surface/40 hover:text-primary'
            }`} 
            href={item.href}
          >
            <span 
              className="material-symbols-outlined" 
              style={{ fontVariationSettings: isActive || item.activeIcon ? "'FILL' 1" : "'FILL' 0" }}
            >
              {item.icon}
            </span>
            <span className="font-body text-[10px] font-black uppercase tracking-widest mt-1">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
