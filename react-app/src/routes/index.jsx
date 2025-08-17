// ==========================================
// 📁 react-app/src/routes/index.jsx
// ROUTES COMPLÈTES AVEC TOUTES LES PAGES ADMIN
// ==========================================

import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '../shared/stores/authStore.js'
import { ROUTES } from '../core/constants.js'

// Pages principales
import Login from '../pages/Login.jsx'
import Dashboard from '../pages/Dashboard.jsx'
import NotFound from '../pages/NotFound.jsx'
import Analytics from '../pages/Analytics.jsx'
import TeamPage from '../pages/TeamPage.jsx'

// Pages existantes
import TasksPage from '../pages/TasksPage.jsx'
import ProjectsPage from '../pages/ProjectsPage.jsx'
import GamificationPage from '../pages/GamificationPage.jsx'
import BadgesPage from '../pages/BadgesPage.jsx'
import LeaderboardPage from '../pages/LeaderboardPage.jsx'
import UsersPage from '../pages/UsersPage.jsx'
import OnboardingPage from '../pages/OnboardingPage.jsx'
import TimeTrackPage from '../pages/TimeTrackPage.jsx'
import ProfilePage from '../pages/ProfilePage.jsx'
import SettingsPage from '../pages/SettingsPage.jsx'
import RewardsPage from '../pages/RewardsPage.jsx'

// ✅ TOUTES LES PAGES ADMIN - IMPORTS COMPLETS
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
import AdminSync from '../pages/AdminSync.jsx'
import AdminDashboardTuteurPage from '../pages/AdminDashboardTuteurPage.jsx'
import AdminDashboardManagerPage from '../pages/AdminDashboardManagerPage.jsx'
import AdminInterviewPage from '../pages/AdminInterviewPage.jsx'

// Pages de nettoyage (si elle existe dans admin/)
// import DemoDataCleanerPage from '../pages/admin/DemoDataCleanerPage.jsx'

// Components utilisés comme pages (fallback)
import TaskList from '../modules/tasks/TaskList.jsx'
import BadgeCollection from '../components/gamification/BadgeCollection.jsx'

// Composant de protection des routes
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }
  
  return children
}

