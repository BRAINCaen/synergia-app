// ==========================================
// 📁 react-app/src/App.jsx
// SYNERGIA v3.5 STABLE - IMPORTS CORRIGÉS POUR BUILD
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
// 📄 PAGES PRINCIPALES EXISTANTES
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
// 🎮 PAGES GAMIFICATION EXISTANTES
// ==========================================
import RoleProgressionPage from './pages/RoleProgressionPage.jsx';

// ==========================================
// 🛡️ PAGES ADMIN EXISTANTES
// ==========================================
import AdminTaskValidationPage from './pages/AdminTaskValidationPage.jsx';
import CompleteAdminTestPage from './pages/CompleteAdminTestPage.jsx';

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
// 🔧 COMPOSANT FALLBACK POUR PAGES MANQUANTES
// ==========================================
const PageNotImplemented = ({ pageName }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">
          Page {pageName}
        </h1>
        <p className="text-purple-200 mb-6">
          Cette page sera disponible dans une prochaine version.
        </p>
        <div className="flex justify-center space-x-4">
          <a 
            href="/dashboard" 
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Retour au Dashboard
          </a>
          <a 
            href="/gamification" 
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            Voir Gamification
          </a>
        </div>
      </div>
    </div>
  </div>
);

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
                <PageNotImplemented pageName="Classement" />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/claimant" 
            element={
              <ProtectedRoute>
                <PageNotImplemented pageName="Réclamations" />
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
                <PageNotImplemented pageName="Tâches par Rôle" />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/role-badges" 
            element={
              <ProtectedRoute>
                <PageNotImplemented pageName="Badges Rôle" />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/escape-progression" 
            element={
              <ProtectedRoute>
                <PageNotImplemented pageName="Escape Progression" />
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
              🛡️ ROUTES ADMIN EXISTANTES
              ========================================== */}
          <Route 
            path="/admin/dashboard-tuteur" 
            element={
              <ProtectedRoute>
                <PageNotImplemented pageName="Dashboard Tuteur" />
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
                <PageNotImplemented pageName="Gestion Utilisateurs" />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/analytics" 
            element={
              <ProtectedRoute>
                <PageNotImplemented pageName="Analytics Admin" />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/parameters" 
            element={
              <ProtectedRoute>
                <PageNotImplemented pageName="Paramètres Admin" />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/gestion-utilisateurs" 
            element={
              <ProtectedRoute>
                <PageNotImplemented pageName="Gestion Utilisateurs Admin" />
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
console.log('🛡️ Imports corrigés pour build Netlify');

export default App;
