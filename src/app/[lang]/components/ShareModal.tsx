'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useLang } from './LangContext';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipeName: string;
  recipeImage: string;
  recipeId: string;
  onCopySuccess: () => void;
}

export default function ShareModal({
  isOpen,
  onClose,
  recipeName,
  recipeImage,
  recipeId,
  onCopySuccess
}: ShareModalProps) {
  const { dict: t } = useLang();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const shareUrl = typeof window !== 'undefined' ? window.location.href : `https://naugiday.example.com/recipe/${recipeId}`;

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400');
    onClose();
  };

  const shareToZalo = () => {
    window.open(`https://zalo.me/share?v=4&u=${encodeURIComponent(shareUrl)}`, '_blank');
    onClose();
  };

  const shareToTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(recipeName)}`, '_blank');
    onClose();
  };

  const shareToPinterest = () => {
    const pinUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=${encodeURIComponent(recipeImage)}&description=${encodeURIComponent(recipeName)}`;
    window.open(pinUrl, '_blank', 'width=600,height=600');
    onClose();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      onCopySuccess();
      onClose();
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t.share.nativeTitle.replace('{name}', recipeName),
          text: t.share.nativeText.replace('{name}', recipeName),
          url: shareUrl,
        });
        onClose();
      } catch (error) {
        console.log('Error native share', error);
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-on-surface/40 backdrop-blur-[2px] z-[50] transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="fixed bottom-0 left-0 right-0 z-[60] flex justify-center animate-in slide-in-from-bottom-full duration-300">
        <div className="w-full max-w-md bg-surface-container-lowest/80 backdrop-blur-xl rounded-t-[2rem] p-6 shadow-[0_-8px_40px_rgba(28,28,22,0.12)]">

          <div className="flex justify-center mb-6">
            <div className="w-12 h-1.5 bg-outline-variant/30 rounded-full"></div>
          </div>

          <div className="bg-surface-container-low rounded-xl p-3 mb-8 flex items-center gap-4 border border-outline-variant/20 shadow-sm">
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 relative">
              <Image
                src={recipeImage || '/default-recipe.png'}
                alt={recipeName}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-0.5 truncate">{t.share.recipePreviewLabel}</p>
              <h2 className="font-headline font-extrabold text-on-surface text-base leading-tight truncate">
                {recipeName}
              </h2>
            </div>
            <div className="text-primary pr-2">
              <span className="material-symbols-outlined">link</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-y-8 mb-10">
            <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={shareToFacebook}>
              <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-[#1877F2] active:scale-95 transition-all shadow-sm">
                <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path></svg>
              </div>
              <span className="font-label text-xs font-semibold text-on-surface-variant">Facebook</span>
            </div>

            <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={shareToZalo}>
              <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-[#0068FF] active:scale-95 transition-all shadow-sm">
                <span className="font-extrabold text-xl tracking-tighter italic mr-0.5">Zalo</span>
              </div>
              <span className="font-label text-xs font-semibold text-on-surface-variant">Zalo</span>
            </div>

            <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={shareToTelegram}>
              <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-[#24A1DE] active:scale-95 transition-all shadow-sm">
                 <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
              </div>
              <span className="font-label text-xs font-semibold text-on-surface-variant">Telegram</span>
            </div>

            <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={shareToPinterest}>
              <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-[#E60023] active:scale-95 transition-all shadow-sm">
                <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345l-.288 1.148c-.046.169-.173.216-.336.141-1.258-.585-2.043-2.425-2.043-3.91 0-3.181 2.312-6.108 6.666-6.108 3.492 0 6.208 2.489 6.208 5.823 0 3.473-2.189 6.269-5.23 6.269-1.021 0-1.981-.531-2.31-1.16l-.63 2.399c-.227.864-.841 1.944-1.254 2.605 1.162.355 2.391.547 3.659.547 6.627 0 12.015-5.385 12.015-12.004C24.033 5.367 18.643 0 12.017 0z"/></svg>
              </div>
              <span className="font-label text-xs font-semibold text-on-surface-variant">Pinterest</span>
            </div>

            <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => {
              copyToClipboard();
              alert(t.share.instagramAlert);
            }}>
              <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-[#E4405F] active:scale-95 transition-all shadow-sm">
                <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path></svg>
              </div>
              <span className="font-label text-xs font-semibold text-on-surface-variant">Instagram</span>
            </div>

            <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={copyToClipboard}>
              <div className="w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container active:scale-95 transition-all shadow-sm">
                <span className="material-symbols-outlined text-2xl">content_copy</span>
              </div>
              <span className="font-label text-xs font-semibold text-on-surface-variant">{t.common.copyLink}</span>
            </div>

            <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={handleNativeShare}>
              <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-on-surface active:scale-95 transition-all shadow-sm border border-outline-variant/30">
                <span className="material-symbols-outlined text-2xl">more_horiz</span>
              </div>
              <span className="font-label text-xs font-semibold text-on-surface-variant">{t.common.more}</span>
            </div>

          </div>

          <button
            className="w-full py-4 bg-surface-container-high hover:bg-surface-container-highest active:scale-95 duration-200 transition-all rounded-[1rem] font-headline font-bold text-on-surface"
            onClick={onClose}
          >
            {t.common.close}
          </button>

        </div>
      </div>
    </>
  );
}
