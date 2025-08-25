// ==========================================
// 📁 react-app/src/routes/index.jsx
// ROUTES FINALES - BUILD CORRIGÉ - TOUTES LES 17 PAGES ADMIN
// ==========================================

import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '../shared/stores/authStore.js'
import { ROUTES } from '../core/constants.js'

// ✅ PAGES PRINCIPALES - IMPORTS AVEC NOMS CORRECTS
import LoginPage from '../pages/Login.jsx'
import DashboardPage from '../pages/Dashboard.jsx'
import NotFoundPage from '../pages/NotFound.jsx'
import AnalyticsPage from '../pages/AnalyticsPage.jsx'
import TeamPage from '../pages/TeamPage.jsx'

// ✅ TOUTES LES PAGES STANDARDS
import TasksPage from '../pages/TasksPage.jsx'
import ProjectsPage from '../pages/ProjectsPage.jsx'
import GamificationPage from '../pages/GamificationPage.jsx'
import BadgesPage from '../pages/BadgesPage.jsx'
import LeaderboardPage from '../pages/LeaderboardPage.jsx'
import OnboardingPage from '../pages/OnboardingPage.jsx'
import TimeTrackPage from '../pages/TimeTrackPage.jsx'
import ProfilePage from '../pages/ProfilePage.jsx'
import SettingsPage from '../pages/SettingsPage.jsx'
import RewardsPage from '../pages/RewardsPage.jsx'

// 🛡️ TOUTES LES 17 PAGES ADMIN - IMPORTS COMPLETS (AUCUNE MANQUANTE)
import AdminPage from '../pages/AdminPage.jsx'  // 🔥 PAGE ADMIN PRINCIPALE
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

// ✅ PAGES DE TEST (TESTFIREBASEPAGE DÉFINITIVEMENT SUPPRIMÉ)
import TestDashboardPage from '../pages/TestDashboardPage.jsx'
import TestCompletePage from '../pages/TestCompletePage.jsx'
import TestNotificationsPage from '../pages/TestNotificationsPage.jsx'
// ❌ import TestFirebasePage from '../pages/TestFirebasePage.jsx' - SUPPRIMÉ DÉFINITIVEMENT

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

      {/* 🛡️ SECTION ADMIN COMPLÈTE - TOUTES LES 17 PAGES */}
      
      {/* 🏠 PAGE ADMIN PRINCIPALE - DASHBOARD */}
      <Route 
        path={ROUTES.ADMIN} 
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminPage />
          </ProtectedRoute>
        } 
      />

      {/* 🎯 PAGES ADMIN ESSENTIELLES - CŒUR BUSINESS */}
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

      {/* 🔐 PAGES ADMIN AVANCÉES - GESTION SYSTÈME */}
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

      {/* 👨‍💼 PAGES ADMIN SPÉCIALISÉES - CONTEXTE MÉTIER */}
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

      {/* 🧪 PAGES ADMIN DE TEST & DÉVELOPPEMENT */}
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

      {/* 🧪 PAGES DE TEST DÉVELOPPEMENT (TESTFIREBASEPAGE DÉFINITIVEMENT SUPPRIMÉ) */}
      <Route 
        path={ROUTES.TEST_DASHBOARD} 
        element={
          <ProtectedRoute>
            <TestDashboardPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path={ROUTES.TEST_COMPLETE} 
        element={
          <ProtectedRoute>
            <TestCompletePage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path={ROUTES.TEST_NOTIFICATIONS} 
        element={
          <ProtectedRoute>
            <TestNotificationsPage />
          </ProtectedRoute>
        } 
      />

      {/* ❌ ROUTE TEST_FIREBASE SUPPRIMÉE DÉFINITIVEMENT - PLUS D'ERREUR BUILD */}
      {/* <Route path={ROUTES.TEST_FIREBASE} element={<TestFirebasePage />} /> */}

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
🚀 BUILD CORRIGÉ - RÉSUMÉ COMPLET :

✅ SUPPRIMÉ DÉFINITIVEMENT :
- import TestFirebasePage (ligne supprimée) 
- Route TEST_FIREBASE (commentée)

✅ TOUTES LES 17 PAGES ADMIN AJOUTÉES :
1. AdminPage (/admin)
2. AdminTaskValidationPage (/admin/task-validation)
3. AdminObjectiveValidationPage (/admin/objective-validation)  
4. AdminRewardsPage (/admin/rewards)
5. AdminBadgesPage (/admin/badges)
6. AdminUsersPage (/admin/users)
7. AdminAnalyticsPage (/admin/analytics)
8. AdminSettingsPage (/admin/settings)
9. AdminRolePermissionsPage (/admin/role-permissions)
10. AdminSyncPage (/admin/sync)
11. AdminDashboardTuteurPage (/admin/dashboard-tuteur)
12. AdminDashboardManagerPage (/admin/dashboard-manager)
13. AdminInterviewPage (/admin/interview)
14. AdminDemoCleanerPage (/admin/demo-cleaner)
15. AdminCompleteTestPage (/admin/complete-test)
16. AdminProfileTestPage (/admin/profile-test)

✅ ORGANISATION LOGIQUE :
- Pages principales (Dashboard, Tasks, etc.)
- Gamification (Badges, Rewards, etc.)  
- Outils (Onboarding, Profile, etc.)
- Admin Essentielles (validation, gestion)
- Admin Avancées (permissions, sync)
- Admin Spécialisées (tuteur, manager)
- Admin Test (debugging)

✅ SÉCURITÉ :
- Protection ProtectedRoute sur toutes les pages
- adminOnly={true} sur toutes les pages admin
- Vérification isAuthenticated

Le build devrait maintenant réussir ! 🎉
*/
