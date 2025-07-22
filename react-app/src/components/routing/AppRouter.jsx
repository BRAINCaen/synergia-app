// ==========================================
// 📁 react-app/src/components/routing/AppRouter.jsx
// AJOUT UNIQUEMENT DE LA ROUTE GAMIFICATION
// ==========================================

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../shared/stores/authStore.js';

// Import de la page gamification
import GamificationPage from '../../pages/GamificationPage.jsx';

// ==========================================
// 🚀 COMPOSANTS DE BASE SIMPLIFIÉS (INCHANGÉS)
// ==========================================

// Page de connexion simple
const Login = () => {
  const { signInWithGoogle, loading } = useAuthStore();
  
  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      console.log('✅ Connexion réussie');
    } catch (error) {
      console.error('❌ Erreur connexion:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 max-w-md mx-4 text-center">
        <h1 className="text-white text-3xl font-bold mb-6">Synergia v3.5.3</h1>
        <p className="text-gray-300 mb-8">Application de gestion collaborative</p>
        
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 px-6 rounded-lg font-medium transition-colors"
        >
          {loading ? 'Connexion...' : '🚀 Se connecter avec Google'}
        </button>
      </div>
    </div>
  );
};

// Dashboard simple
const Dashboard = () => {
  const { user, signOut } = useAuthStore();

  const handleLogout = async () => {
    try {
      await signOut();
      console.log('👋 Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
    }
  };

  const handleNavigateToGamification = () => {
    // Simple redirection JavaScript pour éviter les problèmes de router
    window.location.href = '/gamification';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header simple */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            🏠 Dashboard Synergia
          </h1>
          
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">
              Bonjour, {user?.displayName || user?.email || 'Utilisateur'}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Puck Time
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Carte de bienvenue */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👋</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 ml-4">Bienvenue !</h2>
            </div>
            <p className="text-gray-600">
              L'application fonctionne correctement. Route gamification ajoutée avec succès.
            </p>
          </div>

          {/* État de l'application */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 ml-4">État</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Version:</span>
                <span className="text-blue-600">v3.5.3</span>
              </div>
              <div className="flex justify-between">
                <span>Build:</span>
                <span className="text-green-600">Stable</span>
              </div>
              <div className="flex justify-between">
                <span>Router:</span>
                <span className="text-green-600">+ Gamification</span>
              </div>
            </div>
          </div>

          {/* Navigation rapide */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🧭</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 ml-4">Navigation</h2>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleNavigateToGamification}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                🎮 Aller à la Gamification
              </button>
              
              <button
                onClick={() => window.location.href = '/debug'}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                🔧 Mode Debug
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Page de debug simple (INCHANGÉE)
const DebugPage = () => {
  const { user } = useAuthStore();
  
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
          <h1 className="text-white text-2xl font-bold mb-6">🔧 Mode Debug</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informations utilisateur */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3">👤 Utilisateur</h3>
              <div className="space-y-2 text-sm">
                <div className="text-gray-300">UID: {user?.uid || 'Non connecté'}</div>
                <div className="text-gray-300">Email: {user?.email || 'N/A'}</div>
                <div className="text-gray-300">Nom: {user?.displayName || 'N/A'}</div>
              </div>
            </div>
            
            {/* État des corrections */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3">🛡️ Corrections</h3>
              <div className="space-y-2 text-sm">
                <div className="text-gray-300">Motion: {typeof window !== 'undefined' && window.motion ? '✅' : '❌'}</div>
                <div className="text-gray-300">Services: {typeof window !== 'undefined' && window.updateUserProgress ? '✅' : '❌'}</div>
                <div className="text-gray-300">XP Safety: {typeof window !== 'undefined' && window.getXPRewardSafely ? '✅' : '❌'}</div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex space-x-4">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              ← Retour Dashboard
            </button>
            
            <button
              onClick={() => console.clear()}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              🧹 Clear Console
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 🛡️ COMPOSANTS DE PROTECTION (INCHANGÉS)
// ==========================================

// Composant de protection pour les routes authentifiées
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Chargement de l'application...</p>
          <p className="text-gray-400 text-sm mt-2">Vérification des corrections...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// ==========================================
// 🚀 ROUTER PRINCIPAL AVEC GAMIFICATION AJOUTÉE
// ==========================================

const AppRouter = () => {
  console.log('🚀 [ROUTER] AppRouter avec gamification activé');
  
  return (
    <Routes>
      {/* Route de connexion */}
      <Route path="/login" element={<Login />} />
      
      {/* Route protégée du dashboard */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* ✨ NOUVELLE ROUTE GAMIFICATION */}
      <Route 
        path="/gamification" 
        element={
          <ProtectedRoute>
            <GamificationPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Route de debug */}
      <Route 
        path="/debug" 
        element={
          <ProtectedRoute>
            <DebugPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Redirection par défaut */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Page 404 simple */}
      <Route path="*" element={
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
      } />
    </Routes>
  );
};

export default AppRouter;

// Log de confirmation
console.log('✅ AppRouter mis à jour - Route gamification ajoutée');
console.log('🎯 Routes disponibles: /login, /dashboard, /gamification, /debug');
console.log('🎮 Gamification maintenant accessible !');
console.log('🛡️ Toutes les corrections maintenues');
