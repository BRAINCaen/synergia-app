// src/App.jsx - Avec vraie authentification Firebase
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from './shared/stores/authStore.js';

// Import des nouveaux composants pour les tâches et projets
import { TaskList } from './modules/tasks/TaskList.jsx';
import { ProjectDashboard } from './modules/projects/ProjectDashboard.jsx';

// Composant Navigation
const Navigation = ({ user, onLogout }) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/tasks', label: 'Tâches', icon: '📋' },
    { path: '/projects', label: 'Projets', icon: '🏗️' }
  ];

  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg font-bold">⚡</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Synergia</h1>
              <span className="text-xs text-green-400 bg-green-900 px-2 py-0.5 rounded-full">
                v2.0 • Modulaire
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Profil utilisateur */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.displayName ? user.displayName[0].toUpperCase() : 'U'}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-white">
                  {user?.displayName || user?.email?.split('@')[0] || 'Utilisateur'}
                </p>
                <p className="text-xs text-gray-400">👤 Membre</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

// Composant Dashboard Original
const Dashboard = ({ user }) => {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Message de bienvenue */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl p-6 mb-8">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">
              Bonsoir, {user?.displayName || user?.email?.split('@')[0] || 'Utilisateur'} ! 👋
            </h2>
            <p className="text-blue-100 mb-4">
              Bienvenue dans Synergia v2.0 avec la nouvelle architecture modulaire ! 🚀
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <span>📅</span>
                <span className="text-blue-100">
                  {new Intl.DateTimeFormat('fr-FR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  }).format(new Date())}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span>🎯</span>
                <span className="text-blue-100">Niveau 1</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>⭐</span>
                <span className="text-blue-100">0 XP</span>
              </div>
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="relative">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.displayName ? user.displayName[0].toUpperCase() : 'U'}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1">
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  En ligne
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex justify-between items-start mb-2">
            <span className="text-gray-400 text-sm">STATUT</span>
            <div className="w-8 h-8 bg-green-900 rounded-lg flex items-center justify-center">
              <span className="text-green-400">✅</span>
            </div>
          </div>
          <p className="text-xl font-bold text-green-400">Actif</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex justify-between items-start mb-2">
            <span className="text-gray-400 text-sm">NIVEAU</span>
            <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center">
              <span className="text-blue-400">🎯</span>
            </div>
          </div>
          <p className="text-xl font-bold text-white">1</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex justify-between items-start mb-2">
            <span className="text-gray-400 text-sm">EXPÉRIENCE</span>
            <div className="w-8 h-8 bg-purple-900 rounded-lg flex items-center justify-center">
              <span className="text-purple-400">⭐</span>
            </div>
          </div>
          <p className="text-xl font-bold text-purple-400">0 XP</p>
        </div>
      </div>

      {/* Sections principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Architecture Modulaire */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">🏗</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Architecture Modulaire</h3>
              <p className="text-gray-400 text-sm">Fondations solides pour l'évolution</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-green-400">✓</span>
              <span className="text-green-400 text-sm">Services d'authentification optimisés</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-400">✓</span>
              <span className="text-green-400 text-sm">Interface utilisateur moderne</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-400">✓</span>
              <span className="text-green-400 text-sm">Système de tâches gamifié</span>
            </div>
          </div>
        </div>

        {/* Roadmap 2025 */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">🎯</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Roadmap 2025</h3>
              <p className="text-gray-400 text-sm">Prochaines fonctionnalités</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white text-sm">Phase 1 - Architecture</span>
              <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">Terminé</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white text-sm">Phase 2 - Gamification</span>
              <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">Terminé</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white text-sm">Phase 3 - Tâches Firebase</span>
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">En cours</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modules en développement */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span>🚀</span>
          Modules en Développement
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Tâches - NOUVEAU */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="text-center">
              <div className="text-4xl mb-3">📋</div>
              <h4 className="text-lg font-semibold text-white mb-2">Tâches Firebase</h4>
              <p className="text-gray-400 text-sm mb-4">Persistance temps réel</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                <div className="bg-blue-600 h-2 rounded-full" style={{width: '90%'}}></div>
              </div>
              <p className="text-xs text-gray-400 mb-3">90%</p>
              <Link 
                to="/tasks"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-lg transition-colors"
              >
                Tester
              </Link>
            </div>
          </div>

          {/* Projets - NOUVEAU */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="text-center">
              <div className="text-4xl mb-3">🏗️</div>
              <h4 className="text-lg font-semibold text-white mb-2">Projets</h4>
              <p className="text-gray-400 text-sm mb-4">Organisation par projets</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                <div className="bg-green-600 h-2 rounded-full" style={{width: '85%'}}></div>
              </div>
              <p className="text-xs text-gray-400 mb-3">85%</p>
              <Link 
                to="/projects"
                className="bg-green-600 hover:bg-green-700 text-white text-xs px-4 py-2 rounded-lg transition-colors"
              >
                Voir
              </Link>
            </div>
          </div>

          {/* Gamification */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="text-center">
              <div className="text-4xl mb-3">🎮</div>
              <h4 className="text-lg font-semibold text-white mb-2">Gamification</h4>
              <p className="text-gray-400 text-sm mb-4">Points, badges, niveaux</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                <div className="bg-purple-600 h-2 rounded-full" style={{width: '75%'}}></div>
              </div>
              <p className="text-xs text-gray-400 mb-3">75%</p>
              <span className="bg-purple-600 text-white text-xs px-4 py-2 rounded-lg">
                En développement
              </span>
            </div>
          </div>

          {/* Pointage */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="text-center">
              <div className="text-4xl mb-3">⏰</div>
              <h4 className="text-lg font-semibold text-white mb-2">Pointage</h4>
              <p className="text-gray-400 text-sm mb-4">Gestion du temps</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                <div className="bg-gray-600 h-2 rounded-full" style={{width: '0%'}}></div>
              </div>
              <p className="text-xs text-gray-400 mb-3">0%</p>
              <span className="bg-gray-600 text-white text-xs px-4 py-2 rounded-lg">
                Planifié
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Message de célébration */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-center">
        <div className="text-2xl mb-3">🎉</div>
        <h3 className="text-xl font-bold text-white mb-2">
          Synergia v2.0 avec Firebase temps réel !
        </h3>
        <p className="text-gray-400 mb-4">
          Architecture modulaire + Authentification Firebase + Persistance Firestore maintenant disponibles.
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <span>✨</span>
            <span className="text-gray-300">Interface moderne</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>🔧</span>
            <span className="text-gray-300">Architecture évolutive</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>🔥</span>
            <span className="text-gray-300">Firebase intégré</span>
          </div>
        </div>
      </div>

      {/* Debug info */}
      <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
        <div className="text-xs text-gray-500">
          🔍 Debug: User ID = {user?.uid || 'Aucun'} | Email = {user?.email || 'Aucun'}
        </div>
      </div>
    </main>
  );
};

// Layout pour les pages tâches et projets
const TaskLayout = ({ children, user, onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation user={user} onLogout={onLogout} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

// Page de connexion Firebase
const FirebaseLogin = () => {
  const { loginWithGoogle, loading } = useAuthStore();
  
  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Erreur connexion:', error);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4 text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Connexion en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">⚡</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Synergia</h1>
          <p className="text-gray-600">v2.0 • Firebase Edition</p>
        </div>
        
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Se connecter avec Google
        </button>
      </div>
    </div>
  );
};

function App() {
  const { user, logout, initializeAuth, loading } = useAuthStore();

  // Initialiser l'authentification Firebase au montage
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Affichage pendant le chargement initial
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Initialisation...</p>
        </div>
      </div>
    );
  }

  // Page de connexion si pas connecté
  if (!user) {
    return <FirebaseLogin />;
  }

  // Application principale avec routing
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        <Routes>
          {/* Dashboard principal */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={
            <div>
              <Navigation user={user} onLogout={logout} />
              <Dashboard user={user} />
            </div>
          } />
          
          {/* Pages Tâches */}
          <Route path="/tasks" element={
            <TaskLayout user={user} onLogout={logout}>
              <TaskList />
            </TaskLayout>
          } />
          
          {/* Pages Projets */}
          <Route path="/projects" element={
            <TaskLayout user={user} onLogout={logout}>
              <ProjectDashboard />
            </TaskLayout>
          } />
          
          {/* Redirection par défaut */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
