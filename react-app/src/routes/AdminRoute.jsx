// ==========================================
// 📁 react-app/src/routes/AdminRoute.jsx
// COMPOSANT ADMIN ROUTE - PROTECTION ADMIN
// ==========================================

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../shared/stores/authStore.js';

/**
 * 🛡️ ROUTE PROTÉGÉE ADMIN
 * Vérifie que l'utilisateur est connecté ET a le rôle admin
 */
const AdminRoute = () => {
  const { user, loading } = useAuthStore();
  
  // Afficher un loader pendant la vérification
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Vérification des permissions...</p>
        </div>
      </div>
    );
  }
  
  // Rediriger vers login si pas connecté
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Rediriger vers dashboard si pas admin
  if (!user.isAdmin && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Afficher la page admin si tout est OK
  return <Outlet />;
};

export default AdminRoute;
