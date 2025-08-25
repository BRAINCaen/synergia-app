// ==========================================
// 📁 react-app/src/routes/index.jsx
// SYSTÈME DE ROUTING COMPLET ET FONCTIONNEL - TOUTES LES PAGES
// ==========================================

import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '../shared/stores/authStore.js'
import { ROUTES } from '../core/constants.js'

// ✅ PAGES PRINCIPALES - IMPORTS AVEC NOMS CORRECTS
import LoginPage from '../pages/Login.jsx'
import DashboardPage from '../pages/Dashboard.jsx'
import NotFoundPage from '../pages/NotFound.jsx'
import AnalyticsPage from '../pages/AnalyticsPage.jsx'    // ✅ AnalyticsPage.jsx (pas Analytics.jsx)
import TeamPage from '../pages/TeamPage.jsx'

// ✅ TOUTES LES PAGES STANDARDS
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
import AdminSyncPage from '../pages/AdminSync.jsx'
import AdminQuickFixPage from '../pages/AdminQuickFixPage.jsx'

// 🎯 LAYOUT PRINCIPAL
import MainLayout from '../layouts/MainLayout.jsx'

// 🔒 Composant de protection des routes
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }
  
  return children
}

// 🛡️ Composant de protection admin
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuthStore()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }
  
  // Vérification admin souple (permet l'accès pour tests)
  const isAdmin = user?.role === 'admin' || user?.role === 'manager' || user?.isAdmin === true
  
  if (!isAdmin) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }
  
  return children
}

// 🎯 COMPOSANT PRINCIPAL DES ROUTES - COMPLET
const AppRoutes = () => {
  return (
    <Routes>
      {/* Route de connexion (sans layout) */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      
      {/* Routes avec MainLayout */}
      <Route element={<MainLayout />}>
        
        {/* ✅ PAGES PRINCIPALES COMPLÈTES */}
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
        
        {/* ✅ PAGES GAMIFICATION COMPLÈTES */}
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
        
        {/* ✅ PAGES ÉQUIPE COMPLÈTES */}
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
        
        {/* ✅ PAGES OUTILS COMPLÈTES */}
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
        
        {/* ✅ TOUTES LES ROUTES ADMIN COMPLÈTES */}
        <Route 
          path={ROUTES.ADMIN_TASK_VALIDATION} 
          element={
            <AdminRoute>
              <AdminTaskValidationPage />
            </AdminRoute>
          } 
        />
        
        <Route 
          path={ROUTES.ADMIN_OBJECTIVE_VALIDATION} 
          element={
            <AdminRoute>
              <AdminObjectiveValidationPage />
            </AdminRoute>
          } 
        />
        
        <Route 
          path={ROUTES.ADMIN_COMPLETE_TEST} 
          element={
            <AdminRoute>
              <AdminCompleteTestPage />
            </AdminRoute>
          } 
        />
        
        <Route 
          path={ROUTES.ADMIN_PROFILE_TEST} 
          element={
            <AdminRoute>
              <AdminProfileTestPage />
            </AdminRoute>
          } 
        />
        
        <Route 
          path={ROUTES.ADMIN_ROLE_PERMISSIONS} 
          element={
            <AdminRoute>
              <AdminRolePermissionsPage />
            </AdminRoute>
          } 
        />
        
        <Route 
          path={ROUTES.ADMIN_REWARDS} 
          element={
            <AdminRoute>
              <AdminRewardsPage />
            </AdminRoute>
          } 
        />
        
        <Route 
          path={ROUTES.ADMIN_BADGES} 
          element={
            <AdminRoute>
              <AdminBadgesPage />
            </AdminRoute>
          } 
        />
        
        <Route 
          path={ROUTES.ADMIN_USERS} 
          element={
            <AdminRoute>
              <AdminUsersPage />
            </AdminRoute>
          } 
        />
        
        <Route 
          path={ROUTES.ADMIN_ANALYTICS} 
          element={
            <AdminRoute>
              <AdminAnalyticsPage />
            </AdminRoute>
          } 
        />
        
        <Route 
          path={ROUTES.ADMIN_SETTINGS} 
          element={
            <AdminRoute>
              <AdminSettingsPage />
            </AdminRoute>
          } 
        />
        
        <Route 
          path={ROUTES.ADMIN_SYNC} 
          element={
            <AdminRoute>
              <AdminSyncPage />
            </AdminRoute>
          } 
        />
        
        {/* Route Quick Fix Admin */}
        <Route 
          path="/admin-quick-fix" 
          element={
            <ProtectedRoute>
              <AdminQuickFixPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Routes supplémentaires pour compatibilité */}
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <AdminTaskValidationPage />
            </AdminRoute>
          } 
        />
      
      </Route>
      
      {/* Redirection par défaut */}
      <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      
      {/* Page 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRoutes

console.log('✅ [ROUTES] Router COMPLET chargé avec TOUTES les pages')
console.log('🎯 [ROUTES] Pages principales: Dashboard, Tasks, Projects, Analytics, Team')
console.log('🎮 [ROUTES] Pages gamification: Gamification, Badges, Leaderboard, Rewards')
console.log('👥 [ROUTES] Pages équipe: Team, Users')
console.log('🔧 [ROUTES] Pages outils: Onboarding, TimeTrack, Profile, Settings')
console.log('🛡️ [ROUTES] Pages admin: Task Validation, Objective Validation, Complete Test, Profile Test, Role Permissions, Rewards, Badges, Users, Analytics, Settings, Sync')
console.log('🚀 [ROUTES] TOUTES les routes fonctionnelles - Version complète !');
