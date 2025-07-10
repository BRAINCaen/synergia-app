// ==========================================
// 📁 react-app/src/App.jsx
// VERSION ORIGINALE RESTAURÉE - Toutes les pages fonctionnelles
// ==========================================
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
import TeamPage from './pages/TeamPage.jsx';  // ✅ TeamPage (pas TeamPageFixed)
import OnboardingPage from './pages/OnboardingPage.jsx';
import TimeTrackPage from './pages/TimeTrackPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import RewardsPage from './pages/RewardsPage.jsx';

console.log('🚀 SYNERGIA v3.5.3 - VERSION ORIGINALE RESTAURÉE');

/**
 * 🔐 COMPOSANT PROTECTED ROUTE
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
 * 🌐 COMPOSANT PUBLIC ROUTE
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

        {/* 🏠 Dashboard principal */}
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

        {/* 🎮 Gamification complète */}
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

        {/* 👥 Équipe et social */}
        <Route
          path="/team"
          element={
            <PageWithLayout>
              <TeamPage />
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

        {/* 👤 Profil et paramètres */}
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

        {/* 📚 Pages spécialisées */}
        <Route
          path="/onboarding"
          element={
            <PageWithLayout>
              <OnboardingPage />
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

        {/* 🎯 Aliases pour compatibilité avec le routing original */}
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
          path="/time-track"
          element={
            <PageWithLayout>
              <TimeTrackPage />
            </PageWithLayout>
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
