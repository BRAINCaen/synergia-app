// ==========================================
// 📁 react-app/src/App.jsx
// Application principale SIMPLIFIÉE - Sans GameStore
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
  const { user, signOut } = useAuthStore();
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

  const handleLogout = async () => {
    try {
      await signOut();
      console.log('✅ Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
    }
  };

  return (
    <div className="w-64 bg-white shadow-xl h-full border-r border-gray-200 flex flex-col">
      {/* Header sidebar */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Synergia</h1>
            <p className="text-xs text-green-600 font-medium">v3.5.1 - Debug</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <a
              key={item.path}
              href={item.path}
              className={`
                flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </a>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">{getUserInitials()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.displayName || user?.email?.split('@')[0] || 'Utilisateur'}
            </p>
            <p className="text-xs text-gray-600 truncate">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <span>🚪</span>
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
};

/**
 * 🔐 PAGE DE CONNEXION SIMPLE
 */
const LoginPage = () => {
  const { signInWithGoogle, loading, error } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      console.log('✅ Connexion Google réussie');
    } catch (error) {
      console.error('❌ Erreur connexion Google:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Bienvenue dans Synergia</h1>
          <p className="text-gray-600 mt-2">v3.5.1 - Mode Debug</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={isLoading || loading}
          className="w-full flex items-center justify-center space-x-3 bg-white border-2 border-gray-300 rounded-xl py-3 px-4 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading || loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
              <span className="text-gray-700">Connexion...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-gray-700 font-medium">Continuer avec Google</span>
            </>
          )}
        </button>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            🔧 Mode debug actif - GameStore désactivé
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * 🏗️ COMPOSANT LAYOUT PRINCIPAL
 */
const AppLayout = ({ children }) => {
  return (
    <div className="h-screen flex bg-gray-50">
      <SimpleSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

/**
 * 🚀 COMPOSANT PRINCIPAL APP
 */
function App() {
  const { user, isAuthenticated, loading, initializeAuth } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    console.log('🚀 SYNERGIA v3.5.1 - INITIALISATION MODE DEBUG');
    console.log('⚠️ GameStore temporairement désactivé');
    
    // Initialiser l'authentification
    const unsubscribe = initializeAuth();
    setIsInitialized(true);

    // Nettoyer à la fermeture
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [initializeAuth]);

  // Afficher le loading pendant l'initialisation
  if (!isInitialized || loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-cyan-600">
        <div className="text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Chargement Synergia</h2>
          <p className="text-white/80">v3.5.1 - Mode Debug</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {!isAuthenticated ? (
          <LoginPage />
        ) : (
          <AppLayout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AppLayout>
        )}
      </div>
    </Router>
  );
}

export default App;
