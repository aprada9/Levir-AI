export type Locale = 'en' | 'es';

export const defaultLocale: Locale = 'en';

export const locales: Locale[] = ['en', 'es'];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
}; 