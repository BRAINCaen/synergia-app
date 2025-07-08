// ==========================================
// 📁 react-app/src/layouts/DashboardLayout.jsx
// LAYOUT DASHBOARD AVEC NAVIGATION MISE À JOUR
// ==========================================

import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from '../shared/components/Navigation.jsx';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation principale */}
      <Navigation />
      
      {/* Contenu principal */}
      <main className="pb-8">
        <Outlet />
      </main>
      
      {/* Footer optionnel */}
      <footer className="bg-gray-800 text-gray-400 py-4 text-center text-sm">
        <p>© 2024 Synergia v3.5 - Toutes les fonctionnalités reconnectées</p>
      </footer>
    </div>
  );
};

export default DashboardLayout;
