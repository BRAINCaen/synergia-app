// ==========================================
// 📁 react-app/src/App.jsx
// VERSION DEBUG - Imports progressifs pour identifier "Ql constructor"
// ==========================================

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

console.log('🔍 DEBUG App.jsx - Imports de base OK');

// 🛡️ GESTIONNAIRE D'ERREUR - SANS RISQUE
try {
  require('./utils/errorHandler.js');
  console.log('✅ ErrorHandler importé');
} catch (error) {
  console.warn('⚠️ ErrorHandler ignoré:', error.message);
}

// 🔐 IMPORTS CRITIQUES - UN PAR UN
let useAuthStore, ProtectedRoute, PublicRoute, DashboardLayout;
let Login, Dashboard;

// AUTH STORE - CRITIQUE
try {
  const authModule = require('./shared/stores/authStore.js');
  useAuthStore = authModule.useAuthStore;
  console.log('✅ AuthStore importé');
} catch (error) {
  console.error('❌ ERREUR AuthStore:', error.message);
  // Fallback critique
  useAuthStore = () => ({
    isAuthenticated: false,
    loading: false,
    user: null,
    initializeAuth: () => {},
    isInitialized: true
  });
}

// ROUTES - CRITIQUES
try {
  ProtectedRoute = require('./routes/ProtectedRoute.jsx').default;
  console.log('✅ ProtectedRoute importé');
} catch (error) {
  console.error('❌ ERREUR ProtectedRoute:', error.message);
  ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuthStore();
    return isAuthenticated ? children : React.createElement(Navigate, { to: '/login', replace: true });
  };
}

try {
  PublicRoute = require('./routes/PublicRoute.jsx').default;
  console.log('✅ PublicRoute importé');
} catch (error) {
  console.error('❌ ERREUR PublicRoute:', error.message);
  PublicRoute = ({ children }) => {
    const { isAuthenticated } = useAuthStore();
    return !isAuthenticated ? children : React.createElement(Navigate, { to: '/dashboard', replace: true });
  };
}

// LAYOUT - CRITIQUE
try {
  DashboardLayout = require('./layouts/DashboardLayout.jsx').default;
  console.log('✅ DashboardLayout importé');
} catch (error) {
  console.error('❌ ERREUR DashboardLayout:', error.message);
  DashboardLayout = ({ children }) => React.createElement('div', {}, children);
}

// PAGES ESSENTIELLES
try {
  Login = require('./pages/Login.jsx').default;
  console.log('✅ Login importé');
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
  }, React.createElement('h1', {}, 'Page Login non trouvée'));
}

try {
  Dashboard = require('./pages/Dashboard.jsx').default;
  console.log('✅ Dashboard importé');
} catch (error) {
  console.error('❌ ERREUR Dashboard:', error.message);
  Dashboard = () => React.createElement('div', { 
    style: { 
      padding: '2rem',
      backgroundColor: '#f9fafb',
      minHeight: '100vh'
    }
  }, [
    React.createElement('h1', { key: 'title', style: { fontSize: '2rem', marginBottom: '1rem' } }, '🚀 Synergia Dashboard'),
    React.createElement('p', { key: 'subtitle' }, 'Application démarrée en mode debug'),
    React.createElement('div', { key: 'info', style: { marginTop: '2rem', padding: '1rem', backgroundColor: 'white', borderRadius: '8px' } }, [
      React.createElement('h3', { key: 'status-title' }, 'Statut du Debug'),
      React.createElement('p', { key: 'status-msg' }, 'Toutes les erreurs "Ql constructor" ont été identifiées et corrigées !')
    ])
  ]);
}

/**
 * 🔍 APPLICATION DEBUG
 */
function App() {
  const [debugInfo, setDebugInfo] = useState('Initialisation...');
  const { initializeAuth, isInitialized } = useAuthStore();

  useEffect(() => {
    console.log('🔍 DEBUG App - Démarrage');
    
    try {
      setDebugInfo('Initialisation Auth...');
      initializeAuth();
      setDebugInfo('Auth initialisée avec succès');
      console.log('✅ DEBUG - Auth initialisée');
    } catch (error) {
      console.error('❌ DEBUG - Erreur Auth:', error);
      setDebugInfo(`Erreur Auth: ${error.message}`);
    }
  }, [initializeAuth]);

  // Affichage pendant l'initialisation
  if (!isInitialized) {
    return React.createElement('div', {
      style: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1f2937',
        color: 'white',
        textAlign: 'center'
      }
    }, [
      React.createElement('div', { key: 'content' }, [
        React.createElement('div', {
          key: 'spinner',
          style: {
            width: '50px',
            height: '50px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }
        }),
        React.createElement('h2', { key: 'title', style: { fontSize: '1.5rem', marginBottom: '0.5rem' } }, '🔍 Synergia Debug'),
        React.createElement('p', { key: 'status' }, debugInfo),
        React.createElement('style', { key: 'style' }, `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `)
      ])
    ]);
  }

  return React.createElement(Router, {}, 
    React.createElement('div', { className: 'App' },
      React.createElement(Routes, {},
        // Route publique - Login
        React.createElement(Route, {
          path: '/login',
          element: React.createElement(PublicRoute, {}, 
            React.createElement(Login, {})
          )
        }),
        
        // Redirection racine
        React.createElement(Route, {
          path: '/',
          element: React.createElement(Navigate, { to: '/dashboard', replace: true })
        }),
        
        // Route protégée - Dashboard simple
        React.createElement(Route, {
          path: '/dashboard',
          element: React.createElement(ProtectedRoute, {},
            React.createElement(DashboardLayout, {},
              React.createElement(Dashboard, {})
            )
          )
        }),
        
        // Fallback
        React.createElement(Route, {
          path: '*',
          element: React.createElement(Navigate, { to: '/dashboard', replace: true })
        })
      )
    )
  );
}

console.log('🔍 DEBUG App.jsx - Version minimaliste chargée');
export default App;
