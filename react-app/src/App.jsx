// ==========================================
// 📁 react-app/src/App.jsx
// VERSION ULTRA-SIMPLE QUI MARCHE
// ==========================================

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './shared/stores/authStore.js';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import { ToastProvider } from './shared/providers/ToastProvider.jsx';

// Pages principales - imports directs et simples
import Login from './pages/Login.jsx';
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

// Pages de rôles
import RoleProgressionPage from './pages/RoleProgressionPage.jsx';
import RoleTasksPage from './pages/RoleTasksPage.jsx';
import RoleBadgesPage from './pages/RoleBadgesPage.jsx';

// Pages admin
import AdminTaskValidationPage from './pages/AdminTaskValidationPage.jsx';
import CompleteAdminTestPage from './pages/CompleteAdminTestPage.jsx';

// Page de classement
import LeaderboardPage from './pages/LeaderboardPage.jsx';

function App() {
  const { user, loading, initialized, initializeAuth } = useAuthStore();

  // S'assurer que l'auth est initialisée
  useEffect(() => {
    if (!initialized) {
      console.log('🔄 Initialisation de l\'auth depuis App.jsx');
      initializeAuth();
    }
  }, [initialized, initializeAuth]);

  // Affichage de chargement SEULEMENT si pas encore initialisé
  if (!initialized || (loading && !user)) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white text-xl">Initialisation...</div>
          <div className="text-gray-400 text-sm mt-2">
            {!initialized ? 'Configuration de l\'authentification...' : 'Vérification de la session...'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <Router>
        <Routes>
          {/* Route de connexion */}
          <Route path="/login" element={
            user ? <Navigate to="/dashboard" replace /> : <Login />
          } />

          {/* Routes protégées avec DashboardLayout */}
          <Route path="/" element={
            user ? <DashboardLayout /> : <Navigate to="/login" replace />
          }>
            {/* Redirection par défaut */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            {/* Pages principales */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />

            {/* Gamification */}
            <Route path="gamification" element={<GamificationPage />} />
            <Route path="badges" element={<BadgesPage />} />
            <Route path="rewards" element={<RewardsPage />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />

            {/* Pages de rôles */}
            <Route path="role-progression" element={<RoleProgressionPage />} />
            <Route path="role-tasks" element={<RoleTasksPage />} />
            <Route path="role-badges" element={<RoleBadgesPage />} />

            {/* Équipe */}
            <Route path="team" element={<TeamPage />} />
            <Route path="users" element={<UsersPage />} />

            {/* Outils */}
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="onboarding" element={<OnboardingPage />} />
            <Route path="timetrack" element={<TimeTrackPage />} />

            {/* Admin */}
            <Route path="admin/task-validation" element={<AdminTaskValidationPage />} />
            <Route path="admin/complete-test" element={<CompleteAdminTestPage />} />
          </Route>

          {/* Page 404 */}
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
      </Router>
    </ToastProvider>
  );
}

export default App;
