'use client';

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { searchRecipes, getInspiredRecipes, RecipeSearchResult } from "@/app/[lang]/actions/recipe";
import FavoriteButton from "@/app/[lang]/components/FavoriteButton";
import { useLang } from "@/app/[lang]/components/LangContext";
import TopAppBar from "@/app/[lang]/components/TopAppBar";
import { getDifficultyLabel } from "@/lib/difficulty";

function ResultsContent() {
  const searchParams = useSearchParams();
  const ingredientsStr = searchParams.get('ingredients') || '';
  const inspirationQ = searchParams.get('q') || '';
  const [recipes, setRecipes] = useState<RecipeSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const { lang, dict: t } = useLang();

  // Dynamic Title setup based on Q
  let pageTitle = t.results.suggestForYou;
  let subTitle = ingredientsStr
    ? `${ingredientsStr.split(',').length} ${t.results.ingredientsSelected}`
    : t.results.forYou;

  if (inspirationQ) {
    switch (inspirationQ) {
      case 'quick': pageTitle = t.results.quickTitle; subTitle = t.results.quickSubtitle; break;
      case 'party': pageTitle = t.results.partyTitle; subTitle = t.results.partySubtitle; break;
      case 'healthy': pageTitle = t.results.healthyTitle; subTitle = t.results.healthySubtitle; break;
      case 'breakfast': pageTitle = t.results.breakfastTitle; subTitle = t.results.breakfastSubtitle; break;
      case 'snack': pageTitle = t.results.snackTitle; subTitle = t.results.snackSubtitle; break;
    }
  }

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);

      if (ingredientsStr) {
        const ingredients = ingredientsStr.split(',').map(i => i.trim());
        try {
          const results = await searchRecipes(ingredients);
          setRecipes(results);
        } catch (err) {
          console.error('[Results] searchRecipes threw an error:', err);
        } finally {
          setLoading(false);
        }
      } else if (inspirationQ) {
        try {
          const results = await getInspiredRecipes(inspirationQ);
          setRecipes(results);
        } catch (err) {
          console.error('[Results] getInspiredRecipes threw an error:', err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }

    fetchResults();
  }, [ingredientsStr, inspirationQ]);

  return (
    <main className="min-h-screen bg-background text-on-background pb-12">
      {/* Header */}
      <TopAppBar title={pageTitle} subtitle={subTitle} />

      <div className="max-w-2xl mx-auto px-6 pt-24 space-y-8">
        {/* Info Box */}
        <div className="bg-secondary-container/30 p-4 rounded-2xl flex gap-3 border border-secondary-container/50 animate-fade-in">
          <span className="material-symbols-outlined text-secondary">info</span>
          <p className="text-sm font-medium text-on-secondary-container">
            {recipes.length > 0
              ? t.results.foundRecipes.replace('{count}', String(recipes.length))
              : loading ? t.results.searching : t.results.notFound}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
             <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
             <p className="font-bold text-primary">{t.results.preparingMenu}</p>
          </div>
        )}

        {/* Recipe List */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recipes.map((recipe, index) => (
              <Link
                href={`/${lang}/recipe/${recipe.id}`}
                key={recipe.id}
                className="bg-surface-container-low rounded-[2rem] overflow-hidden shadow-sm border border-outline-variant/10 group active:scale-[0.98] transition-all animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={recipe.image_url || '/default-recipe.png'}
                    alt={recipe.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-primary/90 text-on-primary px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md">
                    {ingredientsStr
                      ? t.results.matchCount.replace('{count}', String(recipe.match_count || 0))
                      : t.results.idealSuggestion}
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-1 rounded-full shadow-md z-10" onClick={(e) => e.preventDefault()}>
                    <FavoriteButton recipeId={recipe.id} />
                  </div>
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    <span className="bg-secondary/90 backdrop-blur-md text-on-secondary text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full shadow-lg">
                      {getDifficultyLabel(recipe.difficulty, t.addRecipe)}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-headline font-extrabold mb-4 line-clamp-1">{recipe.name}</h3>
                  <div className="flex items-center gap-4 text-on-surface-variant font-bold text-sm">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[18px] text-primary">timer</span>
                      {recipe.cooking_time}{lang === 'vi' ? 'p' : 'm'}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[18px] text-primary">local_fire_department</span>
                      {recipe.calories} kcal
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && recipes.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
             <span className="material-symbols-outlined text-6xl text-outline/20 mb-4">restaurant</span>
             <h3 className="text-xl font-bold mb-2">{t.results.noResults}</h3>
             <p className="text-on-surface-variant">{t.results.tryAgain}</p>
             <Link href={`/${lang}`} className="mt-8 inline-block px-8 py-3 bg-primary text-on-primary rounded-full font-bold">
                {t.results.goBack}
             </Link>
          </div>
        )}
      </div>
    </main>
  );
}

export default function Results() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResultsContent />
    </Suspense>
  );
}
