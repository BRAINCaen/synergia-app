// ==========================================
// 📁 react-app/src/App.jsx
// VERSION SÉCURISÉE PROGRESSIVE - Charge composants un par un
// ==========================================

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 🛡️ GESTIONNAIRE D'ERREUR EN PREMIER
try {
  require('./utils/errorHandler.js');
  console.log('✅ ErrorHandler importé');
} catch (error) {
  console.warn('⚠️ ErrorHandler non trouvé:', error.message);
}

// 🔐 IMPORTS SÉCURISÉS - Votre structure existante
let useAuthStore, ProtectedRoute, PublicRoute, DashboardLayout;
let Login, Dashboard, TasksPage, ProjectsPage, AnalyticsPage;
let GamificationPage, RewardsPage, BadgesPage;
let UsersPage, OnboardingPage;
let TimeTrackPage, ProfilePage, SettingsPage;
let CompleteAdminTestPage, AdminProfileTestPage, AdminTaskValidationPage;

// Fonction d'import sécurisé
const safeImport = (importPath, name) => {
  try {
    const module = require(importPath);
    const component = module.default || module[name] || module;
    console.log(`✅ ${name} importé avec succès`);
    return component;
  } catch (error) {
    console.warn(`⚠️ ${name} non trouvé:`, error.message);
    return null;
  }
};

// 📦 IMPORTS ESSENTIELS - Votre AuthStore Firebase
try {
  const authStoreModule = require('./shared/stores/authStore.js');
  useAuthStore = authStoreModule.useAuthStore;
  console.log('✅ AuthStore Firebase importé');
} catch (error) {
  console.error('❌ Erreur AuthStore critique:', error.message);
  throw new Error('AuthStore requis pour l\'application');
}

// 🔐 ROUTES ET LAYOUTS - Votre structure existante
ProtectedRoute = safeImport('./routes/ProtectedRoute.jsx', 'ProtectedRoute');
PublicRoute = safeImport('./routes/PublicRoute.jsx', 'PublicRoute');
DashboardLayout = safeImport('./layouts/DashboardLayout.jsx', 'DashboardLayout');

// 📄 PAGES PRINCIPALES - Votre structure existante
Login = safeImport('./pages/Login.jsx', 'Login');
Dashboard = safeImport('./pages/Dashboard.jsx', 'Dashboard');
TasksPage = safeImport('./pages/TasksPage.jsx', 'TasksPage');
ProjectsPage = safeImport('./pages/ProjectsPage.jsx', 'ProjectsPage');
AnalyticsPage = safeImport('./pages/AnalyticsPage.jsx', 'AnalyticsPage');

// 🎮 PAGES GAMIFICATION - Votre structure existante
GamificationPage = safeImport('./pages/GamificationPage.jsx', 'GamificationPage');
RewardsPage = safeImport('./pages/RewardsPage.jsx', 'RewardsPage');
BadgesPage = safeImport('./pages/BadgesPage.jsx', 'BadgesPage');

// 👥 PAGES ÉQUIPE - Votre structure existante
UsersPage = safeImport('./pages/UsersPage.jsx', 'UsersPage');
OnboardingPage = safeImport('./pages/OnboardingPage.jsx', 'OnboardingPage');

// ⚙️ PAGES OUTILS - Votre structure existante
TimeTrackPage = safeImport('./pages/TimeTrackPage.jsx', 'TimeTrackPage');
ProfilePage = safeImport('./pages/ProfilePage.jsx', 'ProfilePage');
SettingsPage = safeImport('./pages/SettingsPage.jsx', 'SettingsPage');

// 🔧 PAGES ADMIN - Votre structure existante
CompleteAdminTestPage = safeImport('./pages/CompleteAdminTestPage.jsx', 'CompleteAdminTestPage');
AdminProfileTestPage = safeImport('./pages/AdminProfileTestPage.jsx', 'AdminProfileTestPage');
AdminTaskValidationPage = safeImport('./pages/AdminTaskValidationPage.jsx', 'AdminTaskValidationPage');

// 🔄 FALLBACKS SIMPLES - Sans mode démo, utilise votre système Firebase
if (!ProtectedRoute) {
  ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuthStore();
    
    if (loading) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-white">🔄 Vérification authentification...</div>
        </div>
      );
    }
    
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    
    return children;
  };
}

if (!PublicRoute) {
  PublicRoute = ({ children }) => {
    const { isAuthenticated } = useAuthStore();
    
    if (isAuthenticated) {
      return <Navigate to="/dashboard" replace />;
    }
    
    return children;
  };
}

if (!Login) {
  Login = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-indigo-900 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-4">🚀 Synergia</h1>
        <p className="text-center text-gray-600 mb-6">Page de connexion non trouvée</p>
        <p className="text-center text-red-600 text-sm">
          Erreur: ./pages/Login.jsx non importé
        </p>
      </div>
    </div>
  );
}

