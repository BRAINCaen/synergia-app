// ==========================================
// 📁 react-app/src/components/layout/Sidebar.jsx
// Sidebar TEMPORAIRE SANS GAMESTORE
// ==========================================

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../shared/stores/authStore.js';
// 🚨 GAMESTORE TEMPORAIREMENT DÉSACTIVÉ
// import { useGameStore } from '../../shared/stores/gameStore.js';
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
 * 🎨 SIDEBAR PREMIUM TEMPORAIRE SANS GAMESTORE
 */
const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const { user, signOut } = useAuthStore();
  
  // 🚨 DONNÉES GAMESTORE TEMPORAIRES MOCKÉES
  const mockGameData = {
    level: 2,
    xp: 175,
    streak: 3,
    tasksCompleted: 12
  };

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
      await signOut();
      console.log('✅ Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
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
    return (mockGameData.level + 1) * 100;
  };

  return (
    <div className={`
      h-full bg-white shadow-xl transition-all duration-300 ease-in-out border-r border-gray-200
      ${collapsed ? 'w-16' : 'w-64'}
    `}>
      {/* Header Sidebar */}
      <div className="flex items-center justify-center h-16 px-4 bg-gradient-to-r from-purple-600 to-pink-600">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-xl font-bold text-white">S</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Synergia</h1>
              <p className="text-xs text-white/80">v3.5.1 - Debug</p>
            </div>
          </div>
        )}
        
        {collapsed && (
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <span className="text-lg font-bold text-white">S</span>
          </div>
        )}

        {/* Toggle Button */}
        {onToggle && (
          <button
            onClick={onToggle}
            className="absolute -right-3 top-6 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-200"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            )}
          </button>
        )}
      </div>

      {/* Profil utilisateur */}
      {!collapsed && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              {getUserInitials()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.displayName || user?.email?.split('@')[0] || 'Utilisateur'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          
          {/* Stats gamification temporaires */}
          <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-medium text-purple-700">Stats Debug</span>
              <span className="text-purple-500">🔧</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="font-semibold text-purple-600">{mockGameData.level}</div>
                <div className="text-xs text-gray-500">Niveau</div>
              </div>
              <div>
                <div className="font-semibold text-blue-600">{mockGameData.xp}</div>
                <div className="text-xs text-gray-500">XP</div>
              </div>
              <div>
                <div className="font-semibold text-orange-600">{mockGameData.streak}</div>
                <div className="text-xs text-gray-500">Streak</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`
                group flex items-center rounded-xl transition-all duration-200 relative
                ${collapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'}
                ${isActive 
                  ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg transform scale-105` 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
              title={collapsed ? item.label : ''}
            >
              <Icon className={`${collapsed ? 'w-5 h-5' : 'w-5 h-5 mr-3'} flex-shrink-0`} />
              
              {!collapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}

              {/* Indicateur actif pour version collapsed */}
              {collapsed && isActive && (
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-white rounded-l-full"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer avec bouton déconnexion */}
      <div className="p-4 border-t border-gray-200">
        {!collapsed ? (
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                <span>Déconnexion...</span>
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="w-full flex items-center justify-center p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            title="Déconnexion"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
            ) : (
              <LogOut className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
