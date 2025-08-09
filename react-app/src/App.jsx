// ==========================================
// 📁 react-app/src/App.jsx
// CORRECTION DES ROUTES ADMIN - VERSION CORRIGÉE
// ==========================================

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 🔧 RETOUR AU LAYOUT ORIGINAL QUI FONCTIONNAIT
import Layout from './components/layout/Layout.jsx';

// Stores (version stable)
import { useAuthStore, initializeAuthStore } from './shared/stores/authStore.js';

// Import des correctifs - ORDRE CRITIQUE !
import './utils/ultimateProductionPatch.js'; // DOIT ÊTRE EN PREMIER
import './utils/safeFix.js';
import './utils/productionErrorPatch.js';

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
// 🛡️ PAGES ADMIN EXISTANTES - CORRECTION IMPORTS
// ==========================================
import AdminTaskValidationPage from './pages/AdminTaskValidationPage.jsx';
import CompleteAdminTestPage from './pages/CompleteAdminTestPage.jsx';
import AdminRolePermissionsPage from './pages/AdminRolePermissionsPage.jsx';
import AdminUsersPage from './pages/AdminUsersPage.jsx';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage.jsx';
import AdminSettingsPage from './pages/AdminSettingsPage.jsx';

// ==========================================
// 🛡️ ROUTE PROTECTION COMPONENT
// ==========================================
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
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
// 🚀 APP COMPONENT PRINCIPAL
// ==========================================
function App() {
  const { user, loading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Synergia</h2>
          <p className="text-gray-400">Initialisation...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Route publique */}
          <Route path="/login" element={<Login />} />
          
          {/* Routes protégées avec layout */}
          <Route path="/*" element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  {/* ✅ ROUTES PRINCIPALES */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/tasks" element={<TasksPage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/gamification" element={<GamificationPage />} />
                  <Route path="/team" element={<TeamPage />} />
                  
                  {/* ✅ ROUTES UTILISATEURS ET OUTILS */}
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/onboarding" element={<OnboardingPage />} />
                  <Route path="/timetrack" element={<TimeTrackPage />} />
                  <Route path="/rewards" element={<RewardsPage />} />
                  <Route path="/badges" element={<BadgesPage />} />
                  
                  {/* ✅ ROUTES GAMIFICATION */}
                  <Route path="/leaderboard" element={<GamificationPage />} />
                  <Route path="/role-progression" element={<RoleProgressionPage />} />
                  
                  {/* 🛡️ ROUTES ADMIN - CORRECTION APPLIQUÉE */}
                  <Route path="/admin/task-validation" element={<AdminTaskValidationPage />} />
                  <Route path="/admin/complete-test" element={<CompleteAdminTestPage />} />
                  
                  {/* ✅ NOUVELLES ROUTES ADMIN CORRIGÉES */}
                  <Route path="/admin/role-permissions" element={<AdminRolePermissionsPage />} />
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                  <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
                  <Route path="/admin/settings" element={<AdminSettingsPage />} />
                  
                  {/* Route par défaut */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  
                  {/* 404 */}
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
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
