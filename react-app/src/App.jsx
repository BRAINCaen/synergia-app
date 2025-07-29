// ==========================================
// 📁 react-app/src/App.jsx
// APP CORRIGÉ - GARDE TOUTES LES FONCTIONNALITÉS
// ==========================================

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 🛡️ IMPORT DU CORRECTIF SÉCURISÉ EN PREMIER
import './utils/secureImportFix.js';

// 🔧 Import du Layout sophistiqué avec sidebar
import Layout from './components/layout/Layout.jsx';

// Stores - IMPORT SÉCURISÉ
import { useAuthStore } from './shared/stores/authStore.js';

// Pages principales - TOUS LES IMPORTS CONSERVÉS
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import TasksPage from './pages/TasksPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import ProjectDetailPage from './pages/ProjectDetailPage.jsx';
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

// Pages nouvellement créées - TOUS CONSERVÉS
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import RoleProgressionPage from './pages/RoleProgressionPage.jsx';
import RoleTasksPage from './pages/RoleTasksPage.jsx';
import RoleBadgesPage from './pages/RoleBadgesPage.jsx';
import EscapeProgressionPage from './pages/EscapeProgressionPage.jsx';

// Pages admin existantes - TOUS CONSERVÉS
import AdminTaskValidationPage from './pages/AdminTaskValidationPage.jsx';
import CompleteAdminTestPage from './pages/CompleteAdminTestPage.jsx';

// Pages admin nouvellement créées - TOUS CONSERVÉS
import AdminDashboardTuteurPage from './pages/AdminDashboardTuteurPage.jsx';
import AdminRolePermissionsPage from './pages/AdminRolePermissionsPage.jsx';
import AdminRewardsPage from './pages/AdminRewardsPage.jsx';
import AdminBadgesPage from './pages/AdminBadgesPage.jsx';
import AdminUsersPage from './pages/AdminUsersPage.jsx';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage.jsx';
import AdminSettingsPage from './pages/AdminSettingsPage.jsx';

// Import du correctif d'erreurs - CONSERVÉ
import './utils/safeFix.js';

// 🔒 Composant de protection pour les routes
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Chargement de Synergia...</p>
          <p className="text-gray-400 text-sm mt-2">Version 3.5 - Mode corrigé</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

console.log('🚀 App.jsx - Toutes les pages importées avec succès');

function App() {
  const { user, loading, initialize } = useAuthStore();

  useEffect(() => {
    console.log('🚀 App - Initialisation de l\'authentification');
    try {
      initialize();
    } catch (error) {
      console.error('❌ Erreur initialisation auth:', error);
    }
  }, [initialize]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Chargement de Synergia...</p>
          <p className="text-gray-400 text-sm mt-2">Version 3.5 - Build corrigé</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* ==========================================
              🔐 ROUTES PUBLIQUES
              ========================================== */}
          
          <Route path="/login" element={<Login />} />
          
          {/* ==========================================
              🏠 ROUTES PRINCIPALES PROTÉGÉES
              ========================================== */}
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/tasks" 
            element={
              <ProtectedRoute>
                <Layout>
                  <TasksPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/projects" 
            element={
              <ProtectedRoute>
                <Layout>
                  <ProjectsPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* ✅ ROUTE DÉTAIL PROJET CONSERVÉE */}
          <Route 
            path="/projects/:id" 
            element={
              <ProtectedRoute>
                <Layout>
                  <ProjectDetailPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <Layout>
                  <AnalyticsPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* ==========================================
              🎮 ROUTES GAMIFICATION CONSERVÉES
              ========================================== */}
          
          <Route 
            path="/gamification" 
            element={
              <ProtectedRoute>
                <Layout>
                  <GamificationPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/badges" 
            element={
              <ProtectedRoute>
                <Layout>
                  <BadgesPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/leaderboard" 
            element={
              <ProtectedRoute>
                <Layout>
                  <LeaderboardPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/rewards" 
            element={
              <ProtectedRoute>
                <Layout>
                  <RewardsPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* ==========================================
              🎯 ROUTES PROGRESSION CONSERVÉES
              ========================================== */}
          
          <Route 
            path="/role-progression" 
            element={
              <ProtectedRoute>
                <Layout>
                  <RoleProgressionPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/role-tasks" 
            element={
              <ProtectedRoute>
                <Layout>
                  <RoleTasksPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/role-badges" 
            element={
              <ProtectedRoute>
                <Layout>
                  <RoleBadgesPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/escape-progression" 
            element={
              <ProtectedRoute>
                <Layout>
                  <EscapeProgressionPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* ==========================================
              👥 ROUTES ÉQUIPE CONSERVÉES
              ========================================== */}
          
          <Route 
            path="/team" 
            element={
              <ProtectedRoute>
                <Layout>
                  <TeamPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/users" 
            element={
              <ProtectedRoute>
                <Layout>
                  <UsersPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* ==========================================
              🛠️ ROUTES OUTILS CONSERVÉES
              ========================================== */}
          
          <Route 
            path="/onboarding" 
            element={
              <ProtectedRoute>
                <Layout>
                  <OnboardingPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/timetrack" 
            element={
              <ProtectedRoute>
                <Layout>
                  <TimeTrackPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Layout>
                  <ProfilePage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Layout>
                  <SettingsPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* ==========================================
              🛡️ ROUTES ADMIN CONSERVÉES
              ========================================== */}
          
          <Route 
            path="/admin/dashboard-tuteur" 
            element={
              <ProtectedRoute>
                <Layout>
                  <AdminDashboardTuteurPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/task-validation" 
            element={
              <ProtectedRoute>
                <Layout>
                  <AdminTaskValidationPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/complete-test" 
            element={
              <ProtectedRoute>
                <Layout>
                  <CompleteAdminTestPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/role-permissions" 
            element={
              <ProtectedRoute>
                <Layout>
                  <AdminRolePermissionsPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/rewards" 
            element={
              <ProtectedRoute>
                <Layout>
                  <AdminRewardsPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/badges" 
            element={
              <ProtectedRoute>
                <Layout>
                  <AdminBadgesPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute>
                <Layout>
                  <AdminUsersPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/analytics" 
            element={
              <ProtectedRoute>
                <Layout>
                  <AdminAnalyticsPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/settings" 
            element={
              <ProtectedRoute>
                <Layout>
                  <AdminSettingsPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* ==========================================
              🔄 REDIRECTIONS ET 404
              ========================================== */}
          
          <Route 
            path="/" 
            element={<Navigate to="/dashboard" replace />} 
          />
          
          <Route 
            path="*" 
            element={
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
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
