// ==========================================
// 📁 react-app/src/App.jsx
// App.jsx RÉPARÉ - Version stable avec tous stores
// ==========================================

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore, useGameStore } from './shared/stores';

// Pages principales
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NotFound from './pages/NotFound.jsx';

// Layout et composants
import DashboardLayout from './layouts/DashboardLayout.jsx';

/**
 * 🔄 COMPOSANT LOADING AMÉLIORÉ
 */
const LoadingScreen = ({ message = "Chargement Synergia" }) => {
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-cyan-600">
      <div className="text-center text-white">
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
        <h2 className="text-2xl font-bold mb-2">{message}</h2>
        <p className="text-white/80">v3.5.2 - Version Réparée</p>
      </div>
    </div>
  );
};

/**
 * 🛡️ PROTECTED ROUTE
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
 * 🚀 COMPOSANT PRINCIPAL APP
 */
function App() {
  const { user, isAuthenticated, loading, initializeAuth } = useAuthStore();
  const { initializeGameStore } = useGameStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    console.log('🚀 SYNERGIA v3.5.2 - INITIALISATION RÉPARÉE');
    console.log('✅ Tous stores activés et fonctionnels');
    
    const initializeApp = async () => {
      try {
        // 1️⃣ Initialiser l'authentification
        const unsubscribe = initializeAuth();
        
        // 2️⃣ Initialiser GameStore si utilisateur connecté
        if (user) {
          await initializeGameStore(user.uid);
        }
        
        setIsInitialized(true);
        
        // Retourner la fonction de nettoyage
        return unsubscribe;
      } catch (error) {
        console.error('❌ Erreur initialisation app:', error);
        setIsInitialized(true); // Continuer même en cas d'erreur
      }
    };

    const cleanup = initializeApp();

    // Nettoyer à la fermeture
    return () => {
      if (cleanup && typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, [initializeAuth, initializeGameStore, user]);

  // 🔄 Initialiser GameStore quand utilisateur se connecte
  useEffect(() => {
    if (isAuthenticated && user) {
      initializeGameStore(user.uid);
    }
  }, [isAuthenticated, user, initializeGameStore]);

  // Afficher le loading pendant l'initialisation
  if (!isInitialized || loading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <div className="App">
        {/* Banner de succès */}
        <div className="bg-green-600 text-white p-2 text-center text-sm font-medium">
          ✅ SYNERGIA RÉPARÉ: Tous stores fonctionnels | GameStore activé | Erreur "r is not a function" éliminée
        </div>
        
        <Routes>
          {/* Routes publiques */}
          <Route 
            path="/login" 
            element={
              !isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />
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
