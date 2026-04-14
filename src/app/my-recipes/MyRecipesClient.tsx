'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RecipeSearchResult, getRecipesByIds } from '@/app/actions/recipe';
import { useFavorites } from '@/hooks/useFavorites';
import FavoriteButton from '@/app/components/FavoriteButton';
import Image from 'next/image';

interface MyRecipesClientProps {
  initialRecipes: RecipeSearchResult[];
}

export default function MyRecipesClient({ initialRecipes }: MyRecipesClientProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'personal'>('all');
  const { favorites, isLoaded } = useFavorites();
  const [favoriteRecipes, setFavoriteRecipes] = useState<RecipeSearchResult[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(false);

  useEffect(() => {
    async function loadFavorites() {
      console.log('[MyRecipesClient] loadFavorites() called. Total favorites in localStorage:', favorites.length);
      if (favorites.length > 0) {
        setLoadingExtras(true);
        // Optimize: Only fetch missing favorites (ones not already in personal recipes)
        const missingIds = favorites.filter(id => !initialRecipes.find(r => r.id === id));
        console.log('[MyRecipesClient] Missing recipe IDs (not in personal):', missingIds);
        if (missingIds.length > 0) {
          const freshFavs = await getRecipesByIds(missingIds);
          console.log(`[MyRecipesClient] Fetched ${freshFavs.length} extra favorite recipe(s):`, freshFavs.map(r => r.name));
          setFavoriteRecipes(freshFavs);
        }
        setLoadingExtras(false);
      }
    }
    if (isLoaded) {
      console.log('[MyRecipesClient] useFavorites isLoaded=true, running loadFavorites.');
      loadFavorites();
    }
  }, [favorites, isLoaded, initialRecipes]);

  // Combine personal recipes and fetched favorites for the 'all' and 'favorites' tabs
  const allKnownRecipes = [...initialRecipes, ...favoriteRecipes];
  
  // Deduplicate just in case
  const uniqueRecipesMap = new Map();
  allKnownRecipes.forEach(r => uniqueRecipesMap.set(r.id, r));
  const uniqueRecipes = Array.from(uniqueRecipesMap.values()) as RecipeSearchResult[];

  let displayedRecipes: RecipeSearchResult[] = [];

  if (activeTab === 'all') {
    // Show personal + favorites
    displayedRecipes = uniqueRecipes.filter(r => r.is_personal || favorites.includes(r.id));
  } else if (activeTab === 'favorites') {
    displayedRecipes = uniqueRecipes.filter(r => favorites.includes(r.id));
  } else if (activeTab === 'personal') {
    displayedRecipes = initialRecipes;
  }

  console.log(`[MyRecipesClient] Render — tab: "${activeTab}", displaying ${displayedRecipes.length} recipe(s).`);

  const totalLikes = favorites.length;

  return (
    <div className="mt-24 px-6 space-y-12">
      {/* Hero Section / Statistics */}
      <section className="animate-fade-in">
        <div className="relative overflow-hidden bg-surface-container rounded-[2rem] p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm">
          <div className="flex-1 space-y-4">
            <h2 className="font-headline text-4xl font-extrabold tracking-tight leading-tight">
              Chào bếp trưởng,<br/>Hôm nay bạn nấu gì?
            </h2>
            <p className="text-on-surface-variant max-w-xs font-medium">
              Bạn đã sáng tạo {initialRecipes.length} công thức tuyệt vời và lưu giữ {favorites.length} món ăn yêu thích.
            </p>
            <div className="flex gap-4 pt-2">
              <div className="bg-surface-container-lowest px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
                <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
                <span className="text-sm font-black uppercase tracking-wider">{initialRecipes.length} Sáng tạo</span>
              </div>
              <div className="bg-surface-container-lowest px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
                <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                <span className="text-sm font-black uppercase tracking-wider">{totalLikes} Đã lưu</span>
              </div>
            </div>
          </div>
          <div className="relative w-48 h-48 md:w-64 md:h-64 shrink-0">
            <Image 
              alt="Cooking scene" 
              className="object-cover rounded-full shadow-lg border-4 border-white" 
              src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=400&auto=format&fit=crop"
              fill
              sizes="(max-width: 768px) 192px, 256px"
            />
            <div className="absolute -bottom-2 -right-2 bg-secondary-container p-4 rounded-full shadow-xl">
              <span className="material-symbols-outlined text-on-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filter Chips */}
      <div className="flex flex-col md:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input className="w-full bg-surface-container-low border-none rounded-full py-4 pl-12 pr-6 focus:ring-2 focus:ring-primary text-on-surface placeholder:text-outline/60 font-medium" placeholder="Tìm công thức của bạn..." type="text"/>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap shadow-md transition-colors ${activeTab === 'all' ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            Tất cả
          </button>
          <button 
            onClick={() => setActiveTab('favorites')}
            className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap shadow-md transition-colors ${activeTab === 'favorites' ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            Yêu thích
          </button>
          <button 
            onClick={() => setActiveTab('personal')}
            className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap shadow-md transition-colors ${activeTab === 'personal' ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            Của tôi
          </button>
        </div>
      </div>

      {/* Recipe Bento Grid */}
      <section className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
        {loadingExtras ? (
          <div className="flex justify-center py-10">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : displayedRecipes.length === 0 ? (
          <div className="text-center py-20 bg-surface-container-lowest rounded-[3rem] border-2 border-dashed border-outline-variant/20">
             <span className="material-symbols-outlined text-6xl text-outline/30 mb-4 italic">menu_book</span>
             <h3 className="text-xl font-headline font-bold mb-2">Chưa có công thức nào</h3>
             <p className="text-on-surface-variant mb-6">Bạn chưa có công thức nào trong mục này.</p>
             <Link href={activeTab === 'personal' ? "/add-recipe" : "/"} className="px-8 py-3 bg-primary text-on-primary rounded-full font-bold shadow-lg">
                {activeTab === 'personal' ? 'Tạo ngay' : 'Khám phá ngay'}
             </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedRecipes.map((recipe, index) => (
              <div key={recipe.id} className="group relative bg-surface-container-lowest rounded-[2rem] overflow-hidden shadow-sm border border-outline-variant/10 transition-all hover:shadow-xl hover:-translate-y-2">
                <div className="aspect-[4/3] overflow-hidden relative">
                  <Image 
                    alt={recipe.name} 
                    className="object-cover transition-transform duration-700 group-hover:scale-110" 
                    src={recipe.image_url || 'https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?q=80&w=400&auto=format&fit=crop'} 
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-full shadow-md z-10">
                    <FavoriteButton recipeId={recipe.id} />
                  </div>
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    <span className="bg-secondary-container/90 backdrop-blur-md text-on-secondary-container text-[10px] uppercase font-black tracking-widest px-4 py-1.5 rounded-full shadow-sm">
                      {recipe.difficulty || 'Dễ'}
                    </span>
                    {recipe.is_personal && (
                      <span className="bg-primary/90 backdrop-blur-md text-on-primary text-[10px] uppercase font-black tracking-widest px-4 py-1.5 rounded-full shadow-sm">
                        Của Tôi
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  <Link href={`/recipe/${recipe.id}`}>
                    <h3 className="font-headline font-black text-xl mb-3 group-hover:text-primary transition-colors cursor-pointer uppercase italic">
                      {recipe.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-6 text-on-surface-variant text-xs font-black uppercase tracking-tight">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base text-primary">schedule</span>
                      <span>{recipe.cooking_time} phút</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base text-primary">local_fire_department</span>
                      <span>{recipe.calories || 0} kcal</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Floating Action Button */}
      <Link href="/add-recipe" className="fixed bottom-28 right-8 w-16 h-16 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-full shadow-[0_12px_32px_rgba(171,53,0,0.4)] flex items-center justify-center active:scale-95 hover:scale-110 transition-all z-50">
        <span className="material-symbols-outlined text-3xl font-bold">add</span>
      </Link>
    </div>
  );
}
