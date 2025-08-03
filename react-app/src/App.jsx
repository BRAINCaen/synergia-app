// ==========================================
// 📁 react-app/src/App.jsx
// APP BYPASS LAYOUT - TEST DIRECT DES PAGES
// ==========================================

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Stores (corrigé)
import { useAuthStore } from './shared/stores/authStore.js';

// Import des correctifs
import './utils/safeFix.js';

// Pages - import direct
import Dashboard from './pages/Dashboard.jsx';
import TasksPage from './pages/TasksPage.jsx';

// ==========================================
// 🔧 NAVIGATION SIMPLE SANS LAYOUT
// ==========================================

const SimpleNav = () => {
  const { user, signOut } = useAuthStore();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  const navLinks = [
    { path: '/dashboard', label: '🏠 Dashboard' },
    { path: '/tasks', label: '✅ Tâches' },
    { path: '/projects', label: '📁 Projets' },
    { path: '/analytics', label: '📊 Analytics' },
  ];

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.location.reload(); // Force reload pour test
  };

  const handleLogout = async () => {
    await signOut();
    window.location.reload();
  };

  return (
    <div className="bg-gray-800 border-b border-gray-700 p-4">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">S</span>
          </div>
          <span className="text-white font-bold text-xl">Synergia</span>
          <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">TEST</span>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-4">
          {navLinks.map(link => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPath === link.path
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* User info */}
        <div className="flex items-center gap-4">
          <span className="text-gray-300 text-sm">
            {user?.email?.split('@')[0]}
          </span>
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
          >
            👋 Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 🔧 COMPOSANT LOGIN SIMPLE
// ==========================================

const SimpleLogin = () => {
  const { signInWithGoogle } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      console.log('✅ Connexion réussie');
    } catch (error) {
      console.error('❌ Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 text-center max-w-md">
        <h1 className="text-2xl font-bold text-white mb-6">🔐 Connexion Test</h1>
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white hover:bg-gray-100 text-gray-900 py-3 px-4 rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? 'Connexion...' : '🔍 Google Login'}
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 🔧 PAGE DE TEST SIMPLE
// ==========================================

const TestPage = ({ pageName }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          🧪 Page de Test: {pageName}
        </h1>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8">
          <p className="text-gray-300 text-lg mb-4">
            Cette page s'affiche correctement !
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="bg-blue-600 text-white p-4 rounded-lg">
              <div className="text-2xl font-bold">✅</div>
              <div className="text-sm">React fonctionne</div>
            </div>
            <div className="bg-green-600 text-white p-4 rounded-lg">
              <div className="text-2xl font-bold">🔥</div>
              <div className="text-sm">CSS fonctionne</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 🎯 APP PRINCIPAL DE TEST
// ==========================================

const App = () => {
  const { user, loading: authLoading, checkAuthState } = useAuthStore();

  useEffect(() => {
    console.log('🔐 App: Vérification auth...');
    checkAuthState();
  }, [checkAuthState]);

  // Écran de chargement
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white">🔧 Test de chargement...</p>
        </div>
      </div>
    );
  }

  console.log('🎯 App rendu, utilisateur:', user?.email || 'Non connecté');

  return (
    <Router>
      <div className="min-h-screen">
        {!user ? (
          // Mode non connecté
          <Routes>
            <Route path="/login" element={<SimpleLogin />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        ) : (
          // Mode connecté - SANS Layout.jsx
          <div>
            <SimpleNav />
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/projects" element={<TestPage pageName="Projets" />} />
              <Route path="/analytics" element={<TestPage pageName="Analytics" />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        )}
      </div>
    </Router>
  );
};

export default App;

// ==========================================
// 📋 LOGS DE TEST
// ==========================================
console.log('🧪 App de test chargé - BYPASS Layout.jsx');
console.log('🔧 Navigation simple sans composants complexes');
console.log('🎯 Test direct du rendu des pages');
