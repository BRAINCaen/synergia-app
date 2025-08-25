// ==========================================
// 📁 react-app/src/routes/index.jsx
// ROUTER MINIMALISTE FONCTIONNEL - SANS IMPORTS CASSÉS
// ==========================================

import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '../shared/stores/authStore.js'

// 🔒 Composant de protection des routes
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

// 🎯 PAGES SIMPLES EN DUR (pas d'imports cassés)
const LoginPage = () => {
  const { signInWithGoogle, loading } = useAuthStore();
  
  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Erreur connexion:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 max-w-md mx-4 text-center">
        <h1 className="text-white text-3xl font-bold mb-6">🚀 Synergia v3.5</h1>
        <p className="text-gray-300 mb-8">Application de gestion collaborative</p>
        
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 px-6 rounded-lg font-medium transition-colors"
        >
          {loading ? 'Connexion...' : 'Se connecter avec Google'}
        </button>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const { user, signOut } = useAuthStore();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              🚀 Bienvenue, {user?.displayName || user?.email}
            </h1>
            <p className="text-gray-400">Synergia v3.5.4 - Build réussi !</p>
          </div>
          <button
            onClick={signOut}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Déconnexion
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-white font-semibold mb-2">Build Réussi</h3>
            <p className="text-gray-400 text-sm">Netlify build fonctionnel</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-white font-semibold mb-2">Router Stable</h3>
            <p className="text-gray-400 text-sm">Navigation fonctionnelle</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="text-white font-semibold mb-2">Auth Firebase</h3>
            <p className="text-gray-400 text-sm">Authentification active</p>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">🎉 Router Minimal Fonctionnel</h2>
          <p className="text-gray-400 mb-4">
            Ce router minimaliste fonctionne sans imports cassés. Une fois le build validé, 
            tu peux réintroduire progressivement les autres pages.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">✅ Fonctionnel</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Authentification Google</li>
                <li>• Protection des routes</li>
                <li>• Navigation de base</li>
                <li>• Build Netlify</li>
              </ul>
            </div>
            
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">🔄 À réintroduire</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Pages Analytics, Tasks, etc.</li>
                <li>• Routes admin complètes</li>
                <li>• Composants avancés</li>
                <li>• Imports externes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-gray-400 mb-8">Page non trouvée</p>
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          🏠 Retour au Dashboard
        </button>
      </div>
    </div>
  );
};

// 🎯 COMPOSANT PRINCIPAL DES ROUTES
const AppRoutes = () => {
  return (
    <Routes>
      {/* Route de connexion */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Route protégée du dashboard */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Redirection par défaut */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Page 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRoutes

console.log('✅ [ROUTES] Router minimaliste fonctionnel chargé')
console.log('🎯 [ROUTES] Pages disponibles: /login, /dashboard')
console.log('🛡️ [ROUTES] Authentification et protection actives')
console.log('🚀 [ROUTES] Prêt pour build Netlify !');
