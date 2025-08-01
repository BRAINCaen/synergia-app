// ==========================================
// 📁 react-app/src/App.jsx
// APPLICATION PRINCIPALE - ÉTAT DE FONCTIONNEMENT TOTAL
// ==========================================

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout principal
import DashboardLayout from './layouts/DashboardLayout.jsx';

// Pages principales - TOUTES IMPORTÉES
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import TasksPage from './pages/TasksPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import Analytics from './pages/Analytics.jsx';
import GamificationPage from './pages/GamificationPage.jsx';
import TeamPage from './pages/TeamPage.jsx';
import NotFound from './pages/NotFound.jsx';

// Pages additionnelles existantes
import BadgesPage from './pages/BadgesPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import TimeTrackPage from './pages/TimeTrackPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import RewardsPage from './pages/RewardsPage.jsx';

// Pages Admin
import AdminTaskValidationPage from './pages/AdminTaskValidationPage.jsx';
import CompleteAdminTestPage from './pages/CompleteAdminTestPage.jsx';

// Composants fallback (si certaines pages n'existent pas)
import TaskList from './modules/tasks/TaskList.jsx';
import BadgeCollection from './components/gamification/BadgeCollection.jsx';
import Leaderboard from './components/gamification/Leaderboard.jsx';
import Profile from './modules/profile/components/Profile.jsx';

// Store d'authentification
import { useAuthStore } from './shared/stores/authStore.js';

/**
 * 🔐 COMPOSANT DE PROTECTION DES ROUTES
 */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <h2 className="text-white text-lg font-semibold">
            🔄 Chargement...
          </h2>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}

/**
 * 🌟 COMPOSANT FALLBACK POUR PAGES MANQUANTES
 */
function FallbackPage({ pageName, description, fallbackComponent: FallbackComponent }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="text-6xl mb-4">🚧</div>
        <h1 className="text-3xl font-bold text-gray-900">
          {pageName}
        </h1>
        <p className="text-gray-600 text-lg">
          {description}
        </p>
        
        {FallbackComponent && (
          <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Composant de démonstration :
            </h3>
            <FallbackComponent />
          </div>
        )}
        
        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            🏠 Retour au Dashboard
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            🔄 Actualiser
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 🎯 COMPOSANT PRINCIPAL DE L'APPLICATION
 */
function App() {
  const { user, initializeAuth } = useAuthStore();
  const [appReady, setAppReady] = useState(false);
  
  useEffect(() => {
    // Initialisation de l'application
    console.log('🚀 [APP] Synergia v3.5 - Initialisation...');
    
    // Initialiser l'auth store
    const cleanup = initializeAuth();
    
    // Marquer l'app comme prête
    setTimeout(() => {
      setAppReady(true);
      console.log('✅ [APP] Application prête');
    }, 500);
    
    return cleanup;
  }, [initializeAuth]);
  
  if (!appReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-pulse">
            <h1 className="text-4xl font-bold text-white mb-2">
              🚀 Synergia v3.5
            </h1>
            <p className="text-indigo-200">
              Initialisation de l'application...
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Route publique : Login */}
          <Route 
            path="/login" 
            element={
              user ? <Navigate to="/dashboard" replace /> : <Login />
            } 
          />
          
          {/* ================================
              ROUTES PRINCIPALES PROTÉGÉES 
              ================================ */}
          
          {/* Dashboard */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Tâches */}
          <Route 
            path="/tasks" 
            element={
              <ProtectedRoute>
                <TasksPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Projets */}
          <Route 
            path="/projects" 
            element={
              <ProtectedRoute>
                <ProjectsPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Analytics */}
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } 
          />
          
          {/* ================================
              ROUTES GAMIFICATION
              ================================ */}
          
          {/* Gamification principale */}
          <Route 
            path="/gamification" 
            element={
              <ProtectedRoute>
                <GamificationPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Badges */}
          <Route 
            path="/badges" 
            element={
              <ProtectedRoute>
                <BadgesPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Classement/Leaderboard */}
          <Route 
            path="/leaderboard" 
            element={
              <ProtectedRoute>
                <FallbackPage 
                  pageName="🥇 Classement" 
                  description="Classement de l'équipe avec scores et performances"
                  fallbackComponent={Leaderboard}
                />
              </ProtectedRoute>
            } 
          />
          
          {/* Récompenses */}
          <Route 
            path="/rewards" 
            element={
              <ProtectedRoute>
                <RewardsPage />
              </ProtectedRoute>
            } 
          />
          
          {/* ================================
              ROUTES ÉQUIPE & SOCIAL
              ================================ */}
          
          {/* Équipe */}
          <Route 
            path="/team" 
            element={
              <ProtectedRoute>
                <TeamPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Utilisateurs */}
          <Route 
            path="/users" 
            element={
              <ProtectedRoute>
                <UsersPage />
              </ProtectedRoute>
            } 
          />
          
          {/* ================================
              ROUTES OUTILS & PARAMÈTRES
              ================================ */}
          
          {/* Onboarding */}
          <Route 
            path="/onboarding" 
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Time Tracking */}
          <Route 
            path="/timetrack" 
            element={
              <ProtectedRoute>
                <TimeTrackPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Profil */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          
          {/* Paramètres */}
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } 
          />
          
          {/* ================================
              ROUTES ADMIN
              ================================ */}
          
          {/* Validation des tâches */}
          <Route 
            path="/admin/task-validation" 
            element={
              <ProtectedRoute>
                <AdminTaskValidationPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Test complet admin */}
          <Route 
            path="/admin/complete-test" 
            element={
              <ProtectedRoute>
                <CompleteAdminTestPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Test profil admin */}
          <Route 
            path="/admin/profile-test" 
            element={
              <ProtectedRoute>
                <FallbackPage 
                  pageName="🧪 Test Profil Admin" 
                  description="Tests et validation des profils utilisateurs"
                  fallbackComponent={Profile}
                />
              </ProtectedRoute>
            } 
          />
          
          {/* ================================
              ROUTES FALLBACK & COMPATIBILITÉ
              ================================ */}
          
          {/* Ancienne route tasks-list */}
          <Route 
            path="/tasks-list" 
            element={
              <ProtectedRoute>
                <FallbackPage 
                  pageName="📋 Liste des Tâches" 
                  description="Interface de gestion des tâches"
                  fallbackComponent={TaskList}
                />
              </ProtectedRoute>
            } 
          />
          
          {/* Ancienne route badge-collection */}
          <Route 
            path="/badge-collection" 
            element={
              <ProtectedRoute>
                <FallbackPage 
                  pageName="🏆 Collection de Badges" 
                  description="Vos badges et accomplissements"
                  fallbackComponent={BadgeCollection}
                />
              </ProtectedRoute>
            } 
          />
          
          {/* ================================
              REDIRECTIONS & 404
              ================================ */}
          
          {/* Redirection racine */}
          <Route 
            path="/" 
            element={<Navigate to="/dashboard" replace />} 
          />
          
          {/* Page 404 */}
          <Route 
            path="*" 
            element={<NotFound />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
