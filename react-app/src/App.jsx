// ==========================================
// 📁 react-app/src/App.jsx
// VERSION STABLE RESTAURÉE - QUI MARCHAIT AVANT
// ==========================================

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRouter from './components/routing/AppRouter.jsx';
import { useAuthStore } from './shared/stores/authStore.js';
import './assets/styles/globals.css';

/**
 * 🚀 COMPOSANT APP PRINCIPAL - VERSION STABLE
 */
function App() {
  const { user, loading } = useAuthStore();

  React.useEffect(() => {
    console.log('🚀 App.jsx - Version stable restaurée');
    console.log('📍 Utilisateur:', user?.email || 'Non connecté');
    console.log('⏳ Chargement:', loading);
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Synergia</p>
          <p className="text-gray-400 text-sm mt-2">Chargement de l'application...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <AppRouter />
      </div>
    </Router>
  );
}

export default App;
