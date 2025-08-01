// ==========================================
// 📁 react-app/src/App.jsx
// REACT AVEC AUTHENTIFICATION GOOGLE RÉACTIVÉE
// ==========================================

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import des composants
import Dashboard from './pages/Dashboard.jsx';
import Tasks from './pages/Tasks.jsx';
import Projects from './pages/Projects.jsx';
import Team from './pages/Team.jsx';
import Gamification from './pages/Gamification.jsx';
import Analytics from './pages/Analytics.jsx';
import Login from './pages/Login.jsx';
import NotFound from './pages/NotFound.jsx';

// Import du contexte d'authentification
import { SimpleAuthProvider, useSimpleAuth } from './contexts/SimpleAuthContext.jsx';

/**
 * 🔐 COMPOSANT DE PROTECTION DES ROUTES
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, initialized } = useSimpleAuth();
  
  // Affichage de chargement pendant l'initialisation
  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <h2 className="text-white text-lg font-semibold">
            🔄 Initialisation de l'authentification...
          </h2>
          <p className="text-indigo-200 text-sm">
            Connexion à Firebase en cours
          </p>
        </div>
      </div>
    );
  }
  
  // Redirection vers login si pas authentifié
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

/**
 * 🚀 COMPOSANT PRINCIPAL DE L'APPLICATION
 */
function AppContent() {
  const { isAuthenticated, user, firebaseReady, error, initialized } = useSimpleAuth();
  
  return (
    <Router>
      <div className="App">
        {/* Informations de diagnostic en développement */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed top-0 right-0 z-50 bg-black/80 text-white p-2 text-xs">
            <div>🔐 Auth: {isAuthenticated ? '✅ Connecté' : '❌ Déconnecté'}</div>
            <div>🔥 Firebase: {firebaseReady ? '✅ Prêt' : '❌ Non prêt'}</div>
            <div>🔄 Init: {initialized ? '✅ Fait' : '⏳ En cours'}</div>
            {user && <div>👤 User: {user.email}</div>}
            {error && <div className="text-red-400">❌ {error}</div>}
          </div>
        )}

        <Routes>
          {/* Route publique : Login */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
                <Navigate to="/dashboard" replace /> : 
                <Login />
            } 
          />
          
          {/* Routes protégées */}
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
                <Tasks />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/projects" 
            element={
              <ProtectedRoute>
                <Projects />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/team" 
            element={
              <ProtectedRoute>
                <Team />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/gamification" 
            element={
              <ProtectedRoute>
                <Gamification />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirection racine */}
          <Route 
            path="/" 
            element={<Navigate to="/dashboard" replace />} 
          />
          
          {/* Page 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

/**
 * 🎯 COMPOSANT RACINE AVEC PROVIDER D'AUTHENTIFICATION
 */
function App() {
  const [appStatus, setAppStatus] = useState('initializing');
  
  useEffect(() => {
    // Diagnostic de l'application au démarrage
    console.log('🚀 [APP] Synergia v3.5 - Démarrage...');
    console.log('🔧 [APP] Mode:', process.env.NODE_ENV);
    console.log('🌐 [APP] Base URL:', window.location.origin);
    
    // Vérification des variables d'environnement Firebase
    const firebaseVars = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    };
    
    console.log('🔥 [APP] Variables Firebase:', {
      apiKey: firebaseVars.apiKey ? '✅ Définie' : '❌ Manquante',
      authDomain: firebaseVars.authDomain ? '✅ Définie' : '❌ Manquante',
      projectId: firebaseVars.projectId ? '✅ Définie' : '❌ Manquante',
    });
    
    setAppStatus('ready');
  }, []);
  
  if (appStatus === 'initializing') {
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
    <SimpleAuthProvider>
      <AppContent />
    </SimpleAuthProvider>
  );
}

export default App;
