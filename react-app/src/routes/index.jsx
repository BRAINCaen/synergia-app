// ==========================================
// 📁 react-app/src/routes/index.jsx
// ROUTES AVEC TERMINOLOGIE CAMPAGNES + QUÊTES
// ==========================================

import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '../shared/stores/authStore.js'
import { ROUTES } from '../core/constants.js'

// ✅ PAGES PRINCIPALES
import LoginPage from '../pages/Login.jsx'
import DashboardPage from '../pages/Dashboard.jsx'
import NotFoundPage from '../pages/NotFound.jsx'
import AnalyticsPage from '../pages/AnalyticsPage.jsx'
import TeamPage from '../pages/TeamPage.jsx'

// ✅ PAGES STANDARDS
import TasksPage from '../pages/TasksPage.jsx'
import CampaignsPage from '../pages/CampaignsPage.jsx' // ← RENOMMÉ
import CampaignDetailPage from '../pages/CampaignDetailPage.jsx' // ← RENOMMÉ
import GamificationPage from '../pages/GamificationPage.jsx'
import BadgesPage from '../pages/BadgesPage.jsx'
import LeaderboardPage from '../pages/LeaderboardPage.jsx'
import OnboardingPage from '../pages/OnboardingPage.jsx'
import TimeTrackPage from '../pages/TimeTrackPage.jsx'
import ProfilePage from '../pages/ProfilePage.jsx'
import SettingsPage from '../pages/SettingsPage.jsx'
import RewardsPage from '../pages/RewardsPage.jsx'

// 🛡️ PAGES ADMIN
import AdminPage from '../pages/AdminPage.jsx'
import AdminTaskValidationPage from '../pages/AdminTaskValidationPage.jsx'
import AdminObjectiveValidationPage from '../pages/AdminObjectiveValidationPage.jsx'
import AdminCompleteTestPage from '../pages/AdminCompleteTestPage.jsx'
import AdminProfileTestPage from '../pages/AdminProfileTestPage.jsx'
import AdminRolePermissionsPage from '../pages/AdminRolePermissionsPage.jsx'
import AdminRewardsPage from '../pages/AdminRewardsPage.jsx'
import AdminBadgesPage from '../pages/AdminBadgesPage.jsx'
import AdminUsersPage from '../pages/AdminUsersPage.jsx'
import AdminAnalyticsPage from '../pages/AdminAnalyticsPage.jsx'
import AdminSettingsPage from '../pages/AdminSettingsPage.jsx'
import AdminSyncPage from '../pages/AdminSyncPage.jsx'
import AdminDashboardTuteurPage from '../pages/AdminDashboardTuteurPage.jsx'
import AdminDashboardManagerPage from '../pages/AdminDashboardManagerPage.jsx'
import AdminInterviewPage from '../pages/AdminInterviewPage.jsx'
import AdminDemoCleanerPage from '../pages/AdminDemoCleanerPage.jsx'

// 🧪 PAGES DE TEST
import TestDashboardPage from '../pages/TestDashboardPage.jsx'

/**
 * 🛡️ PROTECTION DE ROUTE
 */
const ProtectedRoute = ({ children, adminOnly = false, requireAuth = true }) => {
  const { user, isAuthenticated } = useAuthStore()
  
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }
  
  if (adminOnly && (!user || !user.isAdmin)) {
    return <Navigate to={ROUTES.HOME} replace />
  }
  
  return children
}

