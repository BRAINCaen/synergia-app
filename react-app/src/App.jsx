// src/App.jsx - Version simplifiée pour test
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './shared/stores/authStore.js';

// Import seulement les composants existants
import { TaskList } from './modules/tasks/TaskList.jsx';
import { ProjectDashboard } from './modules/projects/ProjectDashboard.jsx';

// Composant de test simple pour le login
const SimpleLogin = () => {
  const { loginWithGoogle } = useAuthStore();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Synergia</h2>
          <p className="mt-2 text-gray-600">Connectez-vous pour continuer</p>
        </div>
        
        <button
          onClick={loginWithGoogle}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Se connecter avec Google
        </button>
      </div>
    </div>
  );
};

// Composant Dashboard simple
const SimpleDashboard = () => {
  const { user, logout } = useAuthStore();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header simple */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Synergia</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user?.displayName || user?.email}
              </span>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation simple */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <a href="/tasks" className="border-b-2 border-blue-500 py-4 px-1 text-sm font-medium text-blue-600">
              Tâches
            </a>
            <a href="/projects" className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700">
              Projets
            </a>
          </div>
        </div>
      </nav>

      {/* Contenu */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              🎉 Interface Tâches Prête !
            </h2>
            <p className="text-gray-600 mb-8">
              Vos composants TaskCard, TaskForm et TaskList sont intégrés !
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">📋 Tâches</h3>
                <p className="text-gray-600 mb-4">Gérez vos tâches avec gamification</p>
                <a 
                  href="/tasks"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Voir les tâches
                </a>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">🏗️ Projets</h3>
                <p className="text-gray-600 mb-4">Organisez vos projets</p>
                <a 
                  href="/projects"
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Voir les projets
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Layout simple
const SimpleLayout = ({ children }) => {
  const { user, logout } = useAuthStore();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Synergia</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user?.displayName || user?.email}
              </span>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <a href="/dashboard" className="py-4 px-1 text-sm font-medium text-gray-700 hover:text-gray-900">
              Dashboard
            </a>
            <a href="/tasks" className="py-4 px-1 text-sm font-medium text-gray-700 hover:text-gray-900">
              Tâches
            </a>
            <a href="/projects" className="py-4 px-1 text-sm font-medium text-gray-700 hover:text-gray-900">
              Projets
            </a>
          </div>
        </div>
      </nav>

      {/* Contenu */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  );
};

// Route protégée
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  const { initializeAuth, user } = useAuthStore();

  // Initialiser l'authentification au montage
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Route de connexion */}
          <Route path="/login" element={
            user ? <Navigate to="/dashboard" replace /> : <SimpleLogin />
          } />
          
          {/* Routes protégées */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <SimpleDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/tasks" element={
            <ProtectedRoute>
              <SimpleLayout>
                <TaskList />
              </SimpleLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/projects" element={
            <ProtectedRoute>
              <SimpleLayout>
                <ProjectDashboard />
              </SimpleLayout>
            </ProtectedRoute>
          } />
          
          {/* Redirection par défaut */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
