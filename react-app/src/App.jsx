// ==========================================
// 📁 react-app/src/App.jsx
// APPLICATION PRINCIPALE COMPLÈTE - FICHIER CORRIGÉ
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

// Component de chargement simple
const LoadingScreen = ({ message }) => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-400">{message || 'Chargement...'}</p>
    </div>
  </div>
);

// 🚨 AUTH NUCLEAR GARDÉ (version stable)
const useNuclearAuth = () => {
  const { user, loading, signOut, initializeAuth } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeAuth();
        setIsInitialized(true);
      } catch (error) {
        console.error('❌ Erreur initialisation auth:', error);
        setIsInitialized(true);
      }
    };
    init();
  }, [initializeAuth]);

  return { user, loading: loading || !isInitialized, signOut };
};

// Route protégée
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useNuclearAuth();
  
  if (loading) {
    return <LoadingScreen message="Vérification de l'authentification..." />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Route publique (redirection si connecté)
const PublicRoute = ({ children }) => {
  const { user, loading } = useNuclearAuth();
  
  if (loading) {
    return <LoadingScreen message="Vérification de l'authentification..." />;
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

/**
 * 🚀 APPLICATION PRINCIPALE
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
