import React from 'react';
import Link from 'next/link';
import { getPersonalRecipes } from '@/app/actions/recipe';
import BackButton from '@/app/components/BackButton';
import BottomNavBar from '@/app/components/BottomNavBar';

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

      <div className="mt-24 px-6 space-y-12">
        {/* Hero Section / Statistics */}
        <section className="animate-fade-in">
          <div className="relative overflow-hidden bg-surface-container rounded-[2rem] p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm">
            <div className="flex-1 space-y-4">
              <h2 className="font-headline text-4xl font-extrabold tracking-tight leading-tight">
                Chào bếp trưởng,<br/>Hôm nay bạn nấu gì?
              </h2>
              <p className="text-on-surface-variant max-w-xs font-medium">
                Bạn đã sáng tạo {recipes.length} công thức tuyệt vời. Hãy tiếp tục chia sẻ đam mê ẩm thực của mình!
              </p>
              <div className="flex gap-4 pt-2">
                <div className="bg-surface-container-lowest px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
                  <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
                  <span className="text-sm font-black uppercase tracking-wider">{recipes.length} Món</span>
                </div>
                <div className="bg-surface-container-lowest px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
                  <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                  <span className="text-sm font-black uppercase tracking-wider">{totalLikes} Lưu</span>
                </div>
              </div>
            </div>
            <div className="relative w-48 h-48 md:w-64 md:h-64 shrink-0">
              <img 
                alt="Cooking scene" 
                className="w-full h-full object-cover rounded-full shadow-lg border-4 border-white" 
                src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=400&auto=format&fit=crop"
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
            <button className="bg-primary text-on-primary px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap shadow-md">Tất cả</button>
            <button className="bg-surface-container-highest text-on-surface-variant px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap hover:bg-surface-container-high transition-colors">Yêu thích</button>
            <button className="bg-surface-container-highest text-on-surface-variant px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap hover:bg-surface-container-high transition-colors">Mới nhất</button>
          </div>
        </div>

        {/* Recipe Bento Grid */}
        <section className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {recipes.length === 0 ? (
            <div className="text-center py-20 bg-surface-container-lowest rounded-[3rem] border-2 border-dashed border-outline-variant/20">
               <span className="material-symbols-outlined text-6xl text-outline/30 mb-4 italic">menu_book</span>
               <h3 className="text-xl font-headline font-bold mb-2">Chưa có công thức nào</h3>
               <p className="text-on-surface-variant mb-6">Hãy bắt đầu hành trình đầu bếp của bạn bằng cách thêm món mới!</p>
               <Link href="/add-recipe" className="px-8 py-3 bg-primary text-on-primary rounded-full font-bold shadow-lg">
                  Tạo ngay món đầu tiên
               </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recipes.map((recipe, index) => (
                <div key={recipe.id} className="group relative bg-surface-container-lowest rounded-[2rem] overflow-hidden shadow-sm border border-outline-variant/10 transition-all hover:shadow-xl hover:-translate-y-2">
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <img 
                      alt={recipe.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      src={recipe.image_url || 'https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?q=80&w=400&auto=format&fit=crop'} 
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-full shadow-md">
                      <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                    </div>
                    <div className="absolute bottom-4 left-4 flex gap-2">
                      <span className="bg-secondary-container/90 backdrop-blur-md text-on-secondary-container text-[10px] uppercase font-black tracking-widest px-4 py-1.5 rounded-full shadow-sm">
                        {recipe.difficulty || 'Dễ'}
                      </span>
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
      </div>

      {/* Floating Action Button */}
      <Link href="/add-recipe" className="fixed bottom-28 right-8 w-16 h-16 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-full shadow-[0_12px_32px_rgba(171,53,0,0.4)] flex items-center justify-center active:scale-95 hover:scale-110 transition-all z-50">
        <span className="material-symbols-outlined text-3xl font-bold">add</span>
      </Link>

      <BottomNavBar />
    </main>
  );
}
