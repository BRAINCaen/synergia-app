// ==========================================
// 📁 react-app/src/App.jsx
// VERSION BUILD COMPATIBLE - SANS IMPORTS MANQUANTS
// ==========================================

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout principal
import DashboardLayout from './layouts/DashboardLayout.jsx';

// Pages principales - SEULEMENT CELLES QUI EXISTENT
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import TasksPage from './pages/TasksPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import GamificationPage from './pages/GamificationPage.jsx';
import TeamPage from './pages/TeamPage.jsx';

// Pages additionnelles qui existent (selon la recherche)
import ProfilePage from './pages/ProfilePage.jsx';

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
 * 🌟 COMPOSANT FALLBACK POUR PAGES EN CONSTRUCTION
 */
function PageInConstruction({ pageName, description, icon = "🚧" }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="text-6xl mb-4">{icon}</div>
        <h1 className="text-3xl font-bold text-gray-900">
          {pageName}
        </h1>
        <p className="text-gray-600 text-lg">
          {description}
        </p>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            🎮 Cette page sera bientôt disponible !
          </h3>
          <div className="text-gray-600 space-y-2">
            <p>✨ Interface moderne et intuitive</p>
            <p>🔥 Fonctionnalités avancées</p>
            <p>📊 Données temps réel</p>
            <p>🎯 Système de gamification intégré</p>
          </div>
        </div>
        
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
                <AnalyticsPage />
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
                <PageInConstruction 
                  pageName="🏆 Badges" 
                  description="Collection de vos accomplissements et badges"
                  icon="🏆"
                />
              </ProtectedRoute>
            } 
          />
          
          {/* Classement/Leaderboard */}
          <Route 
            path="/leaderboard" 
            element={
              <ProtectedRoute>
                <PageInConstruction 
                  pageName="🥇 Classement" 
                  description="Classement de l'équipe avec scores et performances"
                  icon="🥇"
                />
              </ProtectedRoute>
            } 
          />
          
          {/* Récompenses */}
          <Route 
            path="/rewards" 
            element={
              <ProtectedRoute>
                <PageInConstruction 
                  pageName="🎁 Récompenses" 
                  description="Boutique de récompenses et échanges XP"
                  icon="🎁"
                />
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
                <PageInConstruction 
                  pageName="👥 Utilisateurs" 
                  description="Gestion des membres de l'équipe"
                  icon="👥"
                />
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
                <PageInConstruction 
                  pageName="🎯 Intégration" 
                  description="Processus d'intégration et formation"
                  icon="🎯"
                />
              </ProtectedRoute>
            } 
          />
          
          {/* Time Tracking */}
          <Route 
            path="/timetrack" 
            element={
              <ProtectedRoute>
                <PageInConstruction 
                  pageName="⏰ Suivi du Temps" 
                  description="Suivi du temps de travail et productivité"
                  icon="⏰"
                />
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
                <PageInConstruction 
                  pageName="⚙️ Paramètres" 
                  description="Configuration et préférences utilisateur"
                  icon="⚙️"
                />
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
                <PageInConstruction 
                  pageName="🛡️ Validation Tâches" 
                  description="Interface admin pour valider les tâches"
                  icon="🛡️"
                />
              </ProtectedRoute>
            } 
          />
          
          {/* Test complet admin */}
          <Route 
            path="/admin/complete-test" 
            element={
              <ProtectedRoute>
                <PageInConstruction 
                  pageName="🧪 Test Complet" 
                  description="Tests et diagnostics système"
                  icon="🧪"
                />
              </ProtectedRoute>
            } 
          />
          
          {/* Test profil admin */}
          <Route 
            path="/admin/profile-test" 
            element={
              <ProtectedRoute>
                <PageInConstruction 
                  pageName="🧪 Test Profil Admin" 
                  description="Tests et validation des profils utilisateurs"
                  icon="🔬"
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
            element={
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
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
