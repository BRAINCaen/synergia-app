// ==========================================
// 📁 react-app/src/layouts/DashboardLayout.jsx
// LAYOUT CORRIGÉ QUI GARDE TON STYLE EXISTANT
// ==========================================

import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../shared/stores/authStore.js';

const DashboardLayout = () => {
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

  // Navigation items - ON GARDE TON STYLE EXISTANT
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/tasks', label: 'Tâches', icon: '✅' },
    { path: '/projects', label: 'Projets', icon: '📁' },
    { path: '/analytics', label: 'Analytics', icon: '📊' },
    { path: '/gamification', label: 'Gamification', icon: '🎮' },
    { path: '/badges', label: 'Badges', icon: '🏆' },
    { path: '/leaderboard', label: 'Classement', icon: '🥇' },
    { path: '/team', label: 'Équipe', icon: '👥' },
  ];

  // Check if admin
  const isAdmin = user?.role === 'admin' || user?.profile?.role === 'admin' || user?.isAdmin;

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVIGATION - ON GARDE TON STYLE EXISTANT EXACTEMENT */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo et titre - EXACTEMENT COMME TON ORIGINAL */}
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                  <span className="text-xl">⚡</span>
                </div>
                <span className="text-2xl font-bold text-white">Synergia</span>
              </Link>
              
              <span className="px-3 py-1 bg-gradient-to-r from-green-600 to-blue-600 text-white text-xs rounded-full font-medium">
                v3.5 • COMPLET
              </span>
            </div>

            {/* Navigation principale - TON STYLE EXACT */}
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

              {/* Section admin si applicable */}
              {isAdmin && (
                <>
                  <div className="w-px h-6 bg-gray-600 mx-2" />
                  <Link
                    to="/admin/task-validation"
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
                      ${isActive('/admin/task-validation')
                        ? 'bg-red-600 text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-red-700'
                      }
                    `}
                  >
                    <span className="text-lg">🛡️</span>
                    <span>Validation</span>
                  </Link>
                </>
              )}
            </div>

            {/* Profile et déconnexion - TON STYLE EXACT */}
            <div className="flex items-center space-x-4">
              <Link
                to="/profile"
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
      
      {/* Contenu principal - EXACTEMENT COMME TON ORIGINAL */}
      <main className="pb-8">
        <Outlet />
      </main>
      
      {/* Footer - TON STYLE EXACT */}
      <footer className="bg-gray-800 text-gray-400 py-4 text-center text-sm">
        <p>© 2024 Synergia v3.5 - Toutes les fonctionnalités reconnectées</p>
      </footer>
    </div>
  );
};

export default DashboardLayout;
