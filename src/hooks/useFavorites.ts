'use client';

import { useState, useEffect } from 'react';

const FAVORITES_KEY = 'nau_gi_day_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Lỗi lấy dữ liệu Favorites:', e);
    }
    setIsLoaded(true);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === FAVORITES_KEY && e.newValue) {
        setFavorites(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleFavorite = (id: string) => {
    let newFavorites;
    if (favorites.includes(id)) {
      newFavorites = favorites.filter(favId => favId !== id);
    } else {
      newFavorites = [...favorites, id];
    }
    setFavorites(newFavorites);
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      // Trigger a custom event for same-tab updates
      window.dispatchEvent(new Event('nau_favorites_updated'));
    } catch (e) {
      console.error('Lỗi khi lưu Favorites:', e);
    }
  };

  // Same-tab updates listener
  useEffect(() => {
    const handleLocalUpdate = () => {
      try {
        const stored = localStorage.getItem(FAVORITES_KEY);
        if (stored) {
          setFavorites(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Lỗi đồng bộ Favorites tĩnh cục bộ:', e);
      }
    };
    window.addEventListener('nau_favorites_updated', handleLocalUpdate);
    return () => window.removeEventListener('nau_favorites_updated', handleLocalUpdate);
  }, []);

  const isFavorite = (id: string) => favorites.includes(id);

  return { favorites, toggleFavorite, isFavorite, isLoaded };
}
