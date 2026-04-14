'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

interface BackButtonProps {
  fallbackHref?: string;
  forceFallback?: boolean;
  className?: string;
  iconClassName?: string;
}

export default function BackButton({
  fallbackHref = '/',
  forceFallback = false,
  className = "p-2 hover:bg-surface-variant/50 rounded-full transition-colors",
  iconClassName = "text-primary"
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (forceFallback) {
      router.push(fallbackHref);
      return;
    }

    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button onClick={handleBack} className={className}>
      <span className={`material-symbols-outlined ${iconClassName}`}>arrow_back</span>
    </button>
  );
}
