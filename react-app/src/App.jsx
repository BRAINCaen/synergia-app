// src/App.jsx - Version minimale qui fonctionne
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './shared/stores/authStore.js';

// Import seulement les nouveaux composants que nous avons créés
import { TaskList } from './modules/tasks/TaskList.jsx';
import { ProjectDashboard } from './modules/projects/ProjectDashboard.jsx';
import { Navigation } from './shared/components/Navigation.jsx';

// Composant de login simple
const SimpleLogin = () => {
  const { loginWithGoogle, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Synergia</h2>
          <p className="mt-2 text-gray-600">Connectez-vous pour continuer</p>
        </div>
        
        <button
          onClick={loginWithGoogle}
          disabled={loading}
          className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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

// Layout simple avec votre navigation
const SimpleLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main>
        {children}
      </main>
    </div>
  );
};

// Route protégée
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
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
          
          {/* Dashboard - Page d'accueil simple */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <SimpleLayout>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                  <div className="px-4 py-6 sm:px-0">
                    <div className="text-center">
                      <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        🎉 Bienvenue dans Synergia !
                      </h1>
                      <p className="text-gray-600 mb-8">
                        Votre système de gestion de tâches gamifié est maintenant prêt !
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        <div className="bg-white p-6 rounded-lg shadow border">
                          <div className="text-4xl mb-3">📋</div>
                          <h3 className="text-lg font-semibold mb-2">Tâches</h3>
                          <p className="text-gray-600 mb-4">
                            Gérez vos tâches avec un système de gamification
                          </p>
                          <a 
                            href="/tasks"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            📋 Voir les tâches
                          </a>
                        </div>
                        
                        <div className="bg-white p-6 rounded-lg shadow border">
                          <div className="text-4xl mb-3">🏗️</div>
                          <h3 className="text-lg font-semibold mb-2">Projets</h3>
                          <p className="text-gray-600 mb-4">
                            Organisez vos projets et suivez leur progression
                          </p>
                          <a 
                            href="/projects"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            🏗️ Voir les projets
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </SimpleLayout>
            </ProtectedRoute>
          } />
          
          {/* Pages Tâches et Projets */}
          <Route path="/tasks" element={
            <ProtectedRoute>
              <SimpleLayout>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                  <TaskList />
                </div>
              </SimpleLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/projects" element={
            <ProtectedRoute>
              <SimpleLayout>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                  <ProjectDashboard />
                </div>
              </SimpleLayout>
            </ProtectedRoute>
          } />
          
          {/* Redirections */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
