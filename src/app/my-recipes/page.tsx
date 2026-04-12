import React from 'react';
import Link from 'next/link';
import { getPersonalRecipes } from '@/app/actions/recipe';
import BackButton from '@/app/components/BackButton';
import BottomNavBar from '@/app/components/BottomNavBar';
import MyRecipesClient from './MyRecipesClient';

export default async function MyRecipes() {
  const recipes = await getPersonalRecipes();
  const totalLikes = 450; // Mocked for design parity

  return (
    <main className="bg-surface text-on-surface pb-32 max-w-5xl mx-auto min-h-screen selection:bg-secondary-container">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 flex items-center justify-center hover:bg-surface-variant/50 transition-colors active:scale-95 duration-200 rounded-full">
              <span className="material-symbols-outlined text-primary">menu</span>
            </button>
            <h1 className="font-headline font-bold text-xl tracking-tight text-primary uppercase italic">Bếp Của Tôi</h1>
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
