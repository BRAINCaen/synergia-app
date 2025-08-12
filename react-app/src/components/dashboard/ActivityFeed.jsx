// ==========================================
// 📁 react-app/src/components/dashboard/ActivityFeed.jsx
// COMPOSANT FLUX D'ACTIVITÉ TEMPS RÉEL
// ==========================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  CheckCircle2, 
  Trophy, 
  Star, 
  Zap, 
  Clock,
  MoreHorizontal,
  Filter,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

/**
 * 📈 COMPOSANT FLUX D'ACTIVITÉ
 * Affiche les activités récentes de l'utilisateur en temps réel
 */
const ActivityFeed = ({ 
  activities = [], 
  title = "Activité récente",
  maxItems = 5,
  showFilter = false,
  showRefresh = false,
  onRefresh,
  loading = false,
  className = ''
}) => {
  const [filterType, setFilterType] = useState('all');
  const [isExpanded, setIsExpanded] = useState(false);

  // Filtrer les activités
  const filteredActivities = activities.filter(activity => {
    if (filterType === 'all') return true;
    return activity.type === filterType;
  });

  // Limiter le nombre d'activités affichées
  const displayedActivities = isExpanded 
    ? filteredActivities 
    : filteredActivities.slice(0, maxItems);

  // Types d'activités disponibles
  const activityTypes = [
    { value: 'all', label: 'Toutes', icon: Activity },
    { value: 'task_completed', label: 'Tâches', icon: CheckCircle2 },
    { value: 'badge_unlocked', label: 'Badges', icon: Trophy },
    { value: 'xp', label: 'XP', icon: Zap },
    { value: 'login_bonus', label: 'Connexion', icon: Star }
  ];

  // Obtenir l'icône pour un type d'activité
  const getActivityIcon = (type) => {
    const activityType = activityTypes.find(t => t.value === type);
    return activityType ? activityType.icon : Activity;
  };

  // Obtenir la couleur pour un type d'activité
  const getActivityColor = (type) => {
    switch (type) {
      case 'task_completed':
        return 'bg-green-500/20 text-green-400';
      case 'badge_unlocked':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'xp':
        return 'bg-blue-500/20 text-blue-400';
      case 'login_bonus':
        return 'bg-purple-500/20 text-purple-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  // Formater le temps relatif
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Récent';
    
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);
    
    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} h`;
    return `${Math.floor(diffInSeconds / 86400)} j`;
  };

  return (
    <div className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 ${className}`}>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-blue-400" />
          <h3 className="text-white text-xl font-semibold">{title}</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Filtre */}
          {showFilter && (
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white/10 text-white text-sm px-3 py-1 rounded-lg border border-white/20 focus:outline-none focus:border-blue-400"
            >
              {activityTypes.map(type => (
                <option key={type.value} value={type.value} className="bg-gray-800">
                  {type.label}
                </option>
              ))}
            </select>
          )}
          
          {/* Actualiser */}
          {showRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>
      
      {/* Liste des activités */}
      <div className="space-y-3">
        {loading ? (
          // État de chargement
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="flex items-center gap-4 bg-white/5 rounded-lg p-4">
                  <div className="w-10 h-10 bg-gray-600 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="w-32 h-4 bg-gray-600 rounded mb-2"></div>
                    <div className="w-24 h-3 bg-gray-600 rounded"></div>
                  </div>
                  <div className="w-16 h-4 bg-gray-600 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : displayedActivities.length > 0 ? (
          <AnimatePresence>
            {displayedActivities.map((activity, index) => {
              const Icon = activity.icon || getActivityIcon(activity.type);
              const colorClass = getActivityColor(activity.type);
              
              return (
                <motion.div
                  key={activity.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <div className="flex items-center gap-4 bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all duration-200">
                    {/* Icône d'activité */}
                    <div className={`p-2 rounded-lg ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm line-clamp-1">
                        {activity.title}
                      </p>
                      <p className="text-gray-400 text-xs line-clamp-1">
                        {activity.description}
                      </p>
                    </div>
                    
                    {/* Métadonnées */}
                    <div className="text-right">
                      {activity.xp > 0 && (
                        <div className="flex items-center gap-1 text-blue-400 font-medium text-sm mb-1">
                          <Zap className="w-3 h-3" />
                          +{activity.xp}
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-gray-500 text-xs">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(activity.timestamp)}
                      </div>
                    </div>
                    
                    {/* Actions (au survol) */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        ) : (
          // État vide
          <div className="text-center py-12">
            <Activity className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 mb-2">Aucune activité récente</p>
            <p className="text-gray-500 text-sm">
              {filterType === 'all' 
                ? 'Commencez à utiliser Synergia pour voir votre activité ici'
                : `Aucune activité de type "${activityTypes.find(t => t.value === filterType)?.label}" trouvée`
              }
            </p>
          </div>
        )}
      </div>
      
      {/* Bouton voir plus */}
      {!loading && filteredActivities.length > maxItems && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
            {isExpanded ? 'Voir moins' : `Voir ${filteredActivities.length - maxItems} de plus`}
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
