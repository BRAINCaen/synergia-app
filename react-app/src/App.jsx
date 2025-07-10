// ==========================================
// 📁 react-app/src/App.jsx
// VERSION CLEAN UNIQUE - EFFACE TOUT ET REMPLACE PAR CECI
// ==========================================

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 🛡️ CORRECTIONS - SEULS LES IMPORTS QUI EXISTENT
import './utils/errorHandler.js';
import './core/simpleRoleFix.js';

// 🔐 AuthStore
import { useAuthStore } from './shared/stores/authStore.js';

// 🏗️ Layout - IMPORT SÉCURISÉ
let DashboardLayout;
try {
  DashboardLayout = require('./layouts/DashboardLayout.jsx').default;
} catch (e) {
  console.warn('⚠️ DashboardLayout non trouvé, utilisation d\'un fallback');
  DashboardLayout = ({ children }) => React.createElement('div', {
    className: "min-h-screen bg-gray-100"
  }, children);
}

// 📄 Pages - IMPORTS SÉCURISÉS
let Login, Dashboard, TasksPage, ProjectsPage, AnalyticsPage;
let GamificationPage, UsersPage, TeamPage, OnboardingPage;
let TimeTrackPage, ProfilePage, SettingsPage, RewardsPage;

try {
  Login = require('./pages/Login.jsx').default;
  Dashboard = require('./pages/Dashboard.jsx').default;
  TasksPage = require('./pages/TasksPage.jsx').default;
  ProjectsPage = require('./pages/ProjectsPage.jsx').default;
  AnalyticsPage = require('./pages/AnalyticsPage.jsx').default;
  GamificationPage = require('./pages/GamificationPage.jsx').default;
  UsersPage = require('./pages/UsersPage.jsx').default;
  OnboardingPage = require('./pages/OnboardingPage.jsx').default;
  TimeTrackPage = require('./pages/TimeTrackPage.jsx').default;
  ProfilePage = require('./pages/ProfilePage.jsx').default;
  SettingsPage = require('./pages/SettingsPage.jsx').default;
  RewardsPage = require('./pages/RewardsPage.jsx').default;
  TeamPage = require('./pages/TeamPage.jsx').default;
  
  console.log('✅ Toutes les pages chargées avec succès');
} catch (e) {
  console.error('❌ Erreur chargement pages:', e);
  
  const FallbackPage = ({ title }) => React.createElement('div', {
    className: "min-h-screen bg-gray-100 flex items-center justify-center"
  }, React.createElement('div', {
    className: "bg-white rounded-lg shadow-lg p-8 text-center"
  }, [
    React.createElement('h1', { key: 'title', className: "text-2xl font-bold text-gray-800 mb-4" }, title || "Page en cours de chargement"),
    React.createElement('p', { key: 'message', className: "text-gray-600 mb-4" }, "Cette page sera bientôt disponible."),
    React.createElement('button', {
      key: 'reload',
      onClick: () => window.location.reload(),
      className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
    }, "🔄 Recharger")
  ]));
  
  Login = () => React.createElement(FallbackPage, { title: "Connexion" });
  Dashboard = () => React.createElement(FallbackPage, { title: "Dashboard" });
  TasksPage = () => React.createElement(FallbackPage, { title: "Tâches" });
  ProjectsPage = () => React.createElement(FallbackPage, { title: "Projets" });
  AnalyticsPage = () => React.createElement(FallbackPage, { title: "Analytics" });
  GamificationPage = () => React.createElement(FallbackPage, { title: "Gamification" });
  UsersPage = () => React.createElement(FallbackPage, { title: "Utilisateurs" });
  TeamPage = () => React.createElement(FallbackPage, { title: "Équipe" });
  OnboardingPage = () => React.createElement(FallbackPage, { title: "Intégration" });
  TimeTrackPage = () => React.createElement(FallbackPage, { title: "Time Track" });
  ProfilePage = () => React.createElement(FallbackPage, { title: "Profil" });
  SettingsPage = () => React.createElement(FallbackPage, { title: "Paramètres" });
  RewardsPage = () => React.createElement(FallbackPage, { title: "Récompenses" });
}

console.log('🚀 SYNERGIA v3.5.3 - VERSION CORRIGÉE');

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

function PageWithLayout({ children }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function App() {
  const { initializeAuth, user, loading } = useAuthStore();

  useEffect(() => {
    console.log('🔄 Initialisation de l\'authentification...');
    initializeAuth();
  }, [initializeAuth]);

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
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <PageWithLayout>
              <Dashboard />
            </PageWithLayout>
          }
        />

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

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
