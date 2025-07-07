// ==========================================
// 📁 react-app/src/App.jsx
// VERSION STABLE - Imports ES modules + Navigation complète
// ==========================================

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 🛡️ GESTIONNAIRE D'ERREUR GLOBAL
import './utils/errorHandler.js';

// 🔐 AUTH STORE
import { useAuthStore } from './shared/stores/authStore.js';

// 🎯 ROUTES COMPONENTS - IMPORTS ES MODULES
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import PublicRoute from './routes/PublicRoute.jsx';

// 🏗️ LAYOUTS
import DashboardLayout from './layouts/DashboardLayout.jsx';

// 📄 PAGES
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import TasksPage from './pages/TasksPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import GamificationPage from './pages/GamificationPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import TimeTrackPage from './pages/TimeTrackPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import RewardsPage from './pages/RewardsPage.jsx';

console.log('🚀 SYNERGIA v3.5.3 - MODE STABLE');
console.log('✅ Service Worker désactivé définitivement');
console.log('🧹 Nettoyage automatique terminé');

/**
 * 🚀 APPLICATION PRINCIPALE SYNERGIA v3.5
 */
function App() {
  const { initializeAuth, isInitialized, user } = useAuthStore();

  useEffect(() => {
    console.log('🔄 Initialisation de l\'authentification...');
    initializeAuth();
  }, [initializeAuth]);

  // DEBUG - Fonctions utilitaires globales
  useEffect(() => {
    // 🛠️ Fonctions de debug globales
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

  // Affichage pendant l'initialisation
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold mb-2">🚀 Synergia v3.5</h2>
          <p className="text-blue-200">Initialisation en cours...</p>
          <div className="mt-4 text-xs text-blue-300">
            <p>Firebase • React • Vite</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* 🌐 ROUTES PUBLIQUES */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />

          {/* 🔐 ROUTES PROTÉGÉES AVEC LAYOUT */}
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

          {/* 🎖️ ROUTES BONUS (accessibles directement) */}
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

export default App;
