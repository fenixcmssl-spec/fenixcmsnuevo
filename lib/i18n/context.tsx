'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedLocale, SUPPORTED_LOCALES, DEFAULT_LOCALE, getTranslation, LocaleInfo } from './translations';

interface I18nContextType {
  locale: SupportedLocale;
  setLocale: (newLocale: SupportedLocale) => void;
  t: (key: string) => string;
  availableLocales: LocaleInfo[];
}

const I18nContext = createContext<I18nContextType>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (key: string) => getTranslation(DEFAULT_LOCALE, key),
  availableLocales: SUPPORTED_LOCALES,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>(DEFAULT_LOCALE);

  useEffect(() => {
    // Check saved cookie or localStorage
    const saved = localStorage.getItem('fenix_locale') as SupportedLocale;
    if (saved && SUPPORTED_LOCALES.some(l => l.code === saved)) {
      setLocaleState(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  const setLocale = (newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    localStorage.setItem('fenix_locale', newLocale);
    document.cookie = `fenix_locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    document.documentElement.lang = newLocale;
  };

  const t = (key: string): string => {
    return getTranslation(locale, key);
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, availableLocales: SUPPORTED_LOCALES }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
