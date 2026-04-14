'use client';

import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, isOpen, onClose, duration = 3000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isOpen) {
      // Trigger mount animation next tick
      timeout = setTimeout(() => setIsVisible(true), 10);
      timeout = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for transition to finish
      }, duration);
    } else {
      setIsVisible(false);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isOpen, duration, onClose]);

  if (!isOpen && !isVisible) return null;

  return (
    <div className="fixed bottom-24 left-0 right-0 z-[100] flex justify-center pointer-events-none px-4">
      <div 
        className={`bg-inverse-surface text-inverse-on-surface px-6 py-3 rounded-full text-sm font-medium shadow-lg transition-all duration-300 transform
          ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}
        `}
      >
        {message}
      </div>
    </div>
  );
}
