// ==========================================
// react-app/src/components/pwa/OfflineIndicator.jsx
// INDICATEUR HORS LIGNE - SYNERGIA v4.0
// Module: Affichage statut connexion
// ==========================================

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnlineStatus, useOffline } from '../../hooks/useOffline';

export default function OfflineIndicator() {
  const { isOnline, wasOffline } = useOnlineStatus();
  const { pendingActions, syncInProgress, syncNow } = useOffline();
  const [showReconnected, setShowReconnected] = useState(false);

  // Afficher le message "reconnecte" quand on repasse en ligne
  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  return (
    <>
      {/* Barre hors ligne */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-amber-500 to-orange-500
                     px-4 py-2 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-white">
              <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-sm font-medium">
                Vous etes hors ligne
              </span>
              {pendingActions > 0 && (
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {pendingActions} actions en attente
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast reconnexion */}
      <AnimatePresence>
        {showReconnected && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[9999]
                     bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg
                     flex items-center gap-3"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Connexion retablie</span>

            {pendingActions > 0 && (
              <button
                onClick={syncNow}
                disabled={syncInProgress}
                className="px-3 py-1 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition-colors"
              >
                {syncInProgress ? 'Sync...' : 'Synchroniser'}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Indicateur de sync en cours */}
      <AnimatePresence>
        {syncInProgress && isOnline && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[9998] bg-slate-800 text-white
                     px-4 py-2 rounded-xl shadow-lg flex items-center gap-2"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
            />
            <span className="text-sm">Synchronisation...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
