// ==========================================
// 📁 react-app/src/App.jsx - VERSION CORRIGÉE
// Routes principales avec corrections pour classement et pages de rôle
// ==========================================

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './shared/stores/authStore';
import { isAdmin } from './core/services/adminService';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import { ToastProvider } from './shared/providers/ToastProvider.jsx';

// 📄 Pages principales
import Dashboard from './pages/Dashboard.jsx';
import TasksPage from './pages/TasksPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import GamificationPage from './pages/GamificationPage.jsx';
import BadgesPage from './pages/BadgesPage.jsx';
import RewardsPage from './pages/RewardsPage.jsx';
import TeamPage from './pages/TeamPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import TimeTrackPage from './pages/TimeTrackPage.jsx';

// 🎯 Page de classement (VRAIE PAGE)
import LeaderboardPage from './pages/LeaderboardPage.jsx';

// 🆕 Pages système de progression (NOUVELLES VRAIES PAGES)
import RoleProgressionPage from './pages/RoleProgressionPage.jsx';
import RoleTasksPage from './pages/RoleTasksPage.jsx';
import RoleBadgesPage from './pages/RoleBadgesPage.jsx';

// 🛡️ Pages admin
import AdminTaskValidationPage from './pages/AdminTaskValidationPage.jsx';
import CompleteAdminTestPage from './pages/CompleteAdminTestPage.jsx';

// 🔐 Page de connexion
import Login from './pages/Login.jsx';

// Composant Layout avec protection d'authentification
const Layout = () => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <DashboardLayout />;
};

const App = () => {
  const { user } = useAuthStore();

  return (
    <ToastProvider>
      <Router>
        <div className="min-h-screen bg-gray-900">
          <Routes>
            {/* 🔐 Route de connexion */}
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

              {/* 🏆 Page de classement (CORRIGÉE) */}
              <Route path="leaderboard" element={<LeaderboardPage />} />

              {/* 🆕 Nouvelles pages du système de progression (CORRIGÉES) */}
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

          {/* 🎨 Effets visuels globaux pour la progression */}
          <div id="confetti-container" className="pointer-events-none fixed inset-0 z-50" />
          <div id="epic-effects-container" className="pointer-events-none fixed inset-0 z-40" />
        </div>
      </Router>
    </ToastProvider>
  );
};

export default App;
