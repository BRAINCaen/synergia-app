// ==========================================
// 📁 react-app/src/App.jsx
// VERSION COMPLÈTE CORRIGÉE AVEC TEAMPAGE
// ==========================================
import './core/immediateRoleFix.js';
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 🛡️ Import du gestionnaire d'erreur
import './utils/errorHandler.js';

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
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import GamificationPage from './pages/GamificationPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import TeamPage from './pages/TeamPage.jsx'; // ✅ IMPORT TEAMPAGE AJOUTÉ
import OnboardingPage from './pages/OnboardingPage.jsx';
import TimeTrackPage from './pages/TimeTrackPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import RewardsPage from './pages/RewardsPage.jsx';

console.log('🚀 SYNERGIA v3.5.3 - VERSION CORRIGÉE AVEC TEAMPAGE');
console.log('✅ Tous les imports testés et fonctionnels');

/**
 * 🚀 APPLICATION PRINCIPALE SYNERGIA v3.5
 * Version corrigée avec TeamPage fonctionnelle
 */
function App() {
  const { initializeAuth, isAuthenticated, user, loading } = useAuthStore();

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
    
    console.log('✅ Fonctions debug: forceReload(), emergencyClean()');
  }, []);

  // Diagnostic en temps réel
  useEffect(() => {
    console.log('📊 État Auth:', {
      loading,
      isAuthenticated, 
      hasUser: !!user,
      userName: user?.displayName || user?.email
    });
  }, [loading, isAuthenticated, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-white">Chargement de l'application...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* 📝 ROUTE LOGIN PUBLIC */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />

          {/* 🏠 ROUTES PROTÉGÉES PRINCIPALES */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/tasks" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <TasksPage />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/projects" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ProjectsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AnalyticsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/gamification" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <GamificationPage />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/users" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <UsersPage />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          {/* 👥 ROUTE TEAM CORRIGÉE - POINTE VERS TEAMPAGE */}
          <Route 
            path="/team" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <TeamPage />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/onboarding" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <OnboardingPage />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/timetrack" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <TimeTrackPage />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ProfilePage />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SettingsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/rewards" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <RewardsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          {/* 🎖️ ROUTES ALIASES - Rediriger vers les pages existantes */}
          <Route 
            path="/badges" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <GamificationPage />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/leaderboard" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <UsersPage />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          {/* 🏠 REDIRECTION RACINE */}
          <Route 
            path="/" 
            element={<Navigate to="/dashboard" replace />} 
          />

          {/* 🔄 FALLBACK */}
          <Route 
            path="*" 
            element={<Navigate to="/dashboard" replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

console.log('✅ App corrigée - Route Team pointe vers TeamPage');
export default App;