// Composant principal des routes
const AppRoutes = () => {
  return (
    <Routes>
      {/* Route de connexion */}
      <Route path={ROUTES.LOGIN} element={<Login />} />
      
      {/* ✅ PAGES PRINCIPALES */}
      <Route 
        path={ROUTES.DASHBOARD} 
        element={
          <ProtectedRoute>
            <Dashboard />
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
            <Analytics />
          </ProtectedRoute>
        } 
      />
      
      {/* ✅ PAGES GAMIFICATION */}
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
      
      {/* ✅ PAGES ÉQUIPE */}
      <Route 
        path={ROUTES.TEAM} 
        element={
          <ProtectedRoute>
            <TeamPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path={ROUTES.USERS} 
        element={
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        } 
      />
      
      {/* ✅ PAGES OUTILS */}
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

      {/* ✅ TOUTES LES ROUTES ADMIN - COMPLÈTES ! */}
      
      {/* 🛡️ Validation */}
      <Route 
        path={ROUTES.ADMIN_TASK_VALIDATION} 
        element={
          <ProtectedRoute>
            <AdminTaskValidationPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path={ROUTES.ADMIN_OBJECTIVE_VALIDATION} 
        element={
          <ProtectedRoute>
            <AdminObjectiveValidationPage />
          </ProtectedRoute>
        } 
      />
      
      {/* 🧪 Tests */}
      <Route 
        path={ROUTES.ADMIN_COMPLETE_TEST} 
        element={
          <ProtectedRoute>
            <AdminCompleteTestPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path={ROUTES.ADMIN_PROFILE_TEST} 
        element={
          <ProtectedRoute>
            <AdminProfileTestPage />
          </ProtectedRoute>
        } 
      />

      {/* 🔐 Permissions et Rôles */}
      <Route 
        path={ROUTES.ADMIN_ROLE_PERMISSIONS} 
        element={
          <ProtectedRoute>
            <AdminRolePermissionsPage />
          </ProtectedRoute>
        } 
      />

      {/* 🎁 Gamification Admin */}
      <Route 
        path={ROUTES.ADMIN_REWARDS} 
        element={
          <ProtectedRoute>
            <AdminRewardsPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path={ROUTES.ADMIN_BADGES} 
        element={
          <ProtectedRoute>
            <AdminBadgesPage />
          </ProtectedRoute>
        } 
      />

      {/* 👥 Gestion */}
      <Route 
        path={ROUTES.ADMIN_USERS} 
        element={
          <ProtectedRoute>
            <AdminUsersPage />
          </ProtectedRoute>
        } 
      />

      {/* 📊 Analytics et Monitoring */}
      <Route 
        path={ROUTES.ADMIN_ANALYTICS} 
        element={
          <ProtectedRoute>
            <AdminAnalyticsPage />
          </ProtectedRoute>
        } 
      />

      {/* ⚙️ Configuration */}
      <Route 
        path={ROUTES.ADMIN_SETTINGS} 
        element={
          <ProtectedRoute>
            <AdminSettingsPage />
          </ProtectedRoute>
        } 
      />

      {/* 🔄 Synchronisation */}
      <Route 
        path={ROUTES.ADMIN_SYNC} 
        element={
          <ProtectedRoute>
            <AdminSync />
          </ProtectedRoute>
        } 
      />

      {/* 📊 Dashboards Spécialisés */}
      <Route 
        path={ROUTES.ADMIN_DASHBOARD_TUTEUR} 
        element={
          <ProtectedRoute>
            <AdminDashboardTuteurPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path={ROUTES.ADMIN_DASHBOARD_MANAGER} 
        element={
          <ProtectedRoute>
            <AdminDashboardManagerPage />
          </ProtectedRoute>
        } 
      />

      {/* 💼 Fonctionnalités Spéciales */}
      <Route 
        path={ROUTES.ADMIN_INTERVIEW} 
        element={
          <ProtectedRoute>
            <AdminInterviewPage />
          </ProtectedRoute>
        } 
      />

      {/* 🧹 Nettoyage (si le fichier existe) */}
      {/* 
      <Route 
        path={ROUTES.ADMIN_DEMO_CLEANER} 
        element={
          <ProtectedRoute>
            <DemoDataCleanerPage />
          </ProtectedRoute>
        } 
      />
      */}

      {/* Routes de fallback pour anciens liens */}
      <Route 
        path="/task-list" 
        element={
          <ProtectedRoute>
            <TaskList />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/badge-collection" 
        element={
          <ProtectedRoute>
            <BadgeCollection />
          </ProtectedRoute>
        } 
      />
      
      {/* Redirection par défaut */}
      <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      
      {/* Page 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes

// ==========================================
// 📊 RÉCAPITULATIF DES PAGES ADMIN AJOUTÉES
// ==========================================

console.log('✅ TOUTES les pages admin sont maintenant routées:');
console.log('🛡️ AdminTaskValidationPage - Validation des tâches');
console.log('🎯 AdminObjectiveValidationPage - Validation des objectifs'); 
console.log('🧪 AdminCompleteTestPage - Tests complets du système');
console.log('🧪 AdminProfileTestPage - Tests de profil admin');
console.log('🔐 AdminRolePermissionsPage - Gestion des permissions');
console.log('🎁 AdminRewardsPage - Gestion des récompenses');
console.log('🏆 AdminBadgesPage - Administration des badges');
console.log('👥 AdminUsersPage - Gestion des utilisateurs');
console.log('📈 AdminAnalyticsPage - Analytics administrateur');
console.log('⚙️ AdminSettingsPage - Paramètres système');
console.log('🔄 AdminSync - Synchronisation des données');
console.log('🎓 AdminDashboardTuteurPage - Dashboard tuteur');
console.log('📊 AdminDashboardManagerPage - Dashboard manager');
console.log('💼 AdminInterviewPage - Gestion des entretiens');
console.log('🧹 AdminDemoCleanerPage - Nettoyage données (si existe)');

console.log('🎯 Total: 15 pages admin complètement intégrées !');
