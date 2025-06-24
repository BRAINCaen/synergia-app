import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 🔧 IMPORT UNIQUEMENT LES STORES QUI EXISTENT
import { useAuthStore } from './shared/stores/authStore.js';

// Pages - Import basique pour commencer
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';

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

// Layout simple
function SimpleLayout({ children }) {
  const { user, signOut } = useAuthStore();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header simple */}
      <header className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">⚡</span>
              <span className="text-xl font-bold text-white">Synergia</span>
              <span className="text-sm bg-green-500 text-white px-2 py-1 rounded-full">
                v3.3
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-white text-sm">
                {user?.displayName || 'Utilisateur'}
              </span>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700"
                title="Déconnexion"
              >
                🚪
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex-1">
        {children}
      </main>
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
  
  return <SimpleLayout>{children}</SimpleLayout>;
}

function App() {
  const { user, loading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

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

        {/* Routes protégées */}
        <Route 
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Route par défaut */}
        <Route 
          path="/" 
          element={<Navigate to="/dashboard" replace />} 
        />
        <Route 
          path="*" 
          element={<Navigate to="/dashboard" replace />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
