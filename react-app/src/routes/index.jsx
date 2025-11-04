// ==========================================
// 📁 react-app/src/routes/index.jsx
// ROUTES FINALES CORRIGÉES AVEC PROJECT DETAIL
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
import ProjectsPage from '../pages/ProjectsPage.jsx'
import ProjectDetailPage from '../pages/ProjectDetailPage.jsx' // ← AJOUTÉ
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
  
  // Vérification authentification
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }
  
  // Vérification admin si requis
  if (adminOnly && (!user || !user.isAdmin)) {
    return <Navigate to={ROUTES.HOME} replace />
  }
  
  return children
}

/**
 * 🗺️ CONFIGURATION DES ROUTES PRINCIPALES
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* 🔓 ROUTES PUBLIQUES */}
      <Route 
        path={ROUTES.LOGIN} 
        element={<LoginPage />} 
      />

      {/* 🏠 PAGES PRINCIPALES PROTÉGÉES */}
      <Route 
        path={ROUTES.HOME} 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path={ROUTES.DASHBOARD} 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path={ROUTES.TASKS} 
        element={
          <ProtectedRoute>
            <TasksPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path={ROUTES.PROJECTS} 
        element={
          <ProtectedRoute>
            <ProjectsPage />
          </ProtectedRoute>
        } 
      />

      {/* 📁 ROUTE DÉTAIL PROJET - AJOUTÉE ICI */}
      <Route 
        path="/projects/:id" 
        element={
          <ProtectedRoute>
            <ProjectDetailPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path={ROUTES.ANALYTICS} 
        element={
          <ProtectedRoute>
            <AnalyticsPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path={ROUTES.TEAM} 
        element={
          <ProtectedRoute>
            <TeamPage />
          </ProtectedRoute>
        } 
      />

      {/* 🎮 GAMIFICATION */}
      <Route 
        path={ROUTES.GAMIFICATION} 
        element={
          <ProtectedRoute>
            <GamificationPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path={ROUTES.BADGES} 
        element={
          <ProtectedRoute>
            <BadgesPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path={ROUTES.LEADERBOARD} 
        element={
          <ProtectedRoute>
            <LeaderboardPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path={ROUTES.REWARDS} 
        element={
          <ProtectedRoute>
            <RewardsPage />
          </ProtectedRoute>
        } 
      />

      {/* 🛠️ OUTILS */}
      <Route 
        path={ROUTES.ONBOARDING} 
        element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path={ROUTES.TIMETRACK} 
        element={
          <ProtectedRoute>
            <TimeTrackPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path={ROUTES.PROFILE} 
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path={ROUTES.SETTINGS} 
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } 
      />

      {/* 🛡️ SECTION ADMIN COMPLÈTE */}
      
      {/* PAGE ADMIN PRINCIPALE */}
      <Route 
        path={ROUTES.ADMIN} 
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminPage />
          </ProtectedRoute>
        } 
      />

      {/* PAGES ADMIN ESSENTIELLES */}
      <Route 
        path={ROUTES.ADMIN_TASK_VALIDATION} 
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminTaskValidationPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path={ROUTES.ADMIN_OBJECTIVE_VALIDATION} 
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminObjectiveValidationPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path={ROUTES.ADMIN_REWARDS} 
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminRewardsPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path={ROUTES.ADMIN_BADGES} 
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminBadgesPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path={ROUTES.ADMIN_USERS} 
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminUsersPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path={ROUTES.ADMIN_ANALYTICS} 
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminAnalyticsPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path={ROUTES.ADMIN_SETTINGS} 
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminSettingsPage />
          </ProtectedRoute>
        } 
      />

      {/* PAGES ADMIN AVANCÉES */}
      <Route 
        path={ROUTES.ADMIN_ROLE_PERMISSIONS} 
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminRolePermissionsPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path={ROUTES.ADMIN_SYNC} 
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminSyncPage />
          </ProtectedRoute>
        } 
      />

      {/* PAGES ADMIN SPÉCIALISÉES */}
      <Route 
        path={ROUTES.ADMIN_DASHBOARD_TUTEUR} 
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminDashboardTuteurPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path={ROUTES.ADMIN_DASHBOARD_MANAGER} 
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminDashboardManagerPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path={ROUTES.ADMIN_INTERVIEW} 
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminInterviewPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path={ROUTES.ADMIN_DEMO_CLEANER} 
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminDemoCleanerPage />
          </ProtectedRoute>
        } 
      />

      {/* PAGES ADMIN DE TEST */}
      <Route 
        path={ROUTES.ADMIN_COMPLETE_TEST} 
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminCompleteTestPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path={ROUTES.ADMIN_PROFILE_TEST} 
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminProfileTestPage />
          </ProtectedRoute>
        } 
      />

      {/* PAGES DE TEST DÉVELOPPEMENT */}
      <Route 
        path={ROUTES.TEST_DASHBOARD} 
        element={
          <ProtectedRoute>
            <TestDashboardPage />
          </ProtectedRoute>
        } 
      />

      {/* 404 - PAGE NON TROUVÉE */}
      <Route 
        path="*" 
        element={<NotFoundPage />} 
      />
    </Routes>
  )
}

export default AppRoutes

/* 
✅ ROUTE PROJET DÉTAIL AJOUTÉE :
- Import: ProjectDetailPage 
- Route: /projects/:id
- Protection: ProtectedRoute (authentification requise)

La navigation depuis ProjectsPage vers /projects/:id fonctionne maintenant !
*/
