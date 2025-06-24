// ==========================================
// 📁 react-app/src/components/collaboration/NotificationCenter.jsx
// Centre de notifications intelligentes avec mentions et activités
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../shared/stores/authStore.js';
import collaborationService from '../../core/services/collaborationService.js';
import { toast } from 'react-hot-toast';

/**
 * 🔔 CENTRE DE NOTIFICATIONS
 * 
 * Hub central pour toutes les notifications :
 * - Mentions dans commentaires
 * - Activités sur projets/tâches
 * - Notifications temps réel
 * - Gestion lecture/non-lu
 * - Actions rapides
 */
const NotificationCenter = ({ className = '' }) => {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'mentions'

  // ========================
  // 🔄 GESTION DES DONNÉES
  // ========================

  useEffect(() => {
    if (!user?.uid) return;

    loadNotifications();
    
    // Recharger périodiquement
    const interval = setInterval(loadNotifications, 30000); // Toutes les 30s
    
    return () => clearInterval(interval);
  }, [user?.uid]);

  const loadNotifications = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const notificationsData = await collaborationService.getUserNotifications(user.uid);
      setNotifications(notificationsData);
      
      // Compter les non-lues
      const unread = notificationsData.filter(n => !n.isRead).length;
      setUnreadCount(unread);
      
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // ========================
  // 🎯 ACTIONS NOTIFICATIONS
  // ========================

  const handleMarkAsRead = async (notificationId) => {
    try {
      await collaborationService.markNotificationAsRead(notificationId);
      
      // Mettre à jour localement
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, isRead: true, readAt: new Date() }
            : n
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      
    } catch (error) {
      console.error('Erreur marquer comme lu:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await collaborationService.markAllNotificationsAsRead(user.uid);
      
      // Mettre à jour localement
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true, readAt: new Date() }))
      );
      setUnreadCount(0);
      
      toast.success('Toutes les notifications marquées comme lues');
      
    } catch (error) {
      console.error('Erreur marquer tout comme lu:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleNotificationClick = async (notification) => {
    // Marquer comme lu si pas déjà fait
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id);
    }

    // Navigation selon le type
    switch (notification.type) {
      case 'mention':
        if (notification.entityType === 'task') {
          window.location.href = `/tasks?highlight=${notification.entityId}`;
        } else if (notification.entityType === 'project') {
          window.location.href = `/projects?highlight=${notification.entityId}`;
        }
        break;
      
      case 'task_assigned':
        window.location.href = `/tasks?id=${notification.entityId}`;
        break;
        
      case 'project_update':
        window.location.href = `/projects?id=${notification.entityId}`;
        break;
        
      default:
        console.log('Type de notification non géré:', notification.type);
    }
    
    setIsOpen(false);
  };

  // ========================
  // 🎨 FILTRAGE ET RENDU
  // ========================

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'mentions':
        return notifications.filter(n => n.type === 'mention');
      default:
        return notifications;
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      mention: '🏷️',
      task_assigned: '📋',
      task_completed: '✅',
      project_update: '📁',
      comment_reply: '💬',
      badge_earned: '🏆',
      level_up: '⭐'
    };
    return icons[type] || '🔔';
  };

  const getNotificationColor = (type) => {
    const colors = {
      mention: 'border-l-blue-500 bg-blue-50',
      task_assigned: 'border-l-green-500 bg-green-50',
      task_completed: 'border-l-purple-500 bg-purple-50',
      project_update: 'border-l-orange-500 bg-orange-50',
      comment_reply: 'border-l-indigo-500 bg-indigo-50',
      badge_earned: 'border-l-yellow-500 bg-yellow-50',
      level_up: 'border-l-pink-500 bg-pink-50'
    };
    return colors[type] || 'border-l-gray-500 bg-gray-50';
  };

  const renderNotification = (notification) => (
    <motion.div
      key={notification.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      onClick={() => handleNotificationClick(notification)}
      className={`
        p-4 border-l-4 cursor-pointer transition-all hover:shadow-md
        ${getNotificationColor(notification.type)}
        ${!notification.isRead ? 'ring-2 ring-blue-200' : ''}
      `}
    >
      <div className="flex items-start space-x-3">
        {/* Icône */}
        <div className="text-2xl flex-shrink-0">
          {getNotificationIcon(notification.type)}
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-gray-900">
              {notification.message}
            </p>
            {!notification.isRead && (
              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
            )}
          </div>

          {/* Détails */}
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <span>De {notification.fromUser?.name || 'Système'}</span>
            <span>•</span>
            <span>
              {notification.createdAt 
                ? new Intl.RelativeTimeFormat('fr').format(
                    Math.round((new Date(notification.createdAt) - new Date()) / (1000 * 60)), 
                    'minute'
                  )
                : 'Maintenant'
              }
            </span>
          </div>

          {/* Actions rapides */}
          <div className="flex items-center space-x-2 mt-2">
            {!notification.isRead && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkAsRead(notification.id);
                }}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Marquer comme lu
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  // ========================
  // 🎨 INTERFACE UTILISATEUR
  // ========================

  return (
    <div className={`relative ${className}`}>
      {/* Bouton de notification */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM12 19l0-7.154M12 5v7M19 12h-7"/>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        </svg>
        
        {/* Badge de compteur */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Panel de notifications */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
          >
            {/* En-tête */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  🔔 Notifications
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Filtres */}
              <div className="flex space-x-2">
                {[
                  { id: 'all', label: 'Toutes', count: notifications.length },
                  { id: 'unread', label: 'Non lues', count: unreadCount },
                  { id: 'mentions', label: 'Mentions', count: notifications.filter(n => n.type === 'mention').length }
                ].map(filterOption => (
                  <button
                    key={filterOption.id}
                    onClick={() => setFilter(filterOption.id)}
                    className={`
                      px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                      ${filter === filterOption.id
                        ? 'bg-blue-100 text-blue-800'
                        : 'text-gray-600 hover:bg-gray-100'
                      }
                    `}
                  >
                    {filterOption.label}
                    {filterOption.count > 0 && (
                      <span className="ml-1 text-xs">({filterOption.count})</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Action globale */}
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-800"
                >
                  Tout marquer comme lu
                </button>
              )}
            </div>

            {/* Liste des notifications */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-gray-600">Chargement...</span>
                </div>
              ) : (
                <AnimatePresence>
                  {getFilteredNotifications().length > 0 ? (
                    <div className="space-y-1">
                      {getFilteredNotifications().map(renderNotification)}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">📭</div>
                      <p>
                        {filter === 'unread' 
                          ? 'Aucune notification non lue'
                          : filter === 'mentions'
                          ? 'Aucune mention'
                          : 'Aucune notification'
                        }
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              )}
            </div>

            {/* Pied */}
            <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <button
                onClick={() => {
                  window.location.href = '/notifications';
                  setIsOpen(false);
                }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-800"
              >
                Voir toutes les notifications →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * 🔔 COMPOSANT NOTIFICATION TOAST
 * Pour les notifications en temps réel
 */
export const NotificationToast = ({ notification, onDismiss }) => (
  <motion.div
    initial={{ opacity: 0, x: 300 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 300 }}
    className="bg-white border-l-4 border-blue-500 rounded-lg shadow-lg p-4 max-w-sm"
  >
    <div className="flex items-start space-x-3">
      <div className="text-xl">{getNotificationIcon(notification.type)}</div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">
          {notification.message}
        </p>
        <p className="text-xs text-gray-600 mt-1">
          De {notification.fromUser?.name || 'Système'}
        </p>
      </div>
      <button
        onClick={onDismiss}
        className="text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>
    </div>
  </motion.div>
);

export default NotificationCenter;
