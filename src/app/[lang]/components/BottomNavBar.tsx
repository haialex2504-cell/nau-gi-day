'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState, useRef } from 'react';
import { useLang } from './LangContext';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/app/[lang]/actions/auth';

import LoginPrompt from './LoginPrompt';

export default function BottomNavBar() {
  const pathname = usePathname();
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const { lang, dict: t } = useLang();
  const { user, isLoaded } = useAuth();
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFocusIn = (e: Event) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        setIsKeyboardOpen(true);
      }
    };

    const handleFocusOut = () => {
      setTimeout(() => {
        if (
          document.activeElement?.tagName !== 'INPUT' &&
          document.activeElement?.tagName !== 'TEXTAREA' &&
          !(document.activeElement as HTMLElement)?.isContentEditable
        ) {
          setIsKeyboardOpen(false);
        }
      }, 50);
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  // Close profile sheet when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sheetRef.current && !sheetRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

  // Handle nav item click
  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsProfileOpen(true);
  };

  const navItems = [
    { label: t.common.home,       icon: 'home',       href: `/${lang}` },
    { label: t.common.favorites,  icon: 'favorite',   href: `/${lang}/my-recipes` },
    { label: t.common.addRecipe,  icon: 'add_circle', href: `/${lang}/add-recipe` },
  ];

  if (isKeyboardOpen) return null;

  return (
    <>
      {/* Profile Bottom Sheet Overlay */}
      {isProfileOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in duration-300">
          <div 
            ref={sheetRef}
            className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300 max-w-2xl mx-auto"
          >
            {/* Handle bar */}
            <div className="w-12 h-1.5 bg-outline-variant/30 rounded-full mx-auto mb-8" onClick={() => setIsProfileOpen(false)} />
            
            <div className="space-y-8">
              {user ? (
                <>
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-secondary">
                      {t.auth.loggedInAs}
                    </p>
                    <p className="font-headline font-bold text-2xl text-on-surface truncate">
                      {user.email}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <Link 
                      href={`/${lang}/my-recipes`}
                      className="group flex items-center gap-5 p-5 bg-surface-container-low hover:bg-surface-variant/50 transition-all rounded-3xl border border-outline-variant/10"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <div className="w-12 h-12 bg-primary-container/20 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined">restaurant_menu</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-headline font-bold text-on-surface text-lg">{t.auth.myRecipes}</p>
                        <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Quản lý bữa ăn của bạn</p>
                      </div>
                      <span className="material-symbols-outlined text-outline">chevron_right</span>
                    </Link>

                    <button
                      onClick={() => signOut(lang)}
                      className="group flex items-center gap-5 p-5 bg-error-container/10 hover:bg-error-container/20 transition-all rounded-3xl border border-error/10 text-error"
                    >
                      <div className="w-12 h-12 bg-error-container/20 rounded-2xl flex items-center justify-center text-error group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined">logout</span>
                      </div>
                      <p className="font-headline font-bold text-lg">{t.auth.logout}</p>
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-6 py-4">
                  <div className="w-20 h-20 bg-primary-container/20 rounded-full flex items-center justify-center mx-auto text-primary">
                    <span className="material-symbols-outlined text-4xl">account_circle</span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-headline font-bold text-2xl">Chào mừng bạn!</h3>
                    <p className="text-on-surface-variant font-medium">Đăng nhập để lưu công thức và cá nhân hóa trải nghiệm.</p>
                  </div>
                  <Link 
                    href={`/${lang}/login`}
                    className="block w-full py-5 bg-primary text-on-primary rounded-full font-headline font-bold text-lg shadow-lg active:scale-95 transition-all"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    {t.auth.login}
                  </Link>
                </div>
              )}
              
              <button 
                className="w-full py-4 bg-surface-container-highest hover:bg-surface-variant transition-colors rounded-2xl font-bold text-on-surface/80 text-sm italic tracking-wide"
                onClick={() => setIsProfileOpen(false)}
              >
                {t.common.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-4 pt-3 pb-8 bg-surface/80 backdrop-blur-xl shadow-[0_-4px_32px_rgba(28,28,22,0.04)] rounded-t-[2rem] border-t border-outline-variant/15">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isAddRecipe = item.href.includes('/add-recipe');
          
          return (
            <Link
              key={item.icon}
              href={item.href}
              onClick={(e) => {
                if (isAddRecipe && !user && isLoaded) {
                  e.preventDefault();
                  setIsLoginPromptOpen(true);
                }
              }}
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

        {/* Profile Tab */}
        <button
          onClick={handleProfileClick}
          className={`flex flex-col items-center justify-center transition-all active:scale-90 px-5 py-1.5 rounded-full ${
            isProfileOpen
              ? 'bg-primary-container/10 text-primary'
              : 'text-on-surface/50 hover:text-primary'
          }`}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: isProfileOpen ? "'FILL' 1" : "'FILL' 0" }}
          >
            person
          </span>
          <span className="font-body text-[11px] font-semibold uppercase tracking-wider mt-1">
            {t.common.profile}
          </span>
        </button>
      </nav>

      {/* Login Prompt Modal */}
      <LoginPrompt 
        isOpen={isLoginPromptOpen}
        onClose={() => setIsLoginPromptOpen(false)}
        lang={lang}
        title={t.auth.loginToCreateTitle}
        message={t.auth.loginToCreateMessage}
        loginText={t.auth.login}
        laterText={t.common.later}
      />
    </>
  );
}
