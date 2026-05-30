import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../i18n/LanguageContext';

const STORAGE_KEY = 'dark-forest-onboarded';

const Onboarding = () => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(() => {
    try { return !localStorage.getItem(STORAGE_KEY); } catch { return true; }
  });
  const dialogRef = useRef(null);
  const buttonRef = useRef(null);
  // Element to restore focus to after the dialog closes.
  const restoreFocusRef = useRef(null);

  const dismiss = () => {
    setVisible(false);
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* noop */ }
  };

  // Modal behaviour: capture/restore focus, trap Tab inside, close on Escape.
  useEffect(() => {
    if (!visible) return;
    restoreFocusRef.current = document.activeElement;
    buttonRef.current?.focus();

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        dismiss();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusable = dialogRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      // Return focus to wherever it was before the dialog opened.
      if (restoreFocusRef.current instanceof HTMLElement) {
        restoreFocusRef.current.focus();
      }
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      aria-describedby="onboarding-desc"
      className="fixed inset-0 z-50 bg-black/98 flex items-center justify-center px-6"
    >
      <div className="text-center max-w-lg">
        <div className="mb-8">
          <div className="w-2 h-2 rounded-full bg-blue-500 mx-auto mb-6 animate-pulse" aria-hidden="true" />
          <h2 id="onboarding-title" className="text-2xl sm:text-3xl font-bold tracking-widest uppercase text-gray-200 mb-2">
            {t('ui.onboardingTitle')}
          </h2>
          <div className="w-16 h-px bg-blue-500/40 mx-auto" aria-hidden="true" />
        </div>

        <p id="onboarding-desc" className="text-sm sm:text-base text-gray-400 leading-relaxed mb-4">
          {t('ui.onboardingText')}
        </p>

        <p className="text-xs sm:text-sm text-gray-400 italic mb-10">
          {t('ui.onboardingHint')}
        </p>

        <button
          ref={buttonRef}
          onClick={dismiss}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(37,99,235,0.3)] tracking-wider uppercase text-sm"
        >
          {t('ui.onboardingBegin')}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
