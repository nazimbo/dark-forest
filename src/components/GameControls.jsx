import { Radio, Volume2, Eye, RefreshCw, ArrowRight } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { STATES } from '../simulation/constants';
import ActionButton from './ActionButton';
import StatusBadge from './StatusBadge';

const GameControls = ({ gameState, pendingState, onBroadcast, onWhisper, onListen, onReset, onAdvance }) => {
  const { t } = useTranslation();
  const showChoices = [STATES.START, STATES.WITNESS, STATES.SAFE].includes(gameState);

  if (pendingState) {
    return (
      <div role="group" aria-label={t('ui.ariaGameControls')} className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
        <ActionButton variant="neutral" onClick={onAdvance}>
          <span>{t('ui.continue')}</span>
          <ArrowRight aria-hidden="true" className="w-4 h-4 ltr:group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
        </ActionButton>
      </div>
    );
  }

  return (
    <div role="group" aria-label={t('ui.ariaGameControls')} className="flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-3 w-full sm:w-auto px-4 sm:px-0">
      {showChoices && (
        <>
          <ActionButton variant="primary" onClick={onBroadcast}>
            <Radio aria-hidden="true" className="w-4 h-4 sm:w-5 sm:h-5 group-hover:animate-ping" />
            <span>{gameState === STATES.WITNESS ? t('ui.broadcastAnyway') : t('ui.broadcastSignal')}</span>
          </ActionButton>

          <ActionButton variant="indigo" onClick={onWhisper}>
            <Volume2 aria-hidden="true" className="w-4 h-4 sm:w-5 sm:h-5 opacity-50 group-hover:opacity-100" />
            <span>{t('ui.whisper')}</span>
          </ActionButton>

          <ActionButton variant="gray" onClick={onListen}>
            <Eye aria-hidden="true" className="w-4 h-4 sm:w-5 sm:h-5 opacity-50 group-hover:opacity-100" />
            <span>{gameState === STATES.WITNESS ? t('ui.keepListening') : t('ui.listen')}</span>
          </ActionButton>
        </>
      )}

      {gameState === STATES.BROADCASTING && (
        <StatusBadge
          tone="blue"
          pulse
          icon={<Radio aria-hidden="true" className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />}
          label={t('ui.transmitting')}
        />
      )}

      {gameState === STATES.WHISPERING && (
        <StatusBadge
          tone="indigo"
          pulse
          icon={<Volume2 aria-hidden="true" className="w-4 h-4 sm:w-5 sm:h-5" />}
          label={t('ui.whispering')}
        />
      )}

      {gameState === STATES.LISTENING && (
        <StatusBadge
          tone="gray"
          icon={<Eye aria-hidden="true" className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />}
          label={t('ui.observing')}
        />
      )}

      {gameState === STATES.DESTROYED && (
        <ActionButton variant="outline" onClick={onReset}>
          <RefreshCw aria-hidden="true" className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>{t('ui.rebirth')}</span>
        </ActionButton>
      )}
    </div>
  );
};

export default GameControls;
