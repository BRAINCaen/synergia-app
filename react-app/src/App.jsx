import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';

// Stores et services
import { useAuthStore } from './shared/stores/authStore';
import { useGameStore } from './shared/stores/gameStore';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TasksPage from './pages/TasksPage';
import ProjectsPage from './pages/ProjectsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';

// Component de chargement
function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-white">Chargement de Synergia...</p>
      </div>
    </div>
  );
}

// Layout principal avec navigation
function MainLayout() {
  const { user, signOut } = useAuthStore();
  const { userStats, initializeUser } = useGameStore();
  const location = useLocation();

  // Initialiser l'utilisateur dans le système de gamification
  useEffect(() => {
    if (user?.uid && !userStats) {
      initializeUser(user.uid);
    }
  }, [user?.uid, userStats, initializeUser]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠', color: 'text-blue-400' },
    { path: '/tasks', label: 'Tâches', icon: '✅', color: 'text-green-400' },
    { path: '/projects', label: 'Projets', icon: '📁', color: 'text-purple-400' },
    { path: '/analytics', label: 'Analytics', icon: '📊', color: 'text-orange-400' },
    { path: '/leaderboard', label: 'Classement', icon: '🏆', color: 'text-yellow-400' },
    { path: '/profile', label: 'Profil', icon: '👤', color: 'text-gray-400' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-gray-800 shadow-lg flex flex-col">
        {/* Logo et infos utilisateur */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-2xl">⚡</span>
            <div>
              <h1 className="text-xl font-bold text-white">Synergia</h1>
              <p className="text-sm text-gray-400">v3.4 Firebase</p>
            </div>
          </div>
          
          {/* Infos utilisateur */}
          {userStats && (
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Niveau {userStats.level || 1}</span>
                <span className="text-sm text-yellow-400 font-medium">
                  {userStats.totalXp?.toLocaleString() || 0} XP
                </span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(((userStats.totalXp || 0) % 1000) / 10, 100)}%` 
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {user?.email?.split('@')[0] || 'Utilisateur'}
              </p>
            </div>
          )}
        </div>

        {/* Navigation principale */}
        <nav className="flex-1 mt-6 px-3">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive(item.path)
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }
                `}
              >
                <span className={`text-lg ${isActive(item.path) ? 'text-white' : item.color}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {isActive(item.path) && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* Footer avec actions */}
        <div className="p-4 border-t border-gray-700">
          <div className="space-y-2">
            {/* Statistiques rapides */}
            {userStats && (
              <div className="text-xs text-gray-400 grid grid-cols-2 gap-2">
                <div className="bg-gray-700/30 rounded p-2 text-center">
                  <div className="font-medium text-white">{userStats.tasksCompleted || 0}</div>
                  <div>Tâches</div>
                </div>
                <div className="bg-gray-700/30 rounded p-2 text-center">
                  <div className="font-medium text-white">{userStats.projectsCreated || 0}</div>
                  <div>Projets</div>
                </div>
              </div>
            )}
            
            {/* Bouton déconnexion */}
            <button
              onClick={handleLogout}
              className="w-full px-3 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-gray-700/50 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>🚪</span>
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header avec notifications */}
        <header className="bg-gray-800/50 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-white">
                {navItems.find(item => item.path === location.pathname)?.label || 'Synergia'}
              </h2>
              
              {/* Badge de notification XP récente */}
              {userStats?.lastXpGain && (
                <div className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-medium">
                  +{userStats.lastXpGain} XP
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {/* Indicateur de connexion */}
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                En ligne
              </div>
              
              {/* Avatar utilisateur */}
              <Link 
                to="/profile"
                className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm hover:shadow-lg transition-all"
              >
                {user?.email?.charAt(0)?.toUpperCase() || '?'}
              </Link>
            </div>
          </div>
        </header>

        {/* Zone de contenu avec scroll */}
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// Composant principal de l'application
function App() {
  const { user, loading, initializeAuth } = useAuthStore();

  // Initialiser l'authentification au démarrage
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Affichage pendant le chargement initial
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <div className="App">
        {user ? (
          <MainLayout />
        ) : (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;
