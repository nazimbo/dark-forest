import { useState, useEffect, useRef, useCallback } from 'react';
import { Settings, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { useLanguage, useTranslation } from '../i18n/LanguageContext';

const SettingsPanel = ({ isMuted, onToggleMute }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const panelRef = useRef(null);
  const { lang, setLang } = useLanguage();
  const { t } = useTranslation();

  // Track fullscreen state
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen().catch(() => {
        /* Fullscreen API unavailable */
      });
    }
  }, []);

  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={() => setIsOpen(o => !o)}
        aria-label={t('ui.ariaSettings')}
        aria-expanded={isOpen}
        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-gray-200"
      >
        <Settings aria-hidden="true" className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 bg-black/95 border border-white/15 rounded-xl p-2 min-w-[180px] backdrop-blur-sm shadow-xl shadow-black/50 animate-in"
        >
          {/* Language */}
          <div className="px-3 py-2">
            <span className="text-[10px] uppercase tracking-widest text-gray-500">{t('ui.language')}</span>
            <div className="flex gap-1 mt-1.5">
              <button
                role="menuitemradio"
                aria-checked={lang === 'en'}
                onClick={() => setLang('en')}
                className={`flex-1 px-3 py-1.5 text-xs rounded-md transition-colors ${lang === 'en' ? 'bg-white/15 text-gray-200' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
              >
                EN
              </button>
              <button
                role="menuitemradio"
                aria-checked={lang === 'fr'}
                onClick={() => setLang('fr')}
                className={`flex-1 px-3 py-1.5 text-xs rounded-md transition-colors ${lang === 'fr' ? 'bg-white/15 text-gray-200' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
              >
                FR
              </button>
            </div>
          </div>

          <div className="mx-2 border-t border-white/10" />

          {/* Sound */}
          <button
            role="menuitem"
            onClick={onToggleMute}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-gray-300 hover:bg-white/5 rounded-md transition-colors"
          >
            {isMuted
              ? <VolumeX aria-hidden="true" className="w-3.5 h-3.5 text-gray-500" />
              : <Volume2 aria-hidden="true" className="w-3.5 h-3.5 text-gray-400" />
            }
            <span>{isMuted ? t('ui.unmute') : t('ui.mute')}</span>
          </button>

          {/* Fullscreen */}
          <button
            role="menuitem"
            onClick={toggleFullscreen}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-gray-300 hover:bg-white/5 rounded-md transition-colors"
          >
            {isFullscreen
              ? <Minimize aria-hidden="true" className="w-3.5 h-3.5 text-gray-400" />
              : <Maximize aria-hidden="true" className="w-3.5 h-3.5 text-gray-400" />
            }
            <span>{isFullscreen ? t('ui.exitFullscreen') : t('ui.fullscreen')}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;
