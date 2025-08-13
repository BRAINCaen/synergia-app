// ==========================================
// 📁 react-app/src/App.jsx
// APP PRINCIPAL AVEC INTÉGRATION DU SERVICE DE RÉCURRENCE HEBDOMADAIRE
// ==========================================

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// ==========================================
// 🔧 STORES ET SERVICES CORE
// ==========================================
import { useAuthStore, initializeAuthStore } from './shared/stores/authStore.js';
import userResolverService from './core/services/userResolverService.js';
import weeklyRecurrenceService from './core/services/weeklyRecurrenceService.js';
import recurrenceSchedulerService from './core/services/recurrenceSchedulerService.js';

// ==========================================
// 🎭 PAGES PRINCIPALES - CHEMINS CORRIGÉS
// ==========================================
import LoginPage from './pages/Login.jsx';
import DashboardPage from './pages/Dashboard.jsx'; // ✅ CORRECTION: Dashboard.jsx au lieu de DashboardPage.jsx
import TasksPage from './pages/TasksPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import TeamPage from './pages/TeamPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

// ==========================================
// 🏆 PAGES GAMIFICATION - CHEMINS CORRIGÉS
// ==========================================
import GamificationPage from './pages/GamificationPage.jsx';
import BadgesPage from './pages/BadgesPage.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import RewardsPage from './pages/RewardsPage.jsx';
import RoleProgressionPage from './pages/RoleProgressionPage.jsx';
import EscapeProgressionPage from './pages/EscapeProgressionPage.jsx';

// ==========================================
// 🛡️ PAGES ADMIN - CHEMINS CORRIGÉS
// ==========================================
import AdminTaskValidationPage from './pages/AdminTaskValidationPage.jsx';
import CompleteAdminTestPage from './pages/CompleteAdminTestPage.jsx';
import {
  AdminObjectiveValidationPage,
  AdminRolePermissionsPage,
  AdminRewardsPage,
  AdminBadgesPage,
  AdminUsersPage,
  AdminAnalyticsPage,
  AdminSettingsPage,
  AdminDemoCleanerPage,
  AdminCompleteTestPage
} from './pages/RoleProgressionPage.jsx';

// ==========================================
// 📱 PAGES ADDITIONNELLES
// ==========================================
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import TimeTrackPage from './pages/TimeTrackPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import NotFoundPage from './pages/NotFound.jsx';

// ==========================================
// 🎯 COMPOSANTS LAYOUT
// ==========================================
import Layout from './components/layout/Layout.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import PublicRoute from './components/auth/PublicRoute.jsx';

// ==========================================
// 🔧 CONFIGURATION ET CONSTANTES
// ==========================================
import { ROUTES } from './core/constants.js';

/**
 * 🚀 COMPOSANT APP PRINCIPAL
 */
