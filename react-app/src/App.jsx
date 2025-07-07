// ==========================================
// 📁 react-app/src/App.jsx
// VERSION ORIGINALE COMPLÈTE - RÉPARÉE
// ==========================================

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 🛡️ GESTIONNAIRE D'ERREUR GLOBAL - À IMPORTER EN PREMIER
import './utils/errorHandler.js';

// 🔐 Auth & Protection
import { useAuthStore } from './shared/stores/authStore.js';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import PublicRoute from './routes/PublicRoute.jsx';

// 🎨 Layout
import DashboardLayout from './layouts/DashboardLayout.jsx';

// ✅ PAGES PRINCIPALES
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import TasksPage from './pages/TasksPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';

// ✅ PAGES GAMIFICATION
import GamificationPage from './pages/GamificationPage.jsx';
import RewardsPage from './pages/RewardsPage.jsx';
import BadgesPage from './pages/BadgesPage.jsx';

// ✅ PAGES ÉQUIPE & SOCIAL
import UsersPage from './pages/UsersPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';

// ✅ PAGES OUTILS
import TimeTrackPage from './pages/TimeTrackPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

// ✅ PAGES ADMIN/TEST
import CompleteAdminTestPage from './pages/CompleteAdminTestPage.jsx';
import AdminProfileTestPage from './pages/AdminProfileTestPage.jsx';
import AdminTaskValidationPage from './pages/AdminTaskValidationPage.jsx';

/**
 * 🚀 APPLICATION PRINCIPALE AVEC PROTECTION D'ERREUR
 */
function App() {
  const { initializeAuth, isInitialized } = useAuthStore();

  useEffect(() => {
    console.log('🚀 SYNERGIA v3.5.3 - Initialisation avec protection d\'erreur');
    
    // Initialiser l'authentification
    initializeAuth();
    
    // Log que l'app est protégée contre les erreurs
    console.log('🛡️ Gestionnaire d\'erreur global actif');
    
  }, [initializeAuth]);

  // Affichage pendant l'initialisation
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold mb-2">Synergia</h2>
          <p className="text-blue-200">Initialisation sécurisée...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* 🌐 Route publique - Login */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          
          {/* 🏠 Redirection racine vers dashboard */}
          <Route 
            path="/" 
            element={<Navigate to="/dashboard" replace />} 
          />
          
          {/* 🔐 Routes protégées avec layout */}
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Routes>
                    {/* 📊 Pages principales */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/tasks" element={<TasksPage />} />
                    <Route path="/projects" element={<ProjectsPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    
                    {/* 🎮 Pages gamification */}
                    <Route path="/gamification" element={<GamificationPage />} />
                    <Route path="/rewards" element={<RewardsPage />} />
                    <Route path="/badges" element={<BadgesPage />} />
                    
                    {/* 👥 Pages équipe & social */}
                    <Route path="/users" element={<UsersPage />} />
                    <Route path="/onboarding" element={<OnboardingPage />} />
                    
                    {/* 🛠️ Pages outils */}
                    <Route path="/timetrack" element={<TimeTrackPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    
                    {/* 🔧 Pages admin & tests */}
                    <Route path="/admin/complete-test" element={<CompleteAdminTestPage />} />
                    <Route path="/admin/profile-test" element={<AdminProfileTestPage />} />
                    <Route path="/admin/task-validation" element={<AdminTaskValidationPage />} />
                    
                    {/* 🚫 Route par défaut */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
