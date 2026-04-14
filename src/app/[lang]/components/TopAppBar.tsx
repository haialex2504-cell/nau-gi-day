'use client';

import React from 'react';
import Link from 'next/link';
import LanguageSwitcher from './LanguageSwitcher';
import { useLang } from './LangContext';
import BackButton from './BackButton';

interface TopAppBarProps {
  title?: string;
  subtitle?: string;
}

export default function TopAppBar({ title, subtitle }: TopAppBarProps) {
  const { lang, dict: t } = useLang();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10">
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          {title && <BackButton />}
          <Link href={`/${lang}`}>
            <div>
              <h1 className="font-headline font-bold text-xl tracking-tight text-primary uppercase italic leading-tight">
                {title || t.common.appName}
              </h1>
              {subtitle && (
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider">
                  {subtitle}
                </p>
              )}
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {!title && <LanguageSwitcher lang={lang} />}
        </div>
      </div>
    </header>
  );
}
