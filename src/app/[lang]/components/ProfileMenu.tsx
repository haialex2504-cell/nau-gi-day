'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { signOut } from '@/app/[lang]/actions/auth';
import { useLang } from './LangContext';

interface ProfileMenuProps {
  user: any;
}

export default function ProfileMenu({ user }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { lang, dict: t } = useLang();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <Link 
        href={`/${lang}/login`}
        className="flex items-center gap-2 px-3 py-1.5 hover:bg-surface-variant/50 transition-colors active:scale-95 duration-200 rounded-full border border-outline-variant/30"
      >
        <span className="material-symbols-outlined text-primary text-xl">login</span>
        <span className="text-xs font-bold text-on-surface">{t.auth.login}</span>
      </Link>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 hover:bg-surface-variant/50 transition-colors active:scale-95 duration-200 rounded-full border border-outline-variant/30"
      >
        <span className="material-symbols-outlined text-primary text-xl">person</span>
        <span className="text-xs font-bold text-on-surface">{t.auth.profile}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-surface-container-high rounded-2xl shadow-xl border border-outline-variant/10 py-4 z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-6 pb-4 border-b border-outline-variant/10">
            <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-1">
              {t.auth.loggedInAs}
            </p>
            <p className="font-headline font-bold text-on-surface truncate">
              {user.email}
            </p>
          </div>
          
          <div className="py-2">
            <Link 
              href={`/${lang}/my-recipes`}
              className="px-6 py-3 flex items-center gap-4 hover:bg-surface-variant/50 transition-colors text-on-surface font-medium"
              onClick={() => setIsOpen(false)}
            >
              <span className="material-symbols-outlined text-primary">restaurant_menu</span>
              {t.auth.myRecipes}
            </Link>
          </div>

          <div className="px-4 pt-2">
            <button
              onClick={() => signOut(lang)}
              className="w-full py-3 bg-error-container/20 text-error hover:bg-error-container/30 transition-colors rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">logout</span>
              {t.auth.logout}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
