'use client';

import React, { useState } from 'react';
import FavoriteButton from '@/app/[lang]/components/FavoriteButton';
import ShareModal from '@/app/[lang]/components/ShareModal';
import Toast from '@/app/[lang]/components/Toast';
import { useLang } from '@/app/[lang]/components/LangContext';

interface RecipeActionsProps {
  recipeId: string;
  recipeName: string;
  recipeImage: string;
}

export default function RecipeActions({ recipeId, recipeName, recipeImage }: RecipeActionsProps) {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const { dict: t } = useLang();

  const handleShareClick = () => {
    setIsShareOpen(true);
  };

  const handleCopySuccess = () => {
    setToastMessage(t.recipe.copiedLink);
  };

  const closeToast = () => {
    setToastMessage('');
  };

  return (
    <>
      <div className="flex gap-3">
        <button
          className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg active:scale-95 transition-transform"
          onClick={handleShareClick}
        >
          <span className="material-symbols-outlined text-on-surface">share</span>
        </button>
        <FavoriteButton
          recipeId={recipeId}
          className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg"
        />
      </div>

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        recipeId={recipeId}
        recipeName={recipeName}
        recipeImage={recipeImage}
        onCopySuccess={handleCopySuccess}
      />

      <Toast
        isOpen={!!toastMessage}
        message={toastMessage}
        onClose={closeToast}
      />
    </>
  );
}
