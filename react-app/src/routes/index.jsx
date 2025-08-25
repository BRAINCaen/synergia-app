// ==========================================
// 📁 react-app/src/routes/index.jsx
// ROUTES MISES À JOUR - SUPPRESSION USERSPAGE
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

// ✅ TOUTES LES PAGES STANDARDS (SANS USERSPAGE)
import TasksPage from '../pages/TasksPage.jsx'
import ProjectsPage from '../pages/ProjectsPage.jsx'
import GamificationPage from '../pages/GamificationPage.jsx'
import BadgesPage from '../pages/BadgesPage.jsx'
import LeaderboardPage from '../pages/LeaderboardPage.jsx'
// ❌ SUPPRIMÉ : import UsersPage from '../pages/UsersPage.jsx'
import OnboardingPage from '../pages/OnboardingPage.jsx'
import TimeTrackPage from '../pages/TimeTrackPage.jsx'
import ProfilePage from '../pages/ProfilePage.jsx'
import SettingsPage from '../pages/SettingsPage.jsx'
import RewardsPage from '../pages/RewardsPage.jsx'

// ✅ TOUTES LES PAGES ADMIN
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

// ✅ PAGES DE TEST - TOUS PRÉSENTS
import TestDashboardPage from '../pages/TestDashboardPage.jsx'
import TestFirebasePage from '../pages/TestFirebasePage.jsx'
import TestCompletePage from '../pages/TestCompletePage.jsx'
import TestNotificationsPage from '../pages/TestNotificationsPage.jsx'

/**
 * 🛡️ PROTECTION DE ROUTE
 */
