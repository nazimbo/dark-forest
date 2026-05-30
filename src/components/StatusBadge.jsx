// Non-interactive status indicator shown while an action is resolving
// (transmitting / whispering / observing). Announced politely to assistive tech.

const BASE =
  'flex items-center justify-center gap-2.5 sm:gap-3 px-4 py-2.5 sm:px-6 sm:py-3 border rounded-lg text-sm sm:text-base';

const TONES = {
  blue: 'border-blue-500/30 bg-blue-900/20 text-blue-300',
  indigo: 'border-indigo-500/30 bg-indigo-900/20 text-indigo-300',
  gray: 'border-gray-500/30 bg-gray-900/20 text-gray-400',
};

const StatusBadge = ({ tone = 'gray', pulse = false, icon, label }) => (
  <div
    role="status"
    aria-live="polite"
    className={`${BASE} ${TONES[tone]} ${pulse ? 'animate-pulse' : ''}`.trim()}
  >
    {icon}
    <span>{label}</span>
  </div>
);

export default StatusBadge;
