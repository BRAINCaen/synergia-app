// ==========================================
// 📁 react-app/src/routes/index.jsx
// ROUTES COMPLÈTES AVEC IMPORTS CORRIGÉS - VERSION ORIGINALE QUI MARCHAIT
// ==========================================

import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '../shared/stores/authStore.js'

// Pages principales
import Login from '../pages/Login.jsx'
import Dashboard from '../pages/Dashboard.jsx'
import NotFound from '../pages/NotFound.jsx'
import AnalyticsPage from '../pages/AnalyticsPage.jsx'  // ✅ CORRIGÉ : AnalyticsPage au lieu d'Analytics
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

// Components utilisés comme pages (fallback) - IMPORTS SÉCURISÉS
// SUPPRESSION DES IMPORTS QUI N'EXISTENT PAS POUR CORRIGER LE BUILD
// import TaskList from '../modules/tasks/TaskList.jsx'
// import BadgeCollection from '../components/gamification/BadgeCollection.jsx'
// import Leaderboard from '../components/gamification/Leaderboard.jsx'
// import ProjectDashboard from '../components/projects/ProjectDashboard.jsx'
// import Profile from '../components/profile/Profile.jsx'

// Composants fallback temporaires pour éviter les erreurs de build
const TaskList = () => <div className="p-8 text-center">TaskList - En cours de développement</div>
const BadgeCollection = () => <div className="p-8 text-center">BadgeCollection - En cours de développement</div>
const Leaderboard = () => <div className="p-8 text-center">Leaderboard - En cours de développement</div>
const ProjectDashboard = () => <div className="p-8 text-center">ProjectDashboard - En cours de développement</div>
const Profile = () => <div className="p-8 text-center">Profile - En cours de développement</div>

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
        element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      
      {/* Routes principales protégées */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/analytics" 
        element={
          <ProtectedRoute>
            <AnalyticsPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/team" 
        element={
          <ProtectedRoute>
            <TeamPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Routes de gestion */}
      <Route 
        path="/tasks" 
        element={
          <ProtectedRoute>
            <TasksPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/projects" 
        element={
          <ProtectedRoute>
            <ProjectsPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Routes gamification */}
      <Route 
        path="/gamification" 
        element={
          <ProtectedRoute>
            <GamificationPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/badges" 
        element={
          <ProtectedRoute>
            <BadgesPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/rewards" 
        element={
          <ProtectedRoute>
            <RewardsPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/leaderboard" 
        element={
          <ProtectedRoute>
            <Leaderboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Routes utilisateur */}
      <Route 
        path="/users" 
        element={
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <ProfilePage />
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
        path="/settings" 
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Routes outils */}
      <Route 
        path="/time-track" 
        element={
          <ProtectedRoute>
            <TimeTrackPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/onboarding" 
        element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Routes admin */}
      <Route 
        path="/admin/task-validation" 
        element={
          <ProtectedRoute>
            <AdminTaskValidationPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/test" 
        element={
          <ProtectedRoute>
            <CompleteAdminTestPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/roles" 
        element={
          <ProtectedRoute>
            <AdminRolePermissionsPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/users" 
        element={
          <ProtectedRoute>
            <AdminUsersPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/analytics" 
        element={
          <ProtectedRoute>
            <AdminAnalyticsPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/settings" 
        element={
          <ProtectedRoute>
            <AdminSettingsPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/demo-cleaner" 
        element={
          <ProtectedRoute>
            <DemoDataCleanerPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Routes composants (fallback) */}
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
        path="/project-dashboard" 
        element={
          <ProtectedRoute>
            <ProjectDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Route racine */}
      <Route 
        path="/" 
        element={<Navigate to="/dashboard" replace />} 
      />
      
      {/* Route 404 */}
      <Route 
        path="*" 
        element={<NotFound />} 
      />
    </Routes>
  )
}

export default AppRoutes
