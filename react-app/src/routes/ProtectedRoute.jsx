// ==========================================
// 📁 react-app/src/routes/ProtectedRoute.jsx
// COMPOSANT PROTECTED ROUTE
// ==========================================

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../shared/stores/authStore.js';

/**
 * 🛡️ ROUTE PROTÉGÉE
 * Vérifie que l'utilisateur est connecté
 */
const ProtectedRoute = () => {
  const { user, loading } = useAuthStore();
  
  // Afficher un loader pendant la vérification
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Chargement...</p>
        </div>
      </div>
    );
  }
  
  // Rediriger vers login si pas connecté
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Afficher la page si connecté
  return <Outlet />;
};

export default ProtectedRoute;