/**
 * 🗺️ CONFIGURATION DES ROUTES
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* 🔓 ROUTES PUBLIQUES */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />

      {/* 🏠 PAGES PRINCIPALES */}
      <Route path={ROUTES.HOME} element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path={ROUTES.DASHBOARD} element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path={ROUTES.TASKS} element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
      
      {/* ⚔️ ROUTES CAMPAGNES (anciennement PROJECTS) */}
      <Route path="/campaigns" element={<ProtectedRoute><CampaignsPage /></ProtectedRoute>} />
      <Route path="/campaigns/:id" element={<ProtectedRoute><CampaignDetailPage /></ProtectedRoute>} />
      
      {/* 🔄 COMPATIBILITÉ RÉTROCOMPATIBLE (redirect /projects → /campaigns) */}
      <Route path="/projects" element={<Navigate to="/campaigns" replace />} />
      <Route path="/projects/:id" element={<Navigate to="/campaigns/:id" replace />} />
      
      <Route path={ROUTES.ANALYTICS} element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
      <Route path={ROUTES.TEAM} element={<ProtectedRoute><TeamPage /></ProtectedRoute>} />

      {/* 🎮 GAMIFICATION */}
      <Route path={ROUTES.GAMIFICATION} element={<ProtectedRoute><GamificationPage /></ProtectedRoute>} />
      <Route path={ROUTES.BADGES} element={<ProtectedRoute><BadgesPage /></ProtectedRoute>} />
      <Route path={ROUTES.LEADERBOARD} element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
      <Route path={ROUTES.REWARDS} element={<ProtectedRoute><RewardsPage /></ProtectedRoute>} />

      {/* 🛠️ OUTILS */}
      <Route path={ROUTES.ONBOARDING} element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
      <Route path={ROUTES.TIMETRACK} element={<ProtectedRoute><TimeTrackPage /></ProtectedRoute>} />
      <Route path={ROUTES.PROFILE} element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path={ROUTES.SETTINGS} element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

      {/* 🛡️ SECTION ADMIN */}
      <Route path={ROUTES.ADMIN} element={<ProtectedRoute adminOnly={true}><AdminPage /></ProtectedRoute>} />
      <Route path={ROUTES.ADMIN_TASK_VALIDATION} element={<ProtectedRoute adminOnly={true}><AdminTaskValidationPage /></ProtectedRoute>} />
      <Route path={ROUTES.ADMIN_OBJECTIVE_VALIDATION} element={<ProtectedRoute adminOnly={true}><AdminObjectiveValidationPage /></ProtectedRoute>} />
      <Route path={ROUTES.ADMIN_REWARDS} element={<ProtectedRoute adminOnly={true}><AdminRewardsPage /></ProtectedRoute>} />
      <Route path={ROUTES.ADMIN_BADGES} element={<ProtectedRoute adminOnly={true}><AdminBadgesPage /></ProtectedRoute>} />
      <Route path={ROUTES.ADMIN_USERS} element={<ProtectedRoute adminOnly={true}><AdminUsersPage /></ProtectedRoute>} />
      <Route path={ROUTES.ADMIN_ANALYTICS} element={<ProtectedRoute adminOnly={true}><AdminAnalyticsPage /></ProtectedRoute>} />
      <Route path={ROUTES.ADMIN_SETTINGS} element={<ProtectedRoute adminOnly={true}><AdminSettingsPage /></ProtectedRoute>} />
      <Route path={ROUTES.ADMIN_ROLE_PERMISSIONS} element={<ProtectedRoute adminOnly={true}><AdminRolePermissionsPage /></ProtectedRoute>} />
      <Route path={ROUTES.ADMIN_SYNC} element={<ProtectedRoute adminOnly={true}><AdminSyncPage /></ProtectedRoute>} />
      <Route path={ROUTES.ADMIN_DASHBOARD_TUTEUR} element={<ProtectedRoute adminOnly={true}><AdminDashboardTuteurPage /></ProtectedRoute>} />
      <Route path={ROUTES.ADMIN_DASHBOARD_MANAGER} element={<ProtectedRoute adminOnly={true}><AdminDashboardManagerPage /></ProtectedRoute>} />
      <Route path={ROUTES.ADMIN_INTERVIEW} element={<ProtectedRoute adminOnly={true}><AdminInterviewPage /></ProtectedRoute>} />
      <Route path={ROUTES.ADMIN_DEMO_CLEANER} element={<ProtectedRoute adminOnly={true}><AdminDemoCleanerPage /></ProtectedRoute>} />
      <Route path={ROUTES.ADMIN_COMPLETE_TEST} element={<ProtectedRoute adminOnly={true}><AdminCompleteTestPage /></ProtectedRoute>} />
      <Route path={ROUTES.ADMIN_PROFILE_TEST} element={<ProtectedRoute adminOnly={true}><AdminProfileTestPage /></ProtectedRoute>} />

      {/* 🧪 PAGES DE TEST */}
      <Route path={ROUTES.TEST_DASHBOARD} element={<ProtectedRoute><TestDashboardPage /></ProtectedRoute>} />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRoutes

/* 
✅ CHANGEMENTS TERMINOLOGIE :
- ProjectsPage → CampaignsPage
- ProjectDetailPage → CampaignDetailPage
- /projects → /campaigns
- /projects/:id → /campaigns/:id

✅ RÉTROCOMPATIBILITÉ :
- /projects redirige vers /campaigns
- /projects/:id redirige vers /campaigns/:id
*/
