import 'server-only'

const dictionaries = {
  vi: () => import('./dictionaries/vi.json').then((module) => module.default),
  en: () => import('./dictionaries/en.json').then((module) => module.default),
}

export type Locale = keyof typeof dictionaries
export type Dictionary = Awaited<ReturnType<typeof getDictionary>>

export const locales: Locale[] = ['vi', 'en']
export const defaultLocale: Locale = 'vi'

export const hasLocale = (locale: string): locale is Locale =>
  locale in dictionaries

export const getDictionary = async (locale: Locale) => dictionaries[locale]()
