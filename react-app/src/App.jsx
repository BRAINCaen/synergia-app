// ==========================================
// 📁 react-app/src/App.jsx
// VERSION CORRIGÉE ET NETTOYÉE - UTILISE routes/index.jsx
// ==========================================

import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useAuthStore, initializeAuthStore } from './shared/stores/authStore.js';
import LoadingScreen from './components/ui/LoadingScreen.jsx';

// ✅ IMPORT DU ROUTER COMPLET (solution propre)
import AppRoutes from './routes/index.jsx';

// 🔧 Import des correctifs nécessaires
import './core/motionComponentFix.js';
import './core/missingImportsFix.js';

const App = () => {
  const [appReady, setAppReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        console.log('🚀 [APP] Synergia v3.5.4 - Initialisation');
        await initializeAuthStore();
        setAppReady(true);
      } catch (error) {
        console.error('❌ [APP] Erreur initialisation:', error);
        setError(error);
      }
    };

    initApp();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-800 mb-4">Erreur d'initialisation</h1>
          <p className="text-red-600">{error.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Recharger l'application
          </button>
        </div>
      </div>
    );
  }

  if (!appReady) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <Suspense fallback={<LoadingScreen />}>
        {/* ✅ UTILISATION DU SYSTÈME DE ROUTING UNIFIÉ */}
        <AppRoutes />
      </Suspense>
    </Router>
  );
};

export default App;

console.log('✅ [APP] App.jsx chargé - Version propre utilisant routes/index.jsx');
