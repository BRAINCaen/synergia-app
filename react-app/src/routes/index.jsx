// ==========================================
// 📁 react-app/src/routes/index.jsx
// ROUTES COMPLÈTES - AVEC ROUTE ADMIN REWARDS AJOUTÉE
// ==========================================

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Pages principales
import DashboardPage from '../pages/Dashboard.jsx';
import InfosPage from '../pages/InfosPage.jsx';
import TasksPage from '../pages/TasksPage.jsx';
import CampaignsPage from '../pages/CampaignsPage.jsx';
import CampaignDetailPage from '../pages/CampaignDetailPage.jsx';
import AnalyticsPage from '../pages/AnalyticsPage.jsx';
import PersonalStatsPage from '../pages/PersonalStatsPage.jsx'; // 📊 MODULE 7
import ProfilePage from '../pages/ProfilePage.jsx';
import LeaderboardPage from '../pages/LeaderboardPage.jsx';
import BadgesPage from '../pages/BadgesPage.jsx';
import GamificationPage from '../pages/GamificationPage.jsx';
import RewardsPage from '../pages/RewardsPage.jsx';
import BoostsPage from '../pages/BoostsPage.jsx';
import ChallengesPage from '../pages/ChallengesPage.jsx'; // 🎯 MODULE 10
import ProfileCustomizationPage from '../pages/ProfileCustomizationPage.jsx'; // 🎨 MODULE 13
import TeamPage from '../pages/TeamPage.jsx';
import OnboardingPage from '../pages/OnboardingPage.jsx';
import TimeTrackPage from '../pages/TimeTrackPage.jsx';

// ✨ PAGES RH & PLANNING
import HRPage from '../pages/HRPage.jsx';
import PlanningAdvancedPage from '../pages/PlanningAdvancedPage.jsx';

// 👑 PAGE GODMOD
import GodModPage from '../pages/GodModPage.jsx';

// Pages admin
import AdminPage from '../pages/AdminPage.jsx';
import AdminTaskValidationPage from '../pages/AdminTaskValidationPage.jsx';
import AdminObjectiveValidationPage from '../pages/AdminObjectiveValidationPage.jsx';
import AdminRewardsPage from '../pages/AdminRewardsPage.jsx'; // ✅ AJOUTÉ
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
        <Route path="/infos" element={<InfosPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        
        {/* ✅ CAMPAGNES - LISTE ET DÉTAIL */}
        <Route path="/projects" element={<CampaignsPage />} />
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
        <Route path="/projects/:id" element={<CampaignDetailPage />} />
        
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/stats" element={<PersonalStatsPage />} /> {/* 📊 MODULE 7 */}

        {/* GAMIFICATION */}
        <Route path="/gamification" element={<GamificationPage />} />
        <Route path="/badges" element={<BadgesPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/rewards" element={<RewardsPage />} />
        <Route path="/boosts" element={<BoostsPage />} />
        <Route path="/challenges" element={<ChallengesPage />} /> {/* 🎯 MODULE 10 */}

        {/* ÉQUIPE */}
        <Route path="/team" element={<TeamPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<ProfilePage />} />
        <Route path="/customization" element={<ProfileCustomizationPage />} /> {/* 🎨 MODULE 13 */}
        
        {/* OUTILS */}
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/timetrack" element={<TimeTrackPage />} />
        
        {/* ✨ MODULES RH & PLANNING */}
        <Route path="/hr" element={<HRPage />} />
        <Route path="/planning" element={<PlanningAdvancedPage />} />

        {/* 👑 GODMOD - ACCÈS SPÉCIAL (accessible à tous connectés, mais contenu restreint) */}
        <Route path="/godmod" element={<GodModPage />} />
      </Route>

      {/* Routes admin - Nécessitent authentification + rôle admin */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/task-validation" element={<AdminTaskValidationPage />} />
        <Route path="/admin/objective-validation" element={<AdminObjectiveValidationPage />} />
        <Route path="/admin/rewards" element={<AdminRewardsPage />} /> {/* ✅ AJOUTÉ */}
        <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
        <Route path="/admin/role-permissions" element={<AdminRolePermissionsPage />} />
        <Route path="/admin/sync" element={<AdminSyncPage />} />
      </Route>

      {/* Redirection par défaut */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Route 404 - Page non trouvée */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
