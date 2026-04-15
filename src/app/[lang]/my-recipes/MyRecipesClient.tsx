'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { RecipeSearchResult, getRecipesByIds } from '@/app/[lang]/actions/recipe';
import { useFavorites } from '@/hooks/useFavorites';
import FavoriteButton from '@/app/[lang]/components/FavoriteButton';
import { useLang } from '@/app/[lang]/components/LangContext';
import Image from 'next/image';
import LoginPrompt from '@/app/[lang]/components/LoginPrompt';
import { getDifficultyLabel } from '@/lib/difficulty';

interface MyRecipesClientProps {
  initialRecipes: RecipeSearchResult[];
  isLoggedIn: boolean;
}

export default function MyRecipesClient({ initialRecipes, isLoggedIn }: MyRecipesClientProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'personal'>(isLoggedIn ? 'all' : 'all');
  const { favorites, isLoaded } = useFavorites();
  const [favoriteRecipes, setFavoriteRecipes] = useState<RecipeSearchResult[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(false);
  const { lang, dict: t } = useLang();
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load recipes for favorites tab
  useEffect(() => {
    async function loadFavorites() {
      if (favorites.length > 0) {
        setLoadingExtras(true);
        // Find ids that we don't already have in initialRecipes
        const missingIds = favorites.filter(id => !initialRecipes.find(r => r.id === id));
        if (missingIds.length > 0) {
          try {
            const freshFavs = await getRecipesByIds(missingIds);
            setFavoriteRecipes(freshFavs);
          } catch (err) {
            console.error("Failed to load favorite recipes", err);
          }
        }
        setLoadingExtras(false);
      }
    }
    if (isLoaded) {
      loadFavorites();
    }
  }, [favorites, isLoaded, initialRecipes]);

  const allKnownRecipes = [...initialRecipes, ...favoriteRecipes];
  const uniqueRecipesMap = new Map();
  allKnownRecipes.forEach(r => uniqueRecipesMap.set(r.id, r));
  const uniqueRecipes = Array.from(uniqueRecipesMap.values()) as RecipeSearchResult[];

  let displayedRecipes: RecipeSearchResult[] = [];

  // Filter by search query
  const filteredBySearch = uniqueRecipes.filter(r => 
    searchQuery.trim() === '' || 
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (activeTab === 'all') {
    // Show both personal and favorites
    displayedRecipes = filteredBySearch.filter(r => (isLoggedIn && r.is_personal) || favorites.includes(r.id));
  } else if (activeTab === 'favorites') {
    displayedRecipes = filteredBySearch.filter(r => favorites.includes(r.id));
  } else if (activeTab === 'personal') {
    displayedRecipes = initialRecipes.filter(r => 
      searchQuery.trim() === '' || 
      r.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }


  return (
    <div className="mt-20 px-4 pb-32 space-y-8 max-w-5xl mx-auto">
      {/* Compact Header Section */}
      <section className="animate-fade-in">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1 py-2">
              <h2 className="font-headline text-2xl font-black tracking-tight uppercase italic text-primary">
                {t.myRecipes.heroGreeting}
              </h2>
              <p className="text-on-surface-variant/70 text-xs font-bold uppercase tracking-widest">
                {t.myRecipes.heroQuestion}
              </p>
            </div>
            <div className="flex gap-2">
               {isLoggedIn && (
                <div className="bg-secondary/10 text-secondary px-3 py-1.5 rounded-2xl flex items-center gap-2 border border-secondary/20 shadow-sm">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
                  <span className="text-[10px] font-black uppercase tracking-wider">{initialRecipes.length} {t.myRecipes.createdCount}</span>
                </div>
              )}
              <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-2xl flex items-center gap-2 border border-primary/20 shadow-sm">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                <span className="text-[10px] font-black uppercase tracking-wider">{favorites.length} {t.myRecipes.savedCount}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">search</span>
              <input 
                className="w-full bg-surface-container-highest border-none rounded-[1.5rem] py-4 pl-14 pr-8 focus:ring-4 focus:ring-primary/20 text-on-surface placeholder:text-outline/50 font-medium shadow-sm transition-all text-sm" 
                placeholder={t.myRecipes.searchPlaceholder} 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-1 px-1 items-center">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-md transition-all active:scale-95 whitespace-nowrap ${activeTab === 'all' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-highest border border-outline-variant/10'}`}
              >
                {t.myRecipes.tabAll}
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-md transition-all active:scale-95 whitespace-nowrap ${activeTab === 'favorites' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-highest border border-outline-variant/10'}`}
              >
                {t.myRecipes.tabFavorites}
              </button>
              {isLoggedIn && (
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-md transition-all active:scale-95 whitespace-nowrap ${activeTab === 'personal' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-highest border border-outline-variant/10'}`}
                >
                  {t.myRecipes.tabPersonal}
                </button>
              )}
            </div>
          </div>

          {/* Sync Warning for Guests */}
          {!isLoggedIn && activeTab === 'favorites' && favorites.length > 0 && (
            <Link 
              href={`/${lang}/login`}
              className="flex items-center gap-3 p-4 bg-tertiary-fixed text-on-tertiary-fixed rounded-3xl border border-tertiary/20 animate-in slide-in-from-top-4 duration-500 shadow-md hover:scale-[1.01] transition-transform active:scale-100"
            >
              <span className="material-symbols-outlined text-tertiary animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
              <p className="text-[10px] font-bold uppercase tracking-wide flex-1">
                {t.myRecipes.localDataWarning}
              </p>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          )}
        </div>
      </section>

      {/* Recipe Grid */}
      <section className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
        {loadingExtras ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">{t.common.loading}</p>
          </div>
        ) : displayedRecipes.length === 0 ? (
          <div className="text-center py-20 bg-surface-container-lowest rounded-[3rem] border-2 border-dashed border-outline-variant/20 flex flex-col items-center group">
             <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-500">
                <span className="material-symbols-outlined text-5xl text-outline/30 italic">menu_book</span>
             </div>
             <h3 className="text-xl font-headline font-black mb-2 uppercase italic text-on-surface/80">{t.myRecipes.noRecipes}</h3>
             <p className="text-on-surface-variant/70 mb-8 font-medium max-w-xs text-sm px-6">{t.myRecipes.noRecipesDesc}</p>
             
             {(!isLoggedIn || activeTab === 'personal') ? (
                <button 
                  onClick={() => !isLoggedIn ? setIsLoginPromptOpen(true) : window.location.href = `/${lang}/add-recipe`}
                  className="px-8 py-3.5 bg-primary text-on-primary rounded-full font-headline font-black uppercase italic shadow-lg hover:scale-105 active:scale-95 transition-all text-[11px] tracking-widest"
                >
                  {t.myRecipes.createNow}
                </button>
             ) : (
                <Link href={`/${lang}`} className="px-8 py-3.5 bg-secondary text-on-secondary rounded-full font-headline font-black uppercase italic shadow-lg hover:scale-105 active:scale-95 transition-all text-[11px] tracking-widest">
                  {t.myRecipes.exploreNow}
                </Link>
             )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {displayedRecipes.map((recipe, index) => (
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe} 
                lang={lang} 
                t={t} 
                index={index}
                isLoggedIn={isLoggedIn}
              />
            ))}
          </div>
        )}
      </section>

      {/* Guest Login Prompt */}
      <LoginPrompt 
        isOpen={isLoginPromptOpen}
        onClose={() => setIsLoginPromptOpen(false)}
        lang={lang}
        title={t.auth.loginToCreateTitle}
        message={t.auth.loginToCreateMessage}
        loginText={t.auth.login}
        laterText={t.common.later}
      />
    </div>
  );
}

function RecipeCard({ recipe, lang, t, index, isLoggedIn }: { recipe: any; lang: string; t: any; index: number; isLoggedIn: boolean }) {
  const [isPressing, setIsPressing] = useState(false);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const [showOptions, setShowOptions] = useState(false);

  const handleStart = () => {
    if (!isLoggedIn || !recipe.is_personal) return;
    pressTimer.current = setTimeout(() => {
      setIsPressing(true);
      setShowOptions(true);
      if ('vibrate' in navigator) navigator.vibrate(50);
    }, 800);
  };

  const handleEnd = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
    setIsPressing(false);
  };

  useEffect(() => {
    return () => {
      if (pressTimer.current) clearTimeout(pressTimer.current);
    };
  }, []);

  return (
    <div 
      className={`group relative bg-surface-container-lowest rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-sm border border-outline-variant/10 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-6 fill-mode-both ${isPressing ? 'scale-[0.98]' : ''}`}
      style={{ animationDelay: `${index * 100}ms` }}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
    >
      <Link href={`/${lang}/recipe/${recipe.id}`} className="block h-full cursor-pointer">
        <div className="aspect-square md:aspect-[4/3] overflow-hidden relative">
          <Image
            alt={recipe.name}
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
            src={recipe.image_url || '/default-recipe.png'}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute bottom-2 left-2 md:bottom-5 md:left-5 flex flex-wrap gap-1 md:gap-2">
            <span className="bg-secondary/90 backdrop-blur-md text-on-secondary text-[8px] md:text-[10px] uppercase font-black tracking-widest px-2 md:px-4 py-1 md:py-2 rounded-full shadow-lg">
              {getDifficultyLabel(recipe.difficulty, t.addRecipe)}
            </span>
            {recipe.is_personal && (
              <span className="bg-primary/95 backdrop-blur-md text-on-primary text-[8px] md:text-[10px] uppercase font-black tracking-widest px-2 md:px-4 py-1 md:py-2 rounded-full shadow-lg border border-white/20">
                {t.myRecipes.myLabel}
              </span>
            )}
          </div>
        </div>
        <div className="p-3 md:p-8">
          <h3 className="font-headline font-black text-sm md:text-2xl mb-2 md:mb-4 group-hover:text-primary transition-colors uppercase italic tracking-tight leading-tight line-clamp-2 min-h-[2.5rem] md:min-h-0">
            {recipe.name}
          </h3>
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 text-on-surface-variant text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-80">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm md:text-lg text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
              <span>{recipe.cooking_time} {t.common.minutes}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm md:text-lg text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              <span>{recipe.calories || 0} kcal</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Floating Buttons and Overlays must be outside the Link or stop propagation */}
      <div 
        className="absolute top-2 right-2 md:top-5 md:right-5 z-20"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div className="bg-white/95 backdrop-blur-xl p-1.5 md:p-2.5 rounded-full shadow-lg scale-90 md:scale-110 hover:scale-125 active:scale-100 transition-all">
          <FavoriteButton recipeId={recipe.id} />
        </div>
      </div>

      {/* Options Overlay for Personal Recipes */}
      {showOptions && (
        <div className="absolute inset-0 bg-primary/10 backdrop-blur-md flex flex-col items-center justify-center gap-6 animate-in fade-in duration-300 z-30" onClick={() => setShowOptions(false)}>
           <div className="flex gap-4">
              <Link
                href={`/${lang}/add-recipe?editId=${recipe.id}`}
                className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary shadow-xl hover:scale-110 active:scale-95 transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                 <span className="material-symbols-outlined text-3xl">edit</span>
              </Link>
              <button 
                className="w-16 h-16 bg-error-container text-error rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  // For now just alert, could implement real delete
                  alert("Tính năng xóa sẽ được cập nhật sớm!");
                }}
              >
                 <span className="material-symbols-outlined text-3xl">delete</span>
              </button>
           </div>
           <button className="px-8 py-3 bg-white text-on-surface rounded-full font-headline font-black uppercase italic shadow-lg text-xs tracking-widest">
             {t.common.close}
           </button>
        </div>
      )}
    </div>
  );
}
