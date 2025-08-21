// ==========================================
// 📁 react-app/src/App.jsx
// APPLICATION PRINCIPALE SYNERGIA v3.5 - VERSION CORRIGÉE
// SANS CONFLITS D'IMPORTS - BUILD NETLIFY COMPATIBLE
// ==========================================

import React, { useEffect, Suspense, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// ==========================================
// 🚨 CORRECTIFS D'URGENCE - PREMIÈRE PRIORITÉ
// ==========================================
// Import du suppresseur d'erreurs AVANT tout le reste
import './utils/productionErrorSuppression.js';

// ==========================================
// 🏪 STORES ET SERVICES CORE
// ==========================================
import { useAuthStore } from './shared/stores/authStore.js';
import { useThemeStore } from './shared/stores/themeStore.js';

// ==========================================
// 🏗️ LAYOUT ET NAVIGATION
// ==========================================
import Layout from './components/layout/Layout.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';

// ==========================================
// 📄 PAGES PRINCIPALES - IMPORTS SIMPLIFIÉS
// ==========================================
const LoginPage = React.lazy(() => import('./pages/Login.jsx'));
const HomePage = React.lazy(() => import('./pages/Dashboard.jsx'));
const TasksPage = React.lazy(() => import('./pages/TasksPage.jsx'));
const ProjectsPage = React.lazy(() => import('./pages/ProjectsPage.jsx'));
const TeamPage = React.lazy(() => import('./pages/TeamPage.jsx'));
const AnalyticsPage = React.lazy(() => import('./pages/AnalyticsPage.jsx'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage.jsx'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage.jsx'));

// ==========================================
// 🏆 PAGES GAMIFICATION - SYSTÈME BADGES
// ==========================================
const BadgesPage = React.lazy(() => import('./pages/BadgesPage.jsx'));
const GamificationPage = React.lazy(() => import('./pages/GamificationPage.jsx'));
const LeaderboardPage = React.lazy(() => import('./pages/LeaderboardPage.jsx'));
const RewardsPage = React.lazy(() => import('./pages/RewardsPage.jsx'));

// ==========================================
// 🛠️ PAGES SPÉCIALISÉES
// ==========================================
const OnboardingPage = React.lazy(() => import('./pages/OnboardingPage.jsx'));
const TimeTrackPage = React.lazy(() => import('./pages/TimeTrackPage.jsx'));
const UsersPage = React.lazy(() => import('./pages/UsersPage.jsx'));

// ==========================================
// 🛡️ PAGES ADMIN
// ==========================================
const AdminPage = React.lazy(() => import('./pages/AdminPage.jsx'));
const AdminBadgesPage = React.lazy(() => import('./pages/AdminBadgesPage.jsx'));
const AdminUsersPage = React.lazy(() => import('./pages/AdminUsersPage.jsx'));
const AdminTaskValidationPage = React.lazy(() => import('./pages/AdminTaskValidationPage.jsx'));
const AdminCompleteTestPage = React.lazy(() => import('./pages/AdminCompleteTestPage.jsx'));
const AdminProfileTestPage = React.lazy(() => import('./pages/AdminProfileTestPage.jsx'));

// ==========================================
// 🎨 COMPOSANTS DE NOTIFICATION
// ==========================================
const BadgeNotificationContainer = React.lazy(() => 
  import('./components/gamification/BadgeNotification.jsx').then(module => ({
    default: module.BadgeNotificationContainer
  }))
);

// ==========================================
// 🚨 COMPOSANT LOADING SÉCURISÉ
// ==========================================
const LoadingFallback = ({ error = null }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      {error ? (
        <>
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-600">Erreur de chargement</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Recharger
          </button>
        </>
      ) : (
        <>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </>
      )}
    </div>
  </div>
);

// ==========================================
// 🔧 INITIALISATION BADGES SÉCURISÉE
// ==========================================
const initializeBadgeSystem = async () => {
  try {
    // Import dynamique sécurisé du système de badges
    const badgeModule = await import('./core/services/badgeSystemIntegration.js').catch(() => null);
    
    if (badgeModule) {
      console.log('✅ Système de badges chargé avec succès');
      
      // Exposer globalement pour debug
      if (import.meta.env.DEV) {
        window.badgeSystem = badgeModule.default;
      }
    } else {
      console.log('⚠️ Système de badges non disponible, mode dégradé');
    }
    
  } catch (error) {
    console.warn('⚠️ Erreur initialisation badges (mode dégradé actif):', error.message);
  }
};

// ==========================================
// 🎯 COMPOSANT PRINCIPAL APPLICATION
// ==========================================
const App = () => {
  const { user, loading: authLoading, checkAuthState } = useAuthStore();
  const { theme } = useThemeStore();
  const [appInitialized, setAppInitialized] = useState(false);
  const [initError, setInitError] = useState(null);

  // ==========================================
  // 🚀 INITIALISATION DE L'APPLICATION
  // ==========================================
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Initialisation Synergia v3.5...');
        
        // 1. Vérifier l'état d'authentification
        await checkAuthState();
        
        // 2. Initialiser le système de badges (mode dégradé si erreur)
        await initializeBadgeSystem();
        
        // 3. Configuration theme
        document.documentElement.className = theme;
        
        setAppInitialized(true);
        console.log('✅ Synergia v3.5 initialisé avec succès');
        
      } catch (error) {
        console.error('❌ Erreur initialisation app:', error);
        setInitError(error);
        setAppInitialized(true); // Continuer en mode dégradé
      }
    };

    initializeApp();
  }, [checkAuthState, theme]);

  // ==========================================
  // 🔄 GESTION DES ÉTATS DE CHARGEMENT
  // ==========================================
  if (!appInitialized) {
    return <LoadingFallback />;
  }

  if (initError) {
    return <LoadingFallback error={initError} />;
  }

  if (authLoading) {
    return <LoadingFallback />;
  }

  // ==========================================
  // 🛣️ CONFIGURATION DES ROUTES
  // ==========================================
  return (
    <div className={`app ${theme}`}>
      <Router>
        <Routes>
          {/* Route de connexion */}
          <Route
            path="/login"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <LoginPage />
              </Suspense>
            }
          />

          {/* Routes protégées avec Layout */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                      {/* ✅ PAGES PRINCIPALES */}
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<HomePage />} />
                      <Route path="/tasks" element={<TasksPage />} />
                      <Route path="/projects" element={<ProjectsPage />} />
                      <Route path="/team" element={<TeamPage />} />
                      <Route path="/analytics" element={<AnalyticsPage />} />

                      {/* 🏆 GAMIFICATION */}
                      <Route path="/badges" element={<BadgesPage />} />
                      <Route path="/gamification" element={<GamificationPage />} />
                      <Route path="/leaderboard" element={<LeaderboardPage />} />
                      <Route path="/rewards" element={<RewardsPage />} />

                      {/* 🛠️ OUTILS */}
                      <Route path="/onboarding" element={<OnboardingPage />} />
                      <Route path="/timetrack" element={<TimeTrackPage />} />
                      <Route path="/users" element={<UsersPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/settings" element={<SettingsPage />} />

                      {/* 🛡️ ADMINISTRATION */}
                      <Route path="/admin" element={<AdminPage />} />
                      <Route path="/admin/badges" element={<AdminBadgesPage />} />
                      <Route path="/admin/users" element={<AdminUsersPage />} />
                      <Route path="/admin/task-validation" element={<AdminTaskValidationPage />} />
                      <Route path="/admin/complete-test" element={<AdminCompleteTestPage />} />
                      <Route path="/admin/profile-test" element={<AdminProfileTestPage />} />

                      {/* 404 - Route de fallback */}
                      <Route
                        path="*"
                        element={
                          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                            <div className="text-center">
                              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                              <p className="text-gray-600 mb-4">Page non trouvée</p>
                              <button
                                onClick={() => window.history.back()}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                              >
                                Retour
                              </button>
                            </div>
                          </div>
                        }
                      />
                    </Routes>
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>

        {/* 🎊 CONTENEUR NOTIFICATIONS BADGES */}
        <Suspense fallback={null}>
          <BadgeNotificationContainer />
        </Suspense>
      </Router>
    </div>
  );
};

export default App;
