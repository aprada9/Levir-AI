'use client';

import { useLanguage } from './client';
import { useEffect } from 'react';

/**
 * This component updates the HTML lang attribute when the language changes.
 * It should be included near the root of the application.
 */
export default function LangAttributeUpdater() {
  const { locale } = useLanguage();

  useEffect(() => {
    // Update the HTML lang attribute whenever the locale changes
    if (document && document.documentElement) {
      document.documentElement.lang = locale;
      
      // Also set a cookie to make the locale available on the server side
      document.cookie = `locale=${locale}; path=/; max-age=31536000`; // 1 year
    }
  }, [locale]);

  // This component doesn't render anything
  return null;
} 