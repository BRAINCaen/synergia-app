// ==========================================
// 📁 react-app/src/App.jsx
// FORCER L'UTILISATION DU LAYOUT AVEC MENU MOBILE
// ==========================================

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 🔧 FORCER L'UTILISATION DE MAINLAYOUT AVEC MENU MOBILE
import MainLayout from './layouts/MainLayout.jsx';

// Stores
import { useAuthStore, initializeAuthStore } from './shared/stores/authStore.js';

// Pages
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

// Pages admin
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
          <p className="text-white">Chargement de Synergia...</p>
          <p className="text-gray-400 text-sm mt-2">Version v3.5.3</p>
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
// 🚀 APPLICATION PRINCIPALE
// ==========================================
const App = () => {
  useEffect(() => {
    console.log('🚀 [APP] Initialisation Synergia v3.5.3 avec MainLayout');
    initializeAuthStore();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Routes>
          {/* Route de connexion - SANS Layout */}
          <Route path="/login" element={<Login />} />
          
          {/* Toutes les autres routes - AVEC MainLayout qui a le menu mobile */}
          <Route path="/*" element={
            <ProtectedRoute>
              <MainLayout>
                <Routes>
                  {/* Routes principales */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/tasks" element={<TasksPage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/gamification" element={<GamificationPage />} />
                  <Route path="/team" element={<TeamPage />} />
                  
                  {/* Routes utilisateurs */}
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  
                  {/* Routes outils */}
                  <Route path="/onboarding" element={<OnboardingPage />} />
                  <Route path="/timetrack" element={<TimeTrackPage />} />
                  <Route path="/rewards" element={<RewardsPage />} />
                  <Route path="/badges" element={<BadgesPage />} />
                  
                  {/* Routes admin */}
                  <Route path="/admin/task-validation" element={<AdminTaskValidationPage />} />
                  <Route path="/admin/complete-test" element={<CompleteAdminTestPage />} />
                  
                  {/* Route par défaut */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  
                  {/* Page 404 */}
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
              </MainLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

// Log de confirmation
console.log('✅ App.jsx configuré pour utiliser MainLayout avec menu mobile');
console.log('📱 Bouton hamburger disponible sur mobile');
console.log('🎯 Routes configurées avec navigation complète');
