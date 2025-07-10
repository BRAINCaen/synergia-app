// ==========================================
// 📁 react-app/src/App.jsx
// APPLICATION PRINCIPALE AVEC SYSTÈME DE PROGRESSION PAR RÔLES INTÉGRÉ
// ==========================================

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 🎯 Import du système de notifications existant
import { ToastProvider } from './shared/components/ToastNotification.jsx';
import ToastContainer from './shared/components/ui/ToastContainer.jsx';

// 🔥 Imports des systèmes de progression par rôles
import './core/services/roleProgressionIntegration.js';
import './core/services/roleUnlockService.js';
import './core/services/roleTaskManager.js';
import './core/services/roleBadgeSystem.js';

// 🎯 Imports existants
import { useAuthStore } from './shared/stores/authStore.js';
import { initializeBadgeSystem } from './core/badgeInitializer.js';
import Layout from './components/layout/Layout.jsx';
import Login from './pages/Login.jsx';
import LoadingScreen from './components/ui/LoadingScreen.jsx';

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
