// ==========================================
// 📁 react-app/src/components/layout/Layout.jsx
// Layout principal TEMPORAIRE SANS GAMESTORE
// ==========================================

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../shared/stores/authStore.js';
// 🚨 GAMESTORE TEMPORAIREMENT DÉSACTIVÉ
// import { useGameStore } from '../../shared/stores/gameStore.js';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 🏗️ LAYOUT PRINCIPAL TEMPORAIRE SANS GAMESTORE
 */
const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  
  // 🚨 DONNÉES GAMESTORE TEMPORAIRES MOCKÉES
  const mockUserStats = {
    totalXp: 175,
    level: 2,
    loginStreak: 3,
    tasksCompleted: 12
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Données gamification avec fallbacks
  const xp = mockUserStats?.totalXp || 0;
  const level = mockUserStats?.level || 1;
  const streak = mockUserStats?.loginStreak || 0;

  // Navigation items avec badges ajoutés
  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: '📊',
      description: 'Vue d\'ensemble'
    },
    {
      name: 'Tâches',
      href: '/tasks',
      icon: '✅',
      description: 'Gestion des tâches'
    },
    {
      name: 'Projets',
      href: '/projects',
      icon: '📁',
      description: 'Gestion des projets'
    },
    {
      name: 'Badges',
      href: '/badges',
      icon: '🏆',
      description: 'Galerie des badges',
      isNew: true
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: '📈',
      description: 'Statistiques'
    },
    {
      name: 'Classement',
      href: '/leaderboard',
      icon: '🏆',
      description: 'Leaderboard'
    },
    {
      name: 'Profil',
      href: '/profile',
      icon: '👤',
      description: 'Mon profil'
    },
    {
      name: 'Utilisateurs',
      href: '/users',
      icon: '👥',
      description: 'Gestion utilisateurs'
    }
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
      console.log('✅ Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
        lg:relative lg:z-auto lg:translate-x-0 lg:shadow-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header Sidebar */}
        <div className="flex items-center justify-center h-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-xl">⚡</span>
            </div>
            <span className="text-xl font-bold text-white">Synergia</span>
            <span className="text-xs bg-amber-500 text-white px-2 py-1 rounded-full">
              DEBUG
            </span>
          </div>
        </div>

        {/* Profil utilisateur dans la sidebar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.displayName ? user.displayName.charAt(0) : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.displayName || user?.email?.split('@')[0] || 'Utilisateur'}
              </p>
              <p className="text-xs text-gray-500">En ligne</p>
            </div>
          </div>
          
          {/* Stats gamification temporaires */}
          <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-medium text-amber-700">Stats Temporaires</span>
              <span className="text-amber-600">🔧</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="text-center">
                <div className="font-semibold text-blue-600">{level}</div>
                <div className="text-gray-500">Niveau</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-purple-600">{xp}</div>
                <div className="text-gray-500">XP</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-orange-600">{streak}</div>
                <div className="text-gray-500">Streak</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors relative
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                <span>{item.name}</span>
                
                {/* Badge NEW */}
                {item.isNew && (
                  <span className="ml-auto px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                    NEW
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer sidebar */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <span>🚪</span>
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Header principal pour mobile */}
      <div className="lg:hidden sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between h-16 px-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-900">Synergia</span>
            <span className="text-xs bg-amber-500 text-white px-2 py-1 rounded-full">
              DEBUG
            </span>
          </div>
          
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {user?.displayName ? user.displayName.charAt(0) : 'U'}
          </div>
        </div>
      </div>

      {/* Zone de contenu principal */}
      <main className="lg:pl-64 min-h-screen">
        <div className="relative">
          {/* Banner debug visible */}
          <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-white p-2 text-center text-sm">
            🔧 Mode Debug Actif - GameStore temporairement désactivé - Données simulées
          </div>
          
          {/* Contenu des pages */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
