'use client';

import { useLanguage } from '@/i18n/client';
import { Locale, localeNames, locales } from '@/i18n/settings';
import ThemeSwitcher from '@/components/theme/Switcher';
import { Select } from '@/components/ui/Select';

export default function Footer() {
  const { locale, setLocale, t } = useLanguage();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocale(e.target.value as Locale);
  };

  return (
    <footer className="py-4 px-4 mt-8 border-t border-light-200 dark:border-dark-200">
      <div className="max-w-screen-lg mx-auto flex flex-wrap items-center justify-between">
        <div className="text-sm text-black/70 dark:text-white/70">
          {t('footer.copyright')}
        </div>
        
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-black/70 dark:text-white/70">
              {t('footer.language')}:
            </span>
            <Select
              className="w-32"
              value={locale}
              onChange={handleLanguageChange}
              options={locales.map(loc => ({
                value: loc,
                label: localeNames[loc]
              }))}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-black/70 dark:text-white/70">
              {t('footer.theme')}:
            </span>
            <ThemeSwitcher className="w-32" />
          </div>
        </div>
      </div>
    </footer>
  );
} 