const App = () => {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  // ==========================================
  // 🔄 INITIALISATION DES SERVICES
  // ==========================================
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 1. Initialiser le store d'authentification
        await initializeAuthStore();
        
        // 2. Initialiser les services si utilisateur connecté
        if (isAuthenticated && user) {
          // Service de résolution utilisateur
          await userResolverService.initialize();
          
          // Service de récurrence hebdomadaire
          await weeklyRecurrenceService.initialize();
          
          // Planificateur de récurrence
          await recurrenceSchedulerService.start();
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'app:', error);
      }
    };

    initializeApp();
  }, [isAuthenticated, user]);

  // ==========================================
  // 🔄 CLEANUP AU DÉMONTAGE
  // ==========================================
  useEffect(() => {
    return () => {
      // Arrêter le planificateur lors du démontage
      recurrenceSchedulerService.stop();
    };
  }, []);

  // ==========================================
  // ⏳ AFFICHAGE CHARGEMENT
  // ==========================================
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Synergia</h2>
          <p className="text-gray-400">Chargement en cours...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // 🎯 RENDU PRINCIPAL
  // ==========================================
  return (
    <Router>
      <div className="App min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <AnimatePresence mode="wait">
          <Routes>
            {/* ==========================================
                🔐 ROUTES PUBLIQUES
                ========================================== */}
            <Route 
              path={ROUTES.LOGIN} 
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } 
            />

            {/* ==========================================
                🏠 ROUTES PROTÉGÉES PRINCIPALES
                ========================================== */}
            <Route
              path={ROUTES.DASHBOARD}
              element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.TASKS}
              element={
                <ProtectedRoute>
                  <Layout>
                    <TasksPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.PROJECTS}
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProjectsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.ANALYTICS}
              element={
                <ProtectedRoute>
                  <Layout>
                    <AnalyticsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.TEAM}
              element={
                <ProtectedRoute>
                  <Layout>
                    <TeamPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* ==========================================
                🏆 ROUTES GAMIFICATION
                ========================================== */}
            <Route
              path={ROUTES.GAMIFICATION}
              element={
                <ProtectedRoute>
                  <Layout>
                    <GamificationPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.BADGES}
              element={
                <ProtectedRoute>
                  <Layout>
                    <BadgesPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.LEADERBOARD}
              element={
                <ProtectedRoute>
                  <Layout>
                    <LeaderboardPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.REWARDS}
              element={
                <ProtectedRoute>
                  <Layout>
                    <RewardsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.ROLE_PROGRESSION}
              element={
                <ProtectedRoute>
                  <Layout>
                    <RoleProgressionPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.ESCAPE_PROGRESSION}
              element={
                <ProtectedRoute>
                  <Layout>
                    <EscapeProgressionPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* ==========================================
                👥 ROUTES UTILISATEURS
                ========================================== */}
            <Route
              path={ROUTES.USERS}
              element={
                <ProtectedRoute>
                  <Layout>
                    <UsersPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.PROFILE}
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProfilePage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* ==========================================
                🛠️ ROUTES OUTILS
                ========================================== */}
            <Route
              path={ROUTES.ONBOARDING}
              element={
                <ProtectedRoute>
                  <Layout>
                    <OnboardingPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.TIMETRACK}
              element={
                <ProtectedRoute>
                  <Layout>
                    <TimeTrackPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.SETTINGS}
              element={
                <ProtectedRoute>
                  <Layout>
                    <SettingsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* ==========================================
                🛡️ ROUTES ADMIN
                ========================================== */}
            <Route
              path={ROUTES.ADMIN_TASK_VALIDATION}
              element={
                <ProtectedRoute requiredRole="admin">
                  <Layout>
                    <AdminTaskValidationPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.ADMIN_OBJECTIVE_VALIDATION}
              element={
                <ProtectedRoute requiredRole="admin">
                  <Layout>
                    <AdminObjectiveValidationPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.ADMIN_COMPLETE_TEST}
              element={
                <ProtectedRoute requiredRole="admin">
                  <Layout>
                    <CompleteAdminTestPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.ADMIN_ROLE_PERMISSIONS}
              element={
                <ProtectedRoute requiredRole="admin">
                  <Layout>
                    <AdminRolePermissionsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.ADMIN_REWARDS}
              element={
                <ProtectedRoute requiredRole="admin">
                  <Layout>
                    <AdminRewardsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.ADMIN_BADGES}
              element={
                <ProtectedRoute requiredRole="admin">
                  <Layout>
                    <AdminBadgesPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.ADMIN_USERS}
              element={
                <ProtectedRoute requiredRole="admin">
                  <Layout>
                    <AdminUsersPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.ADMIN_ANALYTICS}
              element={
                <ProtectedRoute requiredRole="admin">
                  <Layout>
                    <AdminAnalyticsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.ADMIN_SETTINGS}
              element={
                <ProtectedRoute requiredRole="admin">
                  <Layout>
                    <AdminSettingsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.ADMIN_DEMO_CLEANER}
              element={
                <ProtectedRoute requiredRole="admin">
                  <Layout>
                    <AdminDemoCleanerPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* ==========================================
                🔀 REDIRECTIONS ET 404
                ========================================== */}
            <Route 
              path="/" 
              element={
                isAuthenticated ? 
                  <Navigate to={ROUTES.DASHBOARD} replace /> : 
                  <Navigate to={ROUTES.LOGIN} replace />
              } 
            />

            <Route 
              path="*" 
              element={
                <Layout>
                  <NotFoundPage />
                </Layout>
              } 
            />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
};

export default App;
