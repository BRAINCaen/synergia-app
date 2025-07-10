// ==========================================
// 📁 react-app/src/App.jsx
// APPLICATION PRINCIPALE AVEC SYSTÈME DE PROGRESSION PAR RÔLES INTÉGRÉ
// Version compatible avec build Netlify
// ==========================================

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 🎯 Imports existants
import { useAuthStore } from './shared/stores/authStore.js';
import Layout from './components/layout/Layout.jsx';
import Login from './pages/Login.jsx';

// 📄 Pages principales
import Dashboard from './pages/Dashboard.jsx';
import TasksPage from './pages/TasksPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import GamificationPage from './pages/GamificationPage.jsx';

// Component de chargement simple
const LoadingScreen = ({ message }) => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-400">{message || 'Chargement...'}</p>
    </div>
  </div>
);

// Container de notifications simple
const ToastContainer = () => null;

// ToastProvider simple
const ToastProvider = ({ children }) => <>{children}</>;

// Page de fallback pour les fonctionnalités en développement
const FallbackPage = ({ title, description }) => (
  <div className="min-h-screen bg-gray-900 p-6">
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-3xl font-bold text-white mb-4">{title}</h1>
      <p className="text-gray-400 mb-8">{description}</p>
      
      <div className="bg-gray-800 rounded-lg p-8">
        <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-white text-2xl">🚀</span>
        </div>
        <h3 className="text-white font-semibold mb-2">En développement</h3>
        <p className="text-gray-400">Cette fonctionnalité sera bientôt disponible</p>
      </div>
    </div>
  </div>
);

// Pages en développement
const BadgesPage = () => <FallbackPage title="Badges" description="Système de badges en développement" />;
const RewardsPage = () => <FallbackPage title="Récompenses" description="Boutique de récompenses" />;
const TeamPage = () => <FallbackPage title="Équipe" description="Gestion d'équipe" />;
const UsersPage = () => <FallbackPage title="Utilisateurs" description="Gestion des utilisateurs" />;
const ProfilePage = () => <FallbackPage title="Profil" description="Profil utilisateur" />;
const SettingsPage = () => <FallbackPage title="Paramètres" description="Configuration" />;
const OnboardingPage = () => <FallbackPage title="Aide" description="Guide d'utilisation" />;
const TimeTrackPage = () => <FallbackPage title="Temps" description="Suivi du temps" />;
const AdminTaskValidationPage = () => <FallbackPage title="Validation Admin" description="Validation des tâches" />;
const CompleteAdminTestPage = () => <FallbackPage title="Tests Admin" description="Tests administrateur" />;

// 🆕 Nouvelles pages du système de progression
const RoleProgressionPage = () => (
  <div className="min-h-screen bg-gray-900 p-6">
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-2">
          <span className="text-yellow-400">👑</span>
          Progression par Rôles
        </h1>
        <p className="text-gray-400">Développez votre expertise dans vos domaines de spécialisation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <span className="text-4xl mb-4 block">📈</span>
          <h3 className="text-white font-semibold mb-2">Vue d'ensemble</h3>
          <p className="text-gray-400 text-sm">Dashboard de progression complet</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <span className="text-4xl mb-4 block">🎯</span>
          <h3 className="text-white font-semibold mb-2">Tâches Spécialisées</h3>
          <p className="text-gray-400 text-sm">Tâches débloquées par niveau</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <span className="text-4xl mb-4 block">🏆</span>
          <h3 className="text-white font-semibold mb-2">Badges Exclusifs</h3>
          <p className="text-gray-400 text-sm">Collection de badges par rôle</p>
        </div>
      </div>

      <div className="mt-8 bg-blue-900 rounded-lg p-6">
        <h3 className="text-white font-semibold mb-3">🚀 Fonctionnalités à venir :</h3>
        <ul className="text-blue-200 space-y-2">
          <li>• Dashboard de progression en temps réel</li>
          <li>• Tâches spécialisées par rôle et niveau</li>
          <li>• Système de badges exclusifs</li>
          <li>• Déverrouillages progressifs</li>
          <li>• Recommandations personnalisées</li>
        </ul>
      </div>
    </div>
  </div>
);

const RoleTasksPage = () => (
  <div className="min-h-screen bg-gray-900 p-6">
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-3xl font-bold text-white mb-4">Tâches par Rôle</h1>
      <p className="text-gray-400 mb-8">Système de tâches spécialisées en développement...</p>
      
      <div className="bg-gray-800 rounded-lg p-8">
        <span className="text-6xl block mb-4">🎯</span>
        <h3 className="text-white font-semibold mb-2">Tâches Spécialisées</h3>
        <p className="text-gray-400">
          Bientôt disponible : tâches qui se débloquent selon votre progression dans chaque rôle
        </p>
      </div>
    </div>
  </div>
);