if (!Dashboard) {
  Dashboard = () => (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">🚀 Synergia Dashboard</h1>
          <p className="text-gray-600 mb-4">Dashboard principal non trouvé</p>
          <p className="text-red-600 text-sm">
            Erreur: ./pages/Dashboard.jsx non importé
          </p>
        </div>
      </div>
    </div>
  );
}

if (!DashboardLayout) {
  DashboardLayout = ({ children }) => children;
}

/**
 * 🚀 APPLICATION PRINCIPALE SÉCURISÉE
 */
function App() {
  const [appState, setAppState] = useState('initializing');
  const { initializeAuth, isInitialized } = useAuthStore();

  useEffect(() => {
    console.log('🚀 SYNERGIA v3.5.3 - Démarrage sécurisé');
    
    try {
      // Initialiser l'authentification Firebase
      if (initializeAuth) {
        initializeAuth();
      }
      
      setAppState('ready');
      console.log('✅ Application initialisée avec Firebase Auth');
      
    } catch (error) {
      console.error('❌ Erreur initialisation:', error);
      setAppState('error');
    }
  }, [initializeAuth]);

  // État de chargement
  if (appState === 'initializing' || !isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold mb-2">🚀 Synergia</h2>
          <p className="text-blue-200">Initialisation sécurisée...</p>
          <p className="text-xs text-blue-300 mt-2">Mode de récupération activé</p>
        </div>
      </div>
    );
  }

  // État d'erreur
  if (appState === 'error') {
    return (
      <div className="min-h-screen bg-red-900 flex items-center justify-center">
        <div className="text-center text-white p-8">
          <h2 className="text-2xl font-semibold mb-4">❌ Erreur Critique</h2>
          <p className="mb-6">Impossible d'initialiser l'application</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-white text-red-900 px-6 py-2 rounded font-semibold hover:bg-gray-100"
          >
            🔄 Recharger
          </button>
        </div>
      </div>
    );
  }

  // Application principale - Toutes vos routes existantes
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
          
          {/* 🏠 Redirection racine */}
          <Route 
            path="/" 
            element={<Navigate to="/dashboard" replace />} 
          />
          
          {/* 🔐 Routes protégées avec layout */}
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Routes>
                    {/* 📊 Pages principales */}
                    <Route path="/dashboard" element={Dashboard ? <Dashboard /> : <div>Dashboard non trouvé</div>} />
                    <Route path="/tasks" element={TasksPage ? <TasksPage /> : <div>TasksPage non trouvé</div>} />
                    <Route path="/projects" element={ProjectsPage ? <ProjectsPage /> : <div>ProjectsPage non trouvé</div>} />
                    <Route path="/analytics" element={AnalyticsPage ? <AnalyticsPage /> : <div>AnalyticsPage non trouvé</div>} />
                    
                    {/* 🎮 Pages gamification */}
                    <Route path="/gamification" element={GamificationPage ? <GamificationPage /> : <div>GamificationPage non trouvé</div>} />
                    <Route path="/rewards" element={RewardsPage ? <RewardsPage /> : <div>RewardsPage non trouvé</div>} />
                    <Route path="/badges" element={BadgesPage ? <BadgesPage /> : <div>BadgesPage non trouvé</div>} />
                    
                    {/* 👥 Pages équipe */}
                    <Route path="/users" element={UsersPage ? <UsersPage /> : <div>UsersPage non trouvé</div>} />
                    <Route path="/onboarding" element={OnboardingPage ? <OnboardingPage /> : <div>OnboardingPage non trouvé</div>} />
                    
                    {/* ⚙️ Pages outils */}
                    <Route path="/timetrack" element={TimeTrackPage ? <TimeTrackPage /> : <div>TimeTrackPage non trouvé</div>} />
                    <Route path="/profile" element={ProfilePage ? <ProfilePage /> : <div>ProfilePage non trouvé</div>} />
                    <Route path="/settings" element={SettingsPage ? <SettingsPage /> : <div>SettingsPage non trouvé</div>} />
                    
                    {/* 🔧 Pages admin */}
                    <Route path="/admin/complete-test" element={CompleteAdminTestPage ? <CompleteAdminTestPage /> : <div>CompleteAdminTestPage non trouvé</div>} />
                    <Route path="/admin/profile-test" element={AdminProfileTestPage ? <AdminProfileTestPage /> : <div>AdminProfileTestPage non trouvé</div>} />
                    <Route path="/admin/task-validation" element={AdminTaskValidationPage ? <AdminTaskValidationPage /> : <div>AdminTaskValidationPage non trouvé</div>} />
                    
                    {/* 🔄 Fallback */}
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

export default App;
