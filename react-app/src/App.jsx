// ==========================================
// 📁 react-app/src/App.jsx
// Application principale avec design premium dark
// ==========================================

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './shared/stores/authStore.js';
import { useGameStore } from './shared/stores/gameStore.js';

// Pages
import Dashboard from './pages/Dashboard.jsx';
import TasksPage from './pages/TasksPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

// Composants
import LoadingScreen from './shared/components/ui/LoadingScreen.jsx';
import Sidebar from './shared/components/layout/Sidebar.jsx';
import LoginPage from './pages/LoginPage.jsx';

// Services
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './core/firebase.js';

/**
 * 🎨 LAYOUT PRINCIPAL AVEC DESIGN PREMIUM
 */
const PremiumLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Background avec effet */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900/90 via-blue-900/90 to-purple-900/90 backdrop-blur-sm"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
      
      {/* Contenu principal */}
      <div className="relative z-10 flex">
        {/* Sidebar */}
        <Sidebar 
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        {/* Contenu principal */}
        <main className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

/**
 * 🚀 COMPOSANT APP PRINCIPAL
 */
const App = () => {
  const { user, loading, setUser, setLoading, logout } = useAuthStore();
  const { initializeGameStore } = useGameStore();
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    console.log('🚀 SYNERGIA v3.5.1 - INITIALISATION');
    
    // Écouter les changements d'authentification
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        console.log('✅ Utilisateur connecté:', firebaseUser.email);
        setUser(firebaseUser);
        
        // Initialiser le GameStore pour cet utilisateur
        await initializeGameStore(firebaseUser.uid);
      } else {
        console.log('❌ Aucun utilisateur connecté');
        setUser(null);
      }
      
      setLoading(false);
      setAppReady(true);
    });

    // Commandes globales pour debug
    window.forceDashboardReload = () => {
      console.log('🔄 Force reload dashboard');
      window.location.reload();
    };

    window.emergencyLogout = async () => {
      console.log('🚨 Emergency logout');
      await logout();
    };

    console.log('🎉 Application entièrement chargée et prête !');

    return unsubscribe;
  }, [setUser, setLoading, initializeGameStore, logout]);

  // Écran de chargement premium
  if (loading || !appReady) {
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

/**
 * 🌟 ÉCRAN DE CHARGEMENT PREMIUM
 */
const PremiumLoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
      {/* Background effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900/90 via-blue-900/90 to-purple-900/90"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"></div>
      
      {/* Contenu du loading */}
      <div className="relative z-10 text-center">
        {/* Logo/Icône */}
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-2xl">
            ⚡
          </div>
        </div>
        
        {/* Titre */}
        <h1 className="text-4xl font-bold text-white mb-2">
          Synergia
          <span className="ml-3 px-3 py-1 text-sm bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
            v3.5.1
          </span>
        </h1>
        
        {/* Sous-titre */}
        <p className="text-xl text-blue-200 mb-8">
          Collaboration & Gamification
        </p>
        
        {/* Animation de chargement */}
        <div className="flex items-center justify-center space-x-2 mb-6">
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        
        {/* Message de chargement */}
        <p className="text-blue-300 text-sm">
          Initialisation de l'application...
        </p>
      </div>
    </div>
  );
};

/**
 * 🔐 PAGE DE CONNEXION PREMIUM
 */
const PremiumLoginPage = () => {
  const { signInWithGoogle, loading } = useAuthStore();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Erreur de connexion:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-6">
      {/* Background effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900/90 via-blue-900/90 to-purple-900/90"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"></div>
      
      {/* Contenu de connexion */}
      <div className="relative z-10 w-full max-w-md">
        {/* Card de connexion */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          {/* Logo et titre */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
              ⚡
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Bienvenue dans Synergia
            </h1>
            <p className="text-blue-200">
              Plateforme de collaboration et gamification
            </p>
          </div>
          
          {/* Bouton de connexion */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
          >
            {loading ? (
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
                <span>Se connecter avec Google</span>
              </>
            )}
          </button>
          
          {/* Informations supplémentaires */}
          <div className="mt-6 text-center">
            <p className="text-sm text-blue-200/80">
              Connectez-vous pour accéder à vos projets,
              <br />
              tâches et système de gamification
            </p>
          </div>
        </div>
        
        {/* Version */}
        <div className="text-center mt-6">
          <p className="text-sm text-blue-300/60">
            Synergia v3.5.1 • Premium Edition
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
