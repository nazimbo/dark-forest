import { useMemo } from 'react';
import { useSimulation } from './hooks/useSimulation';
import { useSound } from './hooks/useSound';
import NarrativePanel from './components/NarrativePanel';
import GameControls from './components/GameControls';
import SettingsPanel from './components/SettingsPanel';
import Onboarding from './components/Onboarding';
import { useTranslation } from './i18n/LanguageContext';
import { translations } from './i18n/translations';

const App = () => {
  const sound = useSound();
  const { t, lang } = useTranslation();
  // Localized labels drawn onto the canvas (otherwise inaccessible English text).
  const canvasLabels = useMemo(() => ({ you: t('ui.you'), signal: t('ui.signal') }), [t]);
  const { canvasRef, gameState, pendingState, civCount, broadcast, whisper, listen, reset, advance } = useSimulation(sound, canvasLabels);

  // Human-readable, translated status derived from the current state's narrative
  // title — never the raw enum value.
  const narratives = translations[lang]?.narratives ?? translations.en.narratives;
  const statusLabel = (narratives[gameState] ?? translations.en.narratives[gameState])?.title ?? '';

  return (
    <div className="fixed inset-0 bg-black overflow-hidden font-sans text-gray-200">
      <a href="#game-controls" className="skip-link">{t('ui.ariaSkip')}</a>

      <canvas
        ref={canvasRef}
        role="img"
        aria-label={t('ui.ariaSimulation')}
        className="absolute top-0 left-0 z-0"
      />

      <div className="relative z-10 w-full h-full pointer-events-none">
        <header className="game-header p-2 sm:p-6 md:p-8 flex flex-wrap gap-1 sm:gap-2 justify-between items-center bg-linear-to-b from-black/80 to-transparent pointer-events-auto">
          <h1 className="text-sm sm:text-xl md:text-2xl tracking-widest uppercase font-bold text-gray-400 border-s-2 sm:border-s-4 border-blue-500 ps-2 sm:ps-4">
            {t('ui.title')} <span className="hidden sm:inline text-gray-500">{t('ui.subtitle')}</span>
          </h1>
          <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-gray-400">
            <span className="font-mono tabular-nums">{civCount} {t('ui.civilizations', { count: civCount })}</span>
            <span className="hidden sm:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" aria-hidden="true"></span>
              <span className="hidden sm:inline">{statusLabel}</span>
            </span>
            <SettingsPanel isMuted={sound.isMuted} onToggleMute={sound.toggleMute} />
          </div>
        </header>

        <main>
          <NarrativePanel gameState={gameState}>
            <GameControls
              gameState={gameState}
              pendingState={pendingState}
              onBroadcast={broadcast}
              onWhisper={whisper}
              onListen={listen}
              onReset={reset}
              onAdvance={advance}
            />
          </NarrativePanel>
        </main>
      </div>

      <div aria-hidden="true" className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.7)_100%)]"></div>

      <Onboarding />
    </div>
  );
};

export default App;
