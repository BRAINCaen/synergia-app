// ==========================================
// 📁 react-app/src/App.jsx
// SYNERGIA v3.5 STABLE - SANS BOUCLES DE RÉINITIALISATION
// ==========================================

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 🔧 Layout sophistiqué avec sidebar
import Layout from './components/layout/Layout.jsx';

// Stores (version stable)
import { useAuthStore, initializeAuthStore } from './shared/stores/authStore.js';

// Import des correctifs
import './utils/safeFix.js';

// ==========================================
// 📄 PAGES PRINCIPALES
// ==========================================
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

// ==========================================
// 🎮 PAGES GAMIFICATION
// ==========================================
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import ClaimantPage from './pages/ClaimantPage.jsx';
import RoleProgressionPage from './pages/RoleProgressionPage.jsx';
import RoleTasksPage from './pages/RoleTasksPage.jsx';
import RoleBadgesPage from './pages/RoleBadgesPage.jsx';
import EscapeProgressionPage from './pages/EscapeProgressionPage.jsx';

// ==========================================
// 🛡️ PAGES ADMIN
// ==========================================
import AdminDashboardTuteurPage from './pages/AdminDashboardTuteurPage.jsx';
import AdminTaskValidationPage from './pages/AdminTaskValidationPage.jsx';
import CompleteAdminTestPage from './pages/CompleteAdminTestPage.jsx';
import AdminUserManagementPage from './pages/AdminUserManagementPage.jsx';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage.jsx';
import AdminParametersPage from './pages/AdminParametersPage.jsx';
import AdminGestionUtilisateursPage from './pages/AdminGestionUtilisateursPage.jsx';

// ==========================================
// 🛡️ COMPOSANT DE PROTECTION
// ==========================================
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Chargement de l'application...</p>
          <p className="text-gray-400 text-sm mt-2">Synergia v3.5 - Version stable</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <Layout>{children}</Layout>;
};

// ==========================================
// 🚀 COMPOSANT PRINCIPAL APP
// ==========================================
const App = () => {
  const { user, loading } = useAuthStore();

  // ✅ INITIALISATION UNIQUE DE L'AUTH AU MONTAGE
  useEffect(() => {
    console.log('🚀 Initialisation App Synergia v3.5');
    
    // Initialiser l'auth store une seule fois
    initializeAuthStore();

    // Cleanup au démontage
    return () => {
      console.log('🧹 Nettoyage App');
      const store = useAuthStore.getState();
      if (store.cleanup) {
        store.cleanup();
      }
    };
  }, []); // ✅ AUCUNE DÉPENDANCE = UNE SEULE EXÉCUTION

  console.log('🔄 App render - User:', user ? `Connecté: ${user.email}` : 'Déconnecté', 'Loading:', loading);

  return (
    <Router>
      <div className="App min-h-screen bg-gray-50">
        <Routes>
          {/* ==========================================
              🔐 ROUTE DE CONNEXION
              ========================================== */}
          <Route 
            path="/login" 
            element={
              user ? <Navigate to="/dashboard" replace /> : <Login />
            } 
          />

          {/* ==========================================
              📊 ROUTES PRINCIPALES PROTÉGÉES
              ========================================== */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/tasks" 
            element={
              <ProtectedRoute>
                <TasksPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/tasks/:taskId" 
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
            path="/projects/:projectId" 
            element={
              <ProtectedRoute>
                <ProjectDetailPage />
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

          {/* ==========================================
              🎮 ROUTES GAMIFICATION PROTÉGÉES
              ========================================== */}
          <Route 
            path="/gamification" 
            element={
              <ProtectedRoute>
                <GamificationPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/badges" 
            element={
              <ProtectedRoute>
                <BadgesPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/leaderboard" 
            element={
              <ProtectedRoute>
                <LeaderboardPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/claimant" 
            element={
              <ProtectedRoute>
                <ClaimantPage />
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

          {/* ==========================================
              📈 ROUTES PROGRESSION RÔLE
              ========================================== */}
          <Route 
            path="/role-progression" 
            element={
              <ProtectedRoute>
                <RoleProgressionPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/role-tasks" 
            element={
              <ProtectedRoute>
                <RoleTasksPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/role-badges" 
            element={
              <ProtectedRoute>
                <RoleBadgesPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/escape-progression" 
            element={
              <ProtectedRoute>
                <EscapeProgressionPage />
              </ProtectedRoute>
            } 
          />

          {/* ==========================================
              👥 ROUTES ÉQUIPE & SOCIAL
              ========================================== */}
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

          {/* ==========================================
              🔧 ROUTES OUTILS
              ========================================== */}
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

          {/* ==========================================
              🛡️ ROUTES ADMIN
              ========================================== */}
          <Route 
            path="/admin/dashboard-tuteur" 
            element={
              <ProtectedRoute>
                <AdminDashboardTuteurPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/task-validation" 
            element={
              <ProtectedRoute>
                <AdminTaskValidationPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/test-complet" 
            element={
              <ProtectedRoute>
                <CompleteAdminTestPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/user-management" 
            element={
              <ProtectedRoute>
                <AdminUserManagementPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/analytics" 
            element={
              <ProtectedRoute>
                <AdminAnalyticsPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/parameters" 
            element={
              <ProtectedRoute>
                <AdminParametersPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/gestion-utilisateurs" 
            element={
              <ProtectedRoute>
                <AdminGestionUtilisateursPage />
              </ProtectedRoute>
            } 
          />

          {/* ==========================================
              🏠 ROUTE PAR DÉFAUT
              ========================================== */}
          <Route 
            path="/" 
            element={
              user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
            } 
          />
          
          {/* Catch-all pour les routes inexistantes */}
          <Route 
            path="*" 
            element={
              user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
};

// ==========================================
// 📋 LOGS DE CONFIRMATION
// ==========================================
console.log('✅ App Synergia v3.5 stable chargé');
console.log('🔧 AuthStore stable intégré');
console.log('🛡️ Toutes les routes protégées configurées');

export default App;
