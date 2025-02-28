'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Locale, defaultLocale, locales } from './settings';

// Create a type for the context
type LanguageContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, namespace?: string) => string;
};

// Create the context with a default value
const LanguageContext = createContext<LanguageContextType>({
  locale: defaultLocale,
  setLocale: () => {},
  t: (key: string) => key,
});

// Custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext);

// Function to get a value from a nested object using a dot-notation string
const getNestedValue = (obj: any, path: string): string => {
  return path.split('.').reduce((prev, curr) => {
    return prev && prev[curr] ? prev[curr] : path;
  }, obj);
};

interface LanguageProviderProps {
  children: ReactNode;
}

// Language provider component
export function LanguageProvider({ children }: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  // Load translations for the current locale
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        setLoading(true);
        const commonTranslations = await import(`../messages/${locale}/common.json`);
        setTranslations({
          common: commonTranslations.default || commonTranslations,
        });
      } catch (error) {
        console.error(`Failed to load translations for locale ${locale}:`, error);
      } finally {
        setLoading(false);
      }
    };

    loadTranslations();
  }, [locale]);

  // Set locale and save to localStorage
  const setLocale = (newLocale: Locale) => {
    if (locales.includes(newLocale)) {
      localStorage.setItem('locale', newLocale);
      setLocaleState(newLocale);
    }
  };

  // Load locale from localStorage on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale && locales.includes(savedLocale)) {
      setLocaleState(savedLocale);
    }
  }, []);

  // Translation function
  const t = (key: string, namespace = 'common'): string => {
    if (loading) return key;
    
    const ns = translations[namespace];
    if (!ns) return key;
    
    const value = getNestedValue(ns, key);
    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
} 