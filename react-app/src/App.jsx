// ==========================================
// 📁 react-app/src/App.jsx
// VERSION CORRIGÉE - IMPORTS ET STRUCTURE FIXÉS
// ==========================================

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 🔐 Auth & Protection
import { useAuthStore } from './shared/stores/authStore.js';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import PublicRoute from './routes/PublicRoute.jsx';

// 🎨 Layout - IMPORT CORRIGÉ
import DashboardLayout from './layouts/DashboardLayout.jsx';

// ✅ PAGES PRINCIPALES
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import TasksPage from './pages/TasksPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';

// ✅ PAGES GAMIFICATION
import GamificationPage from './pages/GamificationPage.jsx';
import RewardsPage from './pages/RewardsPage.jsx';
import BadgesPage from './pages/BadgesPage.jsx';

// ✅ PAGES ÉQUIPE & SOCIAL
import UsersPage from './pages/UsersPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';

// ✅ PAGES OUTILS
import TimeTrackPage from './pages/TimeTrackPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

// ✅ PAGES ADMIN/TEST
import CompleteAdminTestPage from './pages/CompleteAdminTestPage.jsx';
import AdminProfileTestPage from './pages/AdminProfileTestPage.jsx';
import AdminTaskValidationPage from './pages/AdminTaskValidationPage.jsx';
import TestDashboard from './pages/TestDashboard.jsx';

// ✅ PAGE 404
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
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Synergia v3.5</h2>
          <p className="text-blue-200">Initialisation en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        
        {/* 🔐 ROUTE PUBLIQUE - LOGIN */}
        <Route 
          path={ROUTES.LOGIN} 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />

        {/* 🏠 ROUTES PROTÉGÉES AVEC LAYOUT */}
        <Route 
          path="/*" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Routes imbriquées dans le layout */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          
          {/* Gamification */}
          <Route path="gamification" element={<GamificationPage />} />
          <Route path="badges" element={<BadgesPage />} />
          <Route path="rewards" element={<RewardsPage />} />
          
          {/* Équipe & Social */}
          <Route path="users" element={<UsersPage />} />
          <Route path="onboarding" element={<OnboardingPage />} />
          
          {/* Outils */}
          <Route path="timetrack" element={<TimeTrackPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          
          {/* Admin */}
          <Route path="admin/task-validation" element={<AdminTaskValidationPage />} />
          <Route path="admin/profile-test" element={<AdminProfileTestPage />} />
          <Route path="admin/complete-test" element={<CompleteAdminTestPage />} />
          
          {/* Test */}
          <Route path="test-dashboard" element={<TestDashboard />} />
        </Route>

        {/* 🏠 REDIRECTION RACINE */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* 🚫 ROUTE 404 */}
        <Route path="*" element={<NotFound />} />
        
      </Routes>
    </Router>
  );
}

export default App;
