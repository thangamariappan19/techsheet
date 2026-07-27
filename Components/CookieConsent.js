'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cookie, Settings } from 'lucide-react';

const CONSENT_KEY = 'techsheet-cookie-consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [prefs, setPrefs] = useState({ analytics: false, advertising: false });

  useEffect(() => {
    let timer;
    const saved = localStorage.getItem(CONSENT_KEY);
    if (!saved) {
      timer = setTimeout(() => setVisible(true), 800);
    }

    const openHandler = () => {
      try {
        const c = JSON.parse(localStorage.getItem(CONSENT_KEY) || '{}');
        setPrefs({ analytics: !!c.analytics, advertising: !!c.advertising });
      } catch {}
      setExpanded(true);
      setVisible(true);
    };
    window.addEventListener('open-cookie-settings', openHandler);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('open-cookie-settings', openHandler);
    };
  }, []);

  function save(consent) {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    window.dispatchEvent(new CustomEvent('cookie-consent-update', { detail: consent }));
    setVisible(false);
    setExpanded(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-80 z-50 bg-card border border-border shadow-2xl rounded-2xl p-5"
        >
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <div className="bg-primary/10 p-2 rounded-xl shrink-0">
              <Cookie className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-foreground">Cookie Settings</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                We use cookies for analytics and ads.{' '}
                <a href="/privacy" className="underline hover:text-primary transition-colors">
                  Learn more
                </a>
              </p>
            </div>
            <button
              onClick={() => save({ analytics: false, advertising: false })}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors mt-0.5"
              aria-label="Reject all and close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Expandable customize panel */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mb-4 space-y-3 border border-border/60 rounded-xl p-3 bg-muted/30">
                  <CookieToggle
                    label="Essential"
                    desc="Site functionality (always on)"
                    checked
                    disabled
                  />
                  <CookieToggle
                    label="Analytics"
                    desc="Google Analytics — page views & usage"
                    checked={prefs.analytics}
                    onChange={v => setPrefs(p => ({ ...p, analytics: v }))}
                  />
                  <CookieToggle
                    label="Advertising"
                    desc="Google AdSense — personalized ads"
                    checked={prefs.advertising}
                    onChange={v => setPrefs(p => ({ ...p, advertising: v }))}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button
                onClick={() => save({ analytics: true, advertising: true })}
                className="flex-1 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
              >
                Accept All
              </button>
              <button
                onClick={() => save({ analytics: false, advertising: false })}
                className="flex-1 px-3 py-2 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-muted/50 transition-colors"
              >
                Reject All
              </button>
            </div>
            <button
              onClick={() => expanded ? save(prefs) : setExpanded(true)}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <Settings className="w-3 h-3" />
              {expanded ? 'Save My Choices' : 'Customize'}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CookieToggle({ label, desc, checked, onChange, disabled }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-xs font-bold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange?.(!checked)}
        className={`w-9 h-5 rounded-full flex items-center px-1 transition-colors shrink-0 ${
          checked ? 'bg-primary' : 'bg-muted-foreground/30'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div
          className={`w-3 h-3 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
