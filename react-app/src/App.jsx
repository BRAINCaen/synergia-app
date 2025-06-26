// ==========================================
// 📁 react-app/src/App.jsx
// Application principale CORRIGÉE - Sans GameStore problématique
// ==========================================

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './shared/stores/authStore.js';

// Pages
import Dashboard from './pages/Dashboard.jsx';
import TasksPage from './pages/TasksPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

// Services
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './core/firebase.js';

/**
 * 🎨 SIDEBAR PREMIUM SIMPLE - SANS GAMESTORE
 */
const SimpleSidebar = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const navigation = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/tasks', label: 'Tâches', icon: '✅' },
    { path: '/projects', label: 'Projets', icon: '📁' },
    { path: '/analytics', label: 'Analytics', icon: '📊' },
    { path: '/leaderboard', label: 'Classement', icon: '🏆' },
    { path: '/profile', label: 'Profil', icon: '👤' },
    { path: '/settings', label: 'Paramètres', icon: '⚙️' }
  ];

  const getUserInitials = () => {
    if (!user?.displayName && !user?.email) return '?';
    const name = user.displayName || user.email;
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 z-30">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
            ⚡
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Synergia</h1>
            <p className="text-xs text-blue-200">v3.5.1 Premium</p>
          </div>
        </div>
      </div>

      {/* Profil utilisateur */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg">
            {getUserInitials()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate">
              {user?.displayName || user?.email || 'Utilisateur'}
            </p>
            <div className="flex items-center space-x-4 mt-1">
              <div className="flex items-center space-x-1">
                <span className="text-yellow-400">⭐</span>
                <span className="text-white text-sm font-medium">4</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-blue-400">⚡</span>
                <span className="text-white text-sm font-medium">175</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <a
                key={item.path}
                href={item.path}
                className={`
                  flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                    : 'hover:bg-white/10 text-white/70 hover:text-white'
                  }
                `}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </a>
            );
          })}
        </div>
      </nav>

      {/* Déconnexion */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 p-3 rounded-xl text-white/70 hover:text-red-400 hover:bg-red-500/20 transition-all duration-200"
        >
          <span className="text-xl">🚪</span>
          <span className="font-medium">Déconnexion</span>
        </button>
      </div>
    </div>
  );
};

/**
 * 🎨 LAYOUT PRINCIPAL AVEC DESIGN PREMIUM
 */
const PremiumLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Background avec effet */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900/90 via-blue-900/90 to-purple-900/90 backdrop-blur-sm"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
      
      {/* Contenu principal */}
      <div className="relative z-10 flex">
        {/* Sidebar */}
        <SimpleSidebar />
        
        {/* Contenu principal */}
        <main className="flex-1 ml-64">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

/**
 * 🌟 ÉCRAN DE CHARGEMENT INTÉGRÉ
 */
const PremiumLoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl shadow-2xl mb-6 mx-auto animate-pulse">
          ⚡
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Synergia v3.5</h2>
        <p className="text-blue-200 mb-6">Chargement de votre espace de travail...</p>
        <div className="flex space-x-2 justify-center">
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};

/**
 * 🔐 PAGE DE CONNEXION PREMIUM
 */
const PremiumLoginPage = () => {
  const { login, loading, error } = useAuthStore();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await login();
    } catch (error) {
      console.error('Erreur de connexion:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900/90 via-blue-900/90 to-purple-900/90 backdrop-blur-sm"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
      
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20">
          {/* Logo et titre */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl shadow-2xl mb-6 mx-auto">
              ⚡
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Synergia v3.5</h1>
            <p className="text-blue-200">Plateforme de productivité gamifiée</p>
          </div>

          {/* Formulaire de connexion */}
          <div className="space-y-6">
            <button
              onClick={handleGoogleLogin}
              disabled={loading || isLoggingIn}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Connexion...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continuer avec Google</span>
                </>
              )}
            </button>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-200 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-blue-200/60 text-sm">
              En vous connectant, vous acceptez nos conditions d'utilisation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 🚀 COMPOSANT PRINCIPAL DE L'APPLICATION
 */
const App = () => {
  const { user, loading, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (loading) {
    return <PremiumLoadingScreen />;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Route de connexion */}
          <Route 
            path="/login" 
            element={!user ? <PremiumLoginPage /> : <Navigate to="/dashboard" />} 
          />
          
          {/* Routes protégées */}
          <Route
            path="/dashboard"
            element={user ? (
              <PremiumLayout>
                <Dashboard />
              </PremiumLayout>
            ) : (
              <Navigate to="/login" />
            )}
          />
          
          <Route
            path="/tasks"
            element={user ? (
              <PremiumLayout>
                <TasksPage />
              </PremiumLayout>
            ) : (
              <Navigate to="/login" />
            )}
          />
          
          <Route
            path="/projects"
            element={user ? (
              <PremiumLayout>
                <ProjectsPage />
              </PremiumLayout>
            ) : (
              <Navigate to="/login" />
            )}
          />
          
          <Route
            path="/analytics"
            element={user ? (
              <PremiumLayout>
                <AnalyticsPage />
              </PremiumLayout>
            ) : (
              <Navigate to="/login" />
            )}
          />
          
          <Route
            path="/leaderboard"
            element={user ? (
              <PremiumLayout>
                <LeaderboardPage />
              </PremiumLayout>
            ) : (
              <Navigate to="/login" />
            )}
          />
          
          <Route
            path="/profile"
            element={user ? (
              <PremiumLayout>
                <ProfilePage />
              </PremiumLayout>
            ) : (
              <Navigate to="/login" />
            )}
          />
          
          <Route
            path="/settings"
            element={user ? (
              <PremiumLayout>
                <SettingsPage />
              </PremiumLayout>
            ) : (
              <Navigate to="/login" />
            )}
          />
          
          {/* Redirection par défaut */}
          <Route
            path="/"
            element={<Navigate to={user ? "/dashboard" : "/login"} />}
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
