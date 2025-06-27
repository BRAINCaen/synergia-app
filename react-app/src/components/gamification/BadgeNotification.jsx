// ==========================================
// 📁 react-app/src/components/gamification/BadgeNotification.jsx
// NOTIFICATION ANIMÉE DE BADGE DÉBLOQUÉ
// Pop-up épique avec animations et effets visuels
// ==========================================

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Award, X, Star, Zap } from 'lucide-react';

/**
 * 🎉 COMPOSANT NOTIFICATION BADGE
 * Animation épique lors du déblocage d'un badge
 */
const BadgeNotification = ({ 
  badge, 
  isVisible, 
  onClose, 
  autoClose = true, 
  autoCloseDelay = 5000 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Démarrer l'animation d'entrée
      setTimeout(() => setIsAnimating(true), 100);
      
      // Déclencher les particules
      setTimeout(() => setShowParticles(true), 500);
      
      // Auto-fermeture
      if (autoClose) {
        const timer = setTimeout(() => {
          handleClose();
        }, autoCloseDelay);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, autoClose, autoCloseDelay]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setShowParticles(false);
      onClose();
    }, 300);
  };

  // Ne pas rendre si pas visible ou pas de badge
  if (!isVisible || !badge) return null;

  // Couleurs basées sur la catégorie du badge
  const getCategoryColors = (category) => {
    const colorMap = {
      premiers_pas: 'from-blue-400 via-blue-500 to-blue-600',
      productivite: 'from-green-400 via-green-500 to-green-600',
      regularite: 'from-red-400 via-red-500 to-red-600',
      temporel: 'from-yellow-400 via-orange-500 to-red-500',
      xp: 'from-purple-400 via-purple-500 to-purple-600',
      special: 'from-pink-400 via-pink-500 to-purple-600'
    };
    return colorMap[category] || 'from-gray-400 via-gray-500 to-gray-600';
  };

  // Particules animées
  const renderParticles = () => {
    if (!showParticles) return null;
    
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-ping"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random() * 2}s`
            }}
          >
            <Star className="w-3 h-3 text-yellow-400" />
          </div>
        ))}
        
        {[...Array(8)].map((_, i) => (
          <div
            key={`spark-${i}`}
            className="absolute animate-bounce"
            style={{
              left: `${30 + Math.random() * 40}%`,
              top: `${30 + Math.random() * 40}%`,
              animationDelay: `${Math.random() * 1.5}s`,
              animationDuration: `${0.5 + Math.random() * 1}s`
            }}
          >
            <Zap className="w-2 h-2 text-yellow-300" />
          </div>
        ))}
      </div>
    );
  };

  const notificationContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay sombre */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isAnimating ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Notification principale */}
      <div 
        className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-500 ${
          isAnimating 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-75 opacity-0 translate-y-8'
        }`}
      >
        {/* Particules d'arrière-plan */}
        {renderParticles()}
        
        {/* Header avec gradient */}
        <div className={`relative px-6 py-4 bg-gradient-to-r ${getCategoryColors(badge.category)} rounded-t-2xl text-white overflow-hidden`}>
          
          {/* Effet de brillance animé */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform -skew-x-12 animate-pulse" />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-2xl">{badge.icon}</span>
              </div>
              <div>
                <h3 className="text-lg font-bold">Badge Débloqué !</h3>
                <p className="text-sm opacity-90">Félicitations 🎉</p>
              </div>
            </div>
            
            <button
              onClick={handleClose}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenu du badge */}
        <div className="p-6">
          <div className="text-center">
            
            {/* Icône du badge avec animation */}
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${badge.color || getCategoryColors(badge.category)} text-white text-3xl mb-4 transform transition-all duration-700 ${
              isAnimating ? 'scale-100 rotate-0' : 'scale-50 rotate-180'
            }`}>
              <span className="animate-pulse">{badge.icon}</span>
            </div>

            {/* Nom du badge */}
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {badge.name}
            </h2>

            {/* Description */}
            <p className="text-gray-600 mb-4">
              {badge.description}
            </p>

            {/* Récompense XP */}
            <div className="flex items-center justify-center space-x-2 bg-yellow-50 rounded-lg p-3 mb-4">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="font-bold text-yellow-700">+{badge.xpReward} XP</span>
              <Zap className="w-5 h-5 text-yellow-500" />
            </div>

            {/* Catégorie */}
            <div className="flex items-center justify-center space-x-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getCategoryColors(badge.category)} text-white`}>
                {badge.category?.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            {/* Date de déblocage */}
            <p className="text-xs text-gray-500">
              Débloqué le {new Date(badge.unlockedAt || Date.now()).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        {/* Footer avec actions */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl">
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Fermer
            </button>
            <button
              onClick={() => {
                // Navigation vers la page des badges
                window.location.href = '/gamification';
              }}
              className={`flex-1 px-4 py-2 bg-gradient-to-r ${getCategoryColors(badge.category)} text-white rounded-lg hover:opacity-90 transition-opacity font-medium`}
            >
              Voir mes badges
            </button>
          </div>
        </div>

        {/* Effet de pulsation sur les bords */}
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${getCategoryColors(badge.category)} opacity-20 animate-pulse pointer-events-none`} />
      </div>
    </div>
  );

  // Utiliser un portal pour rendre au niveau racine
  return createPortal(notificationContent, document.body);
};

/**
 * 🎊 COMPOSANT GESTIONNAIRE DE NOTIFICATIONS
 * Gère la file d'attente des notifications de badges
 */
export const BadgeNotificationManager = () => {
  const [notifications, setNotifications] = useState([]);

  // Fonction pour ajouter une notification
  const showBadgeNotification = (badge) => {
    const id = Date.now();
    const notification = { id, badge, isVisible: true };
    
    setNotifications(prev => [...prev, notification]);
  };

  // Fonction pour supprimer une notification
  const removeBadgeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Exposer la fonction globalement
  useEffect(() => {
    window.showBadgeNotification = showBadgeNotification;
    
    return () => {
      delete window.showBadgeNotification;
    };
  }, []);

  return (
    <>
      {notifications.map(notification => (
        <BadgeNotification
          key={notification.id}
          badge={notification.badge}
          isVisible={notification.isVisible}
          onClose={() => removeBadgeNotification(notification.id)}
          autoClose={true}
          autoCloseDelay={6000}
        />
      ))}
    </>
  );
};

/**
 * 🎯 HOOK POUR UTILISER LES NOTIFICATIONS DE BADGES
 */
export const useBadgeNotifications = () => {
  const showNotification = (badge) => {
    if (window.showBadgeNotification) {
      window.showBadgeNotification(badge);
    } else {
      console.warn('BadgeNotificationManager not initialized');
    }
  };

  return { showNotification };
};

export default BadgeNotification;
