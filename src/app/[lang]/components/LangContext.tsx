'use client';

import React, { createContext, useContext } from 'react';

type Dictionary = Record<string, any>;

interface LangContextValue {
  lang: string;
  dict: Dictionary;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({
  children,
  lang,
  dict
}: {
  children: React.ReactNode;
  lang: string;
  dict: Dictionary;
}) {
  return (
    <LangContext.Provider value={{ lang, dict }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const context = useContext(LangContext);
  if (!context) {
    throw new Error('useLang must be used within a LangProvider');
  }
  return context;
}
