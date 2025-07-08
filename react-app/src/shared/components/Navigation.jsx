// ==========================================
// 📁 react-app/src/shared/components/Navigation.jsx
// NAVIGATION COMPLÈTE AVEC TOUTES LES PAGES
// ==========================================

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore.js';
import { ROUTES } from '../../core/constants.js';

const Navigation = () => {
  const location = useLocation();
  const { user, signOut } = useAuthStore();

  const handleLogout = async () => {
    try {
      await signOut();
      console.log('👋 Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
    }
  };

  const navItems = [
    {
      path: ROUTES.DASHBOARD,
      label: 'Dashboard',
      icon: '🏠'
    },
    {
      path: ROUTES.TASKS,
      label: 'Tâches',
      icon: '✅'
    },
    {
      path: ROUTES.PROJECTS,
      label: 'Projets',
      icon: '📁'
    },
    {
      path: ROUTES.ANALYTICS,
      label: 'Analytics',
      icon: '📊'
    },
    {
      path: ROUTES.GAMIFICATION,
      label: 'Gamification',
      icon: '🎮'
    },
    {
      path: ROUTES.BADGES,
      label: 'Badges',
      icon: '🏆'
    },
    {
      path: ROUTES.LEADERBOARD,
      label: 'Classement',
      icon: '🥇'
    },
    {
      path: ROUTES.TEAM,
      label: 'Équipe',
      icon: '👥'
    }
  ];

  // Éléments de navigation admin
  const adminItems = [
    {
      path: ROUTES.ADMIN_TASK_VALIDATION,
      label: 'Validation Tâches',
      icon: '🛡️'
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Vérifier si l'utilisateur est admin
  const isAdmin = user?.role === 'admin' || user?.profile?.role === 'admin' || user?.isAdmin;

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo et titre */}
          <div className="flex items-center space-x-4">
            <Link to={ROUTES.DASHBOARD} className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <span className="text-xl">⚡</span>
              </div>
              <span className="text-2xl font-bold text-white">Synergia</span>
            </Link>
            
            <span className="px-3 py-1 bg-gradient-to-r from-green-600 to-blue-600 text-white text-xs rounded-full font-medium">
              v3.5 • COMPLET
            </span>
          </div>

          {/* Navigation principale */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
                  ${isActive(item.path)
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }
                `}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}

            {/* Navigation admin si applicable */}
            {isAdmin && (
              <>
                <div className="w-px h-6 bg-gray-600 mx-2" />
                {adminItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
                      ${isActive(item.path)
                        ? 'bg-red-600 text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-red-700'
                      }
                    `}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </>
            )}
          </div>

          {/* Profile et déconnexion */}
          <div className="flex items-center space-x-4">
            <Link
              to={ROUTES.PROFILE}
              className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors"
            >
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full border-2 border-gray-600"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.displayName?.[0] || user?.email?.[0] || '?'}
                  </span>
                </div>
              )}
              <span className="font-medium">{user?.displayName || 'Profil'}</span>
            </Link>
            
            <button
              onClick={handleLogout}
              className="text-gray-300 hover:text-red-400 transition-colors"
              title="Déconnexion"
            >
              <span className="text-lg">🚪</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
