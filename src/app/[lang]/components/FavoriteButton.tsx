'use client';

import React from 'react';
import { useFirebaseFavorites as useFavorites } from '@/hooks/useFirebaseFavorites';

interface FavoriteButtonProps {
  recipeId: string;
  className?: string;
  iconClassName?: string;
}

export default function FavoriteButton({ recipeId, className = '', iconClassName = '' }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite, isLoaded } = useFavorites();

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleFavorite(recipeId);
  };

  const active = isFavorite(recipeId);

  return (
    <button 
      onClick={handleToggle}
      className={`flex items-center justify-center transition-colors active:scale-95 duration-200 ${className}`}
      disabled={!isLoaded}
    >
      <span 
        className={`material-symbols-outlined ${active ? 'text-primary' : 'text-on-surface'} ${iconClassName}`}
        style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
      >
        favorite
      </span>
    </button>
  );
}
