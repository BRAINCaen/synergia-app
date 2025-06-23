// ==========================================
// 📁 react-app/src/layouts/MainLayout.jsx
// MODIFICATION : Ajout navigation équipe collaborative
// ==========================================

import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../shared/stores/authStore';

const MainLayout = () => {
  const { user, setUser } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  // Vérifier si l'utilisateur est admin
  const isAdmin = user?.role === 'admin' || user?.permissions?.includes('validate_xp');

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation sidebar */}
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 min-h-screen border-r border-gray-700">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-white mb-8">⚡ Synergia</h1>
            
            {/* Navigation */}
            <nav className="space-y-2">
              <a
                href="/dashboard"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === '/dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span>📊</span>
                Dashboard
              </a>
              
              <a
                href="/tasks"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === '/tasks'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span>✅</span>
                Mes Tâches
              </a>
              
              <a
                href="/projects"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === '/projects'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span>📁</span>
                Projets
              </a>
              
              {/* ⭐ NOUVEAU : Navigation Équipe avec badge */}
              <a
                href="/team"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === '/team'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span>👥</span>
                <span className="flex-1">Équipe</span>
                <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                  New
                </span>
              </a>
              
              <a
                href="/gamification"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === '/gamification'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span>🎮</span>
                Gamification
              </a>
              
              <a
                href="/leaderboard"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === '/leaderboard'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span>🏆</span>
                Classement
              </a>
              
              <a
                href="/analytics"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === '/analytics'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span>📈</span>
                Analytics
              </a>
              
              <a
                href="/profile"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === '/profile'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span>👤</span>
                Profil
              </a>
            </nav>

            {/* Section Admin si applicable */}
            {isAdmin && (
              <div className="mt-8">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
                  Administration
                </div>
                <nav className="space-y-1">
                  <a
                    href="/admin"
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      location.pathname === '/admin'
                        ? 'bg-yellow-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <span>👑</span>
                    Administration
                  </a>
                </nav>
              </div>
            )}
          </div>
          
          {/* User info et logout */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm truncate">
                    {user?.displayName || user?.email}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {isAdmin ? '👑 Admin' : '👤 Membre'}
                  </div>
                </div>
              </div>
              
              {/* Indicateur mode collaboratif si sur page équipe */}
              {location.pathname === '/team' && (
                <div className="mb-3 flex items-center gap-2 bg-green-900/20 border border-green-600/30 px-2 py-1 rounded text-xs">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400">Mode Collaboratif</span>
                </div>
              )}
              
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm transition-colors"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          {/* Top bar avec contexte */}
          <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {location.pathname === '/dashboard' && '📊 Dashboard Personnel'}
                  {location.pathname === '/tasks' && '✅ Mes Tâches'}
                  {location.pathname === '/projects' && '📁 Projets'}
                  {location.pathname === '/team' && '👥 Dashboard Équipe'}
                  {location.pathname === '/gamification' && '🎮 Gamification'}
                  {location.pathname === '/leaderboard' && '🏆 Classement'}
                  {location.pathname === '/analytics' && '📈 Analytics'}
                  {location.pathname === '/profile' && '👤 Profil'}
                </h2>
                <p className="text-gray-400 text-sm">
                  {location.pathname === '/dashboard' && 'Vue d\'ensemble de vos activités'}
                  {location.pathname === '/tasks' && 'Gérez vos tâches personnelles'}
                  {location.pathname === '/projects' && 'Collaborez sur les projets d\'équipe'}
                  {location.pathname === '/team' && 'Vue collaborative - Qui fait quoi, validation XP'}
                  {location.pathname === '/gamification' && 'Système de récompenses et badges'}
                  {location.pathname === '/leaderboard' && 'Classement et compétition équipe'}
                  {location.pathname === '/analytics' && 'Métriques et performance'}
                  {location.pathname === '/profile' && 'Gestion de votre profil'}
                </p>
              </div>

              {/* Quick actions selon la page */}
              <div className="flex items-center gap-3">
                {location.pathname === '/team' && (
                  <div className="flex items-center gap-2 bg-blue-900/20 border border-blue-600/30 px-3 py-2 rounded-lg">
                    <span className="text-blue-400 text-sm">🔥 Collaboration Active</span>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
