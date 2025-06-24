// ==========================================
// 📁 react-app/src/App.jsx
// Application principale mise à jour avec le système de badges
// ==========================================

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './shared/stores/authStore.js';
import { useGameStore } from './shared/stores/gameStore.js';

// 🔧 Services - Utilisation de la structure existante
import { authService, gamificationService } from './core/services/index.js';
import BadgeIntegrationService from './core/services/badgeIntegrationService.js';

// 📱 Pages
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import TasksPage from './pages/TasksPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import GamificationPage from './pages/GamificationPage.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import UsersPage from './pages/UsersPage.jsx';

// 🎮 Composants de gamification
import BadgeNotification from './components/gamification/BadgeNotification.jsx';
import LoadingSpinner from './components/ui/LoadingSpinner.jsx';

// 🧭 Composant de navigation
const Navbar = ({ user, onLogout }) => {
  const { level, xp, badges } = useGameStore();
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Tâches', href: '/tasks', icon: '✅' },
    { name: 'Projets', href: '/projects', icon: '📁' },
    { name: 'Analytics', href: '/analytics', icon: '📈' },
    { name: 'Gamification', href: '/gamification', icon: '🎮' },
    { name: 'Classement', href: '/leaderboard', icon: '🏆' },
    { name: 'Profil', href: '/profile', icon: '👤' },
    { name: 'Équipe', href: '/users', icon: '👥' }
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo et titre */}
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ⚡ SYNERGIA
            </div>
            <span className="hidden md:block text-sm text-gray-500">v3.5</span>
          </div>

          {/* Navigation principale */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </a>
            ))}
          </div>

          {/* Profil utilisateur et gamification */}
          <div className="flex items-center space-x-4">
            {/* Stats de gamification */}
            <div className="hidden lg:flex items-center space-x-4 px-4 py-2 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-1 text-sm">
                <span className="text-blue-600 font-semibold">Niv. {level || 1}</span>
              </div>
              <div className="flex items-center space-x-1 text-sm">
                <span>⭐</span>
                <span className="text-yellow-600 font-medium">{xp || 0}</span>
              </div>
              <div className="flex items-center space-x-1 text-sm">
                <span>🏅</span>
                <span className="text-purple-600 font-medium">{(badges || []).length}</span>
              </div>
            </div>

            {/* Profil utilisateur */}
            <div className="flex items-center space-x-3">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || user.email}
                  className="w-8 h-8 rounded-full border-2 border-gray-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                  {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
                </div>
              )}
              
              <div className="hidden md:block">
                <div className="text-sm font-medium text-gray-900">
                  {user?.displayName || 'Utilisateur'}
                </div>
                <div className="text-xs text-gray-500 truncate max-w-32">
                  {user?.email}
                </div>
              </div>

              {/* Bouton déconnexion */}
              <button
                onClick={onLogout}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Se déconnecter"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation mobile */}
      <div className="md:hidden border-t border-gray-200 bg-gray-50">
        <div className="px-2 py-3 space-y-1 max-h-64 overflow-y-auto">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
};

/**
 * 🚀 COMPOSANT PRINCIPAL DE L'APPLICATION
 */
const App = () => {
  const { user, loading: authLoading, setUser, clearUser } = useAuthStore();
  const { initializeUser, loading: gameLoading } = useGameStore();
  const [appInitialized, setAppInitialized] = useState(false);

  // 🔧 INITIALISATION DE L'APPLICATION
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Initialisation de l\'application...');

        // 1. Vérifier l'authentification
        const currentUser = await authService.getCurrentUser();
        
        if (currentUser) {
          console.log('👤 Utilisateur connecté:', currentUser.email);
          setUser(currentUser);
          
          // 2. Initialiser la gamification
          await initializeUser(currentUser.uid);
          
          // 3. Initialiser le système de badges
          BadgeIntegrationService.initialize();
          
          // 4. Déclencher une vérification initiale des badges
          setTimeout(() => {
            BadgeIntegrationService.triggerBadgeCheck(currentUser.uid, 'appInit');
          }, 2000);
        }

      } catch (error) {
        console.error('❌ Erreur initialisation app:', error);
      } finally {
        setAppInitialized(true);
      }
    };

    initializeApp();
  }, [setUser, initializeUser]);

  // 🎧 ÉCOUTER LES CHANGEMENTS D'AUTHENTIFICATION
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (user) => {
      if (user && !authLoading) {
        setUser(user);
        await initializeUser(user.uid);
        
        // Déclencher vérification badges après connexion
        setTimeout(() => {
          BadgeIntegrationService.triggerBadgeCheck(user.uid, 'login');
        }, 1000);
      } else if (!user) {
        clearUser();
      }
    });

    return () => unsubscribe();
  }, [setUser, clearUser, initializeUser, authLoading]);

  // 🎮 ÉCOUTER LES ÉVÉNEMENTS DE GAMIFICATION POUR DÉCLENCHER LES BADGES
  useEffect(() => {
    if (!user?.uid) return;

    const handleTaskCompleted = async (event) => {
      // Attendre un peu pour que Firebase soit mis à jour
      setTimeout(() => {
        BadgeIntegrationService.triggerBadgeCheck(user.uid, 'taskCompleted', event.detail);
      }, 1000);
    };

    const handleProjectCompleted = async (event) => {
      setTimeout(() => {
        BadgeIntegrationService.triggerBadgeCheck(user.uid, 'projectCompleted', event.detail);
      }, 1000);
    };

    // Écouter les événements globaux
    window.addEventListener('taskCompleted', handleTaskCompleted);
    window.addEventListener('projectCompleted', handleProjectCompleted);

    return () => {
      window.removeEventListener('taskCompleted', handleTaskCompleted);
      window.removeEventListener('projectCompleted', handleProjectCompleted);
    };
  }, [user?.uid]);

  // 🚪 FONCTION DE DÉCONNEXION
  const handleLogout = async () => {
    try {
      await authService.logout();
      clearUser();
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
    }
  };

  // ⏳ ÉCRAN DE CHARGEMENT
  if (!appInitialized || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            Chargement de Synergia...
          </h2>
          <p className="mt-2 text-gray-600">
            Initialisation du système de gamification
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* 🔔 Système de notifications de badges global */}
        <BadgeNotification />

        {user ? (
          <>
            {/* 🧭 Navigation */}
            <Navbar user={user} onLogout={handleLogout} />
            
            {/* 📱 Contenu principal */}
            <main className="min-h-screen">
              {gameLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <LoadingSpinner />
                    <p className="mt-4 text-gray-600">Chargement des données de gamification...</p>
                  </div>
                </div>
              ) : (
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/tasks" element={<TasksPage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/gamification" element={<GamificationPage />} />
                  <Route path="/leaderboard" element={<LeaderboardPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              )}
            </main>
          </>
        ) : (
          /* 🔐 Page de connexion */
          <Routes>
            <Route path="*" element={<LoginPage />} />
          </Routes>
        )}
      </div>
    </Router>
  );
};

export default App;
