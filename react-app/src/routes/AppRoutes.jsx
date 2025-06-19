// src/routes/AppRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../shared/stores/authStore';

// Importation des pages existantes
import Dashboard from '../modules/dashboard/Dashboard';
import Login from '../modules/auth/Login';
import Register from '../modules/auth/Register';

// 🎮 Nouvelle importation pour la gamification
import GamificationDashboard from '../modules/gamification/GamificationDashboard';

// Composants de protection des routes
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuthStore();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, isLoading } = useAuthStore();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  return user ? <Navigate to="/dashboard" replace /> : children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <Register />
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
      
      {/* 🎮 Nouvelle route pour la gamification */}
      <Route 
        path="/gamification" 
        element={
          <ProtectedRoute>
            <GamificationDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Route par défaut */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* 404 - Page non trouvée */}
      <Route 
        path="*" 
        element={
          <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-purple-500 mb-4">404</h1>
              <p className="text-gray-400 mb-8">Page non trouvée</p>
              <a 
                href="/dashboard" 
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
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
