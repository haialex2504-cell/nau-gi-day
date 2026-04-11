import { getRecipeDetail } from "@/app/actions/recipe";
import Link from "next/link";
import { notFound } from "next/navigation";
import BackButton from "@/app/components/BackButton";

export default async function RecipeDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const recipe = await getRecipeDetail(id);

  if (!recipe) {
    return notFound();
  }

  return (
    <main className="min-h-screen bg-background text-on-background pb-20 selection:bg-secondary-container">
      {/* Top Banner Image */}
      <div className="relative h-[45vh] w-full max-w-2xl mx-auto shadow-xl">
        <img 
          src={recipe.image_url || 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=800&auto=format&fit=crop'} 
          alt={recipe.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center bg-gradient-to-b from-black/40 to-transparent">
          <BackButton 
            className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg" 
            fallbackHref="/results" 
          />
          <div className="flex gap-3">
            <button className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg">
              <span className="material-symbols-outlined text-on-surface">share</span>
            </button>
            <button className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative -mt-12 bg-background rounded-t-[3rem] px-8 pt-10 shadow-[-5px_-5px_30px_rgba(0,0,0,0.05)] max-w-2xl mx-auto min-h-screen">
        <div className="flex flex-col gap-2 mb-8 animate-fade-in">
          <h1 className="text-3xl font-headline font-black tracking-tight leading-tight text-primary uppercase italic">
            {recipe.name}
          </h1>
          <div className="flex flex-wrap gap-2 mt-2">
             {recipe.recipe_tags?.map((t: any, i: number) => (
                <span key={i} className="text-[10px] font-bold uppercase tracking-widest bg-secondary-container/50 text-on-secondary-container px-3 py-1 rounded-full">
                  #{t.tag}
                </span>
             ))}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-10 p-5 bg-surface-container-low rounded-3xl border border-outline-variant/10 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-col items-center gap-1">
            <span className="material-symbols-outlined text-primary">timer</span>
            <span className="text-[10px] font-black text-on-surface-variant uppercase">{recipe.cooking_time} phút</span>
          </div>
          <div className="flex flex-col items-center gap-1 border-x border-outline-variant/20">
            <span className="material-symbols-outlined text-primary">groups</span>
            <span className="text-[10px] font-black text-on-surface-variant uppercase">{recipe.servings} người</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="material-symbols-outlined text-primary">local_fire_department</span>
            <span className="text-[10px] font-black text-on-surface-variant uppercase">{recipe.calories} kcal</span>
          </div>
        </div>

        {/* Ingredients */}
        <section className="mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-xl font-headline font-black mb-6 flex items-center gap-3">
            <div className="w-2 h-6 bg-primary rounded-full"></div>
            Nguyên liệu
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {recipe.recipe_ingredients?.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/5 shadow-sm group">
                <div className="w-5 h-5 rounded-full border-2 border-primary/30 flex items-center justify-center group-has-[:checked]:bg-primary transition-all">
                   <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div className="flex-1 flex justify-between items-center">
                  <span className="font-bold text-on-surface">{item.ingredients.name}</span>
                  <span className="text-xs font-semibold text-on-surface-variant bg-surface-container px-2 py-1 rounded-md">{item.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Steps */}
        <section className="pb-20 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-xl font-headline font-black mb-8 flex items-center gap-3">
            <div className="w-2 h-6 bg-secondary rounded-full"></div>
            Cách thực hiện
          </h2>
          <div className="space-y-10">
            {recipe.steps.map((step: string, i: number) => (
              <div key={i} className="relative pl-12 border-l-2 border-dashed border-outline-variant/20 last:border-0 pb-6">
                <div className="absolute -left-[13px] top-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-on-primary text-xs font-black shadow-lg">
                  {i + 1}
                </div>
                <p className="text-on-surface font-medium leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tips Box */}
        {recipe.tips && (
          <section className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="bg-tertiary-fixed p-6 rounded-3xl border border-tertiary/20 flex gap-4">
               <span className="material-symbols-outlined text-tertiary text-2xl">lightbulb</span>
               <div>
                  <h4 className="font-headline font-bold text-on-tertiary-fixed mb-1">Mẹo nhỏ cho bạn</h4>
                  <p className="text-sm text-on-tertiary-fixed-variant leading-relaxed">{recipe.tips}</p>
               </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
