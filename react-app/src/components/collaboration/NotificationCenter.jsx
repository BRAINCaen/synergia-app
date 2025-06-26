// ==========================================
// 📁 react-app/src/components/collaboration/NotificationCenter.jsx
// Centre de notifications intelligentes avec mentions et activités
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../shared/stores/authStore.js';
import collaborationService from '../../core/services/collaborationService.js';
import { useToast } from '../../shared/components/ui/Toast.jsx';

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
  const { success, error } = useToast();
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
      
    } catch (err) {
      console.error('Erreur chargement notifications:', err);
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
      
    } catch (err) {
      console.error('Erreur marquer comme lu:', err);
      error('Erreur lors de la mise à jour');
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
      
      success('Toutes les notifications marquées comme lues');
      
    } catch (err) {
      console.error('Erreur marquer tout comme lu:', err);
      error('Erreur lors de la mise à jour');
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
      project_update: '📁',
      comment: '💬',
      badge_earned: '🏆',
      level_up: '⭐',
      collaboration_invite: '🤝',
      deadline_reminder: '⏰'
    };
    return icons[type] || '🔔';
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const notifTime = timestamp?.toDate ? timestamp.toDate() : timestamp;
    const diffMs = now - notifTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}j`;
    return notifTime.toLocaleDateString('fr-FR');
  };

  const filteredNotifications = getFilteredNotifications();

  // ========================
  // 🎨 RENDU COMPOSANT
  // ========================

  return (
    <div className={`relative ${className}`}>
      {/* Bouton d'ouverture */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-colors"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel des notifications */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Notifications
                </h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Tout marquer lu
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Filtres */}
              <div className="flex space-x-1 mt-3">
                {[
                  { key: 'all', label: 'Toutes' },
                  { key: 'unread', label: 'Non lues' },
                  { key: 'mentions', label: 'Mentions' }
                ].map((filterOption) => (
                  <button
                    key={filterOption.key}
                    onClick={() => setFilter(filterOption.key)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      filter === filterOption.key
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {filterOption.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Liste des notifications */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Chargement...</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <span className="text-4xl mb-2 block">🎉</span>
                  <p className="text-gray-500">Aucune notification</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Icône */}
                        <span className="text-xl flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </span>

                        {/* Contenu */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm ${
                              !notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-800'
                            }`}>
                              {notification.title}
                            </p>
                            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                              {getTimeAgo(notification.createdAt)}
                            </span>
                          </div>
                          
                          {notification.message && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                          )}

                          {/* Actions rapides */}
                          {notification.actions && notification.actions.length > 0 && (
                            <div className="flex space-x-2 mt-2">
                              {notification.actions.map((action, index) => (
                                <button
                                  key={index}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    action.handler();
                                  }}
                                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                                >
                                  {action.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Indicateur non-lu */}
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {filteredNotifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 text-center">
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Voir toutes les notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay pour fermer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationCenter;
