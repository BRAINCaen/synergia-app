// ==========================================
// 📁 react-app/src/App.jsx
// CORRECTION ARCHITECTURE - UN SEUL SYSTÈME DE ROUTING
// ==========================================

import globalFirebasePatch from './core/services/globalFirebasePatch.js';
import { createTaskSafely } from './core/services/taskCreationFixService.js';
// ✅ CORRECTION AJOUTÉE - Import userResolverService pour corriger "User is not defined"
import { userResolverService } from './core/services/userResolverService.js';
// ✅ CORRECTION AJOUTÉE - Import globalErrorFix pour corriger "Repeat is not defined"
import './core/globalErrorFix.js';
// ✅ CORRECTION MAJEURE - Import userErrorGlobalFix pour éliminer définitivement "User is not defined"
import './core/userErrorGlobalFix.js';
// ✅ CORRECTION CRITIQUE - Import suppresseur d'erreurs de production
import './core/productionErrorSuppressor.js';
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
  const { isAuthenticated, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// ==========================================
// 🚀 COMPOSANT APP PRINCIPAL
// ==========================================
const App = () => {
  const { isAuthenticated, loading } = useAuthStore();

  // ==========================================
  // 🔧 INITIALISATION UNIQUE
  // ==========================================
  useEffect(() => {
    console.log('🚀 Initialisation App principale...');
    
    // Initialiser l'AuthStore une seule fois
    initializeAuthStore();
    
    // Initialiser userResolverService globalement
    if (typeof window !== 'undefined') {
      window.userResolverService = userResolverService;
      console.log('✅ UserResolverService disponible globalement');
    }
    
    console.log('✅ App initialisée');
  }, []);

  // ==========================================
  // 🔄 LOADING GLOBAL
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement de Synergia...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // 📱 SYSTÈME DE ROUTING PRINCIPAL
  // ==========================================
  return (
    <Router>
      <Routes>
        {/* 🔐 Page de connexion */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <Login />
          } 
        />

        {/* 🏠 Routes protégées avec Layout */}
        <Route 
          path="/*" 
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  {/* Dashboard par défaut */}
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  
                  {/* Pages principales */}
                  <Route path="/tasks" element={<TasksPage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/gamification" element={<GamificationPage />} />
                  <Route path="/team" element={<TeamPage />} />
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/rewards" element={<RewardsPage />} />
                  <Route path="/badges" element={<BadgesPage />} />
                  <Route path="/time-track" element={<TimeTrackPage />} />
                  
                  {/* Pages spéciales */}
                  <Route path="/onboarding" element={<OnboardingPage />} />
                  
                  {/* Pages admin */}
                  <Route path="/admin-tasks" element={<AdminTaskValidationPage />} />
                  <Route path="/admin-test" element={<CompleteAdminTestPage />} />
                  
                  {/* Route fallback */}
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;
