// ==========================================
// 📁 react-app/src/App.jsx
// RESTAURATION PROGRESSIVE - Ajout composant par composant
// ==========================================

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 🛡️ GESTIONNAIRE D'ERREUR GLOBAL
import './utils/errorHandler.js';

// 🔐 IMPORTS CRITIQUES QUI FONCTIONNENT
import { useAuthStore } from './shared/stores/authStore.js';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import PublicRoute from './routes/PublicRoute.jsx';

// 🎨 LAYOUT - TESTONS CELUI-CI D'ABORD
import DashboardLayout from './layouts/DashboardLayout.jsx';

// ✅ PAGES ESSENTIELLES SEULEMENT - AJOUT PROGRESSIF
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';

// 🚫 TEMPORAIREMENT COMMENTÉ - ON TESTE D'ABORD AVEC LE MINIMUM
// import TasksPage from './pages/TasksPage.jsx';
// import ProjectsPage from './pages/ProjectsPage.jsx';
// import AnalyticsPage from './pages/AnalyticsPage.jsx';
// import GamificationPage from './pages/GamificationPage.jsx';
// import RewardsPage from './pages/RewardsPage.jsx';
// import BadgesPage from './pages/BadgesPage.jsx';
// import UsersPage from './pages/UsersPage.jsx';
// import OnboardingPage from './pages/OnboardingPage.jsx';
// import TimeTrackPage from './pages/TimeTrackPage.jsx';
// import ProfilePage from './pages/ProfilePage.jsx';
// import SettingsPage from './pages/SettingsPage.jsx';
// import CompleteAdminTestPage from './pages/CompleteAdminTestPage.jsx';
// import AdminProfileTestPage from './pages/AdminProfileTestPage.jsx';
// import AdminTaskValidationPage from './pages/AdminTaskValidationPage.jsx';

console.log('🔄 App.jsx - Restauration progressive démarrée');

/**
 * 🔄 APPLICATION EN RESTAURATION PROGRESSIVE
 */
function App() {
  const { initializeAuth, isInitialized } = useAuthStore();

  useEffect(() => {
    console.log('🔄 SYNERGIA v3.5.3 - Restauration progressive');
    console.log('📋 Test: Login + Dashboard + DashboardLayout seulement');
    
    // Initialiser l'authentification
    initializeAuth();
    
    console.log('✅ Imports critiques chargés avec succès');
    
  }, [initializeAuth]);

  // Affichage pendant l'initialisation
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold mb-2">Synergia</h2>
          <p className="text-blue-200">Restauration progressive...</p>
          <p className="text-xs text-blue-300 mt-2">Étape 1: Login + Dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* 🌐 Route publique - Login */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          
          {/* 🏠 Redirection racine vers dashboard */}
          <Route 
            path="/" 
            element={<Navigate to="/dashboard" replace />} 
          />
          
          {/* 🔐 Routes protégées avec layout - VERSION MINIMALE */}
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Routes>
                    {/* 📊 SEULEMENT DASHBOARD POUR L'INSTANT */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    
                    {/* 🚫 PAGES TEMPORAIREMENT DÉSACTIVÉES - FALLBACK SIMPLE */}
                    <Route path="/tasks" element={
                      <div className="p-8 bg-white rounded-lg">
                        <h2 className="text-2xl font-bold mb-4">📋 Tâches</h2>
                        <p className="text-gray-600">Page en cours de restauration...</p>
                        <button 
                          onClick={() => window.location.href = '/dashboard'}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          ← Retour Dashboard
                        </button>
                      </div>
                    } />
                    
                    <Route path="/projects" element={
                      <div className="p-8 bg-white rounded-lg">
                        <h2 className="text-2xl font-bold mb-4">📁 Projets</h2>
                        <p className="text-gray-600">Page en cours de restauration...</p>
                        <button 
                          onClick={() => window.location.href = '/dashboard'}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          ← Retour Dashboard
                        </button>
                      </div>
                    } />
                    
                    <Route path="/analytics" element={
                      <div className="p-8 bg-white rounded-lg">
                        <h2 className="text-2xl font-bold mb-4">📊 Analytics</h2>
                        <p className="text-gray-600">Page en cours de restauration...</p>
                        <button 
                          onClick={() => window.location.href = '/dashboard'}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          ← Retour Dashboard
                        </button>
                      </div>
                    } />
                    
                    {/* 🔄 Route par défaut */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

console.log('🔄 App.jsx - Version progressive chargée (Login + Dashboard seulement)');
export default App;
