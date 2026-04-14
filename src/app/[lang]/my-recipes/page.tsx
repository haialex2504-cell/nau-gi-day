import React from 'react';
import { getPersonalRecipes } from '@/app/[lang]/actions/recipe';
import BottomNavBar from '@/app/[lang]/components/BottomNavBar';
import TopAppBar from '@/app/[lang]/components/TopAppBar';
import { getDictionary, hasLocale, type Locale } from '@/app/[lang]/dictionaries';
import { notFound } from 'next/navigation';
import MyRecipesClient from './MyRecipesClient';
import { createClient } from '@/utils/supabase/server';

export default async function MyRecipes({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [recipes, t] = await Promise.all([
    getPersonalRecipes(),
    getDictionary(lang as Locale),
  ]);

  return (
    <main className="bg-surface text-on-surface pb-32 max-w-5xl mx-auto min-h-screen selection:bg-secondary-container">
      {/* TopAppBar */}
      <TopAppBar title={t.myRecipes.pageTitle} />

      <MyRecipesClient initialRecipes={recipes} isLoggedIn={!!user} />

      <BottomNavBar />
    </main>
  );
}
