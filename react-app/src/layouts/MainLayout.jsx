// ==========================================
// 📁 react-app/src/layouts/MainLayout.jsx  
// MAINLAYOUT SANS BARRE DE NAVIGATION DU HAUT
// ==========================================

import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../shared/stores/authStore.js';

const MainLayout = () => {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Fermer la sidebar au changement de route
  useEffect(() => {
    // Placeholder pour d'éventuels effets de route
  }, [location.pathname]);

  // Déconnexion
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* PLUS DE HEADER - SUPPRIMÉ COMPLÈTEMENT */}
      
      {/* Contenu principal full screen */}
      <main className="min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
