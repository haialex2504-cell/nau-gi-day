'use client';

import { usePathname, useRouter } from 'next/navigation';

const localeLabels: Record<string, string> = {
  vi: '🇻🇳 VI',
  en: '🇬🇧 EN',
};

export default function LanguageSwitcher({ lang }: { lang: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = () => {
    const newLang = lang === 'vi' ? 'en' : 'vi';
    // Replace current locale prefix with new one
    const newPath = pathname.replace(`/${lang}`, `/${newLang}`);
    router.push(newPath);
  };

  // Temporarily hidden as per user request (Vietnamese only for now)
  return null;
  /*
  return (
    <button
      onClick={switchLocale}
      className="px-3 py-1.5 bg-surface-container-high hover:bg-surface-variant rounded-full text-xs font-bold text-on-surface transition-colors active:scale-95"
    >
      {localeLabels[lang] || lang.toUpperCase()}
    </button>
  );
  */
}
