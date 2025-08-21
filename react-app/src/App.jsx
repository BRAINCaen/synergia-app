// ==========================================
// 📁 react-app/src/App.jsx
// APPLICATION PRINCIPALE SYNERGIA v3.5 - VERSION ORIGINALE
// ==========================================

import React, { useEffect, Suspense, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// ==========================================
// 🔧 SYSTÈME DE BADGES CORRIGÉ - IMPORTS PRIORITAIRES
// ==========================================
import './core/services/badgeSystemIntegration.js';
import { BadgeNotificationContainer } from './components/gamification/BadgeNotification.jsx';

// ==========================================
// 🚨 CORRECTIFS D'URGENCE - GARDE-FOUS
// ==========================================
import './core/services/consoleErrorSuppressor.js';

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
// 📄 PAGES PRINCIPALES - IMPORTS OPTIMISÉS
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
const AdminObjectiveValidationPage = React.lazy(() => import('./pages/AdminObjectiveValidationPage.jsx'));
const AdminCompleteTestPage = React.lazy(() => import('./pages/AdminCompleteTestPage.jsx'));
const AdminProfileTestPage = React.lazy(() => import('./pages/AdminProfileTestPage.jsx'));
const AdminRolePermissionsPage = React.lazy(() => import('./pages/AdminRolePermissionsPage.jsx'));
const AdminRewardsPage = React.lazy(() => import('./pages/AdminRewardsPage.jsx'));
const AdminAnalyticsPage = React.lazy(() => import('./pages/AdminAnalyticsPage.jsx'));
const AdminSettingsPage = React.lazy(() => import('./pages/AdminSettingsPage.jsx'));

// ==========================================
// 🎯 PAGES DE PROGRESSION ESCAPE GAME
// ==========================================
const RoleProgressionPage = React.lazy(() => import('./pages/RoleProgressionPage.jsx'));
const EscapeProgressionPage = React.lazy(() => import('./pages/EscapeProgressionPage.jsx'));

// ==========================================
// 🚨 COMPOSANT LOADING AVEC GESTION D'ERREURS
// ==========================================
const LoadingFallback = ({ error = null }) => {
  if (error) {
    console.error('Erreur de chargement composant lazy:', error);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center p-8">
        {error ? (
          <>
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Erreur de chargement
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              {error.message || 'Erreur inconnue'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Actualiser la page
            </button>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Chargement de la page...</p>
          </>
        )}
      </div>
    </div>
  );
};

/**
 * 📱 GESTION DES ERREURS DE CHARGEMENT LAZY
 */
const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleError = (error) => {
      console.error('Erreur dans ErrorBoundary:', error);
      setHasError(true);
      setError(error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return <LoadingFallback error={error} />;
  }

  return children;
};

/**
 * 🏠 REDIRECTION INTELLIGENTE POUR LA RACINE
 */
const HomeRedirect = () => {
  const { user } = useAuthStore();
  
  if (!user) return <Navigate to="/login" replace />;
  
  // Rediriger vers onboarding si l'utilisateur est nouveau
  if (user.isNewUser || !user.profileCompleted) {
    return <Navigate to="/onboarding" replace />;
  }
  
  return <Navigate to="/dashboard" replace />;
};

/**
 * 🎯 COMPOSANT PRINCIPAL APPLICATION
 */
const App = () => {
  const { user, loading: authLoading, checkAuthState } = useAuthStore();
  const { theme } = useThemeStore();
  const [isAppReady, setIsAppReady] = useState(false);
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
        
        // 2. Configurer le thème
        document.documentElement.className = theme;
        
        // 3. Initialiser les services annexes
        if (window.badgeSystemIntegration) {
          console.log('🏆 Système de badges activé');
        }
        
        // 4. Marquer l'app comme prête
        setIsAppReady(true);
        console.log('✅ Synergia v3.5 initialisé avec succès');
        
      } catch (error) {
        console.error('❌ Erreur initialisation app:', error);
        setInitError(error);
        setIsAppReady(true); // Continuer même en cas d'erreur
      }
    };

    initializeApp();
  }, [checkAuthState, theme]);

  // ==========================================
  // 🔄 GESTION DES ÉTATS DE CHARGEMENT
  // ==========================================
  
  // Ne pas rendre l'app si pas encore prête
  if (!isAppReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Initialisation de Synergia...</p>
          <p className="text-gray-500 text-sm mt-2">Chargement des services...</p>
        </div>
      </div>
    );
  }

  // Erreur d'initialisation
  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center p-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-red-800 mb-2">Erreur d'initialisation</h2>
          <p className="text-red-600 text-sm mb-4">{initError.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Relancer l'application
          </button>
        </div>
      </div>
    );
  }

  // Chargement authentification
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Authentification...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // 🛣️ CONFIGURATION DES ROUTES
  // ==========================================
  return (
    <div className={`app ${theme}`}>
      <ErrorBoundary>
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
                        {/* ✅ RACINE ET REDIRECTIONS */}
                        <Route path="/" element={<HomeRedirect />} />

                        {/* ✅ PAGES PRINCIPALES */}
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

                        {/* 🎯 PROGRESSION ESCAPE GAME */}
                        <Route path="/role/progression" element={<RoleProgressionPage />} />
                        <Route path="/escape-progression" element={<EscapeProgressionPage />} />

                        {/* 🛡️ ADMINISTRATION */}
                        <Route path="/admin" element={<AdminPage />} />
                        <Route path="/admin/badges" element={<AdminBadgesPage />} />
                        <Route path="/admin/users" element={<AdminUsersPage />} />
                        <Route path="/admin/task-validation" element={<AdminTaskValidationPage />} />
                        <Route path="/admin/objective-validation" element={<AdminObjectiveValidationPage />} />
                        <Route path="/admin/complete-test" element={<AdminCompleteTestPage />} />
                        <Route path="/admin/profile-test" element={<AdminProfileTestPage />} />
                        <Route path="/admin/role-permissions" element={<AdminRolePermissionsPage />} />
                        <Route path="/admin/rewards" element={<AdminRewardsPage />} />
                        <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
                        <Route path="/admin/settings" element={<AdminSettingsPage />} />

                        {/* 404 - Route de fallback */}
                        <Route
                          path="*"
                          element={
                            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                              <div className="text-center p-8">
                                <h1 className="text-6xl font-bold text-gray-400 mb-4">404</h1>
                                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page non trouvée</h2>
                                <p className="text-gray-600 mb-6">La page que vous cherchez n'existe pas.</p>
                                <div className="space-x-4">
                                  <button
                                    onClick={() => window.history.back()}
                                    className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                                  >
                                    Retour
                                  </button>
                                  <button
                                    onClick={() => window.location.href = '/dashboard'}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                  >
                                    Accueil
                                  </button>
                                </div>
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
      </ErrorBoundary>
    </div>
  );
};

export default App;
