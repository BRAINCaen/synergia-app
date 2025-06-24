// src/App.jsx
// Application principale avec toutes les corrections
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
import UsersPage from './pages/UsersPage';

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
  const { userStats } = useGameStore();
  const location = useLocation();

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
    { path: '/users', label: 'Utilisateurs', icon: '👥', color: 'text-cyan-400' },
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
          
          {/* Infos utilisateur - LIGNE 74 CORRIGÉE */}
          {userStats && (
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Niveau {userStats.level || 1}</span>
                <span className="text-sm text-blue-400">{userStats.totalXp || 0} XP</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${userStats.levelProgress?.percentage || 0}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <span className="text-lg mr-3">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Info et Logout */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.displayName || 'Utilisateur'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
          >
            Se déconnecter
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// Route protégée
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuthStore();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Composant principal App
function App() {
  const { initializeAuth, isAuthenticated, loading } = useAuthStore();

  useEffect(() => {
    // Initialiser l'authentification au chargement de l'app
    const unsubscribe = initializeAuth();
    
    // Nettoyage à la fermeture de l'app
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [initializeAuth]);

  // Affichage du loader pendant l'initialisation
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <Routes>
        {/* Route de connexion */}
        <Route 
          path="/login" 
          element={
            isAuthenticated 
              ? <Navigate to="/dashboard" replace /> 
              : <Login />
          } 
        />
        
        {/* Routes protégées */}
        <Route 
          path="/*" 
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
