// ==========================================
// 📁 react-app/src/components/notifications/NotificationCenter.jsx
// CENTRE DE NOTIFICATIONS AMÉLIORÉ - SYNERGIA v4.0 - MODULE 6
// ==========================================

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Bell, Check, CheckCheck, Trash2, ExternalLink, Filter,
  Trophy, Zap, Gift, Target, Users, Star, MessageCircle, Info
} from 'lucide-react';

/**
 * 🔔 FILTRES DE NOTIFICATIONS
 */
const NOTIFICATION_FILTERS = [
  { id: 'all', label: 'Tout', icon: Bell },
  { id: 'quest', label: 'Quêtes', icon: Target },
  { id: 'badge', label: 'Badges', icon: Trophy },
  { id: 'boost', label: 'Boosts', icon: Zap },
  { id: 'reward', label: 'Récompenses', icon: Gift },
  { id: 'level', label: 'Niveaux', icon: Star },
  { id: 'team', label: 'Équipe', icon: Users },
];

/**
 * 🔔 ITEM DE NOTIFICATION
 */
const NotificationItem = ({ notification, onMarkAsRead, onDelete, onNavigate, onClose }) => {
  const formatDate = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return date.toLocaleDateString('fr-FR');
  };

  // Couleur de bordure selon le type
  const getBorderColor = () => {
    const type = notification.type || '';
    if (type.includes('approved') || type.includes('earned')) return 'border-green-500/50';
    if (type.includes('rejected')) return 'border-red-500/50';
    if (type.includes('boost')) return 'border-yellow-500/50';
    if (type.includes('badge') || type.includes('level')) return 'border-purple-500/50';
    if (type.includes('reward')) return 'border-pink-500/50';
    if (type.includes('pending')) return 'border-orange-500/50';
    return 'border-blue-500/50';
  };

  const handleClick = () => {
    if (!notification.read) onMarkAsRead(notification.id);
    if (notification.link) {
      onNavigate(notification.link);
      onClose();
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      whileHover={{ scale: 1.01 }}
      className={`
        relative p-4 rounded-xl cursor-pointer transition-all duration-200
        ${notification.read
          ? 'bg-white/5 border border-white/10'
          : `bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-l-4 ${getBorderColor()} border-y border-r border-white/10`
        }
        hover:bg-white/10
      `}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        {/* Icône */}
        <span className="text-2xl flex-shrink-0">{notification.icon || '🔔'}</span>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`text-sm font-semibold truncate ${
              notification.read ? 'text-gray-300' : 'text-white'
            }`}>
              {notification.title}
            </h4>

            {/* Indicateur non lu */}
            {!notification.read && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"
              />
            )}
          </div>

          <p className="text-xs text-gray-400 mt-1 line-clamp-2">
            {notification.message}
          </p>

          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-500">
              {formatDate(notification.createdAt)}
            </span>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {notification.link && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate(notification.link);
                    onClose();
                  }}
                  className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors"
                  title="Voir"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}

              {!notification.read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(notification.id);
                  }}
                  className="p-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-colors"
                  title="Marquer comme lue"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notification.id);
                }}
                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                title="Supprimer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * 🔔 CENTRE DE NOTIFICATIONS PRINCIPAL
 */
const NotificationCenter = ({
  isOpen,
  onClose,
  notifications = [],
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onNavigate
}) => {
  const [activeFilter, setActiveFilter] = useState('all');

  // Filtrer les notifications
  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'all') return notifications;

    return notifications.filter(n => {
      const type = (n.type || '').toLowerCase();
      switch (activeFilter) {
        case 'quest':
          return type.includes('quest') || type.includes('task');
        case 'badge':
          return type.includes('badge');
        case 'boost':
          return type.includes('boost');
        case 'reward':
          return type.includes('reward');
        case 'level':
          return type.includes('level') || type.includes('xp');
        case 'team':
          return type.includes('team') || type.includes('info');
        default:
          return true;
      }
    });
  }, [notifications, activeFilter]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredUnreadCount = filteredNotifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999999]"
      >
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Panel */}
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="absolute top-20 right-6 w-[450px] max-w-[calc(100vw-3rem)] max-h-[80vh] overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-white/10 shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/10 bg-gradient-to-r from-orange-500/10 to-red-500/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Notifications</h3>
                  <p className="text-xs text-gray-400">
                    {unreadCount > 0
                      ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}`
                      : 'Tout est lu ✨'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onMarkAllAsRead}
                    className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Tout lire
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="w-9 h-9 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg flex items-center justify-center text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Filtres */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {NOTIFICATION_FILTERS.map((filter) => {
                const Icon = filter.icon;
                const isActive = activeFilter === filter.id;
                return (
                  <motion.button
                    key={filter.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`
                      flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all
                      ${isActive
                        ? 'bg-white/20 text-white border border-white/30'
                        : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10 hover:text-gray-300'
                      }
                    `}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {filter.label}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Liste des notifications */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <AnimatePresence mode="popLayout">
              {filteredNotifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-gray-500" />
                  </div>
                  <p className="text-gray-400 text-sm">
                    {activeFilter === 'all'
                      ? 'Aucune notification'
                      : `Aucune notification de type "${NOTIFICATION_FILTERS.find(f => f.id === activeFilter)?.label}"`
                    }
                  </p>
                </motion.div>
              ) : (
                filteredNotifications.map((notif) => (
                  <NotificationItem
                    key={notif.id}
                    notification={notif}
                    onMarkAsRead={onMarkAsRead}
                    onDelete={onDelete}
                    onNavigate={onNavigate}
                    onClose={onClose}
                  />
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Footer avec statistiques */}
          {filteredNotifications.length > 0 && (
            <div className="p-3 border-t border-white/10 bg-white/5">
              <p className="text-xs text-gray-500 text-center">
                {filteredNotifications.length} notification{filteredNotifications.length > 1 ? 's' : ''}
                {activeFilter !== 'all' && ` • Filtre: ${NOTIFICATION_FILTERS.find(f => f.id === activeFilter)?.label}`}
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationCenter;
