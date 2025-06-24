// ==========================================
// 📁 react-app/src/components/gamification/BadgeNotification.jsx
// Composant de notification visuelle pour badges débloqués
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
 */
const BadgeNotification = () => {
  const [notification, setNotification] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBadgeUnlocked = (event) => {
      const { badge } = event.detail;
      setNotification(badge);
      setIsVisible(true);

      // Auto-dismiss après 5 secondes
      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => setNotification(null), 500);
      }, 5000);
    };

    window.addEventListener('badgeUnlocked', handleBadgeUnlocked);

    return () => {
      window.removeEventListener('badgeUnlocked', handleBadgeUnlocked);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => setNotification(null), 500);
  };

  if (!notification) return null;

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

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: -100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -100 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 20,
            duration: 0.6
          }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          {/* Effet de particules en arrière-plan */}
          <div className="absolute inset-0 -z-10">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: 0, 
                  y: 0, 
                  scale: 0,
                  opacity: 1 
                }}
                animate={{ 
                  x: Math.random() * 200 - 100,
                  y: Math.random() * 200 - 100,
                  scale: [0, 1, 0],
                  opacity: [1, 1, 0]
                }}
                transition={{ 
                  duration: 2,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
                className={`absolute top-1/2 left-1/2 w-2 h-2 bg-gradient-to-r ${rarityColors[notification.rarity]} rounded-full`}
              />
            ))}
          </div>

          {/* Card principale */}
          <motion.div
            className={`
              bg-gray-800/95 backdrop-blur-md rounded-xl p-6 
              border border-gray-700/50 shadow-2xl ${rarityGlow[notification.rarity]}
              relative overflow-hidden
            `}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            {/* Effet de brillance animé */}
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 300, opacity: [0, 1, 0] }}
              transition={{ 
                duration: 1.5,
                delay: 0.5,
                ease: "easeOut"
              }}
              className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -z-10"
            />

            {/* Header avec badge rareté */}
            <div className="flex items-center justify-between mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                className={`
                  px-3 py-1 rounded-full text-xs font-bold text-white
                  bg-gradient-to-r ${rarityColors[notification.rarity]}
                  ${rarityGlow[notification.rarity]}
                `}
              >
                {notification.rarity.toUpperCase()}
              </motion.div>

              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Icône et titre */}
            <div className="flex items-center mb-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  delay: 0.4,
                  type: "spring",
                  stiffness: 200,
                  damping: 8
                }}
                className="text-6xl mr-4"
              >
                {notification.icon}
              </motion.div>

              <div>
                <motion.h3
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-xl font-bold text-white mb-1"
                >
                  Badge Débloqué !
                </motion.h3>
                
                <motion.h4
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className={`text-lg font-semibold bg-gradient-to-r ${rarityColors[notification.rarity]} bg-clip-text text-transparent`}
                >
                  {notification.name}
                </motion.h4>
              </div>
            </div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-gray-300 text-sm mb-4"
            >
              {notification.description}
            </motion.p>

            {/* XP Reward */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, type: "spring" }}
              className="flex items-center justify-center bg-gray-700/50 rounded-lg p-3"
            >
              <span className="text-yellow-400 font-bold text-lg">
                +{notification.xpReward} XP
              </span>
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ 
                  repeat: Infinity,
                  duration: 2,
                  delay: 1
                }}
                className="ml-2 text-yellow-400"
              >
                ✨
              </motion.div>
            </motion.div>

            {/* Progress indicator (auto-dismiss) */}
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 5, ease: "linear" }}
              className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${rarityColors[notification.rarity]} rounded-b-xl`}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BadgeNotification;
