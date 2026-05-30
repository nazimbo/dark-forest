// Shared button for the game-control actions. Encapsulates the common shape
// (touch target, spacing, transitions) so callers only vary by `variant`,
// icon, and label.

const BASE =
  'group flex items-center justify-center gap-2.5 sm:gap-3 px-4 py-2.5 sm:px-6 sm:py-3 min-h-[44px] rounded-lg transition-all text-sm sm:text-base';

const VARIANTS = {
  primary: 'bg-blue-600 hover:bg-blue-500 text-white transform hover:scale-105 shadow-glow',
  indigo: 'bg-indigo-900/60 hover:bg-indigo-800/80 text-indigo-200 border border-indigo-700/50 hover:border-indigo-500/70',
  gray: 'bg-gray-900/60 hover:bg-gray-800/80 text-gray-300 border border-gray-700/50 hover:border-gray-500/70',
  neutral: 'bg-white/10 hover:bg-white/20 text-gray-200 border border-white/20 hover:border-white/40',
  outline: 'border border-gray-600 hover:border-gray-400 hover:bg-gray-800 text-gray-300',
};

const ActionButton = ({ variant = 'neutral', className = '', children, ...props }) => (
  <button className={`${BASE} ${VARIANTS[variant]} ${className}`.trim()} {...props}>
    {children}
  </button>
);

export default ActionButton;
