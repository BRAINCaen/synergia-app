// ==========================================
// 📁 react-app/src/App.jsx
// App.jsx COMPLET avec TOUTES LES ROUTES (navigation fixée)
// ==========================================

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './shared/stores';

// Pages principales
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NotFound from './pages/NotFound.jsx';

// Toutes les pages existantes
import TasksPage from './pages/TasksPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import UsersPage from './pages/UsersPage.jsx';

// NOUVELLES PAGES AJOUTÉES
import TeamPage from './pages/TeamPage.jsx';
import TimeTrackPage from './pages/TimeTrackPage.jsx';
import RewardsPage from './pages/RewardsPage.jsx';

// Layout
import DashboardLayout from './layouts/DashboardLayout.jsx';

/**
 * 🔄 COMPOSANT LOADING SIMPLE
 */
const LoadingScreen = ({ message = "Chargement Synergia" }) => {
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-cyan-600">
      <div className="text-center text-white">
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
        <h2 className="text-2xl font-bold mb-2">{message}</h2>
        <p className="text-white/80">v3.5.4 - Navigation Réparée</p>
      </div>
    </div>
  );
};

/**
 * 🛡️ PROTECTED ROUTE AVEC LAYOUT
 */
const ProtectedRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuthStore();
  
  if (loading) {
    return <LoadingScreen message="Vérification authentification" />;
  }
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
};

/**
 * 🚀 COMPOSANT PRINCIPAL APP AVEC TOUTES LES ROUTES
 */
function App() {
  const { user, isAuthenticated, loading, initializeAuth } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    console.log('🚀 SYNERGIA v3.5.4 - NAVIGATION RÉPARÉE');
    
    const initialize = async () => {
      try {
        const unsubscribe = initializeAuth();
        setIsInitialized(true);
        console.log('✅ App initialisée avec TOUTES les routes de navigation');
        return unsubscribe;
      } catch (error) {
        console.error('❌ Erreur initialisation:', error);
        setIsInitialized(true);
      }
    };

    initialize();
  }, [initializeAuth]);

  if (!isInitialized || loading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <div className="App">
        {/* Banner de succès */}
        <div className="bg-blue-600 text-white p-2 text-center text-sm font-medium">
          ✅ SYNERGIA v3.5.4 RÉPARÉ | Navigation complète + Édition fonctionnelle
        </div>
        
        <Routes>
          {/* Route publique */}
          <Route 
            path="/login" 
            element={
              !isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />
            } 
          />
          
          {/* Routes protégées avec layout */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
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
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
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
          
          <Route 
            path="/leaderboard" 
            element={
              <ProtectedRoute>
                <LeaderboardPage />
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

          {/* ✅ NOUVELLES ROUTES AJOUTÉES POUR FIXER LA NAVIGATION */}
          <Route 
            path="/team" 
            element={
              <ProtectedRoute>
                <TeamPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/timetrack" 
            element={
              <ProtectedRoute>
                <TimeTrackPage />
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
          
          {/* Redirection par défaut */}
          <Route 
            path="/" 
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
          />
          
          {/* Page 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
