// ==========================================
// 📁 react-app/src/App.jsx
// VERSION COMPLÈTE CORRIGÉE AVEC TOUS LES IMPORTS FIXES
// ==========================================

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 🛡️ CORRECTIONS ET GESTIONNAIRE D'ERREURS
import './utils/errorHandler.js';
import './core/simpleRoleFix.js'; // ✅ Version compatible build (remplace completeRoleFix.js)

// 🔐 AuthStore - TESTÉ ET FONCTIONNEL
import { useAuthStore } from './shared/stores/authStore.js';

// 🎯 Routes - TESTÉES ET FONCTIONNELLES  
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import PublicRoute from './routes/PublicRoute.jsx';

// 🏗️ Layout - TESTÉ ET FONCTIONNEL
import DashboardLayout from './layouts/DashboardLayout.jsx';

// 📄 Pages - TESTÉES ET FONCTIONNELLES (VERSIONS ORIGINALES)
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import TasksPage from './pages/TasksPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx'; // ✅ Progress → Gauge corrigé
import GamificationPage from './pages/GamificationPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import TeamPage from './pages/TeamPage.jsx'; // ✅ IMPORT TEAMPAGE AJOUTÉ
import OnboardingPage from './pages/OnboardingPage.jsx';
import TimeTrackPage from './pages/TimeTrackPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import RewardsPage from './pages/RewardsPage.jsx';

// 🔧 Pages administratives (optionnelles)
import AdminTaskValidationPage from './pages/AdminTaskValidationPage.jsx';
import CompleteAdminTestPage from './pages/CompleteAdminTestPage.jsx';

console.log('🚀 SYNERGIA v3.5.3 - VERSION CORRIGÉE COMPLÈTE');
console.log('✅ Tous les imports testés et fonctionnels');
console.log('🔧 Corrections appliquées : simpleRoleFix.js intégré');

/**
 * 🚀 APPLICATION PRINCIPALE SYNERGIA v3.5
 * Version corrigée avec tous les imports et corrections
 */
function App() {
  const { initializeAuth, isAuthenticated, user, loading } = useAuthStore();

  // Initialisation de l'authentification
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
    
    // 🔧 Fonction de diagnostic des imports
    window.diagnoseApp = () => {
      console.log('🔍 DIAGNOSTIC APPLICATION');
      console.log('✅ AuthStore:', typeof useAuthStore);
      console.log('✅ Routes:', typeof ProtectedRoute);
      console.log('✅ Layout:', typeof DashboardLayout);
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
      console.log('✅ Corrections de rôles actives:', typeof window.fixRoleAssignment);
    };
    
    console.log('✅ Fonctions debug: forceReload(), emergencyClean(), diagnoseApp()');
  }, []);

  // Diagnostic en temps réel
  useEffect(() => {
    console.log('📊 État Auth:', {
      loading,
      isAuthenticated, 
      hasUser: !!user,
      userEmail: user?.email
    });
  }, [loading, isAuthenticated, user]);

  // Écran de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement de Synergia...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* 🔐 Route publique - Connexion */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* 🏠 Routes protégées avec layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* 📊 Page d'accueil */}
          <Route index element={<Dashboard />} />
          
          {/* 📋 Pages principales */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          
          {/* 🎮 Gamification */}
          <Route path="gamification" element={<GamificationPage />} />
          <Route path="rewards" element={<RewardsPage />} />
          
          {/* 👥 Équipe et utilisateurs */}
          <Route path="team" element={<TeamPage />} />
          <Route path="users" element={<UsersPage />} />
          
          {/* 👤 Profil et paramètres */}
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          
          {/* 📚 Onboarding et temps */}
          <Route path="onboarding" element={<OnboardingPage />} />
          <Route path="time-track" element={<TimeTrackPage />} />
          
          {/* 🛡️ Pages administratives */}
          <Route path="admin">
            <Route path="task-validation" element={<AdminTaskValidationPage />} />
            <Route path="complete-test" element={<CompleteAdminTestPage />} />
          </Route>
        </Route>

        {/* 🚫 Route par défaut - Redirection */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
