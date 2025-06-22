// src/routes/index.jsx - ROUTES AVEC MODULE TÂCHES
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from '../shared/stores/authStore';

// Pages principales
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';

// Nouveau composant Tâches
import TaskComponent from '../components/TaskComponent';

// Composant de protection des routes
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Chargement...</div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

// Composant de redirection pour utilisateurs connectés
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Chargement...</div>
      </div>
    );
  }
  
  return user ? <Navigate to="/dashboard" replace /> : children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Route publique - Login */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
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
      
      {/* 🎯 NOUVELLE ROUTE : TÂCHES AVEC GAMIFICATION */}
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <TaskComponent />
          </ProtectedRoute>
        }
      />
      
      {/* Route par défaut */}
      <Route 
        path="/" 
        element={<Navigate to="/dashboard" replace />} 
      />
      
      {/* Route 404 */}
      <Route
        path="*"
        element={
          <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-4">404</h1>
              <p className="text-gray-400 mb-6">Page introuvable</p>
              <a 
                href="/dashboard" 
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors"
              >
                Retour au Dashboard
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
