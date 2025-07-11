// ==========================================
// 📁 react-app/src/App.jsx
// APPLICATION PRINCIPALE - BOUCLE INFINIE CORRIGÉE
// ==========================================

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 🎯 Imports existants
import { useAuthStore } from './shared/stores/authStore.js';
import Layout from './components/layout/Layout.jsx';
import Login from './pages/Login.jsx';

// 📄 Pages principales
import Dashboard from './pages/Dashboard.jsx';
import TasksPage from './pages/TasksPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import GamificationPage from './pages/GamificationPage.jsx';

// 🎮 Pages gamification
import BadgesPage from './pages/BadgesPage.jsx';
import RewardsPage from './pages/RewardsPage.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';

// 👥 Pages équipe  
import TeamPage from './pages/TeamPage.jsx';
import UsersPage from './pages/UsersPage.jsx';

// ⚙️ Pages utilisateur
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import TimeTrackPage from './pages/TimeTrackPage.jsx';

// 🛡️ Pages admin
import AdminTaskValidationPage from './pages/AdminTaskValidationPage.jsx';
import CompleteAdminTestPage from './pages/CompleteAdminTestPage.jsx';

// Component de chargement simple et efficace
const LoadingScreen = ({ message }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-2xl mb-6">
        ⚡
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">Synergia</h1>
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600 mx-auto mb-4"></div>
      <p className="text-blue-200">{message || 'Chargement...'}</p>
    </div>
  </div>
);

// 🔧 HOOK AUTH CORRIGÉ - Plus de boucle infinie !
const useAuthState = () => {
  const { user, loading } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // ✅ CORRECTION : Pas d'appel à initializeAuth qui n'existe pas
    // On attend juste que loading devienne false
    if (!loading) {
      setIsInitialized(true);
    }
  }, [loading]);

  return { 
    user, 
    loading: loading || !isInitialized
  };
};

// Route protégée - VERSION CORRIGÉE
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthState();
  
  if (loading) {
    return <LoadingScreen message="Vérification de l'authentification..." />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Route publique - VERSION CORRIGÉE
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuthState();
  
  if (loading) {
    return <LoadingScreen message="Vérification de l'authentification..." />;
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

/**
 * 🚀 APPLICATION PRINCIPALE - CORRIGÉE
 */
const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* 🔐 Route de connexion */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* 🏠 Pages protégées avec Layout */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    {/* 📊 Pages principales */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/tasks" element={<TasksPage />} />
                    <Route path="/projects" element={<ProjectsPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    
                    {/* 🎮 Gamification */}
                    <Route path="/gamification" element={<GamificationPage />} />
                    <Route path="/badges" element={<BadgesPage />} />
                    <Route path="/rewards" element={<RewardsPage />} />
                    <Route path="/leaderboard" element={<LeaderboardPage />} />
                    
                    {/* 👥 Équipe */}
                    <Route path="/team" element={<TeamPage />} />
                    <Route path="/users" element={<UsersPage />} />
                    
                    {/* ⚙️ Utilisateur */}
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/onboarding" element={<OnboardingPage />} />
                    <Route path="/time-track" element={<TimeTrackPage />} />
                    
                    {/* 🛡️ Admin */}
                    <Route path="/admin/tasks" element={<AdminTaskValidationPage />} />
                    <Route path="/admin/test" element={<CompleteAdminTestPage />} />
                    
                    {/* 🔀 Redirections */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
