// ==========================================
// 📁 react-app/src/App.jsx
// APPLICATION PRINCIPALE AVEC SYSTÈME DE PROGRESSION PAR RÔLES
// Version clean sans doublons - Compatible build Netlify
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

export default App;
