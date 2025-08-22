// ==========================================
// 📁 src/App.jsx - VERSION FINALE SANS AUTHPROVIDER
// BUILD FORCE v2 - 22/08/2025
// ==========================================

import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 🔧 IMPORTS CORRECTS
import { useAuthStore, initializeAuthStore } from './shared/stores/authStore.js';
import LoadingScreen from './components/ui/LoadingScreen.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';

// 📁 PAGES LAZY LOADING
const Dashboard = React.lazy(() => import('./pages/Dashboard.jsx'));
const TasksPage = React.lazy(() => import('./pages/TasksPage.jsx'));
const ProjectsPage = React.lazy(() => import('./pages/ProjectsPage.jsx'));
const AnalyticsPage = React.lazy(() => import('./pages/AnalyticsPage.jsx'));
const GamificationPage = React.lazy(() => import('./pages/GamificationPage.jsx'));
const BadgesPage = React.lazy(() => import('./pages/BadgesPage.jsx'));
const LeaderboardPage = React.lazy(() => import('./pages/LeaderboardPage.jsx'));
const RewardsPage = React.lazy(() => import('./pages/RewardsPage.jsx'));
const TeamPage = React.lazy(() => import('./pages/TeamPage.jsx'));
const UsersPage = React.lazy(() => import('./pages/UsersPage.jsx'));
const OnboardingPage = React.lazy(() => import('./pages/OnboardingPage.jsx'));
const TimeTrackPage = React.lazy(() => import('./pages/TimeTrackPage.jsx'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage.jsx'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage.jsx'));
const AdminPage = React.lazy(() => import('./pages/AdminPage.jsx'));
const LoginPage = React.lazy(() => import('./pages/Login.jsx'));

/**
 * 🎯 COMPOSANT APP PRINCIPAL - VERSION CORRIGÉE
 * SANS AUTHPROVIDER - UTILISE ZUSTAND UNIQUEMENT
 */
const App = () => {
  const [appReady, setAppReady] = useState(false);
  const [error, setError] = useState(null);

  // 🚀 INITIALISATION UNIQUE ET SÉCURISÉE
  useEffect(() => {
    const initApp = async () => {
      try {
        console.log('🚀 [APP] Synergia v3.5.3 - Initialisation SANS AuthProvider');
        
        // Vérifier les correctifs d'erreurs
        if (window.__CONSOLE_FIX_INIT__) {
          window.__CONSOLE_FIX_INIT__();
        }
        
        // Initialiser le store auth
        initializeAuthStore();
        
        // Attendre stabilisation
        await new Promise(resolve => setTimeout(resolve, 200));
        
        setAppReady(true);
        console.log('✅ [APP] Application prête - AuthProvider supprimé définitivement');
        
      } catch (err) {
        console.error('❌ [APP] Erreur initialisation:', err);
        setError(err.message);
        
        // Fallback - marquer comme prêt même en cas d'erreur
        setTimeout(() => setAppReady(true), 1000);
      }
    };

    initApp();
  }, []);

  // 🔄 LOADING SCREEN
  if (!appReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-6"></div>
          <h1 className="text-3xl font-bold text-white mb-2">Synergia v3.5.3</h1>
          <p className="text-gray-300 mb-4">Démarrage sans AuthProvider...</p>
          {error && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg max-w-md mx-auto">
              <p className="text-red-300 text-sm">⚠️ {error}</p>
              <p className="text-red-400 text-xs mt-1">Application continuera dans 1 seconde...</p>
            </div>
          )}
          <div className="mt-6 text-xs text-gray-500">
            Build Force v2 - {new Date().toLocaleString()}
          </div>
        </div>
      </div>
    );
  }

  // 🎯 APPLICATION PRINCIPALE
  return (
    <Router>
      <div className="app" data-version="3.5.3-no-authprovider">
        <Suspense 
          fallback={
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-white text-lg">Chargement du composant...</p>
                <p className="text-gray-400 text-sm mt-2">Système sans AuthProvider</p>
              </div>
            </div>
          }
        >
          <Routes>
            {/* 🔐 LOGIN */}
            <Route path="/login" element={<LoginPage />} />

            {/* 🏠 ACCUEIL */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 📊 PAGES PRINCIPALES */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/tasks" element={
              <ProtectedRoute>
                <TasksPage />
              </ProtectedRoute>
            } />
            
            <Route path="/projects" element={
              <ProtectedRoute>
                <ProjectsPage />
              </ProtectedRoute>
            } />
            
            <Route path="/analytics" element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            } />

            {/* 🎮 GAMIFICATION */}
            <Route path="/gamification" element={
              <ProtectedRoute>
                <GamificationPage />
              </ProtectedRoute>
            } />
            
            <Route path="/badges" element={
              <ProtectedRoute>
                <BadgesPage />
              </ProtectedRoute>
            } />
            
            <Route path="/leaderboard" element={
              <ProtectedRoute>
                <LeaderboardPage />
              </ProtectedRoute>
            } />
            
            <Route path="/rewards" element={
              <ProtectedRoute>
                <RewardsPage />
              </ProtectedRoute>
            } />

            {/* 👥 ÉQUIPE */}
            <Route path="/team" element={
              <ProtectedRoute>
                <TeamPage />
              </ProtectedRoute>
            } />
            
            <Route path="/users" element={
              <ProtectedRoute>
                <UsersPage />
              </ProtectedRoute>
            } />

            {/* 🛠️ OUTILS */}
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            } />
            
            <Route path="/timetrack" element={
              <ProtectedRoute>
                <TimeTrackPage />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />

            {/* 🛡️ ADMIN */}
            <Route path="/admin/*" element={
              <ProtectedRoute adminOnly>
                <AdminPage />
              </ProtectedRoute>
            } />

            {/* 🚫 404 */}
            <Route path="*" element={
              <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-8xl mb-6">🔍</div>
                  <h1 className="text-4xl font-bold text-white mb-4">Page non trouvée</h1>
                  <p className="text-gray-400 mb-8">La page demandée n'existe pas.</p>
                  <button 
                    onClick={() => window.location.href = '/dashboard'}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    🏠 Retour au tableau de bord
                  </button>
                  <div className="mt-6 text-xs text-gray-500">
                    Synergia v3.5.3 - Build Force v2
                  </div>
                </div>
              </div>
            } />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
};

export default App;

// ==========================================
// 📋 LOGS DE CONFIRMATION
// ==========================================
console.log('✅ App.jsx SANS AuthProvider chargé');
console.log('🔧 Version: Build Force v2');
console.log('📅 Date: 22/08/2025');
console.log('🎯 Objectif: Éliminer définitivement l\'erreur AuthProvider');
console.log('🚀 Prêt pour nouveau déploiement Netlify');
