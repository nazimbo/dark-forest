import { useState, useEffect, useRef } from 'react';
import { getNarratives } from '../narratives';
import { useTranslation } from '../i18n/LanguageContext';

const NarrativePanel = ({ gameState, children }) => {
  const { t, lang } = useTranslation();
  const narratives = getNarratives(lang);
  const narrative = narratives[gameState] || narratives.START;
  const [isFading, setIsFading] = useState(false);
  const prevGameStateRef = useRef(gameState);

  useEffect(() => {
    if (gameState === prevGameStateRef.current) return;
    prevGameStateRef.current = gameState;
    setIsFading(true);
    const timer = setTimeout(() => setIsFading(false), 300);
    return () => clearTimeout(timer);
  }, [gameState]);

  return (
    <div className="absolute inset-x-0 bottom-0 pointer-events-none">
      <div className="bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-24 pb-6 px-6 sm:px-10 md:px-16">

        <div className={`text-center mb-3 transition-all duration-300 ${isFading ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
          <span className="text-blue-400/80 text-xs sm:text-sm uppercase tracking-[0.25em] font-medium">
            {narrative.title}
          </span>
        </div>

        <p
          className={`text-center text-base sm:text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed transition-opacity duration-300 ${isFading ? 'opacity-0' : 'opacity-100'}`}
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
        >
          {narrative.text}
        </p>

        <p className={`text-center text-xs sm:text-sm text-gray-500 italic max-w-xl mx-auto mt-2 transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
          {narrative.subtext}
        </p>

        <div className="flex justify-center mt-5 pointer-events-auto">
          {children}
        </div>

        <div className="text-center mt-4 text-xs text-gray-700">
          {t('quote')}
        </div>
      </div>
    </div>
  );
};

export default NarrativePanel;
