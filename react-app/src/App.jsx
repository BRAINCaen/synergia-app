// ==========================================
// 📁 react-app/src/App.jsx
// VERSION FINALE - TOUS LES IMPORTS VÉRIFIÉS
// ==========================================

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 🍞 Système de notifications intégré
import { ToastProvider } from './shared/components/ToastNotification.jsx';

// 🔐 Auth & Protection
import { useAuthStore } from './shared/stores/authStore.js';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import PublicRoute from './routes/PublicRoute.jsx';

// 🎨 Layout
import Layout from './layouts/DashboardLayout.jsx';

// ✅ PAGES PRINCIPALES (toutes vérifiées comme existantes)
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import TasksPage from './pages/TasksPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';

// ✅ PAGES GAMIFICATION (toutes vérifiées)
import GamificationPage from './pages/GamificationPage.jsx';
import RewardsPage from './pages/RewardsPage.jsx';
import BadgesPage from './pages/BadgesPage.jsx';

// ✅ PAGES ÉQUIPE & SOCIAL (toutes vérifiées)
import UsersPage from './pages/UsersPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';

// ✅ PAGES OUTILS (toutes vérifiées)
import TimeTrackPage from './pages/TimeTrackPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

// ✅ PAGES ADMIN/TEST (toutes vérifiées)
import CompleteAdminTestPage from './pages/CompleteAdminTestPage.jsx';
import AdminProfileTestPage from './pages/AdminProfileTestPage.jsx';
import TestDashboard from './pages/TestDashboard.jsx';

// ✅ PAGE 404 (vérifiée)
import NotFound from './pages/NotFound.jsx';

// 🎯 Constants
import { ROUTES } from './core/constants.js';

/**
 * 🚀 APPLICATION PRINCIPALE SYNERGIA v3.5
 */
function App() {
  const { initializeAuth, loading } = useAuthStore();

  // Initialiser l'authentification au démarrage
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Affichage du loader global pendant l'initialisation
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">SYNERGIA v3.5</h2>
            <p className="text-blue-200 animate-pulse">Initialisation de l'application...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <Router>
        <div className="App">
          <Routes>
            
            {/* 🔐 ROUTES PUBLIQUES (sans layout) */}
            <Route 
              path={ROUTES.LOGIN} 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />

            {/* 🏠 ROUTES PRINCIPALES (avec layout) */}
            <Route 
              path={ROUTES.DASHBOARD} 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
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

            {/* 🎮 ROUTES GAMIFICATION (avec layout) */}
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
              path={ROUTES.REWARDS} 
              element={
                <ProtectedRoute>
                  <Layout>
                    <RewardsPage />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            {/* 👥 ROUTES ÉQUIPE & SOCIAL (avec layout) */}
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
              path={ROUTES.ONBOARDING} 
              element={
                <ProtectedRoute>
                  <Layout>
                    <OnboardingPage />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            {/* ⚙️ ROUTES OUTILS (avec layout) */}
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
              path={ROUTES.PROFILE} 
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProfilePage />
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

            {/* 🛡️ ROUTES ADMIN/TEST (avec layout) */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <CompleteAdminTestPage />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <CompleteAdminTestPage />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/admin-test" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <CompleteAdminTestPage />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/admin-profile-test" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <AdminProfileTestPage />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path={ROUTES.TEST_DASHBOARD} 
              element={
                <ProtectedRoute>
                  <Layout>
                    <TestDashboard />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            {/* 🏠 REDIRECTION PAR DÉFAUT */}
            <Route 
              path="/" 
              element={<Navigate to={ROUTES.DASHBOARD} replace />} 
            />

            {/* 🚫 PAGE 404 */}
            <Route 
              path="*" 
              element={
                <Layout>
                  <NotFound />
                </Layout>
              } 
            />

          </Routes>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
