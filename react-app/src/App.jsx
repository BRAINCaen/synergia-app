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
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';

// 📁 Pages principales
const Dashboard = React.lazy(() => import('./views/Dashboard.js'));
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
const AdminPage = React.lazy(() => import('./pages/admin/AdminPage.jsx'));

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

        // 3. Initialiser les services avec gestion d'erreurs
        await window.__SYNERGIA_SAFE_FUNCTIONS__?.safeAsync(async () => {
          // Initialisation des services critiques ici
          console.log('🎯 [APP] Services critiques initialisés');
        });

        // 4. Marquer l'app comme initialisée
        setAppInitialized(true);
        console.log('✅ [APP] Synergia v3.5.3 initialisé avec succès');

      } catch (error) {
        console.error('❌ [APP] Erreur initialisation:', error);
        setInitError(error.message);
        
        // Même en cas d'erreur, permettre à l'app de se charger
        setTimeout(() => {
          setAppInitialized(true);
        }, 2000);
      }
    };

    // Listener pour les correctifs d'erreurs
    const handleFixesApplied = (event) => {
      console.log('✅ [APP] Correctifs d\'erreurs confirmés:', event.detail);
    };

    window.addEventListener('consoleFixesApplied', handleFixesApplied);
    
    // Démarrer l'initialisation
    initializeAppSafely();

    // Cleanup
    return () => {
      window.removeEventListener('consoleFixesApplied', handleFixesApplied);
    };
  }, []);

  // 🔍 DIAGNOSTIC EN MODE DÉVELOPPEMENT
  useEffect(() => {
    if (import.meta.env.DEV) {
      // Ajouter fonction de diagnostic globale
      window.__SYNERGIA_APP_DIAGNOSE__ = () => {
        console.log('🔍 DIAGNOSTIC APPLICATION SYNERGIA');
        console.log('=' .repeat(40));
        
        const appStatus = {
          initialized: appInitialized,
          error: initError,
          errorFixesApplied: window.__SYNERGIA_ERROR_FIXES_APPLIED__,
          safeFunctions: !!window.__SYNERGIA_SAFE_FUNCTIONS__,
          version: 'v3.5.3',
          environment: import.meta.env.MODE
        };
        
        console.table(appStatus);
        
        // Test des fonctions sécurisées
        if (window.__SYNERGIA_SAFE_FUNCTIONS__) {
          console.log('🧪 Test fonctions sécurisées...');
          
          const testResult = window.__SYNERGIA_SAFE_FUNCTIONS__.safeCall(() => {
            return 'Fonctions sécurisées opérationnelles';
          });
          
          console.log('✅ Test result:', testResult);
        }
        
        return appStatus;
      };
    }
  }, [appInitialized, initError]);

  // 🎨 COMPOSANT DE FALLBACK AMÉLIORÉ
  const AppFallback = ({ error }) => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md mx-auto text-center">
        <div className="text-6xl mb-6">⚡</div>
        <h1 className="text-3xl font-bold text-white mb-4">Synergia v3.5.3</h1>
        
        {error ? (
          <>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">Erreur d'initialisation détectée</p>
              <p className="text-gray-400 text-xs mt-2">{error}</p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Recharger l'application
            </button>
          </>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
            <p className="text-blue-300 text-sm">
              Initialisation en cours...
            </p>
            {window.__SYNERGIA_ERROR_FIXES_APPLIED__ && (
              <p className="text-green-400 text-xs mt-2">
                ✅ Correctifs d'erreurs appliqués
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );

  // ⏳ ÉCRAN DE CHARGEMENT SI PAS ENCORE INITIALISÉ
  if (!appInitialized) {
    return <AppFallback error={initError} />;
  }

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Suspense fallback={
            <LoadingScreen 
              message="Chargement des composants..." 
              subtitle="Interface utilisateur en préparation"
            />
          }>
            <Routes>
              {/* 🔐 Route de connexion */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* 🏠 Route d'accueil - Redirection vers dashboard */}
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