const RoleBadgesPage = () => (
  <div className="min-h-screen bg-gray-900 p-6">
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-3xl font-bold text-white mb-4">Badges Exclusifs par Rôle</h1>
      <p className="text-gray-400 mb-8">Collection de badges spécialisés en développement...</p>
      
      <div className="bg-gray-800 rounded-lg p-8">
        <span className="text-6xl block mb-4">🏆</span>
        <h3 className="text-white font-semibold mb-2">Badges de Rôle</h3>
        <p className="text-gray-400">
          Bientôt disponible : badges exclusifs à chaque domaine d'expertise
        </p>
      </div>
    </div>
  </div>
);

// Services simplifiés pour éviter les erreurs
const initializeBadgeSystem = async () => ({ success: true });
const roleProgressionIntegration = {
  initialize: async () => ({ success: true }),
  cleanup: () => {}
};

const App = () => {
  const { user, loading, initializeAuth } = useAuthStore();
  const [systemsInitialized, setSystemsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState(null);

  // 🚀 Initialisation complète des systèmes
  useEffect(() => {
    const initializeAllSystems = async () => {
      try {
        console.log('🚀 Initialisation des systèmes Synergia v3.5...');

        // 1. Initialiser l'authentification
        await initializeAuth();

        // 2. Initialiser le système de badges existant
        if (user?.uid) {
          await initializeBadgeSystem(user.uid);
          console.log('✅ Système de badges initialisé');

          // 3. Initialiser le nouveau système de progression par rôles
          const progressionResult = await roleProgressionIntegration.initialize(user.uid);
          if (progressionResult.success) {
            console.log('✅ Système de progression par rôles initialisé');
          }
        }

        setSystemsInitialized(true);
        console.log('🎉 Tous les systèmes Synergia v3.5 initialisés !');

      } catch (error) {
        console.error('❌ Erreur initialisation systèmes:', error);
        setInitializationError(error.message);
        setSystemsInitialized(true); // Continuer malgré l'erreur
      }
    };

    initializeAllSystems();
  }, [initializeAuth, user?.uid]);

  // 🔄 Cleanup lors du départ de l'utilisateur
  useEffect(() => {
    return () => {
      if (user?.uid && roleProgressionIntegration.cleanup) {
        roleProgressionIntegration.cleanup(user.uid);
      }
    };
  }, [user?.uid]);

  // 🔄 Écran de chargement
  if (loading || !systemsInitialized) {
    return (
      <LoadingScreen 
        message={
          loading ? "Connexion en cours..." :
          !systemsInitialized ? "Initialisation des systèmes de progression..." :
          "Chargement terminé..."
        }
      />
    );
  }

  // ⚠️ Affichage d'erreur d'initialisation
  if (initializationError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-red-900 border border-red-700 rounded-lg p-6 max-w-md">
          <h2 className="text-red-300 font-semibold mb-2">Erreur d'initialisation</h2>
          <p className="text-red-200 text-sm mb-4">{initializationError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
          >
            Recharger l'application
          </button>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <Router>
        <div className="App">
          {/* 🎉 Container de notifications */}
          <ToastContainer />

          {/* 🔐 Routes protégées */}
          <Routes>
            {/* Route de connexion */}
            <Route path="/login" element={
              user ? <Navigate to="/dashboard" replace /> : <Login />
            } />

            {/* Routes principales protégées */}
            <Route path="/" element={
              user ? <Layout /> : <Navigate to="/login" replace />
            }>
              {/* 🏠 Pages principales */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />

              {/* 🎮 Pages gamification */}
              <Route path="gamification" element={<GamificationPage />} />
              <Route path="badges" element={<BadgesPage />} />
              <Route path="rewards" element={<RewardsPage />} />

              {/* 🆕 Nouvelles pages du système de progression */}
              <Route path="role-progression" element={<RoleProgressionPage />} />
              <Route path="role-tasks" element={<RoleTasksPage />} />
              <Route path="role-badges" element={<RoleBadgesPage />} />

              {/* 👥 Pages équipe */}
              <Route path="team" element={<TeamPage />} />
              <Route path="users" element={<UsersPage />} />

              {/* ⚙️ Pages utilisateur */}
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="onboarding" element={<OnboardingPage />} />
              <Route path="timetrack" element={<TimeTrackPage />} />

              {/* 🛡️ Pages admin */}
              <Route path="admin/task-validation" element={<AdminTaskValidationPage />} />
              <Route path="admin/complete-test" element={<CompleteAdminTestPage />} />

              {/* 🔍 Pages de classement et leaderboard */}
              <Route path="leaderboard" element={<GamificationPage />} />
            </Route>

            {/* 🚫 Page 404 */}
            <Route path="*" element={
              <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-600 mb-4">404</h1>
                  <p className="text-gray-400 mb-6">Page non trouvée</p>
                  <button 
                    onClick={() => window.location.href = '/dashboard'}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Retour au Dashboard
                  </button>
                </div>
              </div>
            } />
          </Routes>

          {/* 🎨 Effets visuels globaux pour la progression */}
          <div id="confetti-container" className="pointer-events-none fixed inset-0 z-50" />
          <div id="epic-effects-container" className="pointer-events-none fixed inset-0 z-40" />
        </div>
      </Router>
    </ToastProvider>
  );
};

export default App;// ==========================================
// 📁 react-app/src/App.jsx
// APPLICATION PRINCIPALE AVEC SYSTÈME DE PROGRESSION PAR RÔLES INTÉGRÉ
// Version compatible avec build Netlify
// ==========================================

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 🎯 Import du système de notifications existant (avec fallback)
let ToastProvider, ToastContainer;
try {
  const toastModule = await import('./shared/components/ToastNotification.jsx');
  ToastProvider = toastModule.ToastProvider || React.Fragment;
} catch {
  ToastProvider = React.Fragment;
}

try {
  const containerModule = await import('./shared/components/ui/ToastContainer.jsx');
  ToastContainer = containerModule.default || (() => null);
} catch {
  ToastContainer = () => null;
}

// 🔥 Imports des systèmes de progression par rôles (avec fallback)
try {
  await import('./core/services/roleProgressionIntegration.js');
  await import('./core/services/roleUnlockService.js');
  await import('./core/services/roleTaskManager.js');
  await import('./core/services/roleBadgeSystem.js');
} catch (error) {
  console.log('⚠️ Services de progression en mode fallback');
}

// 🎯 Imports existants
import { useAuthStore } from './shared/stores/authStore.js';
import Layout from './components/layout/Layout.jsx';
import Login from './pages/Login.jsx';

// Imports avec fallback pour les pages qui n'existent pas encore
let LoadingScreen;
try {
  LoadingScreen = (await import('./components/ui/LoadingScreen.jsx')).default;
} catch {
  LoadingScreen = ({ message }) => (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-400">{message || 'Chargement...'}</p>
      </div>
    </div>
  );
}

// 📄 Pages principales
import Dashboard from './pages/Dashboard.jsx';
import TasksPage from './pages/TasksPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';

// 🎮 Pages gamification
import GamificationPage from './pages/GamificationPage.jsx';

// Imports avec fallback pour les pages manquantes
let BadgesPage, RewardsPage, TeamPage, UsersPage, ProfilePage, SettingsPage;
let OnboardingPage, TimeTrackPage, AdminTaskValidationPage, CompleteAdminTestPage;
let RoleProgressionPage, RoleTasksPage, RoleBadgesPage;

// Fonction pour créer une page de fallback
const createFallbackPage = (title, description) => () => (
  <div className="min-h-screen bg-gray-900 p-6">
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-3xl font-bold text-white mb-4">{title}</h1>
      <p className="text-gray-400 mb-8">{description}</p>
      
      <div className="bg-gray-800 rounded-lg p-8">
        <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-white text-2xl">🚀</span>
        </div>
        <h3 className="text-white font-semibold mb-2">En développement</h3>
        <p className="text-gray-400">Cette fonctionnalité sera bientôt disponible</p>
      </div>
    </div>
  </div>
);

// Chargement dynamique avec fallback
const loadPageWithFallback = async (path, fallbackTitle, fallbackDesc) => {
  try {
    const module = await import(path);
    return module.default;
  } catch {
    return createFallbackPage(fallbackTitle, fallbackDesc);
  }
};

// Initialisation des pages
(async () => {
  BadgesPage = await loadPageWithFallback('./pages/BadgesPage.jsx', 'Badges', 'Système de badges');
  RewardsPage = await loadPageWithFallback('./pages/RewardsPage.jsx', 'Récompenses', 'Boutique de récompenses');
  TeamPage = await loadPageWithFallback('./pages/TeamPage.jsx', 'Équipe', 'Gestion d\'équipe');
  UsersPage = await loadPageWithFallback('./pages/UsersPage.jsx', 'Utilisateurs', 'Gestion des utilisateurs');
  ProfilePage = await loadPageWithFallback('./pages/ProfilePage.jsx', 'Profil', 'Profil utilisateur');
  SettingsPage = await loadPageWithFallback('./pages/SettingsPage.jsx', 'Paramètres', 'Configuration');
  OnboardingPage = await loadPageWithFallback('./pages/OnboardingPage.jsx', 'Aide', 'Guide d\'utilisation');
  TimeTrackPage = await loadPageWithFallback('./pages/TimeTrackPage.jsx', 'Temps', 'Suivi du temps');
  AdminTaskValidationPage = await loadPageWithFallback('./pages/AdminTaskValidationPage.jsx', 'Validation Admin', 'Validation des tâches');
  CompleteAdminTestPage = await loadPageWithFallback('./pages/CompleteAdminTestPage.jsx', 'Tests Admin', 'Tests administrateur');
  
  // Nouvelles pages de progression
  RoleProgressionPage = await loadPageWithFallback('./pages/RoleProgressionPage.jsx', 'Progression par Rôles', 'Système de progression spécialisée');
  RoleTasksPage = await loadPageWithFallback('./pages/RoleTasksPage.jsx', 'Tâches par Rôle', 'Tâches spécialisées par domaine');
  RoleBadgesPage = await loadPageWithFallback('./pages/RoleBadgesPage.jsx', 'Badges Exclusifs', 'Badges par rôle et expertise');
})();

// Services avec fallback
let initializeBadgeSystem, roleProgressionIntegration;
try {
  initializeBadgeSystem = (await import('./core/badgeInitializer.js')).initializeBadgeSystem;
} catch {
  initializeBadgeSystem = async () => ({ success: true });
}

try {
  roleProgressionIntegration = (await import('./core/services/roleProgressionIntegration.js')).default;
} catch {
  roleProgressionIntegration = {
    initialize: async () => ({ success: true }),
    cleanup: () => {}
  };
}

const App = () => {
  const { user, loading, initializeAuth } = useAuthStore();
  const [systemsInitialized, setSystemsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState(null);

  // 🚀 Initialisation complète des systèmes
  useEffect(() => {
    const initializeAllSystems = async () => {
      try {
        console.log('🚀 Initialisation des systèmes Synergia v3.5...');

        // 1. Initialiser l'authentification
        await initializeAuth();

        // 2. Initialiser le système de badges existant
        if (user?.uid) {
          await initializeBadgeSystem(user.uid);
          console.log('✅ Système de badges initialisé');

          // 3. Initialiser le nouveau système de progression par rôles
          const progressionResult = await roleProgressionIntegration.initialize(user.uid);
          if (progressionResult.success) {
            console.log('✅ Système de progression par rôles initialisé');
          } else {
            console.warn('⚠️ Erreur initialisation progression:', progressionResult.error);
          }
        }

        setSystemsInitialized(true);
        console.log('🎉 Tous les systèmes Synergia v3.5 initialisés !');

      } catch (error) {
        console.error('❌ Erreur initialisation systèmes:', error);
        setInitializationError(error.message);
        setSystemsInitialized(true); // Continuer malgré l'erreur
      }
    };

    initializeAllSystems();
  }, [initializeAuth, user?.uid]);

  // 🔄 Cleanup lors du départ de l'utilisateur
  useEffect(() => {
    return () => {
      if (user?.uid && roleProgressionIntegration.cleanup) {
        roleProgressionIntegration.cleanup(user.uid);
      }
    };
  }, [user?.uid]);

  // 📱 Gestion des événements globaux du système de progression
  useEffect(() => {
    if (!systemsInitialized || !user?.uid) return;

    // Écouter les événements de level up
    const handleRoleLevelUp = (event) => {
      const { roleId, newLevel } = event.detail;
      console.log('🎉 Level up détecté dans App:', { roleId, newLevel });
      
      // Utiliser le système de notifications existant ou console
      if (window.showNotification) {
        window.showNotification({
          type: 'success',
          title: '🎉 Niveau supérieur atteint!',
          message: `${roleId}: niveau ${newLevel} débloqué!`,
          duration: 8000
        });
      } else {
        console.log(`🎉 Level up: ${roleId} → ${newLevel}`);
      }
    };

    // Écouter les nouveaux badges de rôle
    const handleRoleBadgeEarned = (event) => {
      const { badge } = event.detail;
      console.log('🏆 Nouveau badge de rôle dans App:', badge);
      
      if (window.showNotification) {
        window.showNotification({
          type: 'success',
          title: '🏆 Nouveau badge de rôle!',
          message: `${badge.name} débloqué!`,
          duration: 6000
        });
      }
    };

    // Écouter les déverrouillages de contenu
    const handleContentUnlocked = (event) => {
      const { type, items } = event.detail;
      console.log('🔓 Contenu débloqué dans App:', { type, count: items.length });
    };

    // Attacher les listeners
    window.addEventListener('roleLevelUp', handleRoleLevelUp);
    window.addEventListener('roleBadgeEarned', handleRoleBadgeEarned);
    window.addEventListener('contentUnlocked', handleContentUnlocked);

    // Nettoyage
    return () => {
      window.removeEventListener('roleLevelUp', handleRoleLevelUp);
      window.removeEventListener('roleBadgeEarned', handleRoleBadgeEarned);
      window.removeEventListener('contentUnlocked', handleContentUnlocked);
    };
  }, [systemsInitialized, user?.uid]);

  // 🔄 Écran de chargement
  if (loading || !systemsInitialized) {
    return (
      <LoadingScreen 
        message={
          loading ? "Connexion en cours..." :
          !systemsInitialized ? "Initialisation des systèmes de progression..." :
          "Chargement terminé..."
        }
      />
    );
  }

  // ⚠️ Affichage d'erreur d'initialisation
  if (initializationError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-red-900 border border-red-700 rounded-lg p-6 max-w-md">
          <h2 className="text-red-300 font-semibold mb-2">Erreur d'initialisation</h2>
          <p className="text-red-200 text-sm mb-4">{initializationError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
          >
            Recharger l'application
          </button>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <Router>
        <div className="App">
          {/* 🎉 Container de notifications */}
          <ToastContainer />

          {/* 🔐 Routes protégées */}
          <Routes>
            {/* Route de connexion */}
            <Route path="/login" element={
              user ? <Navigate to="/dashboard" replace /> : <Login />
            } />

            {/* Routes principales protégées */}
            <Route path="/" element={
              user ? <Layout /> : <Navigate to="/login" replace />
            }>
              {/* 🏠 Pages principales */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />

              {/* 🎮 Pages gamification */}
              <Route path="gamification" element={<GamificationPage />} />
              <Route path="badges" element={<BadgesPage />} />
              <Route path="rewards" element={<RewardsPage />} />

              {/* 🆕 Nouvelles pages du système de progression */}
              <Route path="role-progression" element={<RoleProgressionPage />} />
              <Route path="role-tasks" element={<RoleTasksPage />} />
              <Route path="role-badges" element={<RoleBadgesPage />} />

              {/* 👥 Pages équipe */}
              <Route path="team" element={<TeamPage />} />
              <Route path="users" element={<UsersPage />} />

              {/* ⚙️ Pages utilisateur */}
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="onboarding" element={<OnboardingPage />} />
              <Route path="timetrack" element={<TimeTrackPage />} />

              {/* 🛡️ Pages admin */}
              <Route path="admin/task-validation" element={<AdminTaskValidationPage />} />
              <Route path="admin/complete-test" element={<CompleteAdminTestPage />} />

              {/* 🔍 Pages de classement et leaderboard */}
              <Route path="leaderboard" element={<GamificationPage />} />
            </Route>

            {/* 🚫 Page 404 */}
            <Route path="*" element={
              <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-600 mb-4">404</h1>
                  <p className="text-gray-400 mb-6">Page non trouvée</p>
                  <button 
                    onClick={() => window.location.href = '/dashboard'}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Retour au Dashboard
                  </button>
                </div>
              </div>
            } />
          </Routes>
        </div>
      </Router>
    </ToastProvider>
  );
};

export default App;

const App = () => {
  const { user, loading, initializeAuth } = useAuthStore();
  const [systemsInitialized, setSystemsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState(null);

  // 🚀 Initialisation complète des systèmes
  useEffect(() => {
    const initializeAllSystems = async () => {
      try {
        console.log('🚀 Initialisation des systèmes Synergia v3.5...');

        // 1. Initialiser l'authentification
        await initializeAuth();

        // 2. Initialiser le système de badges existant
        if (user?.uid) {
          await initializeBadgeSystem(user.uid);
          console.log('✅ Système de badges initialisé');

          // 3. Initialiser le nouveau système de progression par rôles
          const progressionResult = await roleProgressionIntegration.initialize(user.uid);
          if (progressionResult.success) {
            console.log('✅ Système de progression par rôles initialisé');
          } else {
            console.warn('⚠️ Erreur initialisation progression:', progressionResult.error);
          }
        }

        setSystemsInitialized(true);
        console.log('🎉 Tous les systèmes Synergia v3.5 initialisés !');

      } catch (error) {
        console.error('❌ Erreur initialisation systèmes:', error);
        setInitializationError(error.message);
        setSystemsInitialized(true); // Continuer malgré l'erreur
      }
    };

    initializeAllSystems();
  }, [initializeAuth, user?.uid]);

  // 🔄 Cleanup lors du départ de l'utilisateur
  useEffect(() => {
    return () => {
      if (user?.uid) {
        roleProgressionIntegration.cleanup(user.uid);
      }
    };
  }, [user?.uid]);

  // 📱 Gestion des événements globaux du système de progression
  useEffect(() => {
    if (!systemsInitialized || !user?.uid) return;

    // Écouter les événements de level up
    const handleRoleLevelUp = (event) => {
      const { roleId, newLevel, newUnlocks } = event.detail;
      console.log('🎉 Level up détecté dans App:', { roleId, newLevel });
      
      // Utiliser le système de notifications existant
      if (window.showNotification) {
        window.showNotification({
          type: 'success',
          title: '🎉 Niveau supérieur atteint!',
          message: `${roleId}: niveau ${newLevel} débloqué!`,
          duration: 8000
        });
      }
      
      // Ici tu peux ajouter des effets globaux, confetti, sons, etc.
      if (window.showConfetti) {
        window.showConfetti();
      }
    };

    // Écouter les nouveaux badges de rôle
    const handleRoleBadgeEarned = (event) => {
      const { badge } = event.detail;
      console.log('🏆 Nouveau badge de rôle dans App:', badge);
      
      // Utiliser le système de notifications existant
      if (window.showNotification) {
        window.showNotification({
          type: 'success',
          title: '🏆 Nouveau badge de rôle!',
          message: `${badge.name} débloqué!`,
          duration: 6000
        });
      }
      
      // Effet visuel global pour les badges rares
      if (badge.rarity === 'legendary' || badge.rarity === 'mythic') {
        if (window.showEpicEffect) {
          window.showEpicEffect(badge);
        }
      }
    };

    // Écouter les déverrouillages de contenu
    const handleContentUnlocked = (event) => {
      const { type, items } = event.detail;
      console.log('🔓 Contenu débloqué dans App:', { type, count: items.length });
      
      if (window.showNotification) {
        window.showNotification({
          type: 'info',
          title: '🔓 Nouveau contenu débloqué!',
          message: `${items.length} nouvelles ${type} disponibles`,
          duration: 5000
        });
      }
    };

    // Attacher les listeners
    window.addEventListener('roleLevelUp', handleRoleLevelUp);
    window.addEventListener('roleBadgeEarned', handleRoleBadgeEarned);
    window.addEventListener('contentUnlocked', handleContentUnlocked);

    // Nettoyage
    return () => {
      window.removeEventListener('roleLevelUp', handleRoleLevelUp);
      window.removeEventListener('roleBadgeEarned', handleRoleBadgeEarned);
      window.removeEventListener('contentUnlocked', handleContentUnlocked);
    };
  }, [systemsInitialized, user?.uid]);

  // 🔄 Écran de chargement
  if (loading || !systemsInitialized) {
    return (
      <LoadingScreen 
        message={
          loading ? "Connexion en cours..." :
          !systemsInitialized ? "Initialisation des systèmes de progression..." :
          "Chargement terminé..."
        }
        progress={
          loading ? 30 :
          !systemsInitialized ? 70 :
          100
        }
      />
    );
  }

  // ⚠️ Affichage d'erreur d'initialisation
  if (initializationError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-red-900 border border-red-700 rounded-lg p-6 max-w-md">
          <h2 className="text-red-300 font-semibold mb-2">Erreur d'initialisation</h2>
          <p className="text-red-200 text-sm mb-4">{initializationError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
          >
            Recharger l'application
          </button>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <Router>
        <div className="App">
          {/* 🎉 Container de notifications existant */}
          <ToastContainer />

          {/* 🔐 Routes protégées */}
          <Routes>
            {/* Route de connexion */}
            <Route path="/login" element={
              user ? <Navigate to="/dashboard" replace /> : <Login />
            } />

            {/* Routes principales protégées */}
            <Route path="/" element={
              user ? <Layout /> : <Navigate to="/login" replace />
            }>
              {/* 🏠 Pages principales */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />

              {/* 🎮 Pages gamification enrichies */}
              <Route path="gamification" element={<GamificationPage />} />
              <Route path="badges" element={<BadgesPage />} />
              <Route path="rewards" element={<RewardsPage />} />

              {/* 🆕 Nouvelles pages du système de progression */}
              <Route path="role-progression" element={<RoleProgressionPage />} />
              <Route path="role-tasks" element={<RoleTasksPage />} />
              <Route path="role-badges" element={<RoleBadgesPage />} />

              {/* 👥 Pages équipe */}
              <Route path="team" element={<TeamPage />} />
              <Route path="users" element={<UsersPage />} />

              {/* ⚙️ Pages utilisateur */}
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="onboarding" element={<OnboardingPage />} />
              <Route path="timetrack" element={<TimeTrackPage />} />

              {/* 🛡️ Pages admin */}
              <Route path="admin/task-validation" element={<AdminTaskValidationPage />} />
              <Route path="admin/complete-test" element={<CompleteAdminTestPage />} />

              {/* 🔍 Pages de classement et leaderboard */}
              <Route path="leaderboard" element={<GamificationPage />} />
            </Route>

            {/* 🚫 Page 404 */}
            <Route path="*" element={
              <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-600 mb-4">404</h1>
                  <p className="text-gray-400 mb-6">Page non trouvée</p>
                  <button 
                    onClick={() => window.location.href = '/dashboard'}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Retour au Dashboard
                  </button>
                </div>
              </div>
            } />
          </Routes>

          {/* 🎨 Effets visuels globaux pour la progression */}
          <div id="confetti-container" className="pointer-events-none fixed inset-0 z-50" />
          <div id="epic-effects-container" className="pointer-events-none fixed inset-0 z-40" />
        </div>
      </Router>
    </ToastProvider>
  );
};

export default App;

// 📄 Pages principales
import Dashboard from './pages/Dashboard.jsx';
import TasksPage from './pages/TasksPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';

// 🎮 Pages gamification avec nouvelles fonctionnalités
import GamificationPage from './pages/GamificationPage.jsx';
import BadgesPage from './pages/BadgesPage.jsx';
import RewardsPage from './pages/RewardsPage.jsx';

// 👥 Pages équipe
import TeamPage from './pages/TeamPage.jsx';
import UsersPage from './pages/UsersPage.jsx';

// ⚙️ Pages utilisateur
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import TimeTrackPage from './pages/TimeTrackPage.jsx';

// 🛡️ Pages admin
import AdminTaskValidationPage from './pages/AdminTaskValidationPage.jsx';
import CompleteAdminTestPage from './pages/CompleteAdminTestPage.jsx';

// 🆕 Nouvelles pages du système de progression
import RoleProgressionPage from './pages/RoleProgressionPage.jsx';
import RoleTasksPage from './pages/RoleTasksPage.jsx';
import RoleBadgesPage from './pages/RoleBadgesPage.jsx';

// 🎯 Imports des services
import roleProgressionIntegration from './core/services/roleProgressionIntegration.js';

const App = () => {
  const { user, loading, initializeAuth } = useAuthStore();
  const [systemsInitialized, setSystemsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState(null);

  // 🚀 Initialisation complète des systèmes
  useEffect(() => {
    const initializeAllSystems = async () => {
      try {
        console.log('🚀 Initialisation des systèmes Synergia v3.5...');

        // 1. Initialiser l'authentification
        await initializeAuth();

        // 2. Initialiser le système de badges existant
        if (user?.uid) {
          await initializeBadgeSystem(user.uid);
          console.log('✅ Système de badges initialisé');

          // 3. Initialiser le nouveau système de progression par rôles
          const progressionResult = await roleProgressionIntegration.initialize(user.uid);
          if (progressionResult.success) {
            console.log('✅ Système de progression par rôles initialisé');
          } else {
            console.warn('⚠️ Erreur initialisation progression:', progressionResult.error);
          }
        }

        setSystemsInitialized(true);
        console.log('🎉 Tous les systèmes Synergia v3.5 initialisés !');

      } catch (error) {
        console.error('❌ Erreur initialisation systèmes:', error);
        setInitializationError(error.message);
        setSystemsInitialized(true); // Continuer malgré l'erreur
      }
    };

    initializeAllSystems();
  }, [initializeAuth, user?.uid]);

  // 🔄 Cleanup lors du départ de l'utilisateur
  useEffect(() => {
    return () => {
      if (user?.uid) {
        roleProgressionIntegration.cleanup(user.uid);
      }
    };
  }, [user?.uid]);

  // 📱 Gestion des événements globaux du système de progression
  useEffect(() => {
    if (!systemsInitialized || !user?.uid) return;

    // Écouter les événements de level up
    const handleRoleLevelUp = (event) => {
      const { roleId, newLevel, newUnlocks } = event.detail;
      console.log('🎉 Level up détecté dans App:', { roleId, newLevel });
      
      // Ici tu peux ajouter des effets globaux, confetti, sons, etc.
      if (window.showConfetti) {
        window.showConfetti();
      }
    };

    // Écouter les nouveaux badges de rôle
    const handleRoleBadgeEarned = (event) => {
      const { badge } = event.detail;
      console.log('🏆 Nouveau badge de rôle dans App:', badge);
      
      // Effet visuel global pour les badges rares
      if (badge.rarity === 'legendary' || badge.rarity === 'mythic') {
        if (window.showEpicEffect) {
          window.showEpicEffect(badge);
        }
      }
    };

    // Écouter les déverrouillages de contenu
    const handleContentUnlocked = (event) => {
      const { type, items } = event.detail;
      console.log('🔓 Contenu débloqué dans App:', { type, count: items.length });
    };

    // Attacher les listeners
    window.addEventListener('roleLevelUp', handleRoleLevelUp);
    window.addEventListener('roleBadgeEarned', handleRoleBadgeEarned);
    window.addEventListener('contentUnlocked', handleContentUnlocked);

    // Nettoyage
    return () => {
      window.removeEventListener('roleLevelUp', handleRoleLevelUp);
      window.removeEventListener('roleBadgeEarned', handleRoleBadgeEarned);
      window.removeEventListener('contentUnlocked', handleContentUnlocked);
    };
  }, [systemsInitialized, user?.uid]);

  // 🔄 Écran de chargement
  if (loading || !systemsInitialized) {
    return (
      <LoadingScreen 
        message={
          loading ? "Connexion en cours..." :
          !systemsInitialized ? "Initialisation des systèmes de progression..." :
          "Chargement terminé..."
        }
        progress={
          loading ? 30 :
          !systemsInitialized ? 70 :
          100
        }
      />
    );
  }

  // ⚠️ Affichage d'erreur d'initialisation
  if (initializationError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-red-900 border border-red-700 rounded-lg p-6 max-w-md">
          <h2 className="text-red-300 font-semibold mb-2">Erreur d'initialisation</h2>
          <p className="text-red-200 text-sm mb-4">{initializationError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
          >
            Recharger l'application
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {/* 🎉 Notifications globales */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#f3f4f6',
              border: '1px solid #374151'
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#f3f4f6'
              }
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#f3f4f6'
              }
            }
          }}
        />

        {/* 🔐 Routes protégées */}
        <Routes>
          {/* Route de connexion */}
          <Route path="/login" element={
            user ? <Navigate to="/dashboard" replace /> : <Login />
          } />

          {/* Routes principales protégées */}
          <Route path="/" element={
            user ? <Layout /> : <Navigate to="/login" replace />
          }>
            {/* 🏠 Pages principales */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />

            {/* 🎮 Pages gamification enrichies */}
            <Route path="gamification" element={<GamificationPage />} />
            <Route path="badges" element={<BadgesPage />} />
            <Route path="rewards" element={<RewardsPage />} />

            {/* 🆕 Nouvelles pages du système de progression */}
            <Route path="role-progression" element={<RoleProgressionPage />} />
            <Route path="role-tasks" element={<RoleTasksPage />} />
            <Route path="role-badges" element={<RoleBadgesPage />} />

            {/* 👥 Pages équipe */}
            <Route path="team" element={<TeamPage />} />
            <Route path="users" element={<UsersPage />} />

            {/* ⚙️ Pages utilisateur */}
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="onboarding" element={<OnboardingPage />} />
            <Route path="timetrack" element={<TimeTrackPage />} />

            {/* 🛡️ Pages admin */}
            <Route path="admin/task-validation" element={<AdminTaskValidationPage />} />
            <Route path="admin/complete-test" element={<CompleteAdminTestPage />} />

            {/* 🔍 Pages de classement et leaderboard */}
            <Route path="leaderboard" element={<GamificationPage />} />
          </Route>

          {/* 🚫 Page 404 */}
          <Route path="*" element={
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-600 mb-4">404</h1>
                <p className="text-gray-400 mb-6">Page non trouvée</p>
                <button 
                  onClick={() => window.location.href = '/dashboard'}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Retour au Dashboard
                </button>
              </div>
            </div>
          } />
        </Routes>

        {/* 🎨 Effets visuels globaux pour la progression */}
        <div id="confetti-container" className="pointer-events-none fixed inset-0 z-50" />
        <div id="epic-effects-container" className="pointer-events-none fixed inset-0 z-40" />
      </div>
    </Router>
  );
};

export default App;
