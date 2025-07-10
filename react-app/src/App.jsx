// ==========================================
// 📁 react-app/src/App.jsx
// VERSION PROPRE SANS CONFLITS DE ROUTING
// ==========================================

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 🛡️ CORRECTIONS
import './utils/errorHandler.js';
import './core/simpleRoleFix.js';
import './core/emergencyRoleFix.js';

// 🔐 AuthStore
import { useAuthStore } from './shared/stores/authStore.js';

// 🏗️ Layout
import DashboardLayout from './layouts/DashboardLayout.jsx';

// 📄 Pages
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import TasksPage from './pages/TasksPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import GamificationPage from './pages/GamificationPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import TeamPageFixed from './pages/TeamPageFixed.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import TimeTrackPage from './pages/TimeTrackPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import RewardsPage from './pages/RewardsPage.jsx';

console.log('🚀 SYNERGIA v3.5.3 - VERSION PROPRE');

/**
 * 🔐 COMPOSANT PROTECTED ROUTE INTÉGRÉ
 */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

/**
 * 🌐 COMPOSANT PUBLIC ROUTE INTÉGRÉ
 */
function PublicRoute({ children }) {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement...</p>
        </div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

/**
 * 🎯 COMPOSANT PAGE AVEC LAYOUT
 */
function PageWithLayout({ children }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  );
}

/**
 * 🚀 APPLICATION PRINCIPALE
 */
function App() {
  const { initializeAuth, user, loading } = useAuthStore();

  useEffect(() => {
    console.log('🔄 Initialisation de l\'authentification...');
    initializeAuth();
  }, [initializeAuth]);

  // Fonctions de debug globales
  useEffect(() => {
    window.forceReload = () => {
      console.log('🔄 Force reload demandé');
      window.location.reload();
    };
    
    window.emergencyClean = () => {
      console.log('🧹 Nettoyage d\'urgence...');
      localStorage.clear();
      sessionStorage.clear();
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(registration => registration.unregister());
        });
      }
      window.location.reload();
    };
    
    // Diagnostic des pages
    window.diagnosePages = () => {
      console.log('🔍 DIAGNOSTIC DES PAGES');
      console.log('✅ Pages:', {
        Login: typeof Login,
        Dashboard: typeof Dashboard,
        TasksPage: typeof TasksPage,
        ProjectsPage: typeof ProjectsPage,
        AnalyticsPage: typeof AnalyticsPage,
        GamificationPage: typeof GamificationPage,
        UsersPage: typeof UsersPage,
        TeamPage: typeof TeamPage,
        OnboardingPage: typeof OnboardingPage,
        TimeTrackPage: typeof TimeTrackPage,
        ProfilePage: typeof ProfilePage,
        SettingsPage: typeof SettingsPage,
        RewardsPage: typeof RewardsPage
      });
      console.log('✅ Layout:', typeof DashboardLayout);
      console.log('✅ Auth:', { user: !!user, loading });
    };
    
    console.log('✅ Fonctions debug: forceReload(), emergencyClean(), diagnosePages()');
  }, []);

  // Diagnostic en temps réel
  useEffect(() => {
    console.log('📊 État Auth:', {
      loading,
      hasUser: !!user,
      userEmail: user?.email
    });
  }, [loading, user]);

  return (
    <Router>
      <Routes>
        {/* 🔐 Route de connexion */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* 🏠 Page d'accueil */}
        <Route
          path="/dashboard"
          element={
            <PageWithLayout>
              <Dashboard />
            </PageWithLayout>
          }
        />

        {/* 📋 Pages principales */}
        <Route
          path="/tasks"
          element={
            <PageWithLayout>
              <TasksPage />
            </PageWithLayout>
          }
        />

        <Route
          path="/projects"
          element={
            <PageWithLayout>
              <ProjectsPage />
            </PageWithLayout>
          }
        />

        <Route
          path="/analytics"
          element={
            <PageWithLayout>
              <AnalyticsPage />
            </PageWithLayout>
          }
        />

        {/* 🎮 Gamification */}
        <Route
          path="/gamification"
          element={
            <PageWithLayout>
              <GamificationPage />
            </PageWithLayout>
          }
        />

        <Route
          path="/rewards"
          element={
            <PageWithLayout>
              <RewardsPage />
            </PageWithLayout>
          }
        />

        {/* 👥 Équipe */}
        <Route
          path="/team"
          element={
            <PageWithLayout>
              <TeamPageFixed />
            </PageWithLayout>
          }
        />

        <Route
          path="/users"
          element={
            <PageWithLayout>
              <UsersPage />
            </PageWithLayout>
          }
        />

        {/* 👤 Profil */}
        <Route
          path="/profile"
          element={
            <PageWithLayout>
              <ProfilePage />
            </PageWithLayout>
          }
        />

        <Route
          path="/settings"
          element={
            <PageWithLayout>
              <SettingsPage />
            </PageWithLayout>
          }
        />

        {/* 📚 Autres pages */}
        <Route
          path="/onboarding"
          element={
            <PageWithLayout>
              <OnboardingPage />
            </PageWithLayout>
          }
        />

        <Route
          path="/time-track"
          element={
            <PageWithLayout>
              <TimeTrackPage />
            </PageWithLayout>
          }
        />

        {/* 🎯 Aliases pour compatibilité */}
        <Route
          path="/badges"
          element={
            <PageWithLayout>
              <GamificationPage />
            </PageWithLayout>
          }
        />

        <Route
          path="/leaderboard"
          element={
            <PageWithLayout>
              <UsersPage />
            </PageWithLayout>
          }
        />

        <Route
          path="/timetrack"
          element={
            <PageWithLayout>
              <TimeTrackPage />
            </PageWithLayout>
          }
        />

        {/* 🏠 Redirection par défaut */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* 🔄 Route fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
