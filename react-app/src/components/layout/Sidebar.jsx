// ==========================================
// 📁 react-app/src/shared/components/layout/Sidebar.jsx
// Sidebar premium avec design moderne et gradients
// ==========================================

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore.js';
import { useGameStore } from '../../stores/gameStore.js';
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
  Target
} from 'lucide-react';

/**
 * 🎨 SIDEBAR PREMIUM AVEC DESIGN MODERNE
 */
const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { level, xp, streak, tasksCompleted } = useGameStore();
  const [isLoading, setIsLoading] = useState(false);

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
      gradient: 'from-green-500 to-emerald-500'
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
      id: 'profile',
      path: '/profile',
      icon: User,
      label: 'Profil',
      gradient: 'from-pink-500 to-rose-500'
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
    setIsLoading(true);
    try {
      await logout();
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Obtenir les initiales de l'utilisateur
  const getUserInitials = () => {
    if (!user?.displayName && !user?.email) return '?';
    const name = user.displayName || user.email;
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  // Calculer le niveau suivant
  const getNextLevelXP = () => {
    return (level + 1) * 100; // Système simple: niveau 2 = 200 XP, niveau 3 = 300 XP, etc.
  };

  const getXPProgress = () => {
    const currentLevelXP = level * 100;
    const nextLevelXP = getNextLevelXP();
    const progressXP = xp - currentLevelXP;
    const neededXP = nextLevelXP - currentLevelXP;
    return (progressXP / neededXP) * 100;
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full bg-white/5 backdrop-blur-xl border-r border-white/10
        transition-all duration-300 z-30
        ${collapsed ? 'w-16' : 'w-64'}
      `}>
        {/* Header avec logo */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                  ⚡
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Synergia</h1>
                  <p className="text-xs text-blue-200">v3.5.1 Premium</p>
                </div>
              </div>
            )}
            
            {collapsed && (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg mx-auto">
                ⚡
              </div>
            )}
            
            {!collapsed && (
              <button
                onClick={onToggle}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
              >
                <ChevronLeft size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Profil utilisateur */}
        <div className="p-4 border-b border-white/10">
          {!collapsed ? (
            <div className="space-y-3">
              {/* Avatar et nom */}
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                  {getUserInitials()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {user?.displayName || user?.email?.split('@')[0] || 'Utilisateur'}
                  </p>
                  <p className="text-blue-200 text-sm">Niveau {level}</p>
                </div>
              </div>

              {/* Stats rapides */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/5 rounded-lg p-2 text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Star size={14} className="text-yellow-400" />
                  </div>
                  <p className="text-xs text-white/80">{xp} XP</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2 text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Target size={14} className="text-green-400" />
                  </div>
                  <p className="text-xs text-white/80">{tasksCompleted}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2 text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Zap size={14} className="text-orange-400" />
                  </div>
                  <p className="text-xs text-white/80">{streak}j</p>
                </div>
              </div>

              {/* Barre de progression XP */}
              <div>
                <div className="flex justify-between text-xs text-white/60 mb-1">
                  <span>Niveau {level}</span>
                  <span>Niveau {level + 1}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(getXPProgress(), 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-white/60 mt-1 text-center">
                  {getNextLevelXP() - xp} XP pour le niveau suivant
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                {getUserInitials()}
              </div>
              <div className="w-8 bg-white/10 rounded-full h-1">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-1 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(getXPProgress(), 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`
                  group flex items-center space-x-3 p-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? `bg-gradient-to-r ${item.gradient} shadow-lg text-white` 
                    : 'hover:bg-white/10 text-white/70 hover:text-white'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
              >
                <Icon size={20} className={isActive ? 'text-white' : ''} />
                {!collapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
                
                {/* Indicateur actif pour sidebar collapsed */}
                {collapsed && isActive && (
                  <div className="absolute left-0 w-1 h-8 bg-white rounded-r-full"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bouton de déconnexion */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className={`
              w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200
              hover:bg-red-500/20 text-white/70 hover:text-red-400 group
              ${collapsed ? 'justify-center' : ''}
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-400"></div>
            ) : (
              <LogOut size={20} />
            )}
            {!collapsed && (
              <span className="font-medium">
                {isLoading ? 'Déconnexion...' : 'Déconnexion'}
              </span>
            )}
          </button>
        </div>

        {/* Bouton d'expansion quand collapsed */}
        {collapsed && (
          <button
            onClick={onToggle}
            className="absolute -right-3 top-8 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* Overlay pour mobile */}
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 lg:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
};

export default Sidebar;
