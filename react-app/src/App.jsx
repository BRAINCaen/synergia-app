// ==========================================
// 📁 react-app/src/App.jsx
// VERSION PROPRE ET STABLE - ROUTING PRINCIPAL
// ==========================================

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout principal
import Layout from './components/layout/Layout.jsx';

// Store d'authentification
import { useAuthStore, initializeAuthStore } from './shared/stores/authStore.js';

// ==========================================
// 📄 PAGES PRINCIPALES
// ==========================================
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import TasksPage from './pages/TasksPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import GamificationPage from './pages/GamificationPage.jsx';
import TeamPage from './pages/TeamPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import RewardsPage from './pages/RewardsPage.jsx';
import BadgesPage from './pages/BadgesPage.jsx';
import TimeTrackPage from './pages/TimeTrackPage.jsx';
import RoleProgressionPage from './pages/RoleProgressionPage.jsx';

// ==========================================
// 🛡️ PAGES ADMIN
// ==========================================
import AdminTaskValidationPage from './pages/AdminTaskValidationPage.jsx';
import CompleteAdminTestPage from './pages/CompleteAdminTestPage.jsx';
import AdminRolePermissionsPage from './pages/AdminRolePermissionsPage.jsx';
import AdminUsersPage from './pages/AdminUsersPage.jsx';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage.jsx';
import AdminSettingsPage from './pages/AdminSettingsPage.jsx';

// ==========================================
// 🔐 COMPOSANT DE PROTECTION DES ROUTES
// ==========================================
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚙️</div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// ==========================================
// 🚀 COMPOSANT PRINCIPAL
// ==========================================
export default function App() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    console.log('🔐 Initialisation de l\'authentification...');
    initializeAuth();
    initializeAuthStore();
  }, [initializeAuth]);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Route publique de connexion */}
          <Route path="/login" element={<Login />} />
          
          {/* Routes protégées avec layout */}
          <Route path="/*" element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  {/* Page d'accueil */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  
                  {/* Pages principales */}
                  <Route path="/tasks" element={<TasksPage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/gamification" element={<GamificationPage />} />
                  <Route path="/team" element={<TeamPage />} />
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/onboarding" element={<OnboardingPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/rewards" element={<RewardsPage />} />
                  <Route path="/badges" element={<BadgesPage />} />
                  <Route path="/time-track" element={<TimeTrackPage />} />
                  <Route path="/role-progression" element={<RoleProgressionPage />} />
                  
                  {/* Routes admin */}
                  <Route path="/admin/task-validation" element={<AdminTaskValidationPage />} />
                  <Route path="/admin/test" element={<CompleteAdminTestPage />} />
                  <Route path="/admin/role-permissions" element={<AdminRolePermissionsPage />} />
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                  <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
                  <Route path="/admin/settings" element={<AdminSettingsPage />} />
                  
                  {/* Route par défaut */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}
