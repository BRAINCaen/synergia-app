// ==========================================
// 📁 react-app/src/components/gamification/BadgeNotification.jsx
// Notification animée pour badges débloqués
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 🏆 COMPOSANT NOTIFICATION BADGE PRINCIPAL
 */
const BadgeNotification = ({ 
  badge, 
  isVisible, 
  onClose, 
  autoHideDuration = 5000 
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (isVisible && autoHideDuration > 0) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (autoHideDuration / 100));
          if (newProgress <= 0) {
            onClose();
            return 0;
          }
          return newProgress;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isVisible, autoHideDuration, onClose]);

  const getRarityColors = (rarity) => {
    switch (rarity) {
      case 'common':
        return {
          bg: 'from-gray-500 to-gray-600',
          border: 'border-gray-400',
          glow: 'shadow-gray-500/50'
        };
      case 'uncommon':
        return {
          bg: 'from-green-500 to-green-600',
          border: 'border-green-400',
          glow: 'shadow-green-500/50'
        };
      case 'rare':
        return {
          bg: 'from-blue-500 to-blue-600',
          border: 'border-blue-400',
          glow: 'shadow-blue-500/50'
        };
      case 'epic':
        return {
          bg: 'from-purple-500 to-purple-600',
          border: 'border-purple-400',
          glow: 'shadow-purple-500/50'
        };
      case 'legendary':
        return {
          bg: 'from-yellow-400 to-orange-500',
          border: 'border-yellow-300',
          glow: 'shadow-yellow-500/50'
        };
      default:
        return {
          bg: 'from-gray-500 to-gray-600',
          border: 'border-gray-400',
          glow: 'shadow-gray-500/50'
        };
    }
  };

  if (!badge) return null;

  const colors = getRarityColors(badge.rarity);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -50 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 20 
          }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <div 
            className={`
              bg-gradient-to-r ${colors.bg} 
              border-2 ${colors.border}
              rounded-2xl p-6 text-white 
              shadow-2xl ${colors.glow}
              backdrop-blur-sm
            `}
          >
            {/* Header avec animation d'étoiles */}
            <div className="relative mb-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute -top-2 -left-2 -right-2 -bottom-2"
              >
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: 0 }}
                    animate={{ 
                      scale: [0, 1.2, 0.8, 1],
                      rotate: [0, 180, 360]
                    }}
                    transition={{ 
                      delay: 0.1 * i,
                      duration: 1.5,
                      repeat: Infinity,
                      repeatDelay: 3
                    }}
                    className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                    }}
                  />
                ))}
              </motion.div>

              <div className="text-center relative z-10">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 200, 
                    delay: 0.2 
                  }}
                  className="text-6xl mb-2"
                >
                  {badge.icon}
                </motion.div>
                
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-xl font-bold mb-1"
                >
                  Badge Débloqué !
                </motion.h3>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                  className={`
                    inline-block px-3 py-1 rounded-full text-xs font-medium
                    ${badge.rarity === 'legendary' ? 'bg-yellow-200 text-yellow-800' :
                      badge.rarity === 'epic' ? 'bg-purple-200 text-purple-800' :
                      badge.rarity === 'rare' ? 'bg-blue-200 text-blue-800' :
                      badge.rarity === 'uncommon' ? 'bg-green-200 text-green-800' :
                      'bg-gray-200 text-gray-800'}
                  `}
                >
                  {badge.rarity?.toUpperCase()}
                </motion.div>
              </div>
            </div>

            {/* Contenu du badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-center"
            >
              <h4 className="text-lg font-semibold mb-2">{badge.name}</h4>
              <p className="text-sm opacity-90 mb-4">{badge.description}</p>
              
              <div className="flex items-center justify-center space-x-4">
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-300">⭐</span>
                  <span className="text-sm font-medium">+{badge.xp} XP</span>
                </div>
              </div>
            </motion.div>

            {/* Barre de progression auto-hide */}
            {autoHideDuration > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-4"
              >
                <div className="w-full bg-black/20 rounded-full h-1">
                  <motion.div
                    className="h-1 bg-white rounded-full"
                    style={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              </motion.div>
            )}

            {/* Bouton fermer */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              onClick={onClose}
              className="absolute top-2 right-2 w-6 h-6 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center text-xs transition-colors"
            >
              ✕
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * 🎊 GESTIONNAIRE DE NOTIFICATIONS BADGES
 */
export const BadgeNotificationManager = () => {
  const [notifications, setNotifications] = useState([]);

  const showBadgeNotification = (badge) => {
    const id = Date.now() + Math.random();
    const notification = { id, badge, isVisible: true };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove après animation
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 6000);
  };

  const closeBadgeNotification = (id) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === id ? { ...n, isVisible: false } : n
      )
    );
    
    // Remove from list après animation
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 500);
  };

  // Exposer globalement pour usage facile
  useEffect(() => {
    window.showBadgeNotification = showBadgeNotification;
    return () => {
      delete window.showBadgeNotification;
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          style={{ 
            transform: `translateY(${index * 120}px)`,
            transition: 'transform 0.3s ease'
          }}
        >
          <BadgeNotification
            badge={notification.badge}
            isVisible={notification.isVisible}
            onClose={() => closeBadgeNotification(notification.id)}
            autoHideDuration={5000}
          />
        </div>
      ))}
    </div>
  );
};

export default BadgeNotification;
