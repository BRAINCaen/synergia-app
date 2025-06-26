// ==========================================
// 📁 react-app/src/App.jsx
// App.jsx SÉCURISÉ - Version anti-crash d'urgence
// ==========================================

import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 🚨 IMPORTS SÉCURISÉS AVEC TRY/CATCH
let useAuthStore;
let useGameStore;

try {
  const authStoreModule = await import('./shared/stores/authStore');
  useAuthStore = authStoreModule.useAuthStore;
} catch (error) {
  console.error('🚨 Erreur import authStore:', error);
  useAuthStore = () => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    initializeAuth: () => () => {},
    signOut: () => Promise.resolve()
  });
}

try {
  const gameStoreModule = await import('./shared/stores/gameStore');
  useGameStore = gameStoreModule.useGameStore;
} catch (error) {
  console.error('🚨 Erreur import gameStore:', error);
  useGameStore = () => ({
    initializeGameStore: () => Promise.resolve(),
    userStats: { level: 1, totalXp: 0 }
  });
}

// Pages avec chargement sécurisé
const Login = React.lazy(() => import('./pages/Login.jsx').catch(() => ({
  default: () => <div>Erreur chargement Login</div>
})));

const Dashboard = React.lazy(() => import('./pages/Dashboard.jsx').catch(() => ({
  default: () => <div>Erreur chargement Dashboard</div>
})));

const NotFound = React.lazy(() => import('./pages/NotFound.jsx').catch(() => ({
  default: () => <div>Page non trouvée</div>
})));

/**
 * 🔄 COMPOSANT LOADING SÉCURISÉ
 */
const SafeLoadingScreen = ({ message = "Chargement Synergia" }) => {
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-cyan-600">
      <div className="text-center text-white">
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
        <h2 className="text-2xl font-bold mb-2">{message}</h2>
        <p className="text-white/80">v3.5.3 - Mode Sécurisé</p>
        <button 
          onClick={() => window.emergencyReset?.()} 
          className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 rounded text-white text-sm"
        >
          🚨 Reset d'urgence
        </button>
      </div>
    </div>
  );
};

/**
 * 🛡️ PROTECTED ROUTE SÉCURISÉ
 */
const SafeProtectedRoute = ({ children }) => {
  const authStore = useAuthStore();
  
  if (!authStore) {
    return <SafeLoadingScreen message="Erreur stores" />;
  }
  
  const { user, isAuthenticated, loading } = authStore;
  
  if (loading) {
    return <SafeLoadingScreen message="Vérification authentification" />;
  }
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <React.Suspense fallback={<SafeLoadingScreen message="Chargement page" />}>
      {children}
    </React.Suspense>
  );
};

/**
 * 🚨 COMPOSANT PRINCIPAL APP SÉCURISÉ
 */
function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);
  const initRef = useRef(false);
  
  // Hooks sécurisés
  const authStore = useAuthStore();
  const gameStore = useGameStore();

  useEffect(() => {
    // Éviter les double-initialisations
    if (initRef.current) return;
    initRef.current = true;

    console.log('🚨 SYNERGIA v3.5.3 - INITIALISATION SÉCURISÉE');
    
    const initializeApp = async () => {
      try {
        // 1️⃣ Vérifier que les stores sont disponibles
        if (!authStore || !gameStore) {
          throw new Error('Stores non disponibles');
        }

        // 2️⃣ Initialiser l'authentification avec timeout
        const authPromise = authStore.initializeAuth?.();
        const timeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout auth')), 10000)
        );
        
        const unsubscribe = await Promise.race([authPromise, timeout]);
        
        // 3️⃣ Marquer comme initialisé
        setIsInitialized(true);
        
        console.log('✅ App initialisée avec succès');
        
        // Retourner la fonction de nettoyage
        return unsubscribe;
      } catch (error) {
        console.error('🚨 Erreur initialisation app:', error);
        setError(error.message);
        setIsInitialized(true); // Continuer même en cas d'erreur
      }
    };

    initializeApp().catch(err => {
      console.error('🚨 Erreur critique:', err);
      setError(err.message);
      setIsInitialized(true);
    });

    // Cleanup automatique après 30 secondes
    const cleanup = setTimeout(() => {
      setIsInitialized(true);
    }, 30000);

    return () => {
      clearTimeout(cleanup);
    };
  }, []);

  // Afficher erreur critique
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-red-900 text-white">
        <div className="text-center p-8">
          <h1 className="text-3xl font-bold mb-4">🚨 Erreur Critique</h1>
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => window.emergencyReset?.()} 
            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded text-white"
          >
            🚨 Reset d'urgence
          </button>
        </div>
      </div>
    );
  }

  // Afficher loading pendant l'initialisation
  if (!isInitialized) {
    return <SafeLoadingScreen />;
  }

  return (
    <Router>
      <div className="App">
        {/* Banner de mode sécurisé */}
        <div className="bg-orange-600 text-white p-2 text-center text-sm font-medium">
          🚨 SYNERGIA MODE SÉCURISÉ v3.5.3 | Service Worker désactivé | Anti-crash activé
        </div>
        
        <React.Suspense fallback={<SafeLoadingScreen message="Chargement route" />}>
          <Routes>
            {/* Routes publiques */}
            <Route 
              path="/login" 
              element={
                !authStore?.isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />
              } 
            />
            
            {/* Routes protégées */}
            <Route 
              path="/dashboard" 
              element={
                <SafeProtectedRoute>
                  <Dashboard />
                </SafeProtectedRoute>
              } 
            />
            
            {/* Redirection par défaut */}
            <Route 
              path="/" 
              element={<Navigate to={authStore?.isAuthenticated ? "/dashboard" : "/login"} replace />} 
            />
            
            {/* Page 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </React.Suspense>
      </div>
    </Router>
  );
}

export default App;
