import { Info } from 'lucide-react';
import { NARRATIVES } from '../narratives';

const NarrativePanel = ({ gameState, civCount, children }) => {
  const narrative = NARRATIVES[gameState] || NARRATIVES.START;

  return (
    <div className="max-w-md space-y-6 pointer-events-auto bg-black/60 backdrop-blur-sm p-8 rounded-xl border border-gray-800 shadow-2xl transition-all duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-blue-400">
          <Info size={20} />
          <span className="uppercase text-xs tracking-widest font-semibold">Cosmic Axiom</span>
        </div>
        <div className="text-xs text-gray-600 font-mono tabular-nums">
          {civCount} civilizations
        </div>
      </div>

      <h2 className="text-3xl font-light text-white leading-tight transition-all">
        {narrative.title}
      </h2>

      <p className="text-lg text-gray-300 leading-relaxed transition-all">
        {narrative.text}
      </p>

      <div className="border-t border-gray-700 pt-4">
        <p className="text-sm text-gray-500 italic">
          {narrative.subtext}
        </p>
      </div>

      {children}
    </div>
  );
};

export default NarrativePanel;
