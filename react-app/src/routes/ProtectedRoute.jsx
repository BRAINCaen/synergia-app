// ==========================================
// 📁 react-app/src/components/auth/ProtectedRoute.jsx
// ROUTE PROTÉGÉE SIMPLIFIÉE POUR BUILD
// ==========================================

import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * 🛡️ COMPOSANT ROUTE PROTÉGÉE SIMPLIFIÉ
 * Version compatible build sans dépendances complexes
 */
const ProtectedRoute = ({ children, adminOnly = false, managerOnly = false }) => {
  // Simuler un état d'authentification basique
  const [isLoading, setIsLoading] = React.useState(true);
  const [user, setUser] = React.useState(null);

  // Simulation de chargement d'authentification
  React.useEffect(() => {
    // Simuler un délai de chargement
    const timer = setTimeout(() => {
      // Utilisateur simulé pour le build
      setUser({
        uid: 'demo-user',
        email: 'demo@synergia.com',
        displayName: 'Utilisateur Démo',
        isAdmin: false,
        isManager: false
      });
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Écran de chargement
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Chargement de Synergia
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Vérification des permissions...
          </p>
        </div>
      </div>
    );
  }

  // Redirection vers login si pas d'utilisateur
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Vérifications de permissions
  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (managerOnly && !user.isManager && !user.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Rendre les enfants si tout est OK
  return children;
};

export default ProtectedRoute;
