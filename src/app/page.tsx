'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BottomNavBar from '@/app/components/BottomNavBar';

export default function Home() {
  const [inputValue, setInputValue] = useState('');
  const [tags, setTags] = useState<string[]>(['Cà chua', 'Trứng', 'Thịt lợn']);
  const router = useRouter();

  const handleAddTag = () => {
    if (inputValue.trim() && !tags.includes(inputValue.trim())) {
      setTags([...tags, inputValue.trim()]);
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
    <main className="pb-32 px-6 max-w-2xl mx-auto space-y-10 selection:bg-secondary-container">
      {/* TopAppBar */}
      <header className="flex justify-between items-center w-full px-6 py-4 fixed top-0 left-0 right-0 z-40 bg-surface-container-low transition-colors shadow-sm">
        <div className="flex items-center gap-4 max-w-2xl mx-auto w-full justify-between">
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
        </div>
      </header>

      <div className="pt-24 space-y-10">
        {/* Hero Section */}
        <section className="relative">
          <div className="flex flex-col gap-2 mb-8 animate-fade-in">
            <h2 className="font-headline font-extrabold text-4xl tracking-tight leading-tight">
              Trong tủ lạnh bạn <br /> <span className="text-gradient">còn gì hôm nay?</span>
            </h2>
            <p className="text-on-surface-variant font-medium">Nhập nguyên liệu, chúng tôi sẽ gợi ý món ngon cho bạn.</p>
          </div>
          
          <div className="relative h-64 w-full mb-12 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="absolute right-0 top-0 w-3/4 h-full rounded-lg overflow-hidden transform rotate-2 shadow-sm">
              <img 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQ6f6IXcVRERPSKtFajYDP_sBZhFoqbM0Fntrc_WDBtVmDs7Zzeyr6ZlRrvTzO-Y8C42tlHd09gMjFycHExUrxNeZzPZ_kIkfEBltyfUzAX1bvEGPW_wE1WzjYS3AlYA_5vgVvhPiQKZXTS04JWPFyUSgB0vFObFIIu3I4H113PEaCE7M-gu2xqNFqDOwP6eVOaILu6a2DIZ4d34DDa_PPlFqJ2sDoMaSLQikqeR4M5R-vp9hqCF7hEb_AXmnXJfp-d9B-ry8Xoco"
                alt="Modern kitchen"
              />
            </div>
            <div className="absolute left-0 bottom-0 w-1/2 h-4/5 rounded-full border-8 border-background overflow-hidden transform -rotate-3 shadow-lg">
              <img 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuGZRStVESBMVZkVa-16AMNtWjDl1sv_s2pTYMtuANnimobTBNv6ujt8ClKz-C0Q6JIEIUT-0J8L9L4pKQmmwZftdeuPvFx1-eraONqBC3HDc7OnqOrp2oHuEgondDuUaRYTutNfH_2_Uh54tdg2RsfCaxG8T2c1JbsJXHpuc8LapRgeSeTSo_OABMPvTmkqFnlb3TzNoGwmN6DCf8jhhg-018JvY9ED-_kEuZeZ8VUyNKQH8ryNAYiYC0K1gnlG4EUTEfs0Wzx0E"
                alt="Fresh salad"
              />
            </div>
          </div>
        </section>

        {/* Search & Ingredients Input */}
        <section className="space-y-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-outline">search</span>
            </div>
            <input 
              className="w-full pl-14 pr-6 py-5 bg-surface-container-low border-none rounded-full focus:ring-2 focus:ring-primary text-on-surface placeholder:text-outline/60 font-medium transition-all outline-none" 
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
              <div key={i} className="flex items-center gap-2 bg-surface-container-highest px-4 py-2 rounded-full border border-outline-variant/15 transition-all hover:scale-105">
                <span className="text-sm font-semibold text-on-surface-variant">{tag}</span>
                <button 
                  className="hover:text-primary transition-colors"
                  onClick={() => removeTag(tag)}
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            ))}
            <button 
              className="flex items-center gap-2 px-4 py-2 rounded-full text-secondary font-bold hover:bg-secondary-container transition-colors"
              onClick={handleAddTag}
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span className="text-sm">Thêm nữa</span>
            </button>
          </div>
        </section>

        {/* Primary Call to Action */}
        <section className="pt-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <button 
            className="w-full py-5 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-full font-headline font-bold text-lg shadow-[0_12px_24px_-8px_rgba(171,53,0,0.3)] hover:shadow-[0_16px_32px_-8_rgba(171,53,0,0.4)] transition-all active:scale-[0.98] flex justify-center items-center gap-3 disabled:opacity-50"
            onClick={handleSearch}
            disabled={tags.length === 0}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant_menu</span>
            Gợi ý món ăn
          </button>
        </section>

        {/* Quick Categories */}
        <section className="pt-8 space-y-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <h3 className="font-headline font-bold text-xl px-2">Tìm theo cảm hứng</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1 bg-secondary-container/30 p-6 rounded-lg flex flex-col justify-between h-40 group hover:bg-secondary-container/50 transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-secondary text-3xl">timer</span>
              <span className="font-headline font-bold text-on-secondary-container text-lg leading-tight">Nấu nhanh <br /> 15 phút</span>
            </div>
            <div className="col-span-1 bg-surface-container-high p-6 rounded-lg flex flex-col justify-between h-40 hover:bg-surface-variant transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-primary text-3xl">local_fire_department</span>
              <span className="font-headline font-bold text-on-surface text-lg leading-tight">Món nhậu <br /> cuối tuần</span>
            </div>
          </div>
        </section>
      </div>

      <BottomNavBar />
    </main>
  );
}
