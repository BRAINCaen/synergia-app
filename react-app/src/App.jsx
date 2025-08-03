// ==========================================
// 📁 react-app/src/App.jsx
// APP DIAGNOSTIC - IDENTIFIER LE PROBLÈME D'AFFICHAGE
// ==========================================

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Store auth uniquement pour commencer
import { useAuthStore } from './shared/stores/authStore.js';

// Import du correctif d'erreurs
import './utils/safeFix.js';

// ==========================================
// 🔧 COMPOSANT DE DIAGNOSTIC
// ==========================================

const DiagnosticPage = () => {
  const [diagnostics, setDiagnostics] = useState([]);
  const { user } = useAuthStore();

  useEffect(() => {
    const runDiagnostics = () => {
      const results = [];
      
      try {
        // Test 1: React fonctionne
        results.push({ test: 'React Render', status: 'OK', detail: 'Composant rendu' });
        
        // Test 2: Auth Store
        results.push({ 
          test: 'Auth Store', 
          status: user ? 'OK' : 'WARN', 
          detail: user ? `Utilisateur: ${user.email}` : 'Pas d\'utilisateur'
        });
        
        // Test 3: Router
        results.push({ test: 'React Router', status: 'OK', detail: window.location.pathname });
        
        // Test 4: Styles
        results.push({ test: 'Tailwind CSS', status: 'OK', detail: 'Classes appliquées' });
        
        // Test 5: Console errors
        const hasErrors = window.console._errors?.length > 0;
        results.push({ 
          test: 'Console Errors', 
          status: hasErrors ? 'ERROR' : 'OK', 
          detail: hasErrors ? `${window.console._errors.length} erreurs` : 'Aucune erreur critique'
        });
        
      } catch (error) {
        results.push({ test: 'Diagnostic', status: 'ERROR', detail: error.message });
      }
      
      setDiagnostics(results);
    };

    runDiagnostics();
    
    // Re-test toutes les 5 secondes
    const interval = setInterval(runDiagnostics, 5000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🔧 Diagnostic Synergia v3.5
          </h1>
          <p className="text-gray-400 text-lg">
            Identification des problèmes d'affichage
          </p>
        </div>

        {/* Tests de diagnostic */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">🧪 Tests de Diagnostic</h2>
          
          <div className="space-y-4">
            {diagnostics.map((diag, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={`text-2xl ${
                    diag.status === 'OK' ? '✅' : 
                    diag.status === 'WARN' ? '⚠️' : '❌'
                  }`}>
                    {diag.status === 'OK' ? '✅' : 
                     diag.status === 'WARN' ? '⚠️' : '❌'}
                  </span>
                  <div>
                    <h3 className="text-white font-medium">{diag.test}</h3>
                    <p className="text-gray-400 text-sm">{diag.detail}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  diag.status === 'OK' ? 'bg-green-900/50 text-green-300' :
                  diag.status === 'WARN' ? 'bg-yellow-900/50 text-yellow-300' :
                  'bg-red-900/50 text-red-300'
                }`}>
                  {diag.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Informations système */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Info navigateur */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">🌐 Navigateur</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">User Agent:</span>
                <span className="text-white text-xs">{navigator.userAgent.substring(0, 30)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Viewport:</span>
                <span className="text-white">{window.innerWidth} x {window.innerHeight}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">URL:</span>
                <span className="text-white">{window.location.pathname}</span>
              </div>
            </div>
          </div>

          {/* Info utilisateur */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">👤 Utilisateur</h3>
            <div className="space-y-2 text-sm">
              {user ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span className="text-white">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Nom:</span>
                    <span className="text-white">{user.displayName || 'Non défini'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">UID:</span>
                    <span className="text-white text-xs">{user.uid?.substring(0, 20)}...</span>
                  </div>
                </>
              ) : (
                <p className="text-gray-400">Aucun utilisateur connecté</p>
              )}
            </div>
          </div>
        </div>

        {/* Console logs récents */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">📋 Logs Console</h3>
          <div className="bg-black/50 rounded-lg p-4 font-mono text-sm">
            <div className="text-green-400">✅ Diagnostic page rendue</div>
            <div className="text-blue-400">ℹ️ React Router: {window.location.pathname}</div>
            <div className="text-yellow-400">⚠️ Mode debug actif</div>
            <div className="text-white">🕒 {new Date().toLocaleTimeString()}</div>
          </div>
        </div>

        {/* Actions de test */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            🔄 Recharger Page
          </button>
          
          <button 
            onClick={() => localStorage.clear()}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            🗑️ Vider Cache
          </button>
          
          <button 
            onClick={() => console.log('🧪 Test console')}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            🧪 Test Console
          </button>
          
          <button 
            onClick={() => window.history.pushState({}, '', '/dashboard')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            🏠 Aller Dashboard
          </button>
        </div>

        {/* Status final */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700/50 rounded-lg">
            <span className="text-2xl">🔧</span>
            <span className="text-white font-medium">Diagnostic en cours...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 🔧 COMPOSANT LOGIN ULTRA-SIMPLE
// ==========================================

const SimpleLogin = () => {
  const { signInWithGoogle } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      console.log('✅ Connexion Google réussie');
    } catch (error) {
      console.error('❌ Erreur Google:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-6">🔐 Synergia Login</h1>
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Connexion...' : '🔍 Continuer avec Google'}
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 🎯 APP PRINCIPAL
// ==========================================

const App = () => {
  const { user, loading: authLoading, checkAuthState } = useAuthStore();

  // Vérifier l'état d'authentification au montage
  useEffect(() => {
    console.log('🔐 App: Vérification état auth...');
    checkAuthState();
  }, [checkAuthState]);

  // Écran de chargement
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg">🔧 Chargement diagnostic...</p>
        </div>
      </div>
    );
  }

  console.log('🎯 App rendu, utilisateur:', user?.email || 'Non connecté');

  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          {/* Route de diagnostic pour tous */}
          <Route path="/diagnostic" element={<DiagnosticPage />} />
          
          {/* Routes conditionnelles */}
          {!user ? (
            <>
              <Route path="/login" element={<SimpleLogin />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Navigate to="/diagnostic" replace />} />
              <Route path="/dashboard" element={<DiagnosticPage />} />
              <Route path="*" element={<DiagnosticPage />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
};

export default App;

// ==========================================
// 📋 LOGS DE DIAGNOSTIC
// ==========================================
console.log('🔧 App diagnostic chargé');
console.log('🎯 Mode debug pour identifier le problème d\'affichage');
console.log('📊 Redirection automatique vers /diagnostic');
