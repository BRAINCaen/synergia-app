// ==========================================
// 📁 react-app/src/components/notifications/PushNotificationPrompt.jsx
// BANNIÈRE POUR ACTIVER LES NOTIFICATIONS PUSH
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, BellRing, Smartphone, Check } from 'lucide-react';
import { usePushNotifications } from '../../hooks/usePushNotifications';

/**
 * Bannière pour demander l'activation des notifications push
 */
export const PushNotificationPrompt = () => {
  const {
    isSupported,
    permission,
    isEnabled,
    isLoading,
    error,
    enableNotifications
  } = usePushNotifications();

  const [dismissed, setDismissed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Vérifier si on a déjà demandé
  useEffect(() => {
    const alreadyAsked = localStorage.getItem('push_notification_asked');
    if (alreadyAsked) {
      setDismissed(true);
    }
  }, []);

  // Ne pas afficher si:
  // - Non supporté
  // - Déjà activé
  // - Déjà refusé définitivement
  // - Déjà dismissé
  if (!isSupported || isEnabled || permission === 'denied' || dismissed) {
    return null;
  }

  const handleEnable = async () => {
    const success = await enableNotifications();
    if (success) {
      setShowSuccess(true);
      setTimeout(() => {
        setDismissed(true);
      }, 2000);
    }
    localStorage.setItem('push_notification_asked', 'true');
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('push_notification_asked', 'true');
  };

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto"
        >
          <div className="bg-gradient-to-r from-purple-900/95 to-indigo-900/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-4 shadow-2xl shadow-purple-500/20">
            {showSuccess ? (
              // Message de succès
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-3 text-green-400"
              >
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold">Notifications activées !</p>
                  <p className="text-sm text-green-300/70">Tu recevras les alertes importantes</p>
                </div>
              </motion.div>
            ) : (
              // Demande de permission
              <>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
                    >
                      <BellRing className="w-6 h-6 text-purple-400" />
                    </motion.div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-sm sm:text-base flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-purple-400" />
                      Active les notifications
                    </h3>
                    <p className="text-gray-300 text-xs sm:text-sm mt-1">
                      Reçois les alertes de quêtes, boosts et messages même quand l'app est fermée
                    </p>

                    {error && (
                      <p className="text-red-400 text-xs mt-2">
                        {error}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleDismiss}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleDismiss}
                    className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-colors"
                  >
                    Plus tard
                  </button>
                  <button
                    onClick={handleEnable}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                    ) : (
                      <>
                        <Bell className="w-4 h-4" />
                        Activer
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PushNotificationPrompt;
