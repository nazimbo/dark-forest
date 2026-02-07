import { Radio, Volume2, Eye, RefreshCw } from 'lucide-react';

const GameControls = ({ gameState, onBroadcast, onWhisper, onListen, onReset }) => {
  const showChoices = ['START', 'WITNESS', 'SAFE'].includes(gameState);
  const broadcastLabel = gameState === 'WITNESS' ? 'Broadcast Anyway' : 'Broadcast Signal';
  const listenLabel = gameState === 'WITNESS' ? 'Keep Listening' : 'Listen';

  return (
    <div className="pt-6 flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
      {showChoices && (
        <>
          <button
            onClick={onBroadcast}
            className="group flex items-center gap-2 sm:gap-3 px-4 py-2.5 sm:px-6 sm:py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
          >
            <Radio className="w-5 h-5 group-hover:animate-ping" />
            <span>{broadcastLabel}</span>
          </button>

          <button
            onClick={onWhisper}
            className="group flex items-center gap-2 sm:gap-3 px-4 py-2.5 sm:px-6 sm:py-3 bg-indigo-900/60 hover:bg-indigo-800/80 text-indigo-200 rounded-lg transition-all border border-indigo-700/50 hover:border-indigo-500/70"
          >
            <Volume2 className="w-5 h-5 opacity-50 group-hover:opacity-100" />
            <span>Whisper</span>
          </button>

          <button
            onClick={onListen}
            className="group flex items-center gap-2 sm:gap-3 px-4 py-2.5 sm:px-6 sm:py-3 bg-gray-900/60 hover:bg-gray-800/80 text-gray-300 rounded-lg transition-all border border-gray-700/50 hover:border-gray-500/70"
          >
            <Eye className="w-5 h-5 opacity-50 group-hover:opacity-100" />
            <span>{listenLabel}</span>
          </button>
        </>
      )}

      {gameState === 'BROADCASTING' && (
        <div className="flex items-center gap-2 sm:gap-3 px-4 py-2.5 sm:px-6 sm:py-3 border border-blue-500/30 bg-blue-900/20 text-blue-300 rounded-lg animate-pulse">
          <Radio className="w-5 h-5 animate-spin" />
          <span>Transmitting Location...</span>
        </div>
      )}

      {gameState === 'WHISPERING' && (
        <div className="flex items-center gap-2 sm:gap-3 px-4 py-2.5 sm:px-6 sm:py-3 border border-indigo-500/30 bg-indigo-900/20 text-indigo-300 rounded-lg animate-pulse">
          <Volume2 className="w-5 h-5" />
          <span>Whispering...</span>
        </div>
      )}

      {gameState === 'LISTENING' && (
        <div className="flex items-center gap-2 sm:gap-3 px-4 py-2.5 sm:px-6 sm:py-3 border border-gray-500/30 bg-gray-900/20 text-gray-400 rounded-lg">
          <Eye className="w-5 h-5 animate-pulse" />
          <span>Observing the void...</span>
        </div>
      )}

      {(gameState === 'DETECTED' || gameState === 'DESTROYED') && (
        <button
          onClick={onReset}
          className="flex items-center gap-2 sm:gap-3 px-4 py-2.5 sm:px-6 sm:py-3 border border-gray-600 hover:border-gray-400 hover:bg-gray-800 text-gray-300 rounded-lg transition-all"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Rebirth Civilization</span>
        </button>
      )}
    </div>
  );
};

export default GameControls;
