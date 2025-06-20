// App.jsx - Version finale avec authentification complète
import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useAuthStore } from './shared/stores/authStore';
import MainLayout from './layouts/MainLayout';
import AppRoutes from './routes/AppRoutes';

function App() {
  const { initializeAuth, isInitialized, isLoading } = useAuthStore();

  // Initialiser l'écoute d'authentification au démarrage
  useEffect(() => {
    console.log('🔥 Initialisation de Firebase Auth...');
    const unsubscribe = initializeAuth();
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [initializeAuth]);

  // Écran de chargement pendant l'initialisation
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Initialisation de Synergia...</p>
          <p className="text-gray-400 text-sm">Connexion à Firebase</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <MainLayout>
        <AppRoutes />
      </MainLayout>
    </Router>
  );
}

export default App;
