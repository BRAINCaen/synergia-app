// ==========================================
// 📁 react-app/src/App.jsx
// VERSION FINALE - TOUS LES CHEMINS D'IMPORTS CORRIGÉS
// ==========================================

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// ✅ CORRECTION CRITIQUE - Import authStore avec le bon chemin
import { useAuthStore } from './shared/stores/authStore.js';

// ✅ CORRECTION CRITIQUE - Import DashboardLayout avec le bon chemin
import DashboardLayout from './layouts/DashboardLayout.jsx';

// 📄 Import page de login
import Login from './pages/Login.jsx';

// 📄 Pages principales - TOUS LES CHEMINS VÉRIFIÉS
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

// ✅ LOADING SIMPLE ET EFFICACE
const LoadingScreen = ({ message = 'Chargement...' }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
      <p className="text-white text-lg font-medium">{message}</p>
      <div className="mt-4 text-blue-200 text-sm">Synergia v3.5 - Stable</div>
    </div>
  </div>
);

// ✅ PROTECTION DES ROUTES SIMPLIFIÉE
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return <LoadingScreen message="Vérification de l'authentification..." />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// 🚀 COMPOSANT APP FINAL CORRIGÉ
const App = () => {
  const { user, loading, initializeAuth } = useAuthStore();

  // ✅ INITIALISATION SIMPLE AU DÉMARRAGE
  useEffect(() => {
    console.log('🚀 Démarrage de Synergia v3.5...');
    
    // Initialiser l'auth Firebase
    initializeAuth();
    
    console.log('✅ Initialisation lancée');
  }, []);

  // ✅ CONDITION SIMPLIFIÉE - Seulement authStore.loading
  if (loading) {
    return <LoadingScreen message="Démarrage de Synergia..." />;
  }

  return (
    <Router>
      <Routes>
        {/* ✅ Route de connexion */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
        />
        
        {/* ✅ Routes protégées avec DashboardLayout */}
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          {/* Redirection par défaut */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          {/* 📊 Pages principales */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          
          {/* 🎮 Gamification */}
          <Route path="gamification" element={<GamificationPage />} />
          <Route path="badges" element={<BadgesPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="rewards" element={<RewardsPage />} />
          
          {/* 👥 Équipe & Social */}
          <Route path="team" element={<TeamPage />} />
          <Route path="users" element={<UsersPage />} />
          
          {/* ⚙️ Profil & Paramètres */}
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="onboarding" element={<OnboardingPage />} />
          <Route path="timetrack" element={<TimeTrackPage />} />
          
          {/* 🛡️ Routes Admin */}
          <Route path="admin/task-validation" element={<AdminTaskValidationPage />} />
          <Route path="admin/complete-test" element={<CompleteAdminTestPage />} />
        </Route>
        
        {/* ✅ Route de fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default App;

console.log('✅ App.jsx FINAL - Tous les chemins d\'imports corrigés !');
console.log('🎯 authStore: ./shared/stores/authStore.js');
console.log('🎯 DashboardLayout: ./layouts/DashboardLayout.jsx');
console.log('🎯 Pages: ./pages/[PageName].jsx');
