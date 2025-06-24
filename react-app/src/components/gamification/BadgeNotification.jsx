// ==========================================
// 📁 react-app/src/components/gamification/BadgeNotification.jsx
// Composant de notification visuelle pour badges débloqués - VERSION AMÉLIORÉE
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 🏆 COMPOSANT NOTIFICATION BADGE
 * 
 * Affiche une animation élégante quand un badge est débloqué
 * - Animation d'entrée avec confettis
 * - Son de célébration (optionnel)
 * - Auto-dismiss après 5 secondes
 * - Effet de particules et glow
 * - Support multi-notifications
 */
const BadgeNotification = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleBadgeUnlocked = (event) => {
      const { badge } = event.detail;
      const notification = {
        id: Date.now() + Math.random(),
        badge,
        timestamp: Date.now()
      };

      setNotifications(prev => [...prev, notification]);

      // Auto-dismiss après 5 secondes
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 5000);
    };

    window.addEventListener('badgeUnlocked', handleBadgeUnlocked);

    return () => {
      window.removeEventListener('badgeUnlocked', handleBadgeUnlocked);
    };
  }, []);

  const handleDismiss = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    uncommon: 'from-green-400 to-green-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-600'
  };

  const rarityGlow = {
    common: 'shadow-gray-400/50',
    uncommon: 'shadow-green-400/50',
    rare: 'shadow-blue-400/50',
    epic: 'shadow-purple-400/50',
    legendary: 'shadow-yellow-400/50'
  };

  const rarityBorder = {
    common: 'border-gray-400',
    uncommon: 'border-green-400',
    rare: 'border-blue-400',
    epic: 'border-purple-400',
    legendary: 'border-yellow-400'
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-4 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, scale: 0.5, x: 100 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              x: 0,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 20
              }
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.8, 
              x: 100,
              transition: { duration: 0.3 }
            }}
            className="pointer-events-auto"
          >
            <div className={`
              relative bg-white border-2 rounded-xl p-6 shadow-2xl
              ${rarityBorder[notification.badge.rarity || 'common']}
              ${rarityGlow[notification.badge.rarity || 'common']}
              max-w-sm
            `}>
              {/* Effet de brillance */}
              <div className="absolute inset-0 rounded-xl opacity-20 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
              
              {/* Bouton fermer */}
              <button
                onClick={() => handleDismiss(notification.id)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Contenu principal */}
              <div className="text-center">
                {/* Animation de l'icône */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ 
                    scale: 1, 
                    rotate: 0,
                    transition: {
                      delay: 0.2,
                      type: "spring",
                      stiffness: 200
                    }
                  }}
                  className="text-6xl mb-3 relative"
                >
                  {notification.badge.icon}
                  
                  {/* Particules d'effet */}
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ 
                          scale: [0, 1, 0],
                          opacity: [0, 1, 0],
                          x: [0, (i % 2 ? 1 : -1) * (20 + i * 10)],
                          y: [0, -20 - i * 5]
                        }}
                        transition={{
                          delay: 0.3 + i * 0.1,
                          duration: 1,
                          ease: "easeOut"
                        }}
                        className={`
                          absolute top-1/2 left-1/2 w-2 h-2 rounded-full
                          bg-gradient-to-r ${rarityColors[notification.badge.rarity || 'common']}
                        `}
                        style={{
                          transform: 'translate(-50%, -50%)'
                        }}
                      />
                    ))}
                  </div>
                </motion.div>

                {/* Titre avec animation */}
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { delay: 0.4 }
                  }}
                  className="text-lg font-bold text-gray-900 mb-1"
                >
                  🎉 Badge débloqué !
                </motion.h3>

                {/* Nom du badge */}
                <motion.h4
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { delay: 0.5 }
                  }}
                  className="text-xl font-bold text-gray-800 mb-2"
                >
                  {notification.badge.name}
                </motion.h4>

                {/* Badge de rareté */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    transition: { delay: 0.6 }
                  }}
                  className={`
                    inline-block px-3 py-1 rounded-full text-sm font-bold text-white mb-3
                    bg-gradient-to-r ${rarityColors[notification.badge.rarity || 'common']}
                  `}
                >
                  {(notification.badge.rarity || 'common').toUpperCase()}
                </motion.div>

                {/* Description */}
                {notification.badge.description && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: 1,
                      transition: { delay: 0.7 }
                    }}
                    className="text-sm text-gray-600 mb-3"
                  >
                    {notification.badge.description}
                  </motion.p>
                )}

                {/* Récompense XP */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    transition: { delay: 0.8 }
                  }}
                  className="bg-yellow-50 border border-yellow-200 rounded-lg p-2"
                >
                  <div className="text-yellow-800 font-bold">
                    +{notification.badge.xpReward || 0} XP
                  </div>
                  <div className="text-yellow-600 text-xs">
                    Récompense obtenue
                  </div>
                </motion.div>
              </div>

              {/* Barre de progression auto-dismiss */}
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 5, ease: "linear" }}
                className={`
                  absolute bottom-0 left-0 h-1 rounded-b-xl
                  bg-gradient-to-r ${rarityColors[notification.badge.rarity || 'common']}
                `}
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

/**
 * 🎊 COMPOSANT CONFETTIS (optionnel)
 * Effet de confettis pour les badges légendaires
 */
export const ConfettiEffect = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            opacity: 0,
            scale: 0,
            x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
            y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0.5],
            x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 0,
            y: typeof window !== 'undefined' ? window.innerHeight + 100 : 0,
            rotate: 360
          }}
          transition={{
            duration: 3,
            delay: i * 0.1,
            ease: "easeOut"
          }}
          className="absolute w-3 h-3 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full"
        />
      ))}
    </div>
  );
};

export default BadgeNotification;
