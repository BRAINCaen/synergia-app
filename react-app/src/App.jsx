// ==========================================
// 📁 react-app/src/App.jsx
// TEST ULTRA-MINIMAL - Identification du composant problématique
// ==========================================

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 🛡️ GESTIONNAIRE D'ERREUR GLOBAL
import './utils/errorHandler.js';

// 🔐 AUTHSTORE - ON SAIT QUE ÇA MARCHE
import { useAuthStore } from './shared/stores/authStore.js';

console.log('🔬 Test Ultra-Minimal - Démarrage');

// 🧪 TESTONS LES ROUTES UNE PAR UNE
let ProtectedRoute, PublicRoute, DashboardLayout, Login, Dashboard;

// TEST 1: ProtectedRoute
try {
  ProtectedRoute = require('./routes/ProtectedRoute.jsx').default;
  console.log('✅ ProtectedRoute importé sans erreur');
} catch (error) {
  console.error('❌ ERREUR ProtectedRoute:', error.message);
  ProtectedRoute = ({ children }) => {
    const { user } = useAuthStore();
    return user ? children : React.createElement(Navigate, { to: '/login', replace: true });
  };
}

// TEST 2: PublicRoute
try {
  PublicRoute = require('./routes/PublicRoute.jsx').default;
  console.log('✅ PublicRoute importé sans erreur');
} catch (error) {
  console.error('❌ ERREUR PublicRoute:', error.message);
  PublicRoute = ({ children }) => {
    const { user } = useAuthStore();
    return !user ? children : React.createElement(Navigate, { to: '/dashboard', replace: true });
  };
}

// TEST 3: DashboardLayout
try {
  DashboardLayout = require('./layouts/DashboardLayout.jsx').default;
  console.log('✅ DashboardLayout importé sans erreur');
} catch (error) {
  console.error('❌ ERREUR DashboardLayout:', error.message);
  DashboardLayout = ({ children }) => React.createElement('div', { style: { padding: '20px' } }, children);
}

// TEST 4: Login
try {
  Login = require('./pages/Login.jsx').default;
  console.log('✅ Login importé sans erreur');
} catch (error) {
  console.error('❌ ERREUR Login:', error.message);
  Login = () => React.createElement('div', {
    style: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1f2937',
      color: 'white'
    }
  }, React.createElement('h1', {}, 'Login Fallback'));
}

// TEST 5: Dashboard
try {
  Dashboard = require('./pages/Dashboard.jsx').default;
  console.log('✅ Dashboard importé sans erreur');
} catch (error) {
  console.error('❌ ERREUR Dashboard:', error.message);
  Dashboard = () => React.createElement('div', {
    style: { padding: '40px', backgroundColor: '#f9fafb', minHeight: '100vh' }
  }, [
    React.createElement('h1', { key: 'title', style: { fontSize: '2rem', marginBottom: '20px' } }, '🚀 Dashboard Fallback'),
    React.createElement('p', { key: 'msg' }, 'Dashboard original a une erreur, utilisation du fallback'),
    React.createElement('button', {
      key: 'logout',
      onClick: () => window.location.href = '/login',
      style: {
        padding: '10px 20px',
        backgroundColor: '#ef4444',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        marginTop: '20px'
      }
    }, 'Déconnexion')
  ]);
}

/**
 * 🔬 APPLICATION DE TEST ULTRA-MINIMAL
 */
function App() {
  const { initializeAuth, isInitialized, user } = useAuthStore();

  useEffect(() => {
    console.log('🔬 Test Ultra-Minimal - Initialisation');
    
    try {
      initializeAuth();
      console.log('✅ Auth initialisée');
    } catch (error) {
      console.error('❌ Erreur Auth:', error);
    }
  }, [initializeAuth]);

  // DIAGNOSTIC EN TEMPS RÉEL
  useEffect(() => {
    console.log('📊 État actuel:', {
      isInitialized,
      hasUser: !!user,
      userEmail: user?.email
    });
  }, [isInitialized, user]);

  // Affichage pendant l'initialisation
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold mb-2">🔬 Test Ultra-Minimal</h2>
          <p className="text-blue-200">Initialisation Auth en cours...</p>
          <div className="mt-4 text-xs text-blue-300">
            <p>Vérification des composants un par un</p>
          </div>
        </div>
      </div>
    );
  }

  console.log('🎯 App rendu - Auth initialisée, affichage Router');

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
          
          {/* 🔐 Route protégée - Dashboard */}
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
          
          {/* 🔄 Fallback */}
          <Route 
            path="*" 
            element={<Navigate to="/dashboard" replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

console.log('🔬 Test Ultra-Minimal chargé - Diagnostic en cours');
export default App;
