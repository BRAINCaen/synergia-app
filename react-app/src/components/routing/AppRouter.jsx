// ==========================================
// 📁 react-app/src/components/routing/AppRouter.jsx
// VERSION STABLE RESTAURÉE - QUI MARCHAIT AVANT
// ==========================================

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../shared/stores/authStore.js';

// ==========================================
// 🚀 COMPOSANTS SIMPLES INTÉGRÉS
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
        <h1 className="text-white text-3xl font-bold mb-6">🚀 Synergia v3.5.3</h1>
        <p className="text-gray-300 mb-8">Application de gestion collaborative</p>
        
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 px-6 rounded-lg font-medium transition-colors"
        >
          {loading ? 'Connexion...' : '🚀 Se connecter avec Google'}
        </button>
        
        <p className="text-gray-400 text-sm mt-4">
          Version stable restaurée
        </p>
      </div>
    </div>
  );
};

// Dashboard simple mais fonctionnel
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

  // Navigation vers les pages
  const navigationItems = [
    { label: '🎮 Gamification', path: '/gamification', color: 'bg-purple-500 hover:bg-purple-600' },
    { label: '✅ Tâches', path: '/tasks', color: 'bg-blue-500 hover:bg-blue-600' },
    { label: '📁 Projets', path: '/projects', color: 'bg-green-500 hover:bg-green-600' },
    { label: '👥 Équipe', path: '/team', color: 'bg-orange-500 hover:bg-orange-600' },
    { label: '🔧 Debug', path: '/debug', color: 'bg-gray-500 hover:bg-gray-600' }
  ];

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
              Déconnexion
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
              Version stable restaurée. Navigation fonctionnelle.
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
                <span className="text-green-600">v3.5.3 Stable</span>
              </div>
              <div className="flex justify-between">
                <span>Build:</span>
                <span className="text-green-600">Restauré</span>
              </div>
              <div className="flex justify-between">
                <span>Pages:</span>
                <span className="text-green-600">Fonctionnelles</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:col-span-2 lg:col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🧭</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 ml-4">Navigation</h2>
            </div>
            <div className="space-y-3">
              {navigationItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => window.location.href = item.path}
                  className={`w-full ${item.color} text-white px-4 py-2 rounded-lg text-sm transition-colors`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions de debug */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">🔧 Actions de debug</h3>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => console.log('🔄 Test console')}
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
      </main>
    </div>
  );
};

// Pages simples pour les autres routes
const GamificationPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900 flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-4xl font-bold mb-4">🎮 Gamification</h1>
      <p className="text-xl mb-8">Page gamification - Version stable</p>
      <button 
        onClick={() => window.location.href = '/dashboard'}
        className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg"
      >
        🏠 Retour Dashboard
      </button>
    </div>
  </div>
);

const TasksPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-900 via-green-900 to-gray-900 flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-4xl font-bold mb-4">✅ Tâches</h1>
      <p className="text-xl mb-8">Page tâches - Version stable</p>
      <button 
        onClick={() => window.location.href = '/dashboard'}
        className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg"
      >
        🏠 Retour Dashboard
      </button>
    </div>
  </div>
);

const ProjectsPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-green-900 via-teal-900 to-gray-900 flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-4xl font-bold mb-4">📁 Projets</h1>
      <p className="text-xl mb-8">Page projets - Version stable</p>
      <button 
        onClick={() => window.location.href = '/dashboard'}
        className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg"
      >
        🏠 Retour Dashboard
      </button>
    </div>
  </div>
);

const TeamPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-gray-900 flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-4xl font-bold mb-4">👥 Équipe</h1>
      <p className="text-xl mb-8">Page équipe - Version stable</p>
      <button 
        onClick={() => window.location.href = '/dashboard'}
        className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg"
      >
        🏠 Retour Dashboard
      </button>
    </div>
  </div>
);

const DebugPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-4xl font-bold mb-4">🔧 Debug</h1>
      <p className="text-xl mb-8">Page debug - Version stable</p>
      <button 
        onClick={() => window.location.href = '/dashboard'}
        className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg"
      >
        🏠 Retour Dashboard
      </button>
    </div>
  </div>
);

// ==========================================
// 🛡️ PROTECTION DES ROUTES
// ==========================================
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Chargement...</p>
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
// 🚀 ROUTER PRINCIPAL
// ==========================================
const AppRouter = () => {
  console.log('🚀 AppRouter - Version stable restaurée');
  
  return (
    <Routes>
      {/* Route publique */}
      <Route path="/login" element={<Login />} />
      
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
        path="/gamification" 
        element={
          <ProtectedRoute>
            <GamificationPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/tasks" 
        element={
          <ProtectedRoute>
            <TasksPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/projects" 
        element={
          <ProtectedRoute>
            <ProjectsPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/team" 
        element={
          <ProtectedRoute>
            <TeamPage />
          </ProtectedRoute>
        } 
      />
      
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
  );
};

export default AppRouter;
