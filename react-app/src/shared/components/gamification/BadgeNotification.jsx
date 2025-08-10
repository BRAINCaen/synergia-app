// ==========================================
// 📁 react-app/src/components/gamification/BadgeNotification.jsx
// NOUVEAU FICHIER - Composant de notification de badge débloqué
// ==========================================

import React, { useState, useEffect } from 'react';
import { Trophy, X, Zap, Star } from 'lucide-react';

/**
 * 🎊 COMPOSANT NOTIFICATION BADGE
 * Affiche une notification animée quand un badge est débloqué
 */
const BadgeNotification = ({ badge, onClose, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Animation d'entrée
    setIsAnimating(true);
    
    // Auto-fermeture
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    uncommon: 'from-green-400 to-green-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-600'
  };

  const rarityBorders = {
    common: 'border-gray-500',
    uncommon: 'border-green-500',
    rare: 'border-blue-500',
    epic: 'border-purple-500',
    legendary: 'border-yellow-500'
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
      isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`bg-white rounded-xl shadow-2xl border-2 ${rarityBorders[badge.rarity]} p-6 max-w-sm relative overflow-hidden`}>
        {/* Effet de brillance pour badges légendaires */}
        {badge.rarity === 'legendary' && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200 to-transparent opacity-30 animate-pulse" />
        )}

        {/* Bouton fermer */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Contenu */}
        <div className="text-center">
          {/* En-tête */}
          <div className="flex items-center justify-center mb-3">
            <Trophy className="w-6 h-6 text-yellow-500 mr-2" />
            <h3 className="text-lg font-bold text-gray-800">Badge Débloqué !</h3>
          </div>

          {/* Icône du badge */}
          <div className="text-6xl mb-3 animate-bounce">
            {badge.icon}
          </div>

          {/* Informations */}
          <h4 className="text-xl font-bold text-gray-800 mb-2">
            {badge.name}
          </h4>
          
          <p className="text-sm text-gray-600 mb-4">
            {badge.description}
          </p>

          {/* Rareté et récompense */}
          <div className="flex items-center justify-between text-sm">
            <div className={`px-3 py-1 rounded-full text-white font-semibold bg-gradient-to-r ${rarityColors[badge.rarity]}`}>
              {badge.rarity.toUpperCase()}
            </div>
            
            <div className="flex items-center text-orange-600 font-semibold">
              <Zap className="w-4 h-4 mr-1" />
              +{badge.xpReward} XP
            </div>
          </div>
        </div>

        {/* Particules pour badges épiques et légendaires */}
        {(badge.rarity === 'epic' || badge.rarity === 'legendary') && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <Star
                key={i}
                className={`absolute w-3 h-3 text-yellow-400 animate-ping`}
                style={{
                  top: `${20 + i * 15}%`,
                  left: `${10 + i * 15}%`,
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 🎊 GESTIONNAIRE DE NOTIFICATIONS DE BADGES
 * Composant global qui écoute les événements de badge et affiche les notifications
 */
const BadgeNotificationManager = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleBadgeUnlocked = (event) => {
      const { badge, timestamp } = event.detail;
      
      const notification = {
        id: `${badge.id}-${timestamp}`,
        badge,
        timestamp
      };

      setNotifications(prev => [...prev, notification]);

      // Jouer un son si disponible
      try {
        const audio = new Audio('/sounds/badge-unlock.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {
          // Ignore les erreurs de lecture audio
        });
      } catch (error) {
        // Son non disponible
      }
    };

    window.addEventListener('badgeUnlocked', handleBadgeUnlocked);
    
    return () => {
      window.removeEventListener('badgeUnlocked', handleBadgeUnlocked);
    };
  }, []);

  const removeNotification = (notificationId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  return (
    <div className="fixed top-0 right-0 z-50 space-y-2 p-4">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          style={{ 
            transform: `translateY(${index * 120}px)`,
            zIndex: 50 - index 
          }}
        >
          <BadgeNotification
            badge={notification.badge}
            onClose={() => removeNotification(notification.id)}
            duration={5000 + (index * 1000)} // Décaler la fermeture
          />
        </div>
      ))}
    </div>
  );
};

export default BadgeNotification;
export { BadgeNotificationManager };
