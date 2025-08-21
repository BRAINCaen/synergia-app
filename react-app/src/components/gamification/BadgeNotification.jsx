// ==========================================
// 📁 react-app/src/components/gamification/BadgeNotification.jsx
// COMPOSANT NOTIFICATION BADGES - VERSION BUILD NETLIFY
// SANS EXPORTS DUPLIQUÉS
// ==========================================

import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, X, Zap, Star, Crown, Sparkles } from 'lucide-react';

/**
 * 🎊 COMPOSANT NOTIFICATION BADGE CORRIGÉ
 * Version sans erreurs Firebase avec gestion d'événements propre
 */
const BadgeNotification = ({ 
  badge = null, 
  isVisible = false,
  onClose = null, 
  duration = 5000,
  position = 'top-right'
}) => {
  const [showNotification, setShowNotification] = useState(isVisible);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentBadge, setCurrentBadge] = useState(badge);

  // Queue pour gérer plusieurs notifications
  const [notificationQueue, setNotificationQueue] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * 🎯 GESTION DES ÉVÉNEMENTS GLOBAUX DE BADGES
   */
  useEffect(() => {
    const handleBadgeUnlocked = (event) => {
      const { badge: newBadge } = event.detail || {};
      if (newBadge) {
        console.log('🎊 Notification badge reçue:', newBadge.name);
        addToQueue(newBadge);
      }
    };

    // Écouter les événements personnalisés de badges
    if (typeof window !== 'undefined') {
      window.addEventListener('badgeUnlocked', handleBadgeUnlocked);
      
      // Nettoyage
      return () => {
        window.removeEventListener('badgeUnlocked', handleBadgeUnlocked);
      };
    }
  }, []);

  /**
   * 📥 AJOUTER À LA QUEUE DE NOTIFICATIONS
   */
  const addToQueue = useCallback((newBadge) => {
    setNotificationQueue(prev => [...prev, newBadge]);
  }, []);

  /**
   * 🔄 TRAITER LA QUEUE DE NOTIFICATIONS
   */
  useEffect(() => {
    if (notificationQueue.length > 0 && !isProcessing) {
      setIsProcessing(true);
      const nextBadge = notificationQueue[0];
      
      setCurrentBadge(nextBadge);
      setShowNotification(true);
      setIsAnimating(true);
      
      // Retirer de la queue
      setNotificationQueue(prev => prev.slice(1));
      
      // Auto-fermeture
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [notificationQueue, isProcessing, duration]);

  /**
   * 🎯 AFFICHAGE DIRECT D'UN BADGE (API EXTERNE)
   */
  useEffect(() => {
    if (badge && isVisible) {
      setCurrentBadge(badge);
      setShowNotification(true);
      setIsAnimating(true);
      
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [badge, isVisible, duration]);

  /**
   * ❌ FERMER LA NOTIFICATION
   */
  const handleClose = useCallback(() => {
    setIsAnimating(false);
    
    setTimeout(() => {
      setShowNotification(false);
      setIsProcessing(false);
      onClose?.(currentBadge);
    }, 300);
  }, [currentBadge, onClose]);

  /**
   * 🎨 CONFIGURATION DES COULEURS PAR RARETÉ
   */
  const getRarityConfig = (rarity = 'common') => {
    const configs = {
      common: {
        bgColor: 'from-gray-100 to-gray-200',
        borderColor: 'border-gray-300',
        textColor: 'text-gray-800',
        icon: Trophy,
        iconColor: 'text-gray-600',
        glow: false
      },
      uncommon: {
        bgColor: 'from-green-100 to-green-200',
        borderColor: 'border-green-400',
        textColor: 'text-green-900',
        icon: Star,
        iconColor: 'text-green-600',
        glow: false
      },
      rare: {
        bgColor: 'from-blue-100 to-blue-200',
        borderColor: 'border-blue-400',
        textColor: 'text-blue-900',
        icon: Zap,
        iconColor: 'text-blue-600',
        glow: true
      },
      epic: {
        bgColor: 'from-purple-100 to-purple-200',
        borderColor: 'border-purple-400',
        textColor: 'text-purple-900',
        icon: Crown,
        iconColor: 'text-purple-600',
        glow: true
      },
      legendary: {
        bgColor: 'from-yellow-100 via-orange-100 to-yellow-200',
        borderColor: 'border-yellow-400',
        textColor: 'text-yellow-900',
        icon: Sparkles,
        iconColor: 'text-yellow-600',
        glow: true,
        special: true
      }
    };

    return configs[rarity] || configs.common;
  };

  /**
   * 📍 POSITION DE LA NOTIFICATION
   */
  const getPositionClasses = () => {
    const positions = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
      'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
    };
    
    return positions[position] || positions['top-right'];
  };

  // Ne pas rendre si pas de badge ou pas visible
  if (!showNotification || !currentBadge) {
    return null;
  }

  const config = getRarityConfig(currentBadge.rarity);
  const IconComponent = config.icon;

  return (
    <>
      {/* Overlay pour badges légendaires */}
      {config.special && isAnimating && (
        <div className="fixed inset-0 bg-black bg-opacity-20 z-40 pointer-events-none">
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-yellow-200 to-transparent opacity-30"></div>
        </div>
      )}

      {/* Notification principale */}
      <div 
        className={`
          fixed ${getPositionClasses()} z-50 
          transform transition-all duration-500 ease-out
          ${isAnimating ? 
            'translate-y-0 opacity-100 scale-100' : 
            'translate-y-[-20px] opacity-0 scale-95'
          }
          ${config.glow ? 'drop-shadow-lg' : 'drop-shadow-md'}
        `}
      >
        <div 
          className={`
            relative max-w-sm w-full
            bg-gradient-to-br ${config.bgColor}
            border-2 ${config.borderColor}
            rounded-xl shadow-xl
            p-4 m-2
            ${config.glow ? 'shadow-2xl' : ''}
            ${config.special ? 'animate-pulse' : ''}
            backdrop-blur-sm
          `}
        >
          {/* Effet de lueur pour badges rares+ */}
          {config.glow && (
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${config.bgColor} opacity-50 blur-sm -z-10`}></div>
          )}

          {/* Bouton fermer */}
          <button
            onClick={handleClose}
            className={`
              absolute top-2 right-2 
              ${config.textColor} hover:opacity-70
              transition-opacity duration-200
              p-1 rounded-full hover:bg-white hover:bg-opacity-20
            `}
            aria-label="Fermer notification"
          >
            <X size={16} />
          </button>

          {/* Contenu principal */}
          <div className="flex items-start space-x-3 pr-6">
            {/* Icône du badge */}
            <div className={`
              flex-shrink-0 
              ${config.special ? 'animate-bounce' : ''}
            `}>
              <div className={`
                w-12 h-12 rounded-full 
                bg-white bg-opacity-50 
                flex items-center justify-center
                ${config.borderColor} border
              `}>
                {currentBadge.icon ? (
                  <span className="text-2xl">{currentBadge.icon}</span>
                ) : (
                  <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
                )}
              </div>
            </div>

            {/* Informations du badge */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className={`font-bold text-sm ${config.textColor} truncate`}>
                  Badge débloqué !
                </h3>
                <span className={`
                  text-xs px-2 py-1 rounded-full 
                  bg-white bg-opacity-50 
                  ${config.textColor} font-medium
                  capitalize
                `}>
                  {currentBadge.rarity || 'common'}
                </span>
              </div>
              
              <h4 className={`font-semibold ${config.textColor} text-base mb-1`}>
                {currentBadge.name}
              </h4>
              
              <p className={`text-sm ${config.textColor} opacity-90 line-clamp-2`}>
                {currentBadge.description}
              </p>
              
              {/* XP Reward */}
              {currentBadge.xpReward > 0 && (
                <div className="flex items-center space-x-1 mt-2">
                  <Zap className={`w-4 h-4 ${config.iconColor}`} />
                  <span className={`text-sm font-medium ${config.textColor}`}>
                    +{currentBadge.xpReward} XP
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Barre de progression pour la fermeture automatique */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white bg-opacity-30 rounded-b-xl overflow-hidden">
            <div 
              className={`h-full bg-white bg-opacity-50 animate-shrink-width`}
              style={{
                animation: `shrinkWidth ${duration}ms linear forwards`
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Styles CSS intégrés pour l'animation */}
      <style jsx>{`
        @keyframes shrinkWidth {
          from { width: 100%; }
          to { width: 0%; }
        }
        
        .animate-shrink-width {
          animation: shrinkWidth ${duration}ms linear forwards;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
};

/**
 * 🎯 HOOK POUR GÉRER LES NOTIFICATIONS DE BADGES
 * Version simplifiée pour éviter les conflits d'exports
 */
const useBadgeNotifications = () => {
  const [activeNotifications, setActiveNotifications] = useState([]);

  const showNotification = useCallback((badge) => {
    if (!badge) return;

    console.log('🎊 Affichage notification badge:', badge.name);
    
    // Utiliser l'événement global au lieu d'état local
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('badgeUnlocked', {
        detail: { badge }
      });
      window.dispatchEvent(event);
    }
  }, []);

  const clearAllNotifications = useCallback(() => {
    setActiveNotifications([]);
  }, []);

  return {
    showNotification,
    clearAllNotifications,
    activeCount: activeNotifications.length
  };
};

/**
 * 🎊 CONTAINER GLOBAL POUR LES NOTIFICATIONS
 * Version simplifiée pour éviter les conflits d'exports
 */
const BadgeNotificationContainer = () => {
  return React.createElement(BadgeNotification);
};

// ==========================================
// 🔄 EXPORTS UNIQUES - SANS DUPLICATION
// ==========================================
export default BadgeNotification;

// Exports nommés séparés pour éviter les conflits
export { useBadgeNotifications };
export { BadgeNotificationContainer };
