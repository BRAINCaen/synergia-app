// ==========================================
// 📁 src/App.jsx
// APPLICATION AVEC CORRECTIFS D'ERREURS INTÉGRÉS
// ==========================================

import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './shared/stores/authStore.js';

// 🛡️ IMPORT DU CORRECTIF D'ERREURS (PRIORITÉ ABSOLUE)
import './utils/consoleErrorFix.js';

// 📊 Components
import LoadingScreen from './components/ui/LoadingScreen.jsx';
// 🔧 CORRECTION: Import correct du ProtectedRoute
import ProtectedRoute from './routes/ProtectedRoute.jsx';

// 📁 Pages principales
const Dashboard = React.lazy(() => import('./pages/Dashboard.jsx'));
const TasksPage = React.lazy(() => import('./pages/TasksPage.jsx'));
const ProjectsPage = React.lazy(() => import('./pages/ProjectsPage.jsx'));
const AnalyticsPage = React.lazy(() => import('./pages/AnalyticsPage.jsx'));

// 🎮 Pages gamification
const GamificationPage = React.lazy(() => import('./pages/GamificationPage.jsx'));
const BadgesPage = React.lazy(() => import('./pages/BadgesPage.jsx'));
const LeaderboardPage = React.lazy(() => import('./pages/LeaderboardPage.jsx'));
const RewardsPage = React.lazy(() => import('./pages/RewardsPage.jsx'));

// 👥 Pages équipe
const TeamPage = React.lazy(() => import('./pages/TeamPage.jsx'));
const UsersPage = React.lazy(() => import('./pages/UsersPage.jsx'));

// 🛠️ Pages outils
const OnboardingPage = React.lazy(() => import('./pages/OnboardingPage.jsx'));
const TimeTrackPage = React.lazy(() => import('./pages/TimeTrackPage.jsx'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage.jsx'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage.jsx'));

// 🛡️ Pages admin
const AdminPage = React.lazy(() => import('./pages/AdminPage.jsx'));

// 🔐 Page de connexion
const LoginPage = React.lazy(() => import('./pages/LoginPage.jsx'));

const App = () => {
  const [appInitialized, setAppInitialized] = useState(false);
  const [initError, setInitError] = useState(null);

  // 🚀 INITIALISATION SÉCURISÉE DE L'APPLICATION
  useEffect(() => {
    const initializeAppSafely = async () => {
      try {
        console.log('🚀 [APP] Initialisation Synergia v3.5.3...');
        
        // 1. Vérifier que les correctifs d'erreurs sont appliqués
        if (!window.__SYNERGIA_ERROR_FIXES_APPLIED__) {
          console.warn('⚠️ [APP] Correctifs d\'erreurs non appliqués, initialisation...');
          if (window.__CONSOLE_FIX_INIT__) {
            window.__CONSOLE_FIX_INIT__();
          }
        }

        // 2. Attendre un court délai pour que les correctifs s'appliquent
        await new Promise(resolve => setTimeout(resolve, 100));

        // 3. Marquer l'application comme initialisée
        setAppInitialized(true);
        console.log('✅ [APP] Application initialisée avec succès');

      } catch (error) {
        console.error('❌ [APP] Erreur lors de l\'initialisation:', error);
        setInitError(error.message);
      }
    };

    initializeAppSafely();
  }, []);

  // 🔄 ÉCRAN DE CHARGEMENT INITIAL
  if (!appInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-6"></div>
          <h1 className="text-2xl font-bold text-white mb-2">Synergia v3.5.3</h1>
          <p className="text-gray-400">Initialisation de l'application...</p>
          {initError && (
            <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded-lg max-w-md mx-auto">
              <p className="text-red-300 text-sm">Erreur: {initError}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 🎯 APPLICATION PRINCIPALE
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              {/* 🔐 Route de connexion */}
              <Route path="/login" element={<LoginPage />} />

              {/* 🏠 Route par défaut */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* 📊 Pages principales protégées */}
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

              {/* 🎮 Pages gamification protégées */}
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

              {/* 👥 Pages équipe protégées */}
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

              {/* 🛠️ Pages outils protégées */}
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

              {/* 🛡️ Pages admin protégées */}
              <Route path="/admin/*" element={
                <ProtectedRoute adminOnly>
                  <AdminPage />
                </ProtectedRoute>
              } />

              {/* 🚫 Gestion des routes non trouvées */}
              <Route path="*" element={
                <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-8xl mb-6">🔍</div>
                    <h1 className="text-4xl font-bold text-white mb-4">Page non trouvée</h1>
                    <p className="text-gray-400 mb-8">La page que vous cherchez n'existe pas.</p>
                    <button 
                      onClick={() => window.location.href = '/dashboard'}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
                    >
                      Retour au tableau de bord
                    </button>
                  </div>
                </div>
              } />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
