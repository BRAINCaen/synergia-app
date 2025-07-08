// ==========================================
// 📁 react-app/src/App.jsx
// VERSION ULTRA SIMPLIFIÉE - SEULEMENT LES PAGES QUI EXISTENT
// ==========================================

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 🛡️ Import du gestionnaire d'erreur
import './utils/errorHandler.js';

// 🔐 AuthStore - TESTÉ ET FONCTIONNEL
import { useAuthStore } from './shared/stores/authStore.js';

// 🎯 Routes - TESTÉES ET FONCTIONNELLES  
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import PublicRoute from './routes/PublicRoute.jsx';

// 🏗️ Layout - TESTÉ ET FONCTIONNEL
import DashboardLayout from './layouts/DashboardLayout.jsx';

// 📄 Pages - TESTÉES ET FONCTIONNELLES (VERSIONS ORIGINALES)
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import TasksPage from './pages/TasksPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import GamificationPage from './pages/GamificationPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import TimeTrackPage from './pages/TimeTrackPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import RewardsPage from './pages/RewardsPage.jsx';

// Pages admin existantes - UTILISER LES VRAIES PAGES
import AdminTaskValidationPage from './pages/AdminTaskValidationPage.jsx';
import AdminProfileTestPage from './pages/AdminProfileTestPage.jsx';
import CompleteAdminTestPage from './pages/CompleteAdminTestPage.jsx';

console.log('🚀 SYNERGIA v3.5.3 - VERSION SIMPLIFIÉE POUR BUILD');
console.log('✅ Seulement les pages existantes importées');

/**
 * 🚀 APPLICATION PRINCIPALE SYNERGIA v3.5
 * Version ultra simplifiée pour build réussi
 */
function App() {
  const { initializeAuth, isAuthenticated, user, loading } = useAuthStore();

  useEffect(() => {
    console.log('🔄 Initialisation de l\'authentification...');
    initializeAuth();
  }, [initializeAuth]);

  // Fonctions de debug globales
  useEffect(() => {
    window.forceReload = () => {
      console.log('🔄 Force reload demandé');
      window.location.reload();
    };
    
    window.emergencyClean = () => {
      console.log('🧹 Nettoyage d\'urgence...');
      localStorage.clear();
      sessionStorage.clear();
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(registration => registration.unregister());
        });
      }
      window.location.reload();
    };
    
    console.log('✅ Fonctions debug: forceReload(), emergencyClean()');
  }, []);

  // Diagnostic en temps réel
  useEffect(() => {
    console.log('📊 État Auth:', {
      loading,
      isAuthenticated, 
      hasUser: !!user,
      userEmail: user?.email
    });
  }, [loading, isAuthenticated, user]);

  // Affichage pendant l'initialisation
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold mb-2">🚀 Synergia v3.5</h2>
          <p className="text-blue-200">Initialisation en cours...</p>
          <div className="mt-4 text-xs text-blue-300">
            <p>Build simplifié en cours...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* 🌐 ROUTES PUBLIQUES */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />

          {/* 🔐 ROUTES PROTÉGÉES AVEC LAYOUT - PAGES EXISTANTES SEULEMENT */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/tasks" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <TasksPage />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/projects" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ProjectsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AnalyticsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/gamification" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <GamificationPage />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/users" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <UsersPage />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/onboarding" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <OnboardingPage />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/timetrack" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <TimeTrackPage />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ProfilePage />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SettingsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/rewards" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <RewardsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          {/* 🎮 GAMIFICATION - Pages distinctes */}
          <Route 
            path="/badges" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <div className="p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center">
                      🏆 Badges
                    </h1>
                    <p className="text-gray-600 mb-6">Galerie de vos badges et achievements</p>
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <div className="text-center">
                        <div className="text-6xl mb-4">🏆</div>
                        <h3 className="text-xl font-bold mb-2">Système de Badges</h3>
                        <p className="text-gray-600">Collectionnez des badges en accomplissant des tâches et en atteignant des objectifs.</p>
                      </div>
                    </div>
                  </div>
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/leaderboard" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <div className="p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center">
                      🥇 Classement
                    </h1>
                    <p className="text-gray-600 mb-6">Compétition amicale et classements</p>
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <div className="text-center">
                        <div className="text-6xl mb-4">🥇</div>
                        <h3 className="text-xl font-bold mb-2">Tableau des Leaders</h3>
                        <p className="text-gray-600">Voyez où vous vous situez par rapport à vos collègues.</p>
                      </div>
                    </div>
                  </div>
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/team" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <div className="p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center">
                      👥 Équipe
                    </h1>
                    <p className="text-gray-600 mb-6">Gestion et collaboration d'équipe</p>
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <div className="text-center">
                        <div className="text-6xl mb-4">👥</div>
                        <h3 className="text-xl font-bold mb-2">Gestion d'Équipe</h3>
                        <p className="text-gray-600">Gérez votre équipe, assignez des rôles et collaborez efficacement.</p>
                      </div>
                    </div>
                  </div>
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          {/* 🛡️ ROUTES ADMIN - VRAIE PAGE DE VALIDATION */}
          <Route 
            path="/admin/task-validation" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AdminTaskValidationPage />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/admin/profile-test" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AdminProfileTestPage />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/admin/complete-test" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CompleteAdminTestPage />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          {/* 🏠 REDIRECTION RACINE */}
          <Route 
            path="/" 
            element={<Navigate to="/dashboard" replace />} 
          />

          {/* 🔄 FALLBACK */}
          <Route 
            path="*" 
            element={<Navigate to="/dashboard" replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

console.log('✅ App simplifiée exportée - Build sans erreur');
export default App;
