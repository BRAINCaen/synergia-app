// ==========================================
// 📁 react-app/src/App.jsx
// App.jsx avec SYNCHRONISATION GLOBALE AUTOMATIQUE
// Firebase = Source unique de vérité pour TOUS les utilisateurs
// ==========================================

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './shared/stores';

// 🌐 COMPOSANTS DE SYNCHRONISATION GLOBALE
import GlobalSyncInitializer from './components/core/GlobalSyncInitializer.jsx';

// Pages principales
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NotFound from './pages/NotFound.jsx';

// 🚀 TOUTES LES 17 PAGES EXISTANTES
import TasksPage from './pages/TasksPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import TeamPage from './pages/TeamPage.jsx';
import BadgesPage from './pages/BadgesPage.jsx';
import GamificationPage from './pages/GamificationPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import RewardsPage from './pages/RewardsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import TimeTrackPage from './pages/TimeTrackPage.jsx';
import TestDashboard from './pages/TestDashboard.jsx';

// Layout
import DashboardLayout from './layouts/DashboardLayout.jsx';

/**
 * 🔄 COMPOSANT LOADING AVEC SYNC
 */
const LoadingScreen = ({ message = "Chargement Synergia", showSync = false }) => {
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-cyan-600">
      <div className="text-center text-white">
        <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
        </div>
        <h2 className="text-3xl font-bold mb-3">{message}</h2>
        <p className="text-white/80 text-lg">v3.5 Ultimate - Synchronisation Firebase</p>
        
        {showSync && (
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span>Synchronisation automatique en cours...</span>
            </div>
            <div className="text-xs text-white/60">
              Uniformisation des données pour tous les utilisateurs
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 🛡️ PROTECTED ROUTE AVEC SYNC GLOBAL
 */
const ProtectedRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuthStore();
  
  if (loading) {
    return <LoadingScreen message="Vérification authentification" showSync={true} />;
  }
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <GlobalSyncInitializer>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </GlobalSyncInitializer>
  );
};

/**
 * 🚀 COMPOSANT APP PRINCIPAL AVEC SYNC GLOBAL
 */
function App() {
  const { initializeAuth, loading: authLoading } = useAuthStore();
  const [appInitialized, setAppInitialized] = useState(false);

  // ✅ INITIALISATION DE L'AUTHENTIFICATION
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Initialisation Synergia v3.5 avec synchronisation globale...');
        
        // Initialiser l'authentification
        await initializeAuth();
        
        // Marquer l'app comme initialisée
        setAppInitialized(true);
        
        console.log('✅ Synergia v3.5 initialisé - Synchronisation globale activée');
        
      } catch (error) {
        console.error('❌ Erreur initialisation app:', error);
        setAppInitialized(true); // Continuer même en cas d'erreur
      }
    };

    initializeApp();
  }, [initializeAuth]);

  // Affichage du loading pendant l'initialisation
  if (!appInitialized || authLoading) {
    return <LoadingScreen message="Initialisation Synergia" showSync={true} />;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* 🔓 Route publique */}
          <Route path="/login" element={<Login />} />
          
          {/* 🛡️ Routes protégées avec synchronisation globale automatique */}
          <Route path="/" element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          } />
          
          {/* 📊 Pages principales avec sync global */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/tasks" element={
            <ProtectedRoute>
              <TasksPage />
            </ProtectedRoute>
          } />
          
          <Route path="/projects" element={
            <ProtectedRoute>
              <ProjectsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/analytics" element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          } />

          {/* 🎮 Pages gamification avec sync global */}
          <Route path="/gamification" element={
            <ProtectedRoute>
              <GamificationPage />
            </ProtectedRoute>
          } />
          
          <Route path="/rewards" element={
            <ProtectedRoute>
              <RewardsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/badges" element={
            <ProtectedRoute>
              <BadgesPage />
            </ProtectedRoute>
          } />
          
          <Route path="/leaderboard" element={
            <ProtectedRoute>
              <LeaderboardPage />
            </ProtectedRoute>
          } />

          {/* 👥 Pages collaboration avec sync global */}
          <Route path="/users" element={
            <ProtectedRoute>
              <UsersPage />
            </ProtectedRoute>
          } />
          
          <Route path="/team" element={
            <ProtectedRoute>
              <TeamPage />
            </ProtectedRoute>
          } />
          
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          } />

          {/* ⚙️ Pages outils avec sync global */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/timetrack" element={
            <ProtectedRoute>
              <TimeTrackPage />
            </ProtectedRoute>
          } />

          {/* 🧪 Pages de test avec sync global */}
          <Route path="/test-dashboard" element={
            <ProtectedRoute>
              <TestDashboard />
            </ProtectedRoute>
          } />

          {/* 🚫 Page 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

// 🚀 LOG DE CHARGEMENT AVEC SYNC GLOBAL
console.log('🌐 App Synergia v3.5 chargé avec synchronisation globale automatique');
console.log('🎯 17 pages disponibles + Firebase sync + Auto-correction');
console.log('📡 TOUS les utilisateurs synchronisés automatiquement');
console.log('✨ Firebase = Source unique de vérité pour toute l\'application');
