// src/routes/PublicRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../shared/stores/authStore.js';

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  // Si déjà authentifié, rediriger vers la page d'origine ou dashboard
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  // Rendre le composant enfant si non authentifié
  return children;
};

export default PublicRoute;
