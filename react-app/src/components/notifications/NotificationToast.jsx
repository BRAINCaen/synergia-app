// ==========================================
// 📁 react-app/src/components/notifications/NotificationToast.jsx
// TOAST NOTIFICATIONS EN TEMPS RÉEL - SYNERGIA v4.0 - MODULE 6
// ==========================================

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Bell, Trophy, Zap, Gift, Target, Users, Star, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * 🔔 COMPOSANT TOAST INDIVIDUEL
 */
const Toast = ({ notification, onDismiss, onNavigate }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);

  // Auto-dismiss après 5 secondes (pause si hover)
  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          clearInterval(interval);
          onDismiss(notification.id);
          return 0;
        }
        return prev - 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isHovered, notification.id, onDismiss]);

  // Icône selon le type
  const getIcon = () => {
    const type = notification.type || '';
    if (type.includes('quest') || type.includes('task')) return <Target className="w-5 h-5" />;
    if (type.includes('badge')) return <Trophy className="w-5 h-5" />;
    if (type.includes('xp') || type.includes('level')) return <Star className="w-5 h-5" />;
    if (type.includes('boost')) return <Zap className="w-5 h-5" />;
    if (type.includes('reward')) return <Gift className="w-5 h-5" />;
    if (type.includes('team')) return <Users className="w-5 h-5" />;
    if (type.includes('message') || type.includes('mention')) return <MessageCircle className="w-5 h-5" />;
    return <Bell className="w-5 h-5" />;
  };

  // Couleur selon le type
  const getGradient = () => {
    const type = notification.type || '';
    if (type.includes('approved') || type.includes('success') || type.includes('earned')) {
      return 'from-green-500 to-emerald-600';
    }
    if (type.includes('rejected') || type.includes('error')) {
      return 'from-red-500 to-rose-600';
    }
    if (type.includes('boost')) {
      return 'from-yellow-500 to-orange-500';
    }
    if (type.includes('badge') || type.includes('level')) {
      return 'from-purple-500 to-violet-600';
    }
    if (type.includes('reward')) {
      return 'from-pink-500 to-rose-500';
    }
    return 'from-blue-500 to-cyan-600';
  };

  const handleClick = () => {
    if (notification.link) {
      onNavigate(notification.link);
      onDismiss(notification.id);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 400, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 400, scale: 0.8 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative overflow-hidden"
      style={{ pointerEvents: 'auto' }}
    >
      <div
        onClick={handleClick}
        className={`
          relative w-96 max-w-[calc(100vw-2rem)] backdrop-blur-xl
          bg-gradient-to-r ${getGradient()} bg-opacity-95
          rounded-2xl shadow-2xl cursor-pointer
          border border-white/20
          transform transition-transform hover:scale-[1.02]
        `}
      >
        {/* Contenu */}
        <div className="p-4 flex items-start gap-4">
          {/* Icône */}
          <div className="flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-white">
            {notification.icon ? (
              <span className="text-2xl">{notification.icon}</span>
            ) : (
              getIcon()
            )}
          </div>

          {/* Texte */}
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-bold text-sm mb-1 truncate">
              {notification.title}
            </h4>
            <p className="text-white/80 text-xs line-clamp-2">
              {notification.message}
            </p>

            {/* Actions */}
            {notification.link && (
              <button className="mt-2 text-xs text-white/70 hover:text-white flex items-center gap-1 transition-colors">
                <ExternalLink className="w-3 h-3" />
                Voir détails
              </button>
            )}
          </div>

          {/* Bouton fermer */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss(notification.id);
            }}
            className="flex-shrink-0 w-8 h-8 rounded-lg bg-black/20 hover:bg-black/40 flex items-center justify-center text-white/70 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Barre de progression */}
        <div className="h-1 bg-black/20">
          <motion.div
            className="h-full bg-white/50"
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </div>
    </motion.div>
  );
};

/**
 * 🔔 CONTENEUR DE TOASTS
 * Affiche les notifications en temps réel
 */
const NotificationToast = ({ toasts = [], onDismiss }) => {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div
      className="fixed top-24 right-4 z-[999999] flex flex-col gap-3"
      style={{ pointerEvents: 'none' }}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            notification={toast}
            onDismiss={onDismiss}
            onNavigate={handleNavigate}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationToast;
