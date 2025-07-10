// ==========================================
// 📁 react-app/src/App.jsx
// FIX IMPORT TEAMPAGE - VERSION CORRIGÉE
// ==========================================
import './core/addMissingRoles.js';
import './core/forceNewRoleSystem.js';
import './core/ultimateRoleFix.js';
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 🛡️ CORRECTIONS - Imports optionnels
try {
  require('./utils/errorHandler.js');
} catch (e) {
  console.warn('⚠️ errorHandler non trouvé');
}

try {
  require('./core/simpleRoleFix.js');
} catch (e) {
  console.warn('⚠️ simpleRoleFix non trouvé');
}

// 🔐 AuthStore
import { useAuthStore } from './shared/stores/authStore.js';

// 🏗️ Layout
import DashboardLayout from './layouts/DashboardLayout.jsx';

// 📄 Pages - TOUTES LES VRAIES PAGES
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import TasksPage from './pages/TasksPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import GamificationPage from './pages/GamificationPage.jsx';
import UsersPage from './pages/UsersPage.jsx';

// ✅ Import TeamPage avec fallback ES6
import TeamPageComponent from './pages/TeamPage.jsx';

// Vérifier que l'import a fonctionné
const TeamPage = TeamPageComponent || (() => {
  console.warn('⚠️ TeamPage fallback utilisé');
  return React.createElement('div', { style: { padding: '20px' } }, 
    React.createElement('h1', null, 'Page Équipe'),
    React.createElement('p', null, 'Page en cours de réparation...')
  );
});

console.log('✅ TeamPage importée:', !!TeamPageComponent);

import OnboardingPage from './pages/OnboardingPage.jsx';
import TimeTrackPage from './pages/TimeTrackPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import RewardsPage from './pages/RewardsPage.jsx';

// Pages admin avec gestion d'erreur
import AdminTaskValidationPage from './pages/AdminTaskValidationPage.jsx';

/**
 * 🔒 COMPOSANT ROUTE PROTÉGÉE
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

/**
 * 📄 COMPOSANT PAGE AVEC LAYOUT
 */
const PageWithLayout = ({ children }) => {
  return <DashboardLayout>{children}</DashboardLayout>;
};

/**
 * 🏠 COMPOSANT APP PRINCIPAL
 */
function App() {
  const { initializeAuth, user } = useAuthStore();

  useEffect(() => {
    console.log('🚀 SYNERGIA v3.5.3 - VERSION ORIGINALE RESTAURÉE');
    initializeAuth();
  }, [initializeAuth]);

  return (
    <Router>
      <Routes>
        {/* 🔐 Route de connexion */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
        />

        {/* 🏠 Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* 📋 Pages de gestion */}
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

        {/* 🎮 Gamification */}
        <Route
          path="/gamification"
          element={
            <ProtectedRoute>
              <GamificationPage />
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

        {/* 👥 Équipe et social - AVEC GESTION D'ERREUR */}
        <Route
          path="/team"
          element={
            <ProtectedRoute>
              <TeamPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <UsersPage />
            </ProtectedRoute>
          }
        />

        {/* 👤 Profil et paramètres */}
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

        {/* 📚 Pages spécialisées */}
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

        {/* 🛡️ Routes admin */}
        <Route
          path="/admin/task-validation"
          element={
            <ProtectedRoute>
              <AdminTaskValidationPage />
            </ProtectedRoute>
          }
        />

        {/* 🎯 Aliases pour compatibilité */}
        <Route
          path="/badges"
          element={
            <ProtectedRoute>
              <GamificationPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <UsersPage />
            </ProtectedRoute>
          }
        />

        {/* 🏠 Redirections */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
