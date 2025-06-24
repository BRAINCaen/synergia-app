// ==========================================
// 📁 react-app/src/components/gamification/BadgeNotification.jsx
// Notifications visuelles animées pour les badges débloqués
// ==========================================

import React, { useState, useEffect } from 'react';

/**
 * 🎉 COMPOSANT NOTIFICATION BADGE
 * 
 * Affiche des notifications visuelles animées quand un badge est débloqué
 * avec des effets de confettis et des animations CSS modernes
 */
const BadgeNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    // 🎧 Écouter les événements de badges débloqués
    const handleBadgeUnlocked = (event) => {
      const { badge, timestamp } = event.detail;
      
      // Créer une nouvelle notification
      const notification = {
        id: `badge-${badge.id}-${timestamp.getTime()}`,
        badge,
        timestamp,
        visible: false // Pour déclencher l'animation d'entrée
      };

      // Ajouter la notification
      setNotifications(prev => [...prev, notification]);

      // Déclencher l'animation d'entrée après un petit délai
      setTimeout(() => {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notification.id 
              ? { ...notif, visible: true }
              : notif
          )
        );
      }, 100);

      // 🔊 Jouer le son de notification
      if (soundEnabled) {
        playNotificationSound(badge.rarity);
      }

      // 🎊 Déclencher les effets de confettis
      createConfettiEffect();

      // Auto-supprimer après 5 secondes
      setTimeout(() => {
        removeNotification(notification.id);
      }, 5000);
    };

    // Écouter les événements personnalisés
    window.addEventListener('badgeUnlocked', handleBadgeUnlocked);

    // Cleanup
    return () => {
      window.removeEventListener('badgeUnlocked', handleBadgeUnlocked);
    };
  }, [soundEnabled]);

  /**
   * 🔊 JOUER LE SON DE NOTIFICATION
   * Sons différents selon la rareté du badge
   */
  const playNotificationSound = (rarity) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Fréquences différentes selon la rareté
      const frequencies = {
        common: [523, 659, 784],      // Do, Mi, Sol
        uncommon: [523, 659, 784, 988], // Do, Mi, Sol, Si
        rare: [659, 784, 988, 1318],   // Mi, Sol, Si, Mi octave
        epic: [523, 659, 784, 988, 1318], // Gamme complète
        legendary: [523, 659, 784, 988, 1318, 1568] // Gamme étendue
      };

      const noteFrequencies = frequencies[rarity] || frequencies.common;
      const noteDuration = 150;

      // Jouer chaque note avec un délai
      noteFrequencies.forEach((frequency, index) => {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
          oscillator.type = 'triangle';
          
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + noteDuration / 1000);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + noteDuration / 1000);
        }, index * (noteDuration / 2));
      });

    } catch (error) {
      console.log('🔇 Audio non disponible:', error);
    }
  };

  /**
   * 🎊 CRÉER L'EFFET DE CONFETTIS
   * Animation de particules CSS pour célébrer
   */
  const createConfettiEffect = () => {
    const confettiCount = 50;
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];
    
    for (let i = 0; i < confettiCount; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-particle';
        confetti.style.cssText = `
          position: fixed;
          top: 20%;
          left: ${50 + (Math.random() - 0.5) * 60}%;
          width: ${Math.random() * 10 + 5}px;
          height: ${Math.random() * 10 + 5}px;
          background-color: ${colors[Math.floor(Math.random() * colors.length)]};
          transform: rotate(${Math.random() * 360}deg);
          animation: confettiFall ${2 + Math.random() * 3}s ease-out forwards;
          pointer-events: none;
          z-index: 10000;
          border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        `;
        
        document.body.appendChild(confetti);
        
        // Supprimer après l'animation
        setTimeout(() => {
          if (confetti.parentNode) {
            confetti.parentNode.removeChild(confetti);
          }
        }, 5000);
      }, i * 50);
    }
  };

  /**
   * ❌ SUPPRIMER UNE NOTIFICATION
   */
  const removeNotification = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, visible: false }
          : notif
      )
    );

    // Supprimer définitivement après l'animation de sortie
    setTimeout(() => {
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    }, 500);
  };

  /**
   * 🎨 OBTENIR LA CLASSE CSS SELON LA RARETÉ
   */
  const getRarityClass = (rarity) => {
    const classes = {
      common: 'border-gray-400 bg-gray-50',
      uncommon: 'border-green-400 bg-green-50',
      rare: 'border-blue-400 bg-blue-50',
      epic: 'border-purple-400 bg-purple-50',
      legendary: 'border-yellow-400 bg-yellow-50'
    };
    return classes[rarity] || classes.common;
  };

  /**
   * ✨ OBTENIR LES EFFETS VISUELS SELON LA RARETÉ
   */
  const getRarityEffects = (rarity) => {
    const effects = {
      common: '',
      uncommon: 'shadow-green-200',
      rare: 'shadow-blue-200 shadow-lg',
      epic: 'shadow-purple-200 shadow-xl',
      legendary: 'shadow-yellow-200 shadow-2xl animate-pulse'
    };
    return effects[rarity] || '';
  };

  return (
    <>
      {/* 🎨 STYLES CSS POUR LES ANIMATIONS */}
      <style jsx>{`
        @keyframes confettiFall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes badgeSlideIn {
          0% {
            transform: translateX(100%) scale(0.8);
            opacity: 0;
          }
          60% {
            transform: translateX(-10px) scale(1.1);
          }
          100% {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes badgeSlideOut {
          0% {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateX(100%) scale(0.8);
            opacity: 0;
          }
        }

        @keyframes badgePulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .badge-notification-enter {
          animation: badgeSlideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .badge-notification-exit {
          animation: badgeSlideOut 0.4s ease-in-out;
        }

        .badge-icon-pulse {
          animation: badgePulse 2s ease-in-out infinite;
        }
      `}</style>

      {/* 📍 CONTENEUR DES NOTIFICATIONS */}
      <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`
              transform transition-all duration-500 pointer-events-auto
              ${notification.visible 
                ? 'badge-notification-enter' 
                : 'badge-notification-exit'
              }
            `}
          >
            <div
              className={`
                relative overflow-hidden rounded-xl border-2 p-4 pr-12
                backdrop-blur-sm shadow-lg max-w-sm
                ${getRarityClass(notification.badge.rarity)}
                ${getRarityEffects(notification.badge.rarity)}
              `}
            >
              {/* ✨ EFFET DE BRILLANCE POUR LES BADGES RARES */}
              {(notification.badge.rarity === 'epic' || notification.badge.rarity === 'legendary') && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform -skew-x-12 animate-ping"></div>
              )}

              {/* 🏆 CONTENU DE LA NOTIFICATION */}
              <div className="flex items-center space-x-3">
                {/* Icône du badge avec animation */}
                <div className={`
                  text-3xl badge-icon-pulse
                  ${notification.badge.rarity === 'legendary' ? 'filter drop-shadow-lg' : ''}
                `}>
                  {notification.badge.icon}
                </div>

                {/* Informations du badge */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-gray-900 truncate">
                      {notification.badge.name}
                    </h3>
                    <span className={`
                      px-2 py-1 text-xs font-medium rounded-full
                      ${notification.badge.rarity === 'common' ? 'bg-gray-200 text-gray-700' : ''}
                      ${notification.badge.rarity === 'uncommon' ? 'bg-green-200 text-green-700' : ''}
                      ${notification.badge.rarity === 'rare' ? 'bg-blue-200 text-blue-700' : ''}
                      ${notification.badge.rarity === 'epic' ? 'bg-purple-200 text-purple-700' : ''}
                      ${notification.badge.rarity === 'legendary' ? 'bg-yellow-200 text-yellow-700' : ''}
                    `}>
                      {notification.badge.rarity.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.badge.description}
                  </p>
                  
                  {/* XP Reward */}
                  <div className="flex items-center space-x-1 mt-2">
                    <span className="text-xs text-yellow-600 font-medium">
                      +{notification.badge.xpReward} XP
                    </span>
                    <span className="text-yellow-500">⭐</span>
                  </div>
                </div>
              </div>

              {/* ❌ BOUTON DE FERMETURE */}
              <button
                onClick={() => removeNotification(notification.id)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 
                          flex items-center justify-center text-gray-500 hover:text-gray-700
                          transition-colors duration-200"
                aria-label="Fermer la notification"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 🔧 CONTRÔLES DE NOTIFICATION (DEBUG) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-3 space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <label className="text-gray-700">Sons:</label>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`
                  px-2 py-1 rounded text-xs font-medium
                  ${soundEnabled 
                    ? 'bg-green-200 text-green-700' 
                    : 'bg-red-200 text-red-700'
                  }
                `}
              >
                {soundEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
            
            <button
              onClick={() => {
                // Test de notification
                window.dispatchEvent(new CustomEvent('badgeUnlocked', {
                  detail: {
                    badge: {
                      id: 'test-badge',
                      name: 'Test Badge',
                      icon: '🧪',
                      description: 'Badge de test pour développement',
                      rarity: 'epic',
                      xpReward: 100
                    },
                    timestamp: new Date()
                  }
                }));
              }}
              className="w-full px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
            >
              Test Notification
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BadgeNotification;
