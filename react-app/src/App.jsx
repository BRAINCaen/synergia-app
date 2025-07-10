// ==========================================
// 📁 react-app/src/App.jsx
// VERSION DEBUG - BYPASS FIREBASE POUR FORCER LE DÉMARRAGE
// ==========================================

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 🎯 Import du Layout qui fonctionne
import DashboardLayout from './layouts/DashboardLayout.jsx';

// 📄 Pages
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import TasksPage from './pages/TasksPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import GamificationPage from './pages/GamificationPage.jsx';
import BadgesPage from './pages/BadgesPage.jsx';
import RewardsPage from './pages/RewardsPage.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import TeamPage from './pages/TeamPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import TimeTrackPage from './pages/TimeTrackPage.jsx';
import AdminTaskValidationPage from './pages/AdminTaskValidationPage.jsx';
import CompleteAdminTestPage from './pages/CompleteAdminTestPage.jsx';

// ✅ LOADING SCREEN AMÉLIORÉ
const LoadingScreen = ({ message = 'Chargement...', showDebug = false }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
    <div className="text-center max-w-md">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
      <p className="text-white text-lg font-medium mb-2">{message}</p>
      <div className="text-blue-200 text-sm mb-4">Synergia v3.5 - Mode Debug</div>
      
      {showDebug && (
        <div className="bg-black/30 rounded-lg p-4 text-left text-xs text-gray-300">
          <div>🔍 Debug Info:</div>
          <div>• URL: {window.location.href}</div>
          <div>• Time: {new Date().toLocaleTimeString()}</div>
          <div>• Firebase Config: {import.meta.env.VITE_FIREBASE_API_KEY ? '✅' : '❌'}</div>
        </div>
      )}
      
      <button 
        onClick={() => window.location.reload()} 
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
      >
        🔄 Forcer le redémarrage
      </button>
    </div>
  </div>
);

// 🚨 MOCK AUTH STORE POUR BYPASS FIREBASE
const useMockAuthStore = () => {
  const [authState, setAuthState] = useState({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false
  });

  const mockUser = {
    uid: 'debug-user-123',
    email: 'debug@synergia.com',
    displayName: 'Utilisateur Debug',
    photoURL: null,
    emailVerified: true
  };

  useEffect(() => {
    console.log('🔧 MOCK AUTH - Simulation connexion...');
    
    const timer = setTimeout(() => {
      console.log('✅ MOCK AUTH - Utilisateur connecté (simulation)');
      setAuthState({
        user: mockUser,
        loading: false,
        error: null,
        isAuthenticated: true
      });
    }, 2000); // 2 secondes pour voir l'écran de chargement
    
    return () => clearTimeout(timer);
  }, []);

  return {
    ...authState,
    signOut: () => {
      console.log('🚪 MOCK AUTH - Déconnexion (simulation)');
      setAuthState({
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false
      });
    },
    signInWithGoogle: () => {
      console.log('🔐 MOCK AUTH - Connexion Google (simulation)');
      setAuthState({
        user: mockUser,
        loading: false,
        error: null,
        isAuthenticated: true
      });
    }
  };
};

// ✅ PROTECTION DES ROUTES AVEC MOCK
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useMockAuthStore();
  
  if (loading) {
    return <LoadingScreen message="Vérification de l'authentification..." showDebug={true} />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// 🚨 PAGE DE LOGIN MOCK
const LoginMock = () => {
  const { signInWithGoogle } = useMockAuthStore();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">🚀 Synergia</h1>
          <p className="text-gray-600">Mode Debug - Connexion simulée</p>
        </div>
        
        <button
          onClick={signInWithGoogle}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          🔐 Se connecter (Mode Debug)
        </button>
        
        <div className="mt-4 text-xs text-gray-500 text-center">
          ⚠️ Version de debug - Bypass Firebase
        </div>
      </div>
    </div>
  );
};

// 🚀 COMPOSANT APP DEBUG
const App = () => {
  const [debugMode] = useState(true);
  const [appReady, setAppReady] = useState(false);

  // ✅ INITIALISATION SIMPLIFIÉE
  useEffect(() => {
    console.log('🚨 APP DEBUG - Démarrage en mode bypass Firebase');
    
    const timer = setTimeout(() => {
      setAppReady(true);
      console.log('✅ APP DEBUG - Application prête');
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (!appReady) {
    return <LoadingScreen message="Démarrage en mode debug..." showDebug={true} />;
  }

  return (
    <Router>
      <Routes>
        {/* ✅ Route de connexion MOCK */}
        <Route path="/login" element={<LoginMock />} />
        
        {/* ✅ Routes protégées avec DashboardLayout */}
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          {/* Pages principales */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          
          {/* Gamification */}
          <Route path="gamification" element={<GamificationPage />} />
          <Route path="badges" element={<BadgesPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="rewards" element={<RewardsPage />} />
          
          {/* Équipe */}
          <Route path="team" element={<TeamPage />} />
          <Route path="users" element={<UsersPage />} />
          
          {/* Profil */}
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="onboarding" element={<OnboardingPage />} />
          <Route path="timetrack" element={<TimeTrackPage />} />
          
          {/* Admin */}
          <Route path="admin/task-validation" element={<AdminTaskValidationPage />} />
          <Route path="admin/complete-test" element={<CompleteAdminTestPage />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      
      {/* Debug panel */}
      {debugMode && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs">
          <div className="font-bold text-yellow-300">🚨 MODE DEBUG</div>
          <div>Firebase: BYPASS</div>
          <div>Auth: MOCK</div>
          <div>Status: {appReady ? 'READY' : 'LOADING'}</div>
        </div>
      )}
    </Router>
  );
};

export default App;

console.log('🚨 APP DEBUG - Firebase complètement bypassé pour identifier le problème !');
console.log('🎯 Si ça marche = problème Firebase, sinon = problème React/Layout');
