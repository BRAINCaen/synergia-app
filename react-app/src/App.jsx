import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, Link, useLocation } from 'react-router-dom';

// 🔧 IMPORT avec destructuration correcte
import { useAuthStore } from './shared/stores/authStore.js';

// Pages
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import TasksPage from './pages/TasksPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

// Component de chargement simple
function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-white">Chargement...</p>
      </div>
    </div>
  );
}

// Layout complet avec navigation
function MainLayout() {
  const { user, signOut } = useAuthStore();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/tasks', label: 'Tâches', icon: '✅' },
    { path: '/projects', label: 'Projets', icon: '📁' },
    { path: '/analytics', label: 'Analytics', icon: '📊' },
    { path: '/leaderboard', label: 'Classement', icon: '🏆' },
    { path: '/profile', label: 'Profil', icon: '👤' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-gray-800 shadow-lg">
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">⚡</span>
            <div>
              <h1 className="text-xl font-bold text-white">Synergia</h1>
              <p className="text-sm text-gray-400">v3.3 Production</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive(item.path)
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }
                `}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* User Info & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3 mb-3">
            <img
              src={user?.photoURL || 'https://via.placeholder.com/40'}
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-gray-600"
            />
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
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <span>🚪</span>
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gray-800 shadow-sm border-b border-gray-700">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {navItems.find(item => isActive(item.path))?.label || 'Page'}
                </h2>
                <p className="text-sm text-gray-400">
                  Gestion d'équipe et gamification
                </p>
              </div>
              
              {/* Stats utilisateur */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-white">Niveau 4</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-blue-400">💎</span>
                  <span className="text-white">535 XP</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Contenu de la page */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

// Page par défaut pour les routes manquantes
function DefaultPage({ title, icon, description }) {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">{icon}</span>
          <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
          <p className="text-gray-400 mb-6">{description}</p>
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-300">
              Cette fonctionnalité est en cours de développement. 
              Votre système de gamification et Firebase sont pleinement opérationnels !
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  // 🔧 CORRECTION : Utilisation simplifiée sans boucle
  const { user, loading, initializeAuth } = useAuthStore();

  useEffect(() => {
    let unsubscribe;
    
    if (initializeAuth && typeof initializeAuth === 'function') {
      console.log('🔧 Initialisation unique de l\'authentification...');
      unsubscribe = initializeAuth();
    } else {
      console.warn('⚠️ initializeAuth non disponible');
    }
    
    // Nettoyage
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []); // 🔧 IMPORTANT : Dépendances vides pour éviter les boucles

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <Routes>
        {/* Route publique */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
        />

        {/* Routes protégées avec navigation */}
        <Route 
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route 
            path="tasks" 
            element={<TasksPage />}
          />
          <Route 
            path="projects" 
            element={<ProjectsPage />}
          />
          <Route 
            path="analytics" 
            element={<AnalyticsPage />}
          />
          <Route 
            path="leaderboard" 
            element={<LeaderboardPage />}
          />
          <Route 
            path="profile" 
            element={<ProfilePage />}
          />
        </Route>

        {/* Route par défaut */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
