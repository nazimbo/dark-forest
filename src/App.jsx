import { useSimulation } from './hooks/useSimulation';
import { useSound } from './hooks/useSound';
import NarrativePanel from './components/NarrativePanel';
import GameControls from './components/GameControls';
import SettingsPanel from './components/SettingsPanel';
import Onboarding from './components/Onboarding';
import { useTranslation } from './i18n/LanguageContext';

const App = () => {
  const sound = useSound();
  const { canvasRef, gameState, pendingState, civCount, broadcast, whisper, listen, reset, advance } = useSimulation(sound);
  const { t } = useTranslation();

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
        <header className="game-header p-3 sm:p-6 md:p-8 flex flex-wrap gap-2 justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-auto">
          <h1 className="text-base sm:text-xl md:text-2xl tracking-widest uppercase font-bold text-gray-400 border-l-4 border-blue-500 pl-4">
            {t('ui.title')} <span className="hidden sm:inline text-gray-600">{t('ui.subtitle')}</span>
          </h1>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="font-mono tabular-nums">{civCount} {t('ui.civilizations')}</span>
            <span className="flex items-center gap-2" role="status" aria-live="polite">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" aria-hidden="true"></span>
              <span className="hidden sm:inline">{gameState}</span>
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
