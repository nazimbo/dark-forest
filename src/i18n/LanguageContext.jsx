import { createContext, useContext, useState, useCallback } from 'react';
import { translations } from './translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('dark-forest-lang') || 'en';
    } catch {
      return 'en';
    }
  });

  const changeLang = useCallback((newLang) => {
    setLang(newLang);
    try {
      localStorage.setItem('dark-forest-lang', newLang);
    } catch {
      // localStorage unavailable
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};

export const useTranslation = () => {
  const { lang } = useLanguage();
  const t = useCallback(
    (key) => {
      const keys = key.split('.');
      let val = translations[lang];
      for (const k of keys) {
        val = val?.[k];
      }
      return val ?? key;
    },
    [lang]
  );
  return { t, lang };
};
