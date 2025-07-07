// ==========================================
// 📁 react-app/src/routes/ProtectedRoute.jsx
// ProtectedRoute CORRIGÉ - Cohérence avec authStore
// ==========================================

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../shared/stores/authStore.js';

const ProtectedRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuthStore();
  const location = useLocation();

  // Afficher un loader pendant la vérification de l'auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-400">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Rediriger vers login si non authentifié
  // ✅ CORRECTION: Utiliser à la fois user ET isAuthenticated pour plus de sécurité
  if (!user || !isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Rendre le composant enfant si authentifié
  return children;
};

export default ProtectedRoute;
