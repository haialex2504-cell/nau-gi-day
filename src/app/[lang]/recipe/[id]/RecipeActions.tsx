'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FavoriteButton from '@/app/[lang]/components/FavoriteButton';
import ShareModal from '@/app/[lang]/components/ShareModal';
import Toast from '@/app/[lang]/components/Toast';
import { useLang } from '@/app/[lang]/components/LangContext';
import { createClient } from '@/utils/supabase/client';

interface RecipeActionsProps {
  recipeId: string;
  recipeName: string;
  recipeImage: string;
  isAuthor: boolean;
}

export default function RecipeActions({ recipeId, recipeName, recipeImage, isAuthor }: RecipeActionsProps) {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { lang, dict: t } = useLang();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });
  }, [supabase.auth]);

  const handleShareClick = () => {
    setIsShareOpen(true);
  };

  const handleCloneClick = () => {
    if (!isLoggedIn) {
      router.push(`/${lang}/login?returnUrl=/${lang}/recipe/${recipeId}`);
      return;
    }
    router.push(`/${lang}/add-recipe?cloneId=${recipeId}`);
  };

  const handleEditClick = () => {
    router.push(`/${lang}/add-recipe?editId=${recipeId}`);
  };

  const handleCopySuccess = () => {
    setToastMessage(t.recipe.copiedLink || 'Đã sao chép liên kết');
  };

  const closeToast = () => {
    setToastMessage('');
  };

  return (
    <>
      <div className="flex gap-3">
        {isAuthor && (
          <button
            className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg active:scale-95 transition-transform"
            onClick={handleEditClick}
            title="Sửa công thức"
          >
            <span className="material-symbols-outlined text-primary">edit</span>
          </button>
        )}
        
        <button
          className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg active:scale-95 transition-transform"
          onClick={handleCloneClick}
          title="Nhân bản công thức"
        >
          <span className="material-symbols-outlined text-secondary">content_copy</span>
        </button>

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
