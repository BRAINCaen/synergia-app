// ==========================================
// 📁 react-app/src/layouts/MainLayout.jsx
// MAINLAYOUT CORRIGÉ - IMPORTS FIXÉS
// ==========================================

import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';

// 🔧 CORRECTION: Imports depuis les bons chemins
import { useAuthStore } from '../shared/stores/authStore.js';
import { useGameStore } from '../shared/stores/gameStore.js';

const MainLayout = () => {
  const { user, signOut } = useAuthStore();
  const { level, xp, nextLevelXP } = useGameStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  // 🚀 NAVIGATION COMPLÈTE AVEC TOUTES LES PAGES
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/tasks', label: 'Tâches', icon: '✅' },
    { path: '/projects', label: 'Projets', icon: '📁' },
    { path: '/analytics', label: 'Analytics', icon: '📊' },
    { path: '/gamification', label: 'Gamification', icon: '🎮' },
    { path: '/team', label: 'Équipe', icon: '👥' },
    { path: '/profile', label: 'Profil', icon: '👤' },
    { path: '/users', label: 'Utilisateurs', icon: '👨‍👩‍👧‍👦' }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo et navigation */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">⚡</span>
                <span className="text-xl font-bold text-white">Synergia</span>
                <span className="text-sm bg-green-500 text-white px-2 py-1 rounded-full">
                  v3.5
                </span>
              </div>

              {/* Navigation principale */}
              <nav className="hidden md:flex space-x-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700'
                      }`
                    }
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>

            {/* Section utilisateur */}
            <div className="flex items-center space-x-4">
              {/* Progression XP */}
              <div className="hidden lg:flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-white">
                    Niveau {level || 1}
                  </div>
                  <div className="text-xs text-gray-400">
                    {xp || 0} / {nextLevelXP || 1000} XP
                  </div>
                </div>
                <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                    style={{ 
                      width: `${Math.min(((xp || 0) / (nextLevelXP || 1000)) * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>

              {/* Menu utilisateur */}
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium text-white">
                    {user?.displayName || user?.email || 'Utilisateur'}
                  </div>
                  <div className="text-xs text-gray-400">
                    Connecté
                  </div>
                </div>
                
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
                  </span>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700"
                  title="Déconnexion"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation mobile */}
      <nav className="md:hidden bg-gray-800 border-t border-gray-700">
        <div className="flex justify-around py-2">
          {navItems.slice(0, 5).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center py-2 px-3 transition-colors ${
                  isActive
                    ? 'text-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs mt-1">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
