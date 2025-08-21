// ==========================================
// 📁 react-app/src/App.jsx
// APP PRINCIPAL AVEC TOUTES LES ROUTES CORRIGÉES
// ==========================================

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// ==========================================
// 🚨 CORRECTIFS D'URGENCE COMPLETS
// ==========================================

import './core/roleRecoveryDiagnostic.js';
import './core/emergencyFixUnified.js';
import './core/arrayMapFix.js';
import './core/assignRoleFinalFix.js';

// ==========================================
// 🔧 STORES ET SERVICES CORE
// ==========================================
import { useAuthStore, initializeAuthStore } from './shared/stores/authStore.js';

// ==========================================
// 🎭 PAGES PRINCIPALES
// ==========================================
import LoginPage from './pages/Login.jsx';
import DashboardPage from './pages/Dashboard.jsx';
import TasksPage from './pages/TasksPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import TeamPage from './pages/TeamPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import NotFound from './pages/NotFound.jsx';

// ==========================================
// 🏆 PAGES GAMIFICATION - TOUTES AJOUTÉES !
// ==========================================
import GamificationPage from './pages/GamificationPage.jsx';
import BadgesPage from './pages/BadgesPage.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import RewardsPage from './pages/RewardsPage.jsx';

// ==========================================
// 🛠️ PAGES OUTILS
// ==========================================
import OnboardingPage from './pages/OnboardingPage.jsx';
import TimeTrackPage from './pages/TimeTrackPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import UsersPage from './pages/UsersPage.jsx';

// ==========================================
// 🛡️ PAGES ADMIN (conditionnelles)
// ==========================================
import AdminTaskValidationPage from './pages/AdminTaskValidationPage.jsx';
import CompleteAdminTestPage from './pages/CompleteAdminTestPage.jsx';
import AdminRolePermissionsPage from './pages/AdminRolePermissionsPage.jsx';

// ==========================================
// 🔐 COMPOSANT DE PROTECTION DES ROUTES
// ==========================================
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement...</p>
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
// 🚀 APP PRINCIPAL
// ==========================================
function App() {
  const { user, loading, initializeAuth } = useAuthStore();

  useEffect(() => {
    console.log('🚀 [APP] Initialisation de l\'authentification...');
    initializeAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-white text-xl font-semibold mb-2">Synergia v3.5</h2>
          <p className="text-gray-400">Démarrage de l'application...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <AnimatePresence mode="wait">
        <Routes>
          {/* 🔓 ROUTE PUBLIQUE */}
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
          />
          
          {/* 🏠 ROUTES PRINCIPALES */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
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
            path="/projects" 
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
          
          {/* 🎮 ROUTES GAMIFICATION - TOUTES AJOUTÉES ! */}
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
            path="/rewards" 
            element={
              <ProtectedRoute>
                <RewardsPage />
              </ProtectedRoute>
            } 
          />
          
          {/* 👥 ROUTES ÉQUIPE */}
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
          
          {/* 🛠️ ROUTES OUTILS */}
          <Route 
            path="/onboarding" 
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/time-track" 
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
          
          {/* 🛡️ ROUTES ADMIN */}
          <Route 
            path="/admin/task-validation" 
            element={
              <ProtectedRoute>
                <AdminTaskValidationPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/complete-test" 
            element={
              <ProtectedRoute>
                <CompleteAdminTestPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/roles" 
            element={
              <ProtectedRoute>
                <AdminRolePermissionsPage />
              </ProtectedRoute>
            } 
          />
          
          {/* 🏠 REDIRECTION PAR DÉFAUT */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 🚫 PAGE 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </Router>
  );
}

export default App;
