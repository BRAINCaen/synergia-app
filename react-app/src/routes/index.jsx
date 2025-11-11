// ==========================================
// 📁 react-app/src/routes/index.jsx
// ROUTES COMPLÈTES - TOUS LES LIENS FONCTIONNELS
// ==========================================

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Pages principales
import DashboardPage from '../pages/Dashboard.jsx';
import TasksPage from '../pages/TasksPage.jsx';
import CampaignsPage from '../pages/CampaignsPage.jsx';
import CampaignDetailPage from '../pages/CampaignDetailPage.jsx';
import AnalyticsPage from '../pages/AnalyticsPage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import LeaderboardPage from '../pages/LeaderboardPage.jsx';
import BadgesPage from '../pages/BadgesPage.jsx';
import GamificationPage from '../pages/GamificationPage.jsx';
import RewardsPage from '../pages/RewardsPage.jsx';
import TeamPage from '../pages/TeamPage.jsx';
import OnboardingPage from '../pages/OnboardingPage.jsx';
import TimeTrackPage from '../pages/TimeTrackPage.jsx';
import AdminPage from '../pages/AdminPage.jsx';
import AdminTaskValidationPage from '../pages/AdminTaskValidationPage.jsx';
import AdminObjectiveValidationPage from '../pages/AdminObjectiveValidationPage.jsx';
import AdminAnalyticsPage from '../pages/AdminAnalyticsPage.jsx';
import AdminSettingsPage from '../pages/AdminSettingsPage.jsx';
import AdminRolePermissionsPage from '../pages/AdminRolePermissionsPage.jsx';
import AdminSyncPage from '../pages/AdminSyncPage.jsx';
import LoginPage from '../pages/Login.jsx';

// Protection des routes
import ProtectedRoute from './ProtectedRoute.jsx';
import AdminRoute from './AdminRoute.jsx';

/**
 * 🛣️ CONFIGURATION DES ROUTES DE L'APPLICATION
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Route publique - Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Routes protégées - Nécessitent une authentification */}
      <Route element={<ProtectedRoute />}>
        {/* PRINCIPAL */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/projects" element={<CampaignsPage />} />
        <Route path="/projects/:id" element={<CampaignDetailPage />} />
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        
        {/* GAMIFICATION */}
        <Route path="/gamification" element={<GamificationPage />} />
        <Route path="/badges" element={<BadgesPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/rewards" element={<RewardsPage />} />
        
        {/* ÉQUIPE */}
        <Route path="/team" element={<TeamPage />} />
        
        {/* OUTILS */}
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/timetrack" element={<TimeTrackPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        
        {/* ADMIN - Routes protégées par AdminRoute */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/task-validation" element={<AdminTaskValidationPage />} />
          <Route path="/admin/objective-validation" element={<AdminObjectiveValidationPage />} />
          <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
          <Route path="/admin/role-permissions" element={<AdminRolePermissionsPage />} />
          <Route path="/admin/sync" element={<AdminSyncPage />} />
        </Route>
        
        {/* Redirection par défaut vers le dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
