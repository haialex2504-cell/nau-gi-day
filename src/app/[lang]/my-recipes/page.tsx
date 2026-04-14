import React from 'react';
import { getPersonalRecipes } from '@/app/[lang]/actions/recipe';
import BottomNavBar from '@/app/[lang]/components/BottomNavBar';
import { getDictionary, hasLocale, type Locale } from '@/app/[lang]/dictionaries';
import { notFound } from 'next/navigation';
import MyRecipesClient from './MyRecipesClient';

export default async function MyRecipes({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const [recipes, t] = await Promise.all([
    getPersonalRecipes(),
    getDictionary(lang as Locale),
  ]);

  return (
    <main className="bg-surface text-on-surface pb-32 max-w-5xl mx-auto min-h-screen selection:bg-secondary-container">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 flex items-center justify-center hover:bg-surface-variant/50 transition-colors active:scale-95 duration-200 rounded-full">
              <span className="material-symbols-outlined text-primary">menu</span>
            </button>
            <h1 className="font-headline font-bold text-xl tracking-tight text-primary uppercase italic">{t.myRecipes.pageTitle}</h1>
          </div>
          <button className="w-10 h-10 flex items-center justify-center hover:bg-surface-variant/50 transition-colors active:scale-95 duration-200 rounded-full">
            <span className="material-symbols-outlined text-primary">account_circle</span>
          </button>
        </div>
      </header>

      <MyRecipesClient initialRecipes={recipes} />

      <BottomNavBar />
    </main>
  );
}
