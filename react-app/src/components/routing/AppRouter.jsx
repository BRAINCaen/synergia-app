// ==========================================
// 📁 react-app/src/components/routing/AppRouter.jsx
// ROUTER MIS À JOUR AVEC DASHBOARD ADMIN MANAGER
// ==========================================

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../layout/Layout.jsx';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { isAdmin } from '../../core/services/adminService.js';

// ✅ IMPORTS CORRIGÉS - Noms exacts des fichiers
import Login from '../../pages/Login.jsx';
import Dashboard from '../../pages/Dashboard.jsx';
import TasksPage from '../../pages/TasksPage.jsx';
import ProjectsPage from '../../pages/ProjectsPage.jsx';
import AnalyticsPage from '../../pages/AnalyticsPage.jsx';
import BadgesPage from '../../pages/BadgesPage.jsx';
import GamificationPage from '../../pages/GamificationPage.jsx';
import RewardsPage from '../../pages/RewardsPage.jsx';
import TeamPage from '../../pages/TeamPage.jsx';
import UsersPage from '../../pages/UsersPage.jsx';
import ProfilePage from '../../pages/ProfilePage.jsx';
import SettingsPage from '../../pages/SettingsPage.jsx';
import OnboardingPage from '../../pages/OnboardingPage.jsx';
import TimeTrackPage from '../../pages/TimeTrackPage.jsx';

// 🎯 IMPORTS PAGES DE PROGRESSION - AJOUTÉES
import RoleProgressionPage from '../../pages/RoleProgressionPage.jsx';
import RoleTasksPage from '../../pages/RoleTasksPage.jsx';
import RoleBadgesPage from '../../pages/RoleBadgesPage.jsx';

// 🚀 NOUVELLE PAGE ESCAPE PROGRESSION
import EscapeProgressionPage from '../../pages/EscapeProgressionPage.jsx';

// ✅ IMPORTS ADMIN CORRIGÉS
import AdminTaskValidationPage from '../../pages/AdminTaskValidationPage.jsx';
import CompleteAdminTestPage from '../../pages/CompleteAdminTestPage.jsx';

// 🔧 CORRECTION: Importer LeaderboardPage au lieu de Leaderboard
import LeaderboardPage from '../../pages/LeaderboardPage.jsx';

// 🆕 NOUVELLE PAGE ADMIN - GESTION DES PERMISSIONS PAR RÔLE
import AdminRolePermissionsPage from '../../pages/AdminRolePermissionsPage.jsx';

// 🆕 PAGES ADMIN COMPLÈTES
import AdminBadgesPage from '../../pages/AdminBadgesPage.jsx';
import AdminUsersPage from '../../pages/AdminUsersPage.jsx';
import AdminAnalyticsPage from '../../pages/AdminAnalyticsPage.jsx';
import AdminSettingsPage from '../../pages/AdminSettingsPage.jsx';

// 🎁 NOUVELLE PAGE ADMIN RÉCOMPENSES
import AdminRewardsPage from '../../pages/AdminRewardsPage.jsx';

// 📊 NOUVELLE PAGE DASHBOARD ADMIN MANAGER
import AdminDashboardManager from '../../pages/AdminDashboardManager.jsx';

// Composant de protection admin
const AdminRoute = ({ children }) => {
  const { user } = useAuthStore();
  
  if (!isAdmin(user)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const AppRouter = () => {
  const { user } = useAuthStore();
  
  // Si pas connecté, rediriger vers login
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* Routes protégées avec Layout */}
      <Route element={<Layout />}>
        {/* Pages principales */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        
        {/* Gamification RECONNECTÉES */}
        <Route path="/gamification" element={<GamificationPage />} />
        <Route path="/badges" element={<BadgesPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/rewards" element={<RewardsPage />} />
        
        {/* 🎯 ROUTES PROGRESSION AJOUTÉES */}
        <Route path="/role/progression" element={<RoleProgressionPage />} />
        <Route path="/role/tasks" element={<RoleTasksPage />} />
        <Route path="/role/badges" element={<RoleBadgesPage />} />
        
        {/* 🚀 NOUVELLE ROUTE ESCAPE PROGRESSION */}
        <Route path="/escape-progression" element={<EscapeProgressionPage />} />
        
        {/* Équipe & Social */}
        <Route path="/team" element={<TeamPage />} />
        <Route path="/users" element={<UsersPage />} />
        
        {/* Profil & Paramètres */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        
        {/* Fonctionnalités spécialisées */}
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/timetrack" element={<TimeTrackPage />} />
      </Route>
      
      {/* 🛡️ Routes Admin protégées */}
      <Route element={
        <AdminRoute>
          <Layout />
        </AdminRoute>
      }>
        {/* 📊 NOUVELLE ROUTE DASHBOARD ADMIN MANAGER */}
        <Route path="/admin/dashboard-manager" element={<AdminDashboardManager />} />
        
        <Route path="/admin/task-validation" element={<AdminTaskValidationPage />} />
        <Route path="/admin/complete-test" element={<CompleteAdminTestPage />} />
        
        {/* 🆕 NOUVELLE ROUTE ADMIN - PERMISSIONS PAR RÔLE */}
        <Route path="/admin/role-permissions" element={<AdminRolePermissionsPage />} />
        
        {/* 🆕 ROUTES ADMIN COMPLÈTES */}
        <Route path="/admin/badges" element={<AdminBadgesPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
        
        {/* 🎁 NOUVELLE ROUTE ADMIN RÉCOMPENSES */}
        <Route path="/admin/rewards" element={<AdminRewardsPage />} />
      </Route>
      
      {/* Redirection par défaut */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Page 404 */}
      <Route path="*" element={
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-white mb-4">404</h1>
            <p className="text-gray-400 mb-8">Page non trouvée</p>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Retour au Dashboard
            </button>
          </div>
        </div>
      } />
    </Routes>
  );
};

export default AppRouter;
