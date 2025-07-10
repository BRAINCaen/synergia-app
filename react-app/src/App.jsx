// ==========================================
// 📁 react-app/src/App.jsx
// APPLICATION PRINCIPALE CORRIGÉE - VRAIES PAGES IMPORTÉES
// ==========================================

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 🎯 Imports de base
import { useAuthStore } from './shared/stores/authStore.js';
import Layout from './components/layout/Layout.jsx';
import Login from './pages/Login.jsx';

// 📄 VRAIES PAGES PRINCIPALES (toutes existantes !)
import Dashboard from './pages/Dashboard.jsx';
import TasksPage from './pages/TasksPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';

// 🎮 VRAIES PAGES GAMIFICATION
import GamificationPage from './pages/GamificationPage.jsx';
import BadgesPage from './pages/BadgesPage.jsx';
import RewardsPage from './pages/RewardsPage.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';

// 👥 VRAIES PAGES ÉQUIPE
import TeamPage from './pages/TeamPage.jsx';
import UsersPage from './pages/UsersPage.jsx';

// ⚙️ VRAIES PAGES UTILISATEUR
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import TimeTrackPage from './pages/TimeTrackPage.jsx';

// 🛡️ VRAIES PAGES ADMIN
import AdminTaskValidationPage from './pages/AdminTaskValidationPage.jsx';
import CompleteAdminTestPage from './pages/CompleteAdminTestPage.jsx';

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

// 🛍️ PAGE BOUTIQUE TEMPORAIRE (sera créée séparément)
const ShopPage = () => (
  <div className="min-h-screen bg-gray-900 p-6">
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-3xl font-bold text-white mb-4">🛍️ Boutique</h1>
      <p className="text-gray-400 mb-8">Échangez vos points contre des récompenses</p>
      
      <div className="bg-gray-800 rounded-lg p-8">
        <div className="w-16 h-16 bg-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-white text-2xl">🛒</span>
        </div>
        <h3 className="text-white font-semibold mb-2">Boutique en préparation</h3>
        <p className="text-gray-400">La boutique de récompenses sera bientôt disponible</p>
      </div>
    </div>
  </div>
);

// 🆕 Pages du système de progression (nouvelles)
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
      <h1 className="text-3xl font-bold text-white mb-4">🎯 Tâches par Rôle</h1>
      <p className="text-gray-400 mb-8">Tâches spécialisées débloquées selon votre progression</p>
      
      <div className="bg-gray-800 rounded-lg p-8">
        <div className="w-16 h-16 bg-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-white text-2xl">🎯</span>
        </div>
        <h3 className="text-white font-semibold mb-2">Tâches spécialisées</h3>
        <p className="text-gray-400">Système en développement</p>
      </div>
    </div>
  </div>
);

const RoleBadgesPage = () => (
  <div className="min-h-screen bg-gray-900 p-6">
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-3xl font-bold text-white mb-4">🏆 Badges Exclusifs</h1>
      <p className="text-gray-400 mb-8">Collection de badges spéciaux par rôle</p>
      
      <div className="bg-gray-800 rounded-lg p-8">
        <div className="w-16 h-16 bg-yellow-600 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-white text-2xl">🏆</span>
        </div>
        <h3 className="text-white font-semibold mb-2">Badges exclusifs</h3>
        <p className="text-gray-400">Collection spéciale en développement</p>
      </div>
    </div>
  </div>
);

const App = () => {
  const { user, checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return <LoadingScreen message="Initialisation de Synergia..." />;
  }

  return (
    <ToastProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Route de connexion */}
            <Route 
              path="/login" 
              element={
                user ? <Navigate to="/dashboard" replace /> : <Login />
              } 
            />

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
              <Route path="leaderboard" element={<LeaderboardPage />} />
              <Route path="shop" element={<ShopPage />} />

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

          {/* 🎨 Effets visuels globaux */}
          <div id="confetti-container" className="pointer-events-none fixed inset-0 z-50" />
          <div id="epic-effects-container" className="pointer-events-none fixed inset-0 z-40" />
          <ToastContainer />
        </div>
      </Router>
    </ToastProvider>
  );
};

export default App;
