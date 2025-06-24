// ==========================================
// 📁 react-app/src/App.jsx
// Application principale avec système de badges automatiques
// ==========================================

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Pages
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import TasksPage from './pages/TasksPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import UsersPage from './pages/UsersPage.jsx';

// Layout et composants
import Layout from './components/layout/Layout.jsx';
import LoadingSpinner from './components/ui/LoadingSpinner.jsx';
import BadgeNotification from './components/gamification/BadgeNotification.jsx';

// Hooks et stores
import { useAuthStore } from './shared/stores/authStore.js';
import { useRealTimeUser } from './hooks/useRealTimeUser.js';

// Services
import BadgeIntegrationService from './core/services/badgeIntegrationService.js';

/**
 * 🚀 COMPOSANT PRINCIPAL APPLICATION
 * 
 * Architecture centralisée avec :
 * - Routing complet 7 pages
 * - Système d'authentification Firebase
 * - Gamification temps réel
 * - Système de badges automatiques
 * - Notifications et toast
 */
function App() {
  const { user, loading, initializeAuth } = useAuthStore();

  // Hook temps réel pour synchronisation données utilisateur
  useRealTimeUser(user?.uid);

  // Initialisation de l'application
  useEffect(() => {
    console.log('🚀 App: Initialisation démarrée');
    
    // Initialiser l'authentification
    initializeAuth();

    // Initialiser le service de badges
    BadgeIntegrationService.init();

    // Nettoyage au démontage
    return () => {
      BadgeIntegrationService.cleanup();
    };
  }, [initializeAuth]);

  // Synchronisation badges quand l'utilisateur se connecte
  useEffect(() => {
    if (user?.uid) {
      console.log('👤 Utilisateur connecté, synchronisation badges:', user.email);
      
      // Déclencher une vérification initiale des badges
      setTimeout(() => {
        BadgeIntegrationService.checkBadgesForUser(user.uid);
      }, 2000); // Attendre 2s que les données soient chargées
    }
  }, [user?.uid]);

  // État de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <div className="mt-4 text-white text-lg">
            Chargement de Synergia...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Router>
        <Routes>
          {/* Route publique - Login */}
          <Route 
            path="/login" 
            element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />} 
          />

          {/* Routes protégées avec Layout */}
          <Route path="/*" element={
            user ? (
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/tasks" element={<TasksPage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/leaderboard" element={<LeaderboardPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/users" element={<UsersPage />} />
                  
                  {/* Redirection par défaut */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } />
        </Routes>
      </Router>

      {/* Système de notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #374151',
            borderRadius: '0.75rem',
            fontSize: '14px',
            maxWidth: '400px'
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff'
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff'
            }
          }
        }}
      />

      {/* Notifications de badges (overlay global) */}
      <BadgeNotification />

      {/* Indicateur de développement */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-blue-600 text-white text-xs px-3 py-1 rounded-full opacity-50 z-40">
          🔧 DEV MODE
        </div>
      )}
    </div>
  );
}

export default App;
