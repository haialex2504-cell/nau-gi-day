'use client';

import React from 'react';
import Link from 'next/link';

interface LoginPromptProps {
  isOpen: boolean;
  onClose: () => void;
  lang: string;
  title: string;
  message: string;
  loginText: string;
  laterText: string;
}

export default function LoginPrompt({ 
  isOpen, 
  onClose, 
  lang, 
  title, 
  message, 
  loginText, 
  laterText 
}: LoginPromptProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-surface rounded-t-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-500">
        <div className="w-12 h-1.5 bg-outline-variant/30 rounded-full mx-auto mb-10" onClick={onClose} />
        
        <div className="flex flex-col items-center text-center space-y-8 pb-4">
          <div className="w-20 h-20 bg-primary-container/20 rounded-[2rem] flex items-center justify-center text-primary rotate-3 transition-transform hover:rotate-0">
             <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>draw</span>
          </div>
          
          <div className="space-y-3 px-2">
            <h3 className="font-headline font-black text-3xl tracking-tight leading-tight text-primary uppercase italic">
              {title}
            </h3>
            <p className="text-on-surface-variant font-medium text-lg leading-relaxed">
              {message}
            </p>
          </div>

          <div className="flex flex-col w-full gap-4 pt-4">
            <Link 
              href={`/${lang}/login`}
              className="w-full py-5 bg-primary text-on-primary rounded-full font-headline font-bold text-xl shadow-lg active:scale-95 transition-all text-center"
            >
              {loginText}
            </Link>
            <button 
              onClick={onClose}
              className="w-full py-5 bg-surface-container-highest text-on-surface rounded-full font-headline font-bold text-lg hover:bg-surface-variant transition-all"
            >
              {laterText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
