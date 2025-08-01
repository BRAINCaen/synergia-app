// ==========================================
// 📁 react-app/src/components/layout/Sidebar.jsx
// SIDEBAR FIREBASE PUR - SANS DONNÉES MOCK
// ==========================================

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { useUnifiedFirebaseData } from '../../shared/hooks/useUnifiedFirebaseData.js';
import { 
  Home, 
  CheckSquare, 
  FolderOpen, 
  BarChart3, 
  Trophy, 
  User, 
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Zap,
  Star,
  Target,
  Flame,
  Gift
} from 'lucide-react';

/**
 * 🎨 SIDEBAR FIREBASE PUR
 * Interface utilisateur connectée 100% à Firebase
 */
const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const { user, signOut } = useAuthStore();
  
  // ✅ DONNÉES FIREBASE RÉELLES - Plus de mock !
  const { 
    gamification, 
    profile, 
    isLoading, 
    isReady,
    utils
  } = useUnifiedFirebaseData();

  const [isLoading_logout, setIsLoading_logout] = useState(false);

  // Navigation items
  const navigationItems = [
    {
      id: 'dashboard',
      path: '/dashboard',
      icon: Home,
      label: 'Dashboard',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'tasks',
      path: '/tasks',
      icon: CheckSquare,
      label: 'Tâches',
      gradient: 'from-green-500 to-emerald-500',
      badge: gamification.tasksCreated - gamification.tasksCompleted // Tâches restantes
    },
    {
      id: 'projects',
      path: '/projects',
      icon: FolderOpen,
      label: 'Projets',
      gradient: 'from-purple-500 to-violet-500'
    },
    {
      id: 'analytics',
      path: '/analytics',
      icon: BarChart3,
      label: 'Analytics',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      id: 'leaderboard',
      path: '/leaderboard',
      icon: Trophy,
      label: 'Classement',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'rewards',
      path: '/rewards',
      icon: Gift,
      label: 'Récompenses',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      id: 'profile',
      path: '/profile',
      icon: User,
      label: 'Profil',
      gradient: 'from-indigo-500 to-blue-500'
    },
    {
      id: 'settings',
      path: '/settings',
      icon: Settings,
      label: 'Paramètres',
      gradient: 'from-gray-500 to-slate-500'
    }
  ];

  const handleLogout = async () => {
    setIsLoading_logout(true);
    try {
      await signOut();
      console.log('✅ Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
    } finally {
      setIsLoading_logout(false);
    }
  };

  // Obtenir les initiales de l'utilisateur
  const getUserInitials = () => {
    if (profile?.displayName) {
      return profile.displayName.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.displayName) {
      return user.displayName.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return '?';
  };

  // Calculer l'XP pour le niveau suivant
  const getNextLevelXP = () => {
    return (gamification.level + 1) * 100;
  };

  // Calculer la progression du niveau actuel
  const getCurrentLevelProgress = () => {
    const currentLevelXp = gamification.totalXp % 100;
    return Math.round((currentLevelXp / 100) * 100);
  };

  // Obtenir le statut de productivité avec couleur
  const getProductivityStatus = () => {
    const productivity = gamification.productivity || 'starting';
    const statusConfig = {
      excellent: { label: 'Excellent', color: 'text-green-400', icon: '🚀' },
      high: { label: 'Élevée', color: 'text-blue-400', icon: '⭐' },
      moderate: { label: 'Modérée', color: 'text-yellow-400', icon: '📈' },
      low: { label: 'Faible', color: 'text-orange-400', icon: '🎯' },
      starting: { label: 'Débutant', color: 'text-gray-400', icon: '🌱' }
    };
    return statusConfig[productivity] || statusConfig.starting;
  };

  const productivityStatus = getProductivityStatus();

  return (
    <div className={`
      h-full bg-white shadow-xl transition-all duration-300 ease-in-out border-r border-gray-200
      ${collapsed ? 'w-16' : 'w-64'}
    `}>
      <div className="flex flex-col h-full">
        
        {/* Header avec toggle */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-800 text-lg">Synergia</span>
            </div>
          )}
          
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Profile utilisateur Firebase */}
        <div className="p-4 border-b border-gray-200">
          {isLoading ? (
            <div className="animate-pulse">
              <div className="w-12 h-12 bg-gray-300 rounded-full mb-2"></div>
              {!collapsed && (
                <>
                  <div className="w-24 h-4 bg-gray-300 rounded mb-1"></div>
                  <div className="w-16 h-3 bg-gray-300 rounded"></div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="relative">
                {user?.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt="Avatar" 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {getUserInitials()}
                  </div>
                )}
                
                {/* Indicateur de statut */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>

              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800 truncate">
                    {profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Utilisateur'}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {profile?.department === 'hr' && '👥 Ressources Humaines'}
                    {profile?.department === 'tech' && '💻 Technique'}
                    {profile?.department === 'sales' && '💼 Commercial'}
                    {profile?.department === 'marketing' && '📢 Marketing'}
                    {(!profile?.department || profile?.department === 'general') && '🌟 Général'}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Statistiques Firebase en temps réel */}
        {!collapsed && isReady && (
          <div className="p-4 border-b border-gray-200">
            <div className="space-y-3">
              
              {/* Niveau et XP */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-700">Niveau {gamification.level}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {gamification.totalXp} XP
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getCurrentLevelProgress()}%` }}
                  ></div>
                </div>
                
                <div className="text-xs text-gray-500 mt-1">
                  {100 - (gamification.totalXp % 100)} XP jusqu'au niveau {gamification.level + 1}
                </div>
              </div>

              {/* Tâches et Streak */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-green-50 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-green-600">
                    {gamification.tasksCompleted}
                  </div>
                  <div className="text-xs text-green-700">Tâches</div>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-lg font-bold text-orange-600">
                      {gamification.loginStreak}
                    </span>
                  </div>
                  <div className="text-xs text-orange-700">Streak</div>
                </div>
              </div>

              {/* Productivité */}
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{productivityStatus.icon}</span>
                    <span className="text-sm font-medium text-gray-700">Productivité</span>
                  </div>
                  <span className={`text-sm font-semibold ${productivityStatus.color}`}>
                    {productivityStatus.label}
                  </span>
                </div>
              </div>

              {/* Progrès hebdomadaire */}
              {utils?.weeklyXpProgress !== undefined && (
                <div className="bg-blue-50 rounded-lg p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Objectif Semaine</span>
                    <span className="text-xs text-gray-500">{utils.weeklyXpProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-1">
                    <div 
                      className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, utils.weeklyXpProgress)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`
                  group flex items-center gap-3 p-3 rounded-lg transition-all duration-200
                  ${isActive 
                    ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg` 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                
                {!collapsed && (
                  <>
                    <span className="font-medium">{item.label}</span>
                    
                    {/* Badge pour les notifications */}
                    {item.badge && item.badge > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer avec déconnexion */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            disabled={isLoading_logout}
            className={`
              w-full flex items-center gap-3 p-3 rounded-lg transition-colors
              text-gray-600 hover:bg-red-50 hover:text-red-600
              disabled:opacity-50 disabled:cursor-not-allowed
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && (
              <span className="font-medium">
                {isLoading_logout ? 'Déconnexion...' : 'Déconnexion'}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
