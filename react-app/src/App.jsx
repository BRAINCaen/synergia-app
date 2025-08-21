// ==========================================
// 📁 react-app/src/App.jsx
// APPLICATION PRINCIPALE SYNERGIA v3.5 - VERSION BUILD NETLIFY
// SANS react-hot-toast - Système de notification intégré
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
const AdminAnalyticsPage = React.lazy(() => import('./pages/AdminAnalyticsPage.jsx'));

// ==========================================
// 🚫 PAGE D'ERREUR
// ==========================================
const NotFound = React.lazy(() => import('./pages/NotFound.jsx'));

// ==========================================
// 🍞 SYSTÈME DE NOTIFICATIONS INTÉGRÉ (REMPLACEMENT REACT-HOT-TOAST)
// ==========================================
const NotificationContainer = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleNotification = (event) => {
      const { type, message, duration = 4000 } = event.detail;
      const id = Date.now();
      
      setNotifications(prev => [...prev, { id, type, message, duration }]);
      
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
    };

    window.addEventListener('showNotification', handleNotification);
    return () => window.removeEventListener('showNotification', handleNotification);
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            max-w-sm w-full bg-white border border-gray-200 rounded-lg shadow-lg p-4
            transform transition-all duration-300 ease-in-out
            animate-slide-in-right
            ${notification.type === 'success' ? 'border-green-500 bg-green-50' : ''}
            ${notification.type === 'error' ? 'border-red-500 bg-red-50' : ''}
            ${notification.type === 'warning' ? 'border-yellow-500 bg-yellow-50' : ''}
          `}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {notification.type === 'success' && (
                <div className="w-5 h-5 text-green-400">✅</div>
              )}
              {notification.type === 'error' && (
                <div className="w-5 h-5 text-red-400">❌</div>
              )}
              {notification.type === 'warning' && (
                <div className="w-5 h-5 text-yellow-400">⚠️</div>
              )}
              {!notification.type && (
                <div className="w-5 h-5 text-blue-400">ℹ️</div>
              )}
            </div>
            <div className="ml-3 w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">
                {notification.message}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className="inline-flex text-gray-400 hover:text-gray-500"
                onClick={() => {
                  setNotifications(prev => prev.filter(n => n.id !== notification.id));
                }}
              >
                <span className="text-lg">×</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Fonctions utilitaires pour notifications
window.showNotification = (message, type = 'info', duration = 4000) => {
  const event = new CustomEvent('showNotification', {
    detail: { message, type, duration }
  });
  window.dispatchEvent(event);
};

window.toast = {
  success: (message) => window.showNotification(message, 'success'),
  error: (message) => window.showNotification(message, 'error'),
  warning: (message) => window.showNotification(message, 'warning'),
  info: (message) => window.showNotification(message, 'info')
};

/**
 * 🚀 COMPOSANT APPLICATION PRINCIPAL
 * Version complète avec toutes les fonctionnalités Synergia v3.5
 */
function App() {
  const { user, isLoading, initialize: initAuth } = useAuthStore();
  const { theme, initialize: initTheme } = useThemeStore();
  
  // État local pour l'initialisation
  const [isAppReady, setIsAppReady] = useState(false);
  const [initErrors, setInitErrors] = useState([]);

  /**
   * 🎯 INITIALISATION COMPLÈTE DE L'APPLICATION
   */
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Initialisation Synergia v3.5...');
        
        // 1. Initialiser les stores
        await Promise.all([
          initAuth(),
          initTheme()
        ]);
        
        // 2. Attendre que le système de badges soit prêt
        if (typeof window !== 'undefined') {
          let attempts = 0;
          const maxAttempts = 20;
          
          const waitForBadgeSystem = () => {
            return new Promise((resolve) => {
              const checkBadgeSystem = () => {
                attempts++;
                
                if (window.badgeSystem?.isInitialized || attempts >= maxAttempts) {
                  resolve(true);
                } else {
                  setTimeout(checkBadgeSystem, 100);
                }
              };
              checkBadgeSystem();
            });
          };
          
          await waitForBadgeSystem();
          
          if (window.badgeSystem?.isInitialized) {
            console.log('✅ Système de badges initialisé');
          } else {
            console.warn('⚠️ Système de badges non initialisé après timeout');
          }
        }
        
        // 3. Configuration globale
        if (typeof window !== 'undefined') {
          window.SYNERGIA_VERSION = 'v3.5';
          window.SYNERGIA_BUILD = 'production-ready';
          
          // Outils de debug en développement
          if (process.env.NODE_ENV === 'development') {
            window.debugSynergia = {
              version: 'v3.5',
              auth: !!user,
              badges: !!window.badgeSystem,
              theme: theme,
              routes: 'all-loaded',
              status: 'ready'
            };
          }
        }
        
        setIsAppReady(true);
        console.log('✅ Synergia v3.5 initialisée avec succès');
        
      } catch (error) {
        console.error('❌ Erreur initialisation app:', error);
        setInitErrors(prev => [...prev, error.message]);
        setIsAppReady(true); // Continuer même avec erreurs
      }
    };

    initializeApp();
  }, [initAuth, initTheme]);

  /**
   * 🎊 DÉCLENCHEUR BADGES POUR CONNEXION UTILISATEUR
   */
  useEffect(() => {
    if (user && window.badgeTriggers && isAppReady) {
      console.log('🔑 Utilisateur connecté, déclenchement badges...');
      
      // Déclencher les badges de connexion
      window.badgeTriggers.onUserLogin(user);
      
      // Émettre événement global pour les autres composants
      const event = new CustomEvent('userLogin', {
        detail: { user, timestamp: Date.now() }
      });
      window.dispatchEvent(event);
      
      // Vérifier le badge de première connexion si c'est un nouvel utilisateur
      if (user.metadata?.creationTime) {
        const creationTime = new Date(user.metadata.creationTime);
        const now = new Date();
        const isNewUser = (now - creationTime) < (24 * 60 * 60 * 1000); // 24h
        
        if (isNewUser && window.checkUserBadges) {
          window.checkUserBadges(user.uid, {
            trigger: 'first_login',
            firstLogin: true,
            isNewUser: true
          });
        }
      }
    }
  }, [user, isAppReady]);

  /**
   * 🎨 GESTION DU THÈME
   */
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.colorScheme = 'light';
    }
    
    // Méta tag pour le thème mobile
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.content = theme === 'dark' ? '#111827' : '#ffffff';
    }
  }, [theme]);

  /**
   * 🛡️ COMPOSANT ROUTE PROTÉGÉE AMÉLIORÉ
   */
  const EnhancedProtectedRoute = ({ children, adminOnly = false, managerOnly = false }) => {
    if (isLoading || !isAppReady) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Initialisation de Synergia
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Chargement du système de badges et des données...
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
            </div>
            {initErrors.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Avertissements lors de l'initialisation (l'app peut continuer)
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (!user) {
      return <LoginPage />;
    }

    // Vérifications de permissions
    if (adminOnly && !user.isAdmin) {
      return <Navigate to="/dashboard" replace />;
    }

    if (managerOnly && !user.isManager && !user.isAdmin) {
      return <Navigate to="/dashboard" replace />;
    }

    return children;
  };

  /**
   * 🎯 COMPOSANT DE CHARGEMENT PARESSEUX
   */
  const LoadingFallback = ({ error = null }) => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center max-w-sm mx-auto p-6">
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
    if (!user) return <Navigate to="/login" replace />;
    
    // Rediriger vers onboarding si l'utilisateur est nouveau
    if (user.isNewUser || !user.profileCompleted) {
      return <Navigate to="/onboarding" replace />;
    }
    
    return <Navigate to="/dashboard" replace />;
  };

  // Ne pas rendre l'app si pas encore prête
  if (!isAppReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Synergia v3.5</h1>
          <p className="text-gray-600">Initialisation en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className={`App ${theme} min-h-screen transition-colors duration-300`}>
        <Router>
          {/* 🎊 CONTENEUR NOTIFICATIONS BADGES - TOUJOURS VISIBLE */}
          <BadgeNotificationContainer />
          
          {/* 🍞 SYSTÈME DE NOTIFICATIONS INTÉGRÉ (REMPLACEMENT REACT-HOT-TOAST) */}
          <NotificationContainer />

          {/* 🛣️ ROUTAGE PRINCIPAL COMPLET */}
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* 🔐 AUTHENTIFICATION */}
                <Route 
                  path="/login" 
                  element={
                    user ? <Navigate to="/dashboard" replace /> : <LoginPage />
                  } 
                />

                {/* 🏠 REDIRECTION RACINE */}
                <Route path="/" element={<HomeRedirect />} />

                {/* 📄 PAGES PRINCIPALES PROTÉGÉES */}
                <Route path="/*" element={
                  <EnhancedProtectedRoute>
                    <Layout>
                      <Routes>
                        {/* 🏠 DASHBOARD & ACCUEIL */}
                        <Route path="/dashboard" element={<HomePage />} />
                        <Route path="/home" element={<Navigate to="/dashboard" replace />} />

                        {/* 📋 GESTION DES TÂCHES */}
                        <Route path="/tasks" element={<TasksPage />} />
                        <Route path="/projects" element={<ProjectsPage />} />

                        {/* 🏆 SYSTÈME DE GAMIFICATION COMPLET */}
                        <Route path="/gamification" element={<GamificationPage />} />
                        <Route path="/badges" element={<BadgesPage />} />
                        <Route path="/achievements" element={<Navigate to="/badges" replace />} />
                        <Route path="/leaderboard" element={<LeaderboardPage />} />
                        <Route path="/rewards" element={<RewardsPage />} />
                        <Route path="/points" element={<Navigate to="/rewards" replace />} />

                        {/* 👥 ÉQUIPE & COLLABORATION */}
                        <Route path="/team" element={<TeamPage />} />
                        <Route path="/users" element={<UsersPage />} />
                        <Route path="/members" element={<Navigate to="/team" replace />} />
                        <Route path="/collaboration" element={<Navigate to="/team" replace />} />

                        {/* 📊 ANALYTICS & REPORTING */}
                        <Route path="/analytics" element={<AnalyticsPage />} />
                        <Route path="/reports" element={<Navigate to="/analytics" replace />} />
                        <Route path="/dashboard-analytics" element={<Navigate to="/analytics" replace />} />

                        {/* 👤 PROFIL & PARAMÈTRES */}
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/account" element={<Navigate to="/profile" replace />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/preferences" element={<Navigate to="/settings" replace />} />

                        {/* 🛠️ OUTILS SPÉCIALISÉS */}
                        <Route path="/onboarding" element={<OnboardingPage />} />
                        <Route path="/welcome" element={<Navigate to="/onboarding" replace />} />
                        <Route path="/timetrack" element={<TimeTrackPage />} />
                        <Route path="/time-tracking" element={<Navigate to="/timetrack" replace />} />

                        {/* 🛡️ ADMINISTRATION - ROUTES COMPLÈTES */}
                        <Route path="/admin" element={
                          <EnhancedProtectedRoute adminOnly>
                            <AdminPage />
                          </EnhancedProtectedRoute>
                        } />
                        <Route path="/admin/badges" element={
                          <EnhancedProtectedRoute adminOnly>
                            <AdminBadgesPage />
                          </EnhancedProtectedRoute>
                        } />
                        <Route path="/admin/users" element={
                          <EnhancedProtectedRoute adminOnly>
                            <AdminUsersPage />
                          </EnhancedProtectedRoute>
                        } />
                        <Route path="/admin/task-validation" element={
                          <EnhancedProtectedRoute adminOnly>
                            <AdminTaskValidationPage />
                          </EnhancedProtectedRoute>
                        } />
                        <Route path="/admin/analytics" element={
                          <EnhancedProtectedRoute adminOnly>
                            <AdminAnalyticsPage />
                          </EnhancedProtectedRoute>
                        } />

                        {/* 📱 ROUTES MOBILES & PWA */}
                        <Route path="/mobile" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/app" element={<Navigate to="/dashboard" replace />} />

                        {/* 🔗 ROUTES DE COMPATIBILITÉ */}
                        <Route path="/game" element={<Navigate to="/gamification" replace />} />
                        <Route path="/badge" element={<Navigate to="/badges" replace />} />
                        <Route path="/ranking" element={<Navigate to="/leaderboard" replace />} />
                        <Route path="/stats" element={<Navigate to="/analytics" replace />} />

                        {/* 🚫 PAGE 404 */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Layout>
                  </EnhancedProtectedRoute>
                } />
              </Routes>
            </Suspense>
          </div>
        </Router>

        {/* Styles CSS pour les animations */}
        <style jsx>{`
          @keyframes slide-in-right {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          .animate-slide-in-right {
            animation: slide-in-right 0.3s ease-out forwards;
          }
        `}</style>
      </div>
    </ErrorBoundary>
  );
}

/**
 * 🧪 OUTILS DE DEBUG GLOBAUX (DÉVELOPPEMENT UNIQUEMENT)
 */
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Outils de debug pour les développeurs
  window.debugSynergia = {
    version: 'v3.5',
    build: 'netlify-ready',
    
    // Tester le système de badges
    testBadges: () => {
      if (window.badgeSystem?.testSystem) {
        return window.badgeSystem.testSystem();
      } else {
        console.warn('⚠️ Système de badges non disponible');
        return false;
      }
    },
    
    // Tester les notifications
    testNotifications: () => {
      window.toast.success('Test notification success');
      window.toast.error('Test notification error');
      window.toast.warning('Test notification warning');
      window.toast.info('Test notification info');
    },
    
    // Obtenir le statut complet de l'application
    getAppStatus: () => {
      return {
        version: 'v3.5',
        build: 'netlify-ready',
        auth: !!window.useAuthStore,
        badges: !!window.badgeSystem,
        firebase: !!window.firebaseBadgeFix,
        notifications: !!window.toast,
        theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
        routes: 'all-loaded',
        dependencies: {
          'react-hot-toast': 'removed',
          'notifications': 'integrated'
        },
        timestamp: new Date().toISOString()
      };
    }
  };
  
  // Message de bienvenue développeur
  console.log(`
🚀 Synergia v3.5 - Build Netlify Ready
✅ Système de badges corrigé actif
✅ Notifications intégrées (sans react-hot-toast)
✅ Suppression d'erreurs Firebase active
✅ Toutes les routes chargées
✅ Compatible build production

📚 Commandes utiles:
- window.debugSynergia.getAppStatus()
- window.debugSynergia.testBadges()
- window.debugSynergia.testNotifications()
- window.toast.success('Test message')
  `);
}

/**
 * 🌟 FINALISATION & EXPORT
 */
export default App;

// Version et build info
App.version = 'v3.5';
App.buildDate = new Date().toISOString();
App.buildType = 'netlify-production';
App.features = [
  'badges-system-fixed',
  'firebase-errors-suppressed',
  'complete-routing',
  'admin-panels',
  'gamification-full',
  'theme-system',
  'error-boundaries',
  'lazy-loading',
  'pwa-ready',
  'netlify-compatible',
  'integrated-notifications'
];
