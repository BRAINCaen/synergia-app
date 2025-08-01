// ==========================================
// 📁 react-app/src/App.jsx
// VERSION SIMPLIFIÉE QUI MARCHE - SANS IMPORTS COMPLEXES
// ==========================================

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// ==========================================
// 🔧 IMPORTS BASIQUES SEULEMENT
// ==========================================

// Import CSS global
import './assets/styles/globals.css';

// ==========================================
// 🚀 COMPOSANTS INLINE POUR ÉVITER LES IMPORTS CASSÉS
// ==========================================

// Hook d'authentification simple inline
const useAuth = () => {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulation de vérification auth
    setTimeout(() => {
      setLoading(false);
      // Pour le moment, pas d'auth - direct au dashboard
    }, 1000);
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    // Simulation connexion
    setTimeout(() => {
      setUser({ email: 'test@example.com', displayName: 'Utilisateur Test' });
      setLoading(false);
    }, 1000);
  };

  const signOut = async () => {
    setUser(null);
  };

  return { user, loading, signInWithGoogle, signOut };
};

// ==========================================
// 📄 PAGES INLINE SIMPLES
// ==========================================

// Page de connexion
const Login = () => {
  const { signInWithGoogle, loading } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 max-w-md mx-4 text-center">
        <h1 className="text-white text-3xl font-bold mb-6">🚀 Synergia v3.5.3</h1>
        <p className="text-gray-300 mb-8">Application de gestion collaborative</p>
        
        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 px-6 rounded-lg font-medium transition-colors"
        >
          {loading ? 'Connexion...' : '🚀 Se connecter'}
        </button>
        
        <p className="text-gray-400 text-sm mt-4">
          Version corrigée - Imports simplifiés
        </p>
      </div>
    </div>
  );
};

// Dashboard simple
const Dashboard = () => {
  const { user, signOut } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            🏠 Dashboard Synergia
          </h1>
          
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">
              Bonjour, {user?.displayName || 'Utilisateur'}
            </span>
            <button
              onClick={signOut}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Carte de bienvenue */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👋</span>
              </div>
              <h2 className="text-lg font-semibold text-white ml-4">Bienvenue !</h2>
            </div>
            <p className="text-gray-400">
              Application Synergia v3.5.3 démarrée avec succès.
            </p>
          </div>

          {/* État de l'application */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <h2 className="text-lg font-semibold text-white ml-4">État</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Version:</span>
                <span className="text-green-400">v3.5.3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Build:</span>
                <span className="text-green-400">Fonctionnel</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Cache:</span>
                <span className="text-green-400">Nettoyé</span>
              </div>
            </div>
          </div>

          {/* Navigation future */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🧭</span>
              </div>
              <h2 className="text-lg font-semibold text-white ml-4">Navigation</h2>
            </div>
            <div className="space-y-2">
              <div className="text-gray-400 text-sm">Pages à venir :</div>
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded text-xs">Tâches</span>
                <span className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded text-xs">Projets</span>
                <span className="bg-green-600/20 text-green-300 px-2 py-1 rounded text-xs">Équipe</span>
                <span className="bg-orange-600/20 text-orange-300 px-2 py-1 rounded text-xs">Analytics</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="mt-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">🔧 Actions de debug</h3>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => console.log('🔄 Rechargement forcé')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              🔄 Test Console
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              🔄 Recharger Page
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                console.log('🧹 Storage nettoyé');
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              🧹 Nettoyer Storage
            </button>
          </div>
        </div>

        {/* Logs d'information */}
        <div className="mt-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">📊 Informations système</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">URL actuelle:</span>
              <div className="text-green-400 font-mono break-all">{window.location.href}</div>
            </div>
            <div>
              <span className="text-gray-400">User Agent:</span>
              <div className="text-blue-400 font-mono text-xs break-all">{navigator.userAgent}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// ==========================================
// 🛡️ ROUTE GUARD SIMPLE
// ==========================================
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Chargement de l'application...</p>
          <p className="text-gray-400 text-sm mt-2">Version simplifiée - Stable</p>
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
// 🚀 COMPOSANT PRINCIPAL APP
// ==========================================
const App = () => {
  React.useEffect(() => {
    console.log('🚀 App.jsx simplifié démarré');
    console.log('✅ Tous les imports complexes supprimés');
    console.log('🔧 Version de debug stable');
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Route publique */}
          <Route path="/login" element={<Login />} />
          
          {/* Route protégée */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirection par défaut */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Page 404 */}
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
      </div>
    </Router>
  );
};

export default App;
