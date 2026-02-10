import { useSimulation } from './hooks/useSimulation';
import { useSound } from './hooks/useSound';
import NarrativePanel from './components/NarrativePanel';
import GameControls from './components/GameControls';
import { useTranslation, useLanguage } from './i18n/LanguageContext';

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

const App = () => {
  const sound = useSound();
  const { canvasRef, gameState, pendingState, civCount, broadcast, whisper, listen, reset, advance } = useSimulation(sound);
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black overflow-hidden font-sans text-gray-200">
      <canvas ref={canvasRef} className="absolute top-0 left-0 z-0" />

      <div className="relative z-10 w-full h-full pointer-events-none">
        <header className="p-4 sm:p-6 md:p-8 flex flex-wrap gap-2 justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-auto">
          <h1 className="text-lg sm:text-xl md:text-2xl tracking-widest uppercase font-bold text-gray-400 border-l-4 border-blue-500 pl-4">
            {t('ui.title')} <span className="text-gray-600">{t('ui.subtitle')}</span>
          </h1>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="font-mono tabular-nums">{civCount} {t('ui.civilizations')}</span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              {gameState}
            </span>
            <LanguageSwitcher />
          </div>
        </header>

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
      </div>

      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]"></div>
    </div>
  );
};

export default App;
