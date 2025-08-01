// ==========================================
// 📁 react-app/src/components/collaboration/ActivityFeed.jsx
// Flux d'activité temps réel pour projets et tâches - VERSION COMPLÈTE
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import collaborationService from '../../core/services/collaborationService.js';

/**
 * 📈 COMPOSANT FLUX D'ACTIVITÉ
 * 
 * Affiche l'historique des actions :
 * - Activités sur projets/tâches
 * - Actions des utilisateurs
 * - Timeline chronologique
 * - Filtres par type d'action
 * - Mise à jour temps réel
 */
const ActivityFeed = ({ 
  entityType, 
  entityId, 
  showUserFilter = true,
  maxItems = 20,
  className = '' 
}) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');

  // ========================
  // 🔄 GESTION DES DONNÉES
  // ========================

  useEffect(() => {
    if (!entityType || !entityId) return;

    loadActivities();
    
    // Recharger périodiquement pour les nouvelles activités
    const interval = setInterval(loadActivities, 15000); // Toutes les 15s
    
    return () => clearInterval(interval);
  }, [entityType, entityId]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const activitiesData = await collaborationService.getEntityActivity(
        entityType, 
        entityId, 
        maxItems
      );
      setActivities(activitiesData);
    } catch (error) {
      console.error('Erreur chargement activités:', error);
    } finally {
      setLoading(false);
    }
  };

  // ========================
  // 🎨 FILTRAGE ET RENDU
  // ========================

  const getFilteredActivities = () => {
    let filtered = activities;

    // Filtrer par type
    if (filter !== 'all') {
      filtered = filtered.filter(activity => activity.type === filter);
    }

    // Filtrer par utilisateur
    if (userFilter !== 'all') {
      filtered = filtered.filter(activity => activity.userId === userFilter);
    }

    return filtered;
  };

  const getUniqueUsers = () => {
    const users = new Map();
    activities.forEach(activity => {
      if (activity.user && !users.has(activity.userId)) {
        users.set(activity.userId, activity.user);
      }
    });
    return Array.from(users.values());
  };

  const getActivityIcon = (type) => {
    const icons = {
      comment_added: '💬',
      comment_deleted: '🗑️',
      task_created: '➕',
      task_completed: '✅',
      task_updated: '📝',
      task_deleted: '❌',
      project_created: '🆕',
      project_updated: '📝',
      project_completed: '🎉',
      user_joined: '👋',
      user_left: '👋',
      file_uploaded: '📎',
      badge_earned: '🏆',
      level_up: '⭐'
    };
    return icons[type] || '📋';
  };

  const getActivityColor = (type) => {
    const colors = {
      comment_added: 'text-blue-600',
      comment_deleted: 'text-red-600',
      task_created: 'text-green-600',
      task_completed: 'text-purple-600',
      task_updated: 'text-orange-600',
      task_deleted: 'text-red-600',
      project_created: 'text-indigo-600',
      project_updated: 'text-yellow-600',
      project_completed: 'text-green-600',
      user_joined: 'text-blue-600',
      user_left: 'text-gray-600',
      file_uploaded: 'text-teal-600',
      badge_earned: 'text-yellow-600',
      level_up: 'text-pink-600'
    };
    return colors[type] || 'text-gray-600';
  };

  const formatActivityMessage = (activity) => {
    const userName = activity.user?.name || 'Un utilisateur';
    
    const messages = {
      comment_added: `${userName} a ajouté un commentaire`,
      comment_deleted: `${userName} a supprimé un commentaire`,
      task_created: `${userName} a créé une nouvelle tâche`,
      task_completed: `${userName} a terminé une tâche`,
      task_updated: `${userName} a mis à jour une tâche`,
      task_deleted: `${userName} a supprimé une tâche`,
      project_created: `${userName} a créé le projet`,
      project_updated: `${userName} a mis à jour le projet`,
      project_completed: `${userName} a terminé le projet`,
      user_joined: `${userName} a rejoint le projet`,
      user_left: `${userName} a quitté le projet`,
      file_uploaded: `${userName} a ajouté un fichier`,
      badge_earned: `${userName} a gagné un badge`,
      level_up: `${userName} a monté de niveau`
    };

    return messages[activity.type] || `${userName} a effectué une action`;
  };

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return 'Maintenant';
    
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));

    if (diffInMinutes < 1) return 'Maintenant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes}min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Il y a ${diffInDays}j`;
    
    return time.toLocaleDateString();
  };

  const renderActivity = (activity, index) => (
    <motion.div
      key={`${activity.id}-${index}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-start space-x-3 py-3"
    >
      {/* Timeline */}
      <div className="relative flex flex-col items-center">
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center text-sm
          bg-white border-2 ${getActivityColor(activity.type)} border-current
        `}>
          {getActivityIcon(activity.type)}
        </div>
        
        {/* Ligne de timeline */}
        {index < getFilteredActivities().length - 1 && (
          <div className="w-0.5 h-6 bg-gray-200 mt-2"></div>
        )}
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-900">
            {formatActivityMessage(activity)}
          </p>
          <span className="text-xs text-gray-500 flex-shrink-0">
            {getRelativeTime(activity.timestamp)}
          </span>
        </div>

        {/* Détails supplémentaires */}
        {activity.details && (
          <div className="mt-1">
            {activity.details.content && (
              <p className="text-xs text-gray-600 italic">
                "{activity.details.content.substring(0, 100)}..."
              </p>
            )}
            {activity.details.taskTitle && (
              <p className="text-xs text-gray-600">
                Tâche : <span className="font-medium">{activity.details.taskTitle}</span>
              </p>
            )}
            {activity.details.badgeName && (
              <p className="text-xs text-yellow-600">
                Badge : <span className="font-medium">{activity.details.badgeName}</span>
              </p>
            )}
          </div>
        )}

        {/* Avatar utilisateur */}
        <div className="flex items-center mt-2">
          <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">
            {activity.user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <span className="text-xs text-gray-500">
            {activity.user?.name || 'Utilisateur inconnu'}
          </span>
          {activity.user?.level && (
            <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
              Niv. {activity.user.level}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );

  // ========================
  // 🎨 INTERFACE UTILISATEUR
  // ========================

  const activityTypes = [
    { id: 'all', label: 'Toutes', count: activities.length },
    { id: 'comment_added', label: 'Commentaires', count: activities.filter(a => a.type.includes('comment')).length },
    { id: 'task_completed', label: 'Tâches terminées', count: activities.filter(a => a.type === 'task_completed').length },
    { id: 'badge_earned', label: 'Badges', count: activities.filter(a => a.type === 'badge_earned').length }
  ];

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Chargement de l'activité...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          📈 Activité récente
        </h3>
        <button
          onClick={loadActivities}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          🔄 Actualiser
        </button>
      </div>

      {/* Filtres */}
      <div className="mb-6 space-y-4">
        {/* Filtre par type */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Type d'activité
          </label>
          <div className="flex flex-wrap gap-2">
            {activityTypes.map(type => (
              <button
                key={type.id}
                onClick={() => setFilter(type.id)}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                  ${filter === type.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {type.label} ({type.count})
              </button>
            ))}
          </div>
        </div>

        {/* Filtre par utilisateur */}
        {showUserFilter && getUniqueUsers().length > 1 && (
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Filtrer par utilisateur
            </label>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">Tous les utilisateurs</option>
              {getUniqueUsers().map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Liste des activités */}
      <div className="space-y-1">
        <AnimatePresence>
          {getFilteredActivities().map((activity, index) => 
            renderActivity(activity, index)
          )}
        </AnimatePresence>
        
        {getFilteredActivities().length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">📝</div>
            <p className="text-gray-500">
              {filter === 'all' 
                ? 'Aucune activité récente'
                : `Aucune activité du type "${activityTypes.find(t => t.id === filter)?.label}"`
              }
            </p>
          </div>
        )}
      </div>

      {/* Résumé des statistiques */}
      {activities.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">📊 Résumé d'activité</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600">
                {activities.filter(a => a.type.includes('comment')).length}
              </div>
              <div className="text-xs text-gray-500">Commentaires</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600">
                {activities.filter(a => a.type === 'task_completed').length}
              </div>
              <div className="text-xs text-gray-500">Tâches terminées</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">
                {getUniqueUsers().length}
              </div>
              <div className="text-xs text-gray-500">Contributeurs</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 🔔 COMPOSANT ACTIVITÉ COMPACTE
 * Version réduite pour les widgets
 */
export const ActivityWidget = ({ entityType, entityId, maxItems = 5 }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const data = await collaborationService.getEntityActivity(entityType, entityId, maxItems);
        setActivities(data);
      } catch (error) {
        console.error('Erreur widget activité:', error);
      } finally {
        setLoading(false);
      }
    };

    if (entityType && entityId) {
      loadActivities();
    }
  }, [entityType, entityId, maxItems]);

  const getActivityIcon = (type) => {
    const icons = {
      comment_added: '💬',
      comment_deleted: '🗑️',
      task_created: '➕',
      task_completed: '✅',
      task_updated: '📝',
      task_deleted: '❌',
      project_created: '🆕',
      project_updated: '📝',
      project_completed: '🎉',
      user_joined: '👋',
      user_left: '👋',
      file_uploaded: '📎',
      badge_earned: '🏆',
      level_up: '⭐'
    };
    return icons[type] || '📋';
  };

  const formatActivityMessage = (activity) => {
    const userName = activity.user?.name || 'Un utilisateur';
    
    const messages = {
      comment_added: `${userName} a ajouté un commentaire`,
      comment_deleted: `${userName} a supprimé un commentaire`,
      task_created: `${userName} a créé une nouvelle tâche`,
      task_completed: `${userName} a terminé une tâche`,
      task_updated: `${userName} a mis à jour une tâche`,
      task_deleted: `${userName} a supprimé une tâche`,
      project_created: `${userName} a créé le projet`,
      project_updated: `${userName} a mis à jour le projet`,
      project_completed: `${userName} a terminé le projet`,
      user_joined: `${userName} a rejoint le projet`,
      user_left: `${userName} a quitté le projet`,
      file_uploaded: `${userName} a ajouté un fichier`,
      badge_earned: `${userName} a gagné un badge`,
      level_up: `${userName} a monté de niveau`
    };

    return messages[activity.type] || `${userName} a effectué une action`;
  };

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return 'Maintenant';
    
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));

    if (diffInMinutes < 1) return 'Maintenant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes}min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Il y a ${diffInDays}j`;
    
    return time.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {activities.slice(0, maxItems).map((activity, index) => (
        <div key={activity.id} className="flex items-center space-x-2 text-sm">
          <span className="text-lg">{getActivityIcon(activity.type)}</span>
          <span className="flex-1 truncate">
            {activity.user?.name || 'Utilisateur'} - {formatActivityMessage(activity).split(' ').slice(2).join(' ')}
          </span>
          <span className="text-xs text-gray-500">
            {getRelativeTime(activity.timestamp)}
          </span>
        </div>
      ))}
      
      {activities.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          Aucune activité récente
        </p>
      )}
    </div>
  );
};

export default ActivityFeed;
