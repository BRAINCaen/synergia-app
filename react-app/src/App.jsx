// ==========================================
// 📁 react-app/src/App.jsx  
// SOLUTION D'URGENCE - TIMEOUT DE CHARGEMENT
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

// Component de chargement amélioré
const LoadingScreen = ({ message, showTimeout = false }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-2xl mb-6">
        ⚡
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">Synergia</h1>
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600 mx-auto mb-4"></div>
      <p className="text-blue-200 mb-4">{message || 'Chargement...'}</p>
      
      {showTimeout && (
        <div className="mt-6 space-y-3">
          <p className="text-yellow-300 text-sm">Le chargement prend plus de temps que prévu...</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Forcer la redirection
          </button>
        </div>
      )}
    </div>
  </div>
);

// 🔧 HOOK AUTH AVEC TIMEOUT DE SÉCURITÉ
const useAuthWithTimeout = () => {
  const { user, loading } = useAuthStore();
  const [showTimeout, setShowTimeout] = useState(false);
  const [forceLoaded, setForceLoaded] = useState(false);

  useEffect(() => {
    // Timeout de sécurité après 5 secondes
    const timeoutId = setTimeout(() => {
      if (loading && !user) {
        console.log('⏰ Timeout de chargement atteint - Force le passage');
        setShowTimeout(true);
        
        // Force le loading à false après 8 secondes
        setTimeout(() => {
          setForceLoaded(true);
        }, 3000);
      }
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [loading, user]);

  // Si force loaded, on considère que l'auth est terminée
  const finalLoading = forceLoaded ? false : loading;
  
  return { 
    user, 
    loading: finalLoading,
    showTimeout 
  };
};

// Route protégée avec timeout
const ProtectedRoute = ({ children }) => {
  const { user, loading, showTimeout } = useAuthWithTimeout();
  
  if (loading) {
    return (
      <LoadingScreen 
        message="Vérification de l'authentification..." 
        showTimeout={showTimeout}
      />
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Route publique avec timeout
const PublicRoute = ({ children }) => {
  const { user, loading, showTimeout } = useAuthWithTimeout();
  
  if (loading) {
    return (
      <LoadingScreen 
        message="Initialisation de l'application..." 
        showTimeout={showTimeout}
      />
    );
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

/**
 * 🚀 APPLICATION PRINCIPALE AVEC TIMEOUT DE SÉCURITÉ
 */
const App = () => {
  // Log de debug au démarrage
  useEffect(() => {
    console.log('🚀 App.jsx - Démarrage de l\'application');
    console.log('🔍 AuthStore state:', useAuthStore.getState());
    
    // Debug supplémentaire après 3 secondes
    setTimeout(() => {
      console.log('🔍 AuthStore state après 3s:', useAuthStore.getState());
    }, 3000);
  }, []);

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
