// ==========================================
// 📁 react-app/src/components/layout/Layout.jsx
// Layout principal avec navigation incluant les badges
// ==========================================

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { useGameStore } from '../../shared/stores/gameStore.js';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 🏗️ LAYOUT PRINCIPAL
 * 
 * Interface utilisateur complète avec :
 * - Sidebar navigation avec badges
 * - Header avec gamification
 * - Zone de contenu responsive
 * - Animations et interactions
 */
const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { xp, level, streak } = useGameStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      name: 'Badges', // 🆕 Nouveau lien
      href: '/badges',
      icon: '🏆',
      description: 'Galerie des badges',
      isNew: true // Indicateur nouveau
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
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 bg-gray-900">
          <div className="flex items-center space-x-2">
            <div className="text-2xl">⚡</div>
            <span className="text-white text-xl font-bold">Synergia</span>
          </div>
                      <button
            onClick={toggleSidebar}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Gamification Header dans la sidebar */}
        <div className="px-4 py-3 bg-gray-700/50 border-b border-gray-600">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              {level}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">
                Niveau {level}
              </div>
              <div className="text-gray-400 text-xs">
                {xp} XP • 🔥 {streak} jours
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-4 px-2 space-y-1 flex-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  group relative flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
                  ${isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="text-lg mr-3">{item.icon}</span>
                <span className="flex-1">{item.name}</span>
                
                {/* Indicateur nouveau pour Badges */}
                {item.isNew && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded-full"
                  >
                    NEW
                  </motion.span>
                )}

                {/* Effet hover */}
                {!isActive && (
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/10 group-hover:to-purple-600/10 transition-all duration-300" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section en bas */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3 mb-3">
            <img
              src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || user?.email}&background=6366f1&color=fff`}
              alt="Avatar"
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">
                {user?.displayName || user?.email?.split('@')[0]}
              </div>
              <div className="text-gray-400 text-xs truncate">
                {user?.email}
              </div>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Déconnexion
          </button>
        </div>
      </div>

      {/* Overlay pour mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header mobile */}
        <div className="lg:hidden bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
          <button
            onClick={toggleSidebar}
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center space-x-4">
            {/* Gamification mobile */}
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {level}
              </div>
              <span className="text-white">{xp} XP</span>
              <span className="text-gray-400">🔥 {streak}</span>
            </div>

            <img
              src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || user?.email}&background=6366f1&color=fff`}
              alt="Avatar"
              className="w-8 h-8 rounded-full"
            />
          </div>
        </div>

        {/* Zone de contenu */}
        <main className="flex-1 overflow-auto bg-gray-900">
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
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
