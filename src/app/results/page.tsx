'use client';

import { ChevronLeft, Info, Clock, Flame, Heart } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { searchRecipes, RecipeSearchResult } from "@/app/actions/recipe";
import BackButton from "@/app/components/BackButton";

function ResultsContent() {
  const searchParams = useSearchParams();
  const ingredientsStr = searchParams.get('ingredients') || '';
  const [recipes, setRecipes] = useState<RecipeSearchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      if (!ingredientsStr) {
        setLoading(false);
        return;
      }
      
      const ingredients = ingredientsStr.split(',').map(i => i.trim());
      const results = await searchRecipes(ingredients);
      setRecipes(results);
      setLoading(false);
    }

    fetchResults();
  }, [ingredientsStr]);

  return (
    <main className="min-h-screen bg-background text-on-background pb-12">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-md z-10 border-b border-outline-variant/10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-xl font-headline font-black text-primary italic">Gợi ý cho bạn</h1>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              {ingredientsStr ? ingredientsStr.split(',').length : 0} nguyên liệu đã chọn
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 pt-24 space-y-8">
        {/* Info Box */}
        <div className="bg-secondary-container/30 p-4 rounded-2xl flex gap-3 border border-secondary-container/50 animate-fade-in">
          <span className="material-symbols-outlined text-secondary">info</span>
          <p className="text-sm font-medium text-on-secondary-container">
            {recipes.length > 0 
              ? `Chúng tôi tìm thấy ${recipes.length} món ăn phù hợp nhất.`
              : loading ? "Đang tìm kiếm món ngon cho bạn..." : "Rất tiếc, không tìm thấy món nào hoàn toàn khớp."}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
             <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
             <p className="font-bold text-primary">Đang chuẩn bị thực đơn...</p>
          </div>
        )}

        {/* Recipe List */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recipes.map((recipe, index) => (
              <Link 
                href={`/recipe/${recipe.id}`}
                key={recipe.id}
                className="bg-surface-container-low rounded-[2rem] overflow-hidden shadow-sm border border-outline-variant/10 group active:scale-[0.98] transition-all animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <img 
                    src={recipe.image_url || 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=400&auto=format&fit=crop'} 
                    alt={recipe.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-primary/90 text-on-primary px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md">
                    Khớp {recipe.match_count} vị
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-headline font-extrabold mb-4 line-clamp-1">{recipe.name}</h3>
                  <div className="flex items-center gap-4 text-on-surface-variant font-bold text-sm">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[18px] text-primary">timer</span>
                      {recipe.cooking_time}p
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
             <h3 className="text-xl font-bold mb-2">Không có kết quả</h3>
             <p className="text-on-surface-variant">Hãy thử thêm hoặc thay đổi nguyên liệu nhé!</p>
             <Link href="/" className="mt-8 inline-block px-8 py-3 bg-primary text-on-primary rounded-full font-bold">
                Quay lại
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
