// ==========================================
// 📁 react-app/src/routes/index.jsx
// ROUTES COMPLÈTES AVEC NOUVELLE ROUTE DEMO CLEANER
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
import UsersPage from '../pages/UsersPage.jsx'
import OnboardingPage from '../pages/OnboardingPage.jsx'
import TimeTrackPage from '../pages/TimeTrackPage.jsx'
import ProfilePage from '../pages/ProfilePage.jsx'
import SettingsPage from '../pages/SettingsPage.jsx'
import RewardsPage from '../pages/RewardsPage.jsx'

// ✅ PAGES ADMIN COMPLÈTES
import AdminTaskValidationPage from '../pages/AdminTaskValidationPage.jsx'
import CompleteAdminTestPage from '../pages/CompleteAdminTestPage.jsx'
import AdminRolePermissionsPage from '../pages/AdminRolePermissionsPage.jsx'
import AdminUsersPage from '../pages/AdminUsersPage.jsx'
import AdminAnalyticsPage from '../pages/AdminAnalyticsPage.jsx'
import AdminSettingsPage from '../pages/AdminSettingsPage.jsx'

// 🧹 NOUVELLE PAGE NETTOYAGE DONNÉES DÉMO
import DemoDataCleanerPage from '../pages/admin/DemoDataCleanerPage.jsx'

// Components utilisés comme pages (fallback)
import TaskList from '../modules/tasks/TaskList.jsx'
import BadgeCollection from '../components/gamification/BadgeCollection.jsx'
import Leaderboard from '../components/gamification/Leaderboard.jsx'
import ProjectDashboard from '../components/projects/ProjectDashboard.jsx'
import Profile from '../components/profile/Profile.jsx'

/**
 * 🔐 COMPOSANT DE PROTECTION DES ROUTES
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore()
  
  // Affichage du loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚙️</div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }
  
  // Redirection si non connecté
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

/**
 * 🚀 COMPOSANT PRINCIPAL DES ROUTES
 */
export const AppRoutes = () => {
  const { user } = useAuthStore()
  
  return (
    <Routes>
      {/* Route de connexion publique */}
      <Route 
        path="/login" 
        element={user ? <Navigate to={ROUTES.DASHBOARD} replace /> : <Login />} 
      />
      
      {/* Routes principales protégées */}
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
            <Leaderboard />
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
      
      <Route 
        path={ROUTES.USERS} 
        element={
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        } 
      />
      
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
      
      <Route 
        path={ROUTES.REWARDS} 
        element={
          <ProtectedRoute>
            <RewardsPage />
          </ProtectedRoute>
        } 
      />

      {/* ✅ ROUTES ADMIN COMPLÈTES */}
      <Route 
        path={ROUTES.ADMIN_TASK_VALIDATION} 
        element={
          <ProtectedRoute>
            <AdminTaskValidationPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path={ROUTES.ADMIN_COMPLETE_TEST} 
        element={
          <ProtectedRoute>
            <CompleteAdminTestPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path={ROUTES.ADMIN_ROLE_PERMISSIONS} 
        element={
          <ProtectedRoute>
            <AdminRolePermissionsPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path={ROUTES.ADMIN_USERS} 
        element={
          <ProtectedRoute>
            <AdminUsersPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path={ROUTES.ADMIN_ANALYTICS} 
        element={
          <ProtectedRoute>
            <AdminAnalyticsPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path={ROUTES.ADMIN_SETTINGS} 
        element={
          <ProtectedRoute>
            <AdminSettingsPage />
          </ProtectedRoute>
        } 
      />

      {/* 🧹 NOUVELLE ROUTE NETTOYAGE DONNÉES DÉMO */}
      <Route 
        path={ROUTES.ADMIN_DEMO_CLEANER} 
        element={
          <ProtectedRoute>
            <DemoDataCleanerPage />
          </ProtectedRoute>
        } 
      />

      {/* Routes fallback pour compatibilité */}
      <Route 
        path="/tasks-list" 
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
      
      <Route 
        path="/profile-component" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/project-dashboard" 
        element={
          <ProtectedRoute>
            <ProjectDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Routes par défaut */}
      <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes
