import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { translations } from './translations';

const SUPPORTED_LANGS = Object.keys(translations);

const detectLang = () => {
  try {
    const stored = localStorage.getItem('dark-forest-lang');
    if (stored && SUPPORTED_LANGS.includes(stored)) return stored;
  } catch { /* localStorage unavailable */ }
  const browser = navigator.language?.slice(0, 2);
  return SUPPORTED_LANGS.includes(browser) ? browser : 'en';
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(detectLang);

  // Keep <html lang> in sync with the selected language
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

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

// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};

// eslint-disable-next-line react-refresh/only-export-components
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
