// ==========================================
// 📁 react-app/src/components/dashboard/QuickActions.jsx
// COMPOSANT ACTIONS RAPIDES DASHBOARD
// ==========================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Rocket, 
  Trophy, 
  BarChart3, 
  Users,
  Calendar,
  Target,
  Settings,
  Zap,
  CheckCircle2,
  Star,
  Gift,
  Clock,
  Flame
} from 'lucide-react';

import { useAuthStore } from '../../shared/stores/authStore.js';

/**
 * ⚡ COMPOSANT ACTIONS RAPIDES
 * Fournit des raccourcis vers les fonctionnalités principales
 */
const QuickActions = ({ 
  title = "Actions rapides",
  layout = "grid", // "grid" ou "list"
  maxActions = 8,
  showTitle = true,
  className = ''
}) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [hoveredAction, setHoveredAction] = useState(null);

  // Configuration des actions disponibles
  const availableActions = [
    {
      id: 'new_task',
      title: 'Nouvelle tâche',
      description: 'Créer une nouvelle tâche',
      icon: Plus,
      color: 'from-blue-500 to-purple-500',
      path: '/tasks',
      params: { action: 'new' },
      priority: 1,
      category: 'productivity'
    },
    {
      id: 'new_project',
      title: 'Nouveau projet',
      description: 'Lancer un nouveau projet',
      icon: Rocket,
      color: 'from-green-500 to-emerald-500',
      path: '/projects',
      params: { action: 'new' },
      priority: 2,
      category: 'productivity'
    },
    {
      id: 'my_badges',
      title: 'Mes badges',
      description: 'Voir mes récompenses',
      icon: Trophy,
      color: 'from-yellow-500 to-orange-500',
      path: '/badges',
      priority: 3,
      category: 'gamification'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Voir mes statistiques',
      icon: BarChart3,
      color: 'from-indigo-500 to-blue-500',
      path: '/analytics',
      priority: 4,
      category: 'analytics'
    },
    {
      id: 'team',
      title: 'Mon équipe',
      description: 'Collaborer avec l\'équipe',
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      path: '/team',
      priority: 5,
      category: 'collaboration'
    },
    {
      id: 'calendar',
      title: 'Planning',
      description: 'Gérer mon planning',
      icon: Calendar,
      color: 'from-teal-500 to-cyan-500',
      path: '/time-track',
      priority: 6,
      category: 'productivity'
    },
    {
      id: 'goals',
      title: 'Objectifs',
      description: 'Suivre mes objectifs',
      icon: Target,
      color: 'from-red-500 to-pink-500',
      path: '/gamification',
      priority: 7,
      category: 'gamification'
    },
    {
      id: 'settings',
      title: 'Paramètres',
      description: 'Configurer mon profil',
      icon: Settings,
      color: 'from-gray-500 to-gray-600',
      path: '/settings',
      priority: 8,
      category: 'settings'
    },
    {
      id: 'rewards',
      title: 'Récompenses',
      description: 'Échanger mes points',
      icon: Gift,
      color: 'from-pink-500 to-rose-500',
      path: '/rewards',
      priority: 9,
      category: 'gamification'
    },
    {
      id: 'leaderboard',
      title: 'Classement',
      description: 'Voir le classement',
      icon: Star,
      color: 'from-amber-500 to-yellow-500',
      path: '/leaderboard',
      priority: 10,
      category: 'gamification'
    }
  ];

  // Sélectionner les actions à afficher
  const displayedActions = availableActions
    .sort((a, b) => a.priority - b.priority)
    .slice(0, maxActions);

  // Gérer le clic sur une action
  const handleActionClick = (action) => {
    if (action.path) {
      if (action.params) {
        navigate(action.path, { state: action.params });
      } else {
        navigate(action.path);
      }
    }
  };

  // Obtenir le style de layout
  const getLayoutClass = () => {
    if (layout === 'list') {
      return 'space-y-3';
    }
    return 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4';
  };

  // Composant d'action individuel
  const ActionButton = ({ action, index }) => {
    const Icon = action.icon;
    
    return (
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ 
          scale: 1.05, 
          y: -2,
          transition: { duration: 0.2 }
        }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleActionClick(action)}
        onMouseEnter={() => setHoveredAction(action.id)}
        onMouseLeave={() => setHoveredAction(null)}
        className={`
          group relative flex flex-col items-center gap-3 p-4 
          bg-gradient-to-r ${action.color} rounded-xl 
          hover:shadow-lg hover:shadow-current/25
          transition-all duration-300 text-white overflow-hidden
          ${layout === 'list' ? 'flex-row text-left' : ''}
        `}
      >
        {/* Effet de brillance au survol */}
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-xl"
          initial={{ x: '-100%', opacity: 0 }}
          animate={hoveredAction === action.id ? { x: '100%', opacity: [0, 0.5, 0] } : {}}
          transition={{ duration: 0.6 }}
        />
        
        {/* Icône */}
        <div className={`
          relative z-10 p-2 bg-white/20 rounded-lg backdrop-blur-sm
          group-hover:bg-white/30 transition-colors
          ${layout === 'list' ? 'flex-shrink-0' : ''}
        `}>
          <Icon className="w-6 h-6" />
        </div>
        
        {/* Contenu */}
        <div className={`
          relative z-10 text-center
          ${layout === 'list' ? 'text-left flex-1' : ''}
        `}>
          <span className="font-medium text-sm block mb-1">
            {action.title}
          </span>
          {layout === 'list' && (
            <span className="text-xs text-white/80 block">
              {action.description}
            </span>
          )}
        </div>
        
        {/* Badge de catégorie (optionnel) */}
        {hoveredAction === action.id && layout === 'grid' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1"
          >
            <span className="text-xs font-medium">
              {action.category}
            </span>
          </motion.div>
        )}
      </motion.button>
    );
  };

  return (
    <div className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 ${className}`}>
      {/* En-tête */}
      {showTitle && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h3 className="text-white text-xl font-semibold">{title}</h3>
          </div>
          
          {/* Indicateur d'activité */}
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>Productif aujourd'hui</span>
          </div>
        </div>
      )}
      
      {/* Actions */}
      <div className={getLayoutClass()}>
        {displayedActions.map((action, index) => (
          <ActionButton 
            key={action.id} 
            action={action} 
            index={index}
          />
        ))}
      </div>
      
      {/* Statistiques des actions */}
      {layout === 'grid' && (
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Actions disponibles: {displayedActions.length}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Accès rapide activé</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickActions;
