// ==========================================
// 📁 react-app/src/components/gamification/BadgeNotification.jsx
// NOTIFICATIONS VISUELLES ÉPIQUES POUR LES BADGES
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trophy, Zap, Crown, Award, Target } from 'lucide-react';

/**
 * 🎊 COMPOSANT DE NOTIFICATION DE BADGE AVEC ANIMATIONS
 */
const BadgeNotification = ({ badge, isVisible, onClose }) => {
  const [particles, setParticles] = useState([]);
  const [showDetails, setShowDetails] = useState(false);

  // Générer des particules d'animation
  useEffect(() => {
    if (isVisible) {
      const newParticles = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: Math.random() * 400,
        y: Math.random() * 400,
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
        delay: Math.random() * 0.5
      }));
      setParticles(newParticles);
      
      // Auto-close après 5 secondes
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!badge || !isVisible) return null;

  // Couleurs selon la rareté/importance du badge
  const getBadgeColor = (xpReward) => {
    if (xpReward >= 200) return 'from-purple-500 to-pink-500'; // Légendaire
    if (xpReward >= 100) return 'from-blue-500 to-cyan-500';   // Rare
    if (xpReward >= 50) return 'from-green-500 to-emerald-500'; // Commun
    return 'from-gray-500 to-slate-500'; // Basique
  };

  const getRarityText = (xpReward) => {
    if (xpReward >= 200) return 'LÉGENDAIRE';
    if (xpReward >= 100) return 'RARE';
    if (xpReward >= 50) return 'COMMUN';
    return 'BRONZE';
  };

  const badgeColor = getBadgeColor(badge.xpReward || 50);
  const rarityText = getRarityText(badge.xpReward || 50);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* Particules d'animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map(particle => (
            <motion.div
              key={particle.id}
              initial={{ 
                opacity: 0, 
                scale: 0,
                x: particle.x,
                y: particle.y,
                rotate: 0
              }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0, particle.scale, 0],
                y: particle.y - 100,
                rotate: particle.rotation
              }}
              transition={{
                duration: 2,
                delay: particle.delay,
                ease: "easeOut"
              }}
              className="absolute"
            >
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
            </motion.div>
          ))}
        </div>

        {/* Conteneur principal de la notification */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ type: "spring", damping: 15, stiffness: 300 }}
          className="relative max-w-md mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Carte du badge */}
          <div className={`relative bg-gradient-to-br ${badgeColor} p-8 rounded-2xl shadow-2xl border-2 border-white/20`}>
            
            {/* Lueur externe */}
            <div className={`absolute inset-0 bg-gradient-to-br ${badgeColor} rounded-2xl blur-xl opacity-50 scale-110`}></div>
            
            {/* Contenu */}
            <div className="relative text-center text-white">
              
              {/* Header avec animation */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-4"
              >
                <div className="inline-flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2 backdrop-blur-sm">
                  <Trophy className="w-5 h-5" />
                  <span className="text-sm font-bold tracking-wider">{rarityText}</span>
                </div>
              </motion.div>

              {/* Icône du badge avec animation de rotation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring", damping: 10 }}
                className="mb-6"
              >
                <div className="w-24 h-24 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-4 border-white/30">
                  <span className="text-4xl">{badge.icon}</span>
                </div>
              </motion.div>

              {/* Titre du badge */}
              <motion.h3
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-bold mb-2"
              >
                {badge.name}
              </motion.h3>

              {/* Description */}
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-white/90 mb-4"
              >
                {badge.description}
              </motion.p>

              {/* Récompense XP */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
                className="inline-flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2 backdrop-blur-sm"
              >
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="font-bold">+{badge.xpReward || 50} XP</span>
              </motion.div>

              {/* Rôle badge */}
              {badge.role && badge.role !== 'Général' && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mt-4"
                >
                  <span className="text-xs bg-white/20 rounded-full px-3 py-1 backdrop-blur-sm">
                    {badge.role}
                  </span>
                </motion.div>
              )}

              {/* Bouton de fermeture */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                onClick={onClose}
                className="mt-6 bg-white/20 hover:bg-white/30 transition-colors rounded-full px-6 py-2 backdrop-blur-sm font-medium"
              >
                Continuer
              </motion.button>
            </div>

            {/* Décoration coins */}
            <div className="absolute top-2 left-2">
              <Star className="w-6 h-6 text-white/30 fill-current" />
            </div>
            <div className="absolute top-2 right-2">
              <Crown className="w-6 h-6 text-white/30 fill-current" />
            </div>
            <div className="absolute bottom-2 left-2">
              <Target className="w-6 h-6 text-white/30 fill-current" />
            </div>
            <div className="absolute bottom-2 right-2">
              <Award className="w-6 h-6 text-white/30 fill-current" />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * 🎯 GESTIONNAIRE GLOBAL DES NOTIFICATIONS DE BADGES
 */
export const BadgeNotificationManager = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Écouter les événements de badges
    const handleBadgeEarned = (event) => {
      const { badge } = event.detail;
      
      setNotifications(prev => [...prev, {
        id: Date.now(),
        badge,
        visible: true
      }]);
    };

    window.addEventListener('badgeEarned', handleBadgeEarned);
    
    return () => {
      window.removeEventListener('badgeEarned', handleBadgeEarned);
    };
  }, []);

  const closeNotification = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, visible: false } : notif
      ).filter(notif => notif.visible)
    );
  };

  return (
    <>
      {notifications.map(notification => (
        <BadgeNotification
          key={notification.id}
          badge={notification.badge}
          isVisible={notification.visible}
          onClose={() => closeNotification(notification.id)}
        />
      ))}
    </>
  );
};

/**
 * 🧪 COMPOSANT DE TEST POUR LES NOTIFICATIONS
 */
export const BadgeNotificationTester = () => {
  const [showNotification, setShowNotification] = useState(false);

  const testBadges = [
    {
      id: "test_1",
      name: "Premier Test",
      description: "Vous avez testé le système de badges !",
      icon: "🧪",
      role: "Test",
      xpReward: 50
    },
    {
      id: "test_2", 
      name: "Badge Légendaire",
      description: "Un badge ultra rare pour les testeurs !",
      icon: "🏆",
      role: "Test",
      xpReward: 250
    },
    {
      id: "test_3",
      name: "Speed Tester",
      description: "Test rapide du système",
      icon: "⚡",
      role: "Test", 
      xpReward: 100
    }
  ];

  const triggerTestNotification = (badge) => {
    const event = new CustomEvent('badgeEarned', {
      detail: { badge }
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
      <h3 className="font-bold text-amber-800 mb-3">🧪 Test des Notifications</h3>
      <div className="space-y-2">
        {testBadges.map(badge => (
          <button
            key={badge.id}
            onClick={() => triggerTestNotification(badge)}
            className="block w-full text-left p-2 bg-amber-100 hover:bg-amber-200 rounded transition-colors"
          >
            <span className="mr-2">{badge.icon}</span>
            <span className="font-medium">{badge.name}</span>
            <span className="text-sm text-amber-600 ml-2">(+{badge.xpReward} XP)</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BadgeNotification;
