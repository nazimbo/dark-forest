import { useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';

const STORAGE_KEY = 'dark-forest-onboarded';

const Onboarding = () => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(() => {
    try { return !localStorage.getItem(STORAGE_KEY); } catch { return true; }
  });

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* noop */ }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/98 flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <div className="mb-8">
          <div className="w-2 h-2 rounded-full bg-blue-500 mx-auto mb-6 animate-pulse" />
          <h2 className="text-2xl sm:text-3xl font-bold tracking-widest uppercase text-gray-200 mb-2">
            {t('ui.onboardingTitle')}
          </h2>
          <div className="w-16 h-px bg-blue-500/40 mx-auto" />
        </div>

        <p className="text-sm sm:text-base text-gray-400 leading-relaxed mb-4">
          {t('ui.onboardingText')}
        </p>

        <p className="text-xs sm:text-sm text-gray-600 italic mb-10">
          {t('ui.onboardingHint')}
        </p>

        <button
          onClick={dismiss}
          autoFocus
          className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(37,99,235,0.3)] tracking-wider uppercase text-sm"
        >
          {t('ui.onboardingBegin')}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
