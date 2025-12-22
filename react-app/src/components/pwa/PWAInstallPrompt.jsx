// ==========================================
// react-app/src/components/pwa/PWAInstallPrompt.jsx
// PROMPT INSTALLATION PWA - SYNERGIA v4.0
// Module: UI pour installation PWA
// ==========================================

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePWAInstall } from '../../hooks/useOffline';

export default function PWAInstallPrompt() {
  const { isInstalled, isInstallable, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [installing, setInstalling] = useState(false);

  // Verifier si deja dismiss dans localStorage
  useEffect(() => {
    const dismissedAt = localStorage.getItem('pwa_prompt_dismissed');
    if (dismissedAt) {
      const dismissDate = new Date(dismissedAt);
      const daysSince = (Date.now() - dismissDate.getTime()) / (1000 * 60 * 60 * 24);
      // Re-afficher apres 7 jours
      if (daysSince < 7) {
        setDismissed(true);
      }
    }
  }, []);

  const handleInstall = async () => {
    setInstalling(true);
    const success = await install();
    setInstalling(false);
    if (success) {
      setDismissed(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('pwa_prompt_dismissed', new Date().toISOString());
  };

  // Ne pas afficher si installe, non installable, ou dismiss
  if (isInstalled || !isInstallable || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-6 left-4 right-4 z-50 sm:left-auto sm:right-6 sm:w-96"
      >
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-4 shadow-2xl
                      border border-white/10">
          <div className="flex items-start gap-4">
            {/* Icone */}
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center
                          flex-shrink-0">
              <span className="text-2xl">📱</span>
            </div>

            {/* Contenu */}
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-base">Installer Synergia</h3>
              <p className="text-white/80 text-sm mt-0.5">
                Accedez rapidement depuis votre ecran d&apos;accueil, meme hors ligne !
              </p>

              {/* Avantages */}
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs text-white/80">
                  Acces rapide
                </span>
                <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs text-white/80">
                  Mode hors ligne
                </span>
                <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs text-white/80">
                  Notifications
                </span>
              </div>

              {/* Boutons */}
              <div className="flex items-center gap-2 mt-3">
                <motion.button
                  onClick={handleInstall}
                  disabled={installing}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-white text-indigo-600 font-semibold rounded-lg
                           hover:bg-white/90 transition-colors flex items-center gap-2
                           disabled:opacity-70"
                >
                  {installing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full"
                      />
                      Installation...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Installer
                    </>
                  )}
                </motion.button>

                <button
                  onClick={handleDismiss}
                  className="px-3 py-2 text-white/70 hover:text-white text-sm transition-colors"
                >
                  Plus tard
                </button>
              </div>
            </div>

            {/* Bouton fermer */}
            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
            >
              <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
