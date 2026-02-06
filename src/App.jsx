import { useSimulation } from './hooks/useSimulation';
import { useSound } from './hooks/useSound';
import NarrativePanel from './components/NarrativePanel';
import GameControls from './components/GameControls';

const App = () => {
  const sound = useSound();
  const { canvasRef, gameState, civCount, broadcast, whisper, listen, reset } = useSimulation(sound);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans text-gray-200">
      <canvas ref={canvasRef} className="absolute top-0 left-0 z-0" />

      <div className="relative z-10 w-full h-full flex flex-col pointer-events-none">
        <header className="p-8 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
          <h1 className="text-2xl tracking-widest uppercase font-bold text-gray-400 border-l-4 border-blue-500 pl-4">
            Dark Forest <span className="text-gray-600">Simulator</span>
          </h1>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            {gameState}
          </div>
        </header>

        <div className="flex-1 flex items-center p-8 lg:p-16">
          <NarrativePanel gameState={gameState} civCount={civCount}>
            <GameControls
              gameState={gameState}
              onBroadcast={broadcast}
              onWhisper={whisper}
              onListen={listen}
              onReset={reset}
            />
          </NarrativePanel>
        </div>

        <footer className="p-8 text-center text-xs text-gray-700 pointer-events-auto">
          "The universe is a dark forest." &mdash; Liu Cixin
        </footer>
      </div>

      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]"></div>
    </div>
  );
};

export default App;
