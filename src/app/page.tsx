'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BottomNavBar from '@/app/components/BottomNavBar';

export default function Home() {
  const [inputValue, setInputValue] = useState('');
  const [tags, setTags] = useState<string[]>(['Trứng', 'Thịt lợn']);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const handleFocusIn = (e: Event) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        setIsKeyboardOpen(true);
      }
    };
    
    const handleFocusOut = () => {
      setTimeout(() => {
        if (
          document.activeElement?.tagName !== 'INPUT' && 
          document.activeElement?.tagName !== 'TEXTAREA' &&
          !(document.activeElement as HTMLElement)?.isContentEditable
        ) {
          setIsKeyboardOpen(false);
        }
      }, 50);
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  const handleAddTag = () => {
    if (inputValue.trim()) {
      const newTags = inputValue
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '' && !tags.includes(tag));
      
      if (newTags.length > 0) {
        setTags([...tags, ...newTags]);
      }
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSearch = () => {
    if (tags.length === 0) return;
    const query = tags.join(',');
    router.push(`/results?ingredients=${encodeURIComponent(query)}`);
  };

  return (
    <div className="bg-background text-on-background font-body min-h-screen">
      {/* TopAppBar */}
      <header className="flex justify-between items-center w-full px-6 py-4 fixed top-0 z-40 bg-surface-container-low transition-colors shadow-sm">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-surface-variant/50 transition-colors active:scale-95 duration-200 rounded-full">
            <span className="material-symbols-outlined text-primary">menu</span>
          </button>
          <h1 className="text-2xl font-black text-primary italic font-headline tracking-tight">Nấu Gì Đây?</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-surface-variant/50 transition-colors active:scale-95 duration-200 rounded-full">
            <span className="material-symbols-outlined text-primary">account_circle</span>
          </button>
        </div>
      </header>

      <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto space-y-8">
        {/* Hero Section Header */}
        <section>
          <div className="flex flex-col gap-2">
            <h2 className="font-headline font-extrabold text-4xl tracking-tight leading-tight">
              Trong tủ lạnh bạn <br /> <span className="text-gradient">còn gì hôm nay?</span>
            </h2>
            <p className="text-on-surface-variant font-medium">Nhập nguyên liệu, chúng tôi sẽ gợi ý món ngon cho bạn.</p>
          </div>
        </section>

        {/* Search & Ingredients Input (Top Priority) */}
        <section className="space-y-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-outline">search</span>
            </div>
            <input 
              className="w-full pl-14 pr-6 py-5 bg-surface-container-low border-none rounded-full focus:ring-2 focus:ring-primary text-on-surface placeholder:text-outline/60 font-medium transition-all shadow-sm outline-none" 
              placeholder="Thêm nguyên liệu (ví dụ: Thịt bò...)" 
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
            />
          </div>

          {/* Ingredient Tags Area */}
          <div className="flex flex-wrap gap-3">
            {tags.map((tag, i) => (
              <div key={i} className="flex items-center gap-2 bg-surface-container-highest px-4 py-2 rounded-full border border-outline-variant/15 transition-all">
                <span className="text-sm font-semibold text-on-surface-variant">{tag}</span>
                <button 
                  className="hover:text-primary transition-colors"
                  onClick={() => removeTag(tag)}
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            ))}
            
          </div>
        </section>

        {/* Primary Call to Action */}
        <section className={`sticky z-40 transition-all duration-300 ${isKeyboardOpen ? 'bottom-4' : 'bottom-28'}`}>
          <button 
            className="w-full py-5 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-full font-headline font-bold text-lg shadow-[0_12px_24px_-8px_rgba(171,53,0,0.3)] hover:shadow-[0_16px_32px_-8px_rgba(171,53,0,0.4)] transition-all active:scale-[0.98] flex justify-center items-center gap-3 disabled:opacity-50"
            onClick={handleSearch}
            disabled={tags.length === 0}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant_menu</span>
            Gợi ý món ăn
          </button>
        </section>

        {/* Quick Categories (Bento Style) */}
        <section className="pt-4 space-y-4">
          <h3 className="font-headline font-bold text-xl px-2">Tìm theo cảm hứng</h3>
          <div className="grid grid-cols-2 gap-4">
            <div 
              className="col-span-1 bg-secondary-container/30 p-6 rounded-lg flex flex-col justify-between h-40 group hover:bg-secondary-container/50 transition-colors cursor-pointer"
              onClick={() => router.push('/results?q=quick')}
            >
              <span className="material-symbols-outlined text-secondary text-3xl">timer</span>
              <span className="font-headline font-bold text-on-secondary-container text-lg leading-tight">Nấu nhanh <br /> 15 phút</span>
            </div>
            <div 
              className="col-span-1 bg-surface-container-high p-6 rounded-lg flex flex-col justify-between h-40 hover:bg-surface-variant transition-colors cursor-pointer"
              onClick={() => router.push('/results?q=party')}
            >
              <span className="material-symbols-outlined text-primary text-3xl">local_fire_department</span>
              <span className="font-headline font-bold text-on-surface text-lg leading-tight">Món nhậu <br /> cuối tuần</span>
            </div>
            <div 
              className="col-span-2 bg-tertiary-fixed p-6 rounded-lg flex items-center justify-between hover:bg-tertiary-fixed-dim transition-colors overflow-hidden relative cursor-pointer"
              onClick={() => router.push('/results?q=healthy')}
            >
              <div className="z-10">
                <span className="material-symbols-outlined text-on-tertiary-fixed-variant text-3xl mb-2">eco</span>
                <h4 className="font-headline font-bold text-on-tertiary-fixed text-lg">Thanh đạm & Healthy</h4>
              </div>
              <img 
                className="absolute -right-4 -bottom-4 w-32 h-32 object-cover rounded-full rotate-12 opacity-80" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCosnymvOXUqDzHCdHeDkrnI9U9UfrnpwaLBeTSLFZwI8jn_4C60Qw_th45SK_iX6ysjeeI93R-7J3UPXWkGf0zDrw4vmaJXza7QkAKt2uwDSEXCsZZwUQRnubeQXmOZ7mSD2Zqf8N9TkxSAZy_YXb4ARLVFQJK3f-HB_SvSuyO4KGZcI0lGHcfTB0CFrA5xRQPuhtRe9VSemzrvGCrIxlzjKigC5Kaxo3kKgyLoLL5FlNhuqKnFPPLKQ9tpZy9xAfzL1VEtet-8iQ"
                alt="Healthy buddha bowl"
              />
            </div>
          </div>
        </section>
      </main>

      <BottomNavBar />
    </div>
  );
}

