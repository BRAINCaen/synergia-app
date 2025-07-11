// ==========================================
// 📁 react-app/src/routes/index.jsx
// ROUTES COMPLÈTES AVEC TOUTES LES PAGES RECONNECTÉES
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

// Pages existantes mais pas dans les routes
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

// Pages admin existantes mais pas routées
import AdminTaskValidationPage from '../pages/AdminTaskValidationPage.jsx'
import CompleteAdminTestPage from '../pages/CompleteAdminTestPage.jsx'

// Components utilisés comme pages (fallback si les vraies pages n'existent pas)
import TaskList from '../modules/tasks/TaskList.jsx'
import BadgeCollection from '../components/gamification/BadgeCollection.jsx'
import Leaderboard from '../components/gamification/Leaderboard.jsx'
import Profile from '../modules/profile/components/Profile.jsx'
import ProjectDashboard from '../modules/projects/ProjectDashboard.jsx'

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-white">Chargement...</p>
        </div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }
  
  return children
}

// Public Route Component
function PublicRoute({ children }) {
  const { user, loading } = useAuthStore()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-white">Chargement...</p>
        </div>
      </div>
    )
  }
  
  if (user) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }
  
  return children
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path={ROUTES.LOGIN} 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      
      {/* Protected Main Routes */}
      <Route 
        path={ROUTES.DASHBOARD} 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* ROUTES RECONNECTÉES - Utilise les vraies pages */}
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

      {/* ROUTES ADMIN RECONNECTÉES */}
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

      {/* ROUTES FALLBACK avec composants existants */}
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

      {/* Fallback */}
      <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
