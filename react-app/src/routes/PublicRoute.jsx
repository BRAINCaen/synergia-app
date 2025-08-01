// ==========================================
// 📁 react-app/src/routes/PublicRoute.jsx
// COMPOSANT PUBLIC ROUTE
// ==========================================

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../shared/stores/authStore.js';

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-white">Chargement...</p>
        </div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

export default PublicRoute;
