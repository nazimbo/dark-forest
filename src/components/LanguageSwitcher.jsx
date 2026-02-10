import { useLanguage } from '../i18n/LanguageContext';

const LanguageSwitcher = () => {
  const { lang, setLang } = useLanguage();
  return (
    <div className="flex items-center bg-white/10 border border-white/20 rounded-lg overflow-hidden text-xs">
      <button
        onClick={() => setLang('en')}
        className={`px-2 py-1 transition-colors ${lang === 'en' ? 'bg-white/20 text-gray-200' : 'text-gray-500 hover:text-gray-300'}`}
      >
        EN
      </button>
      <button
        onClick={() => setLang('fr')}
        className={`px-2 py-1 transition-colors ${lang === 'fr' ? 'bg-white/20 text-gray-200' : 'text-gray-500 hover:text-gray-300'}`}
      >
        FR
      </button>
    </div>
  );
};

export default LanguageSwitcher;
