// ==========================================
// 📁 react-app/src/components/layout/Layout.jsx
// Layout principal avec navigation incluant les badges - CORRIGÉ
// ==========================================

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { useGameStore } from '../../shared/stores/gameStore.js';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 🏗️ LAYOUT PRINCIPAL CORRIGÉ
 * 
 * Interface utilisateur complète avec :
 * - Sidebar navigation avec badges
 * - Header avec gamification
 * - Zone de contenu responsive
 * - CORRECTION : children s'affichent maintenant correctement
 */
const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { userStats } = useGameStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Données gamification avec fallbacks
  const xp = userStats?.totalXp || 0;
  const level = userStats?.level || 1;
  const streak = userStats?.loginStreak || 0;

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
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur déconnexion:', error);
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
                {user?.displayName || 'Utilisateur'}
              </p>
              <p className="text-xs text-gray-500">En ligne</p>
            </div>
          </div>
          
          {/* Stats gamification */}
          <div className="mt-3 flex items-center justify-between text-xs">
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
                  flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                <span className="flex-1">{item.name}</span>
                {item.isNew && (
                  <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    New
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bouton déconnexion en bas */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <span className="mr-3">🚪</span>
            Se déconnecter
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Bouton menu mobile */}
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 rounded-lg bg-white shadow-lg text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                  <line x1="4" x2="20" y1="12" y2="12"></line>
                  <line x1="4" x2="20" y1="6" y2="6"></line>
                  <line x1="4" x2="20" y1="18" y2="18"></line>
                </svg>
              </button>

              {/* Titre de la page */}
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  📊 Tableau de bord
                </h1>
              </div>

              {/* Infos utilisateur et actions */}
              <div className="flex items-center space-x-4">
                {/* Stats rapides desktop */}
                <div className="hidden md:flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user?.displayName || 'Utilisateur'}</p>
                    <p className="text-xs text-gray-500">En ligne</p>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user?.displayName ? user.displayName.charAt(0) : 'U'}
                  </div>
                </div>

                {/* Notifications */}
                <div className="relative">
                  <button className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM12 19l0-7.154M12 5v7M19 12h-7"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    </svg>
                  </button>
                </div>

                {/* Menu hamburger mobile */}
                <button className="lg:hidden p-2 text-gray-600 hover:text-gray-900">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* ⭐ ZONE DE CONTENU PRINCIPALE - CORRIGÉE */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            {/* ⭐ C'EST ICI QUE LES CHILDREN DOIVENT S'AFFICHER */}
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="min-h-screen"
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
