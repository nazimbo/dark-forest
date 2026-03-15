import { Radio, Volume2, Eye, RefreshCw, ArrowRight } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { STATES } from '../simulation/constants';

const GameControls = ({ gameState, pendingState, onBroadcast, onWhisper, onListen, onReset, onAdvance }) => {
  const { t } = useTranslation();
  const showChoices = [STATES.START, STATES.WITNESS, STATES.SAFE].includes(gameState);

  if (pendingState) {
    return (
      <div role="group" aria-label={t('ui.ariaGameControls')} className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
        <button
          onClick={onAdvance}
          className="group flex items-center gap-2.5 sm:gap-3 px-6 py-3 min-h-[44px] bg-white/10 hover:bg-white/20 text-gray-200 rounded-lg transition-all border border-white/20 hover:border-white/40"
        >
          <span>{t('ui.continue')}</span>
          <ArrowRight aria-hidden="true" className="w-4 h-4 ltr:group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
        </button>
      </div>
    );
  }

  return (
    <div role="group" aria-label={t('ui.ariaGameControls')} className="flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-3 w-full sm:w-auto px-4 sm:px-0">
      {showChoices && (
        <>
          <button
            onClick={onBroadcast}
            className="group flex items-center justify-center gap-2.5 sm:gap-3 px-4 py-2.5 sm:px-6 sm:py-3 min-h-[44px] bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(37,99,235,0.3)] text-sm sm:text-base"
          >
            <Radio aria-hidden="true" className="w-4 h-4 sm:w-5 sm:h-5 group-hover:animate-ping" />
            <span>{gameState === STATES.WITNESS ? t('ui.broadcastAnyway') : t('ui.broadcastSignal')}</span>
          </button>

          <button
            onClick={onWhisper}
            className="group flex items-center justify-center gap-2.5 sm:gap-3 px-4 py-2.5 sm:px-6 sm:py-3 min-h-[44px] bg-indigo-900/60 hover:bg-indigo-800/80 text-indigo-200 rounded-lg transition-all border border-indigo-700/50 hover:border-indigo-500/70 text-sm sm:text-base"
          >
            <Volume2 aria-hidden="true" className="w-4 h-4 sm:w-5 sm:h-5 opacity-50 group-hover:opacity-100" />
            <span>{t('ui.whisper')}</span>
          </button>

          <button
            onClick={onListen}
            className="group flex items-center justify-center gap-2.5 sm:gap-3 px-4 py-2.5 sm:px-6 sm:py-3 min-h-[44px] bg-gray-900/60 hover:bg-gray-800/80 text-gray-300 rounded-lg transition-all border border-gray-700/50 hover:border-gray-500/70 text-sm sm:text-base"
          >
            <Eye aria-hidden="true" className="w-4 h-4 sm:w-5 sm:h-5 opacity-50 group-hover:opacity-100" />
            <span>{gameState === STATES.WITNESS ? t('ui.keepListening') : t('ui.listen')}</span>
          </button>
        </>
      )}

      {gameState === STATES.BROADCASTING && (
        <div role="status" aria-live="polite" className="flex items-center justify-center gap-2.5 sm:gap-3 px-4 py-2.5 sm:px-6 sm:py-3 border border-blue-500/30 bg-blue-900/20 text-blue-300 rounded-lg animate-pulse text-sm sm:text-base">
          <Radio aria-hidden="true" className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
          <span>{t('ui.transmitting')}</span>
        </div>
      )}

      {gameState === STATES.WHISPERING && (
        <div role="status" aria-live="polite" className="flex items-center justify-center gap-2.5 sm:gap-3 px-4 py-2.5 sm:px-6 sm:py-3 border border-indigo-500/30 bg-indigo-900/20 text-indigo-300 rounded-lg animate-pulse text-sm sm:text-base">
          <Volume2 aria-hidden="true" className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>{t('ui.whispering')}</span>
        </div>
      )}

      {gameState === STATES.LISTENING && (
        <div role="status" aria-live="polite" className="flex items-center justify-center gap-2.5 sm:gap-3 px-4 py-2.5 sm:px-6 sm:py-3 border border-gray-500/30 bg-gray-900/20 text-gray-400 rounded-lg text-sm sm:text-base">
          <Eye aria-hidden="true" className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
          <span>{t('ui.observing')}</span>
        </div>
      )}

      {gameState === STATES.DESTROYED && (
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2.5 sm:gap-3 px-4 py-2.5 sm:px-6 sm:py-3 min-h-[44px] border border-gray-600 hover:border-gray-400 hover:bg-gray-800 text-gray-300 rounded-lg transition-all text-sm sm:text-base"
        >
          <RefreshCw aria-hidden="true" className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>{t('ui.rebirth')}</span>
        </button>
      )}
    </div>
  );
};

export default GameControls;