const ProtectedRoute = ({ children, adminOnly = false, requireAuth = true }) => {
  const { user, isAuthenticated } = useAuthStore()
  
  // Vérification authentification
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  // Vérification admin si requis
  if (adminOnly && (!user || !user.isAdmin)) {
    return <Navigate to="/" replace />
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
        path="/login" 
        element={<LoginPage />} 
      />

      {/* 🏠 PAGES PRINCIPALES PROTÉGÉES */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />

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

      <Route 
        path="/analytics" 
        element={
          <ProtectedRoute>
            <AnalyticsPage />
          </ProtectedRoute>
        } 
      />

      {/* 🎮 GAMIFICATION */}
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
        path="/leaderboard" 
        element={
          <ProtectedRoute>
            <LeaderboardPage />
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

      {/* 👥 ÉQUIPE (REMPLACE USERS) */}
      <Route 
        path="/team" 
        element={
          <ProtectedRoute>
            <TeamPage />
          </ProtectedRoute>
        } 
      />

      {/* 🔄 REDIRECTION /users VERS /team */}
      <Route 
        path="/users" 
        element={<Navigate to="/team" replace />}
      />

      {/* 🛠️ OUTILS */}
      <Route 
        path="/onboarding" 
        element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/timetrack" 
        element={
          <ProtectedRoute>
            <TimeTrackPage />
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
        path="/settings" 
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } 
      />

      {/* 🛡️ PAGES ADMIN */}
      <Route 
        path="/admin/task-validation" 
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminTaskValidationPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin/objective-validation" 
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminObjectiveValidationPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin/complete-test" 
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminCompleteTestPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin/profile-test" 
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminProfileTestPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin/role-permissions" 
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminRolePermissionsPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin/rewards" 
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminRewardsPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin/badges" 
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminBadgesPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin/users" 
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminUsersPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin/analytics" 
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminAnalyticsPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin/settings" 
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminSettingsPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin/sync" 
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminSyncPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin/dashboard-tuteur" 
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminDashboardTuteurPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin/dashboard-manager" 
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminDashboardManagerPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin/interview" 
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminInterviewPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin/demo-cleaner" 
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminDemoCleanerPage />
          </ProtectedRoute>
        } 
      />

      {/* 🧪 PAGES DE TEST */}
      <Route 
        path="/test/dashboard" 
        element={
          <ProtectedRoute>
            <TestDashboardPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/test/firebase" 
        element={
          <ProtectedRoute>
            <TestFirebasePage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/test/complete" 
        element={
          <ProtectedRoute>
            <TestCompletePage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/test/notifications" 
        element={
          <ProtectedRoute>
            <TestNotificationsPage />
          </ProtectedRoute>
        } 
      />

      {/* 🚫 PAGE 404 */}
      <Route 
        path="*" 
        element={<NotFoundPage />} 
      />
    </Routes>
  )
}

export default AppRoutes

// ==========================================
// 📁 react-app/src/core/constants.js
// CONSTANTES MISES À JOUR - SUPPRESSION ROUTE USERS
// ==========================================

export const ROUTES = {
  // Routes de base
  HOME: '/',
  LOGIN: '/login',
  
  // Pages principales
  DASHBOARD: '/dashboard',
  TASKS: '/tasks',
  PROJECTS: '/projects',
  ANALYTICS: '/analytics',
  
  // Gamification
  LEADERBOARD: '/leaderboard',
  BADGES: '/badges',
  GAMIFICATION: '/gamification',
  REWARDS: '/rewards',
  
  // Équipe (remplace /users)
  TEAM: '/team',
  // ❌ SUPPRIMÉ : USERS: '/users',
  
  // Profil & Paramètres
  PROFILE: '/profile',
  SETTINGS: '/settings',
  
  // Fonctionnalités spécialisées
  ONBOARDING: '/onboarding',
  TIMETRACK: '/timetrack',
  
  // Routes admin
  ADMIN_TASK_VALIDATION: '/admin/task-validation',
  ADMIN_OBJECTIVE_VALIDATION: '/admin/objective-validation',
  ADMIN_COMPLETE_TEST: '/admin/complete-test',
  ADMIN_PROFILE_TEST: '/admin/profile-test',
  ADMIN_ROLE_PERMISSIONS: '/admin/role-permissions',
  ADMIN_REWARDS: '/admin/rewards',
  ADMIN_BADGES: '/admin/badges',
  ADMIN_USERS: '/admin/users', // Admin garde sa page users
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_SYNC: '/admin/sync',
  ADMIN_DASHBOARD_TUTEUR: '/admin/dashboard-tuteur',
  ADMIN_DASHBOARD_MANAGER: '/admin/dashboard-manager',
  ADMIN_INTERVIEW: '/admin/interview',
  ADMIN_DEMO_CLEANER: '/admin/demo-cleaner',
  
  // Pages de test
  TEST_DASHBOARD: '/test/dashboard',
  TEST_FIREBASE: '/test/firebase',
  TEST_COMPLETE: '/test/complete',
  TEST_NOTIFICATIONS: '/test/notifications'
};

// ==========================================
// 📁 STRUCTURE DE NAVIGATION MISE À JOUR
// ==========================================

export const NAVIGATION_STRUCTURE = {
  main: {
    label: 'Principal',
    routes: [
      { path: ROUTES.DASHBOARD, label: 'Tableau de bord', icon: '🏠', priority: 1 },
      { path: ROUTES.TASKS, label: 'Tâches', icon: '✅', priority: 2 },
      { path: ROUTES.PROJECTS, label: 'Projets', icon: '📁', priority: 3 },
      { path: ROUTES.ANALYTICS, label: 'Analytics', icon: '📊', priority: 4 }
    ]
  },
  gamification: {
    label: 'Gamification',
    routes: [
      { path: ROUTES.GAMIFICATION, label: 'Gamification', icon: '🎮', priority: 1 },
      { path: ROUTES.LEADERBOARD, label: 'Classement', icon: '🏆', priority: 2 },
      { path: ROUTES.BADGES, label: 'Badges', icon: '🏅', priority: 3 },
      { path: ROUTES.REWARDS, label: 'Récompenses', icon: '🎁', priority: 4 }
    ]
  },
  team: {
    label: 'Équipe & Social',
    routes: [
      { path: ROUTES.TEAM, label: 'Mon Équipe', icon: '👥', priority: 1 }
      // ❌ SUPPRIMÉ : { path: ROUTES.USERS, label: 'Utilisateurs', icon: '👤', priority: 2 }
    ]
  },
  tools: {
    label: 'Outils & Paramètres',
    routes: [
      { path: ROUTES.ONBOARDING, label: 'Accueil', icon: '🚀', priority: 1 },
      { path: ROUTES.TIMETRACK, label: 'Pointeuse', icon: '⏰', priority: 2 },
      { path: ROUTES.PROFILE, label: 'Mon Profil', icon: '👤', priority: 3 },
      { path: ROUTES.SETTINGS, label: 'Paramètres', icon: '⚙️', priority: 4 }
    ]
  },
  admin: {
    label: 'Administration',
    routes: [
      { path: ROUTES.ADMIN_TASK_VALIDATION, label: 'Validation Tâches', icon: '✅', priority: 1 },
      { path: ROUTES.ADMIN_OBJECTIVE_VALIDATION, label: 'Validation Objectifs', icon: '🎯', priority: 2 },
      { path: ROUTES.ADMIN_COMPLETE_TEST, label: 'Test Complet', icon: '🧪', priority: 3 },
      { path: ROUTES.ADMIN_PROFILE_TEST, label: 'Test Profil', icon: '👤', priority: 4 },
      { path: ROUTES.ADMIN_ROLE_PERMISSIONS, label: 'Permissions Rôles', icon: '🔐', priority: 5 },
      { path: ROUTES.ADMIN_REWARDS, label: 'Gestion Récompenses', icon: '🎁', priority: 6 },
      { path: ROUTES.ADMIN_BADGES, label: 'Gestion Badges', icon: '🏅', priority: 7 },
      { path: ROUTES.ADMIN_USERS, label: 'Gestion Utilisateurs', icon: '👥', priority: 8 },
      { path: ROUTES.ADMIN_ANALYTICS, label: 'Analytics Admin', icon: '📈', priority: 9 },
      { path: ROUTES.ADMIN_SETTINGS, label: 'Paramètres Admin', icon: '⚙️', priority: 10 },
      { path: ROUTES.ADMIN_SYNC, label: 'Synchronisation', icon: '🔄', priority: 11 },
      { path: ROUTES.ADMIN_DASHBOARD_TUTEUR, label: 'Dashboard Tuteur', icon: '🎓', priority: 12 },
      { path: ROUTES.ADMIN_DASHBOARD_MANAGER, label: 'Dashboard Manager', icon: '📊', priority: 13 },
      { path: ROUTES.ADMIN_INTERVIEW, label: 'Gestion Entretiens', icon: '💼', priority: 14 },
      { path: ROUTES.ADMIN_DEMO_CLEANER, label: 'Nettoyage Données', icon: '🧹', priority: 15 }
    ]
  }
};

// ==========================================
// 📁 ACTIONS À EFFECTUER POUR FINALISER LA SUPPRESSION
// ==========================================

/*

🗑️ FICHIER À SUPPRIMER MANUELLEMENT :
- react-app/src/pages/UsersPage.jsx

🔄 FICHIERS À METTRE À JOUR :
1. Remplacer react-app/src/routes/index.jsx par le contenu ci-dessus
2. Remplacer les ROUTES dans react-app/src/core/constants.js par la version mise à jour
3. Vérifier que tous les liens de navigation pointent vers /team au lieu de /users

✅ BÉNÉFICES DE CETTE SUPPRESSION :
- Supprime la redondance entre /users et /team
- Centralise la gestion des utilisateurs sur la page /team
- Simplifie la navigation
- Évite les erreurs de la page UsersPage qui ne chargeait pas
- Redirection automatique de /users vers /team pour compatibilité

🎯 RÉSULTAT FINAL :
- La page /users redirige automatiquement vers /team
- La page /team contient toute la logique de gestion des utilisateurs
- La messagerie interne reste fonctionnelle sur /team
- Les admins gardent leur page /admin/users dédiée

*/
