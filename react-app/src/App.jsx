// ==========================================
// 📁 react-app/src/App.jsx
// CORRECTION ARCHITECTURE - UN SEUL SYSTÈME DE ROUTING
// ==========================================

import globalFirebasePatch from './core/services/globalFirebasePatch.js';
import { createTaskSafely } from './core/services/taskCreationFixService.js';
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout principal (celui qui fonctionne)
import Layout from './components/layout/Layout.jsx';

// Store d'authentification
import { useAuthStore, initializeAuthStore } from './shared/stores/authStore.js';

// ==========================================
// 📄 PAGES PRINCIPALES - IMPORTS SIMPLIFIÉS
// ==========================================
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import TasksPage from './pages/TasksPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import GamificationPage from './pages/GamificationPage.jsx';
import TeamPage from './pages/TeamPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import RewardsPage from './pages/RewardsPage.jsx';
import BadgesPage from './pages/BadgesPage.jsx';
import TimeTrackPage from './pages/TimeTrackPage.jsx';

// ==========================================
// 🛡️ PAGES ADMIN
// ==========================================
import AdminTaskValidationPage from './pages/AdminTaskValidationPage.jsx';
import CompleteAdminTestPage from './pages/CompleteAdminTestPage.jsx';

// ==========================================
// 🔐 COMPOSANT DE PROTECTION DES ROUTES
// ==========================================
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚙️</div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// ==========================================
// 🚀 COMPOSANT PRINCIPAL CORRIGÉ
// ==========================================
export default function App() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    console.log('🔐 Initialisation de l\'authentification...');
    initializeAuth();
    initializeAuthStore();
  }, [initializeAuth]);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Route publique de connexion - SANS LAYOUT */}
          <Route path="/login" element={<Login />} />
          
          {/* 🔧 CORRECTION: Routes avec Layout comme wrapper individuel */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Navigate to="/dashboard" replace />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Pages principales avec Layout */}
          <Route path="/tasks" element={
            <ProtectedRoute>
              <Layout>
                <TasksPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/projects" element={
            <ProtectedRoute>
              <Layout>
                <ProjectsPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Layout>
                <AnalyticsPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/gamification" element={
            <ProtectedRoute>
              <Layout>
                <GamificationPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/team" element={
            <ProtectedRoute>
              <Layout>
                <TeamPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/users" element={
            <ProtectedRoute>
              <Layout>
                <UsersPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <Layout>
                <OnboardingPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout>
                <ProfilePage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <Layout>
                <SettingsPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/rewards" element={
            <ProtectedRoute>
              <Layout>
                <RewardsPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/badges" element={
            <ProtectedRoute>
              <Layout>
                <BadgesPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/time-track" element={
            <ProtectedRoute>
              <Layout>
                <TimeTrackPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Routes admin */}
          <Route path="/admin/task-validation" element={
            <ProtectedRoute>
              <Layout>
                <AdminTaskValidationPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/test" element={
            <ProtectedRoute>
              <Layout>
                <CompleteAdminTestPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Route 404 - SANS LAYOUT */}
          <Route path="*" element={
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-white mb-4">404</h1>
                <p className="text-gray-400 mb-8">Page non trouvée</p>
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  🏠 Retour au Dashboard
                </button>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}
