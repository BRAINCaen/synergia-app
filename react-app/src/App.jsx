// ==========================================
// 📁 react-app/src/App.jsx
// VERSION AVEC APPROUTER COMME FALLBACK SÉCURISÉ
// ==========================================

import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useAuthStore, initializeAuthStore } from './shared/stores/authStore.js';
import LoadingScreen from './components/ui/LoadingScreen.jsx';

// 🎯 DOUBLE SYSTÈME DE ROUTING AVEC FALLBACK
let AppRoutes = null;
let AppRouter = null;

// Essayer d'importer le router principal
try {
  const routesModule = await import('./routes/index.jsx');
  AppRoutes = routesModule.default;
  console.log('✅ Router principal chargé');
} catch (error) {
  console.warn('⚠️ Router principal non disponible:', error.message);
  try {
    // Fallback vers AppRouter
    const routerModule = await import('./components/routing/AppRouter.jsx');
    AppRouter = routerModule.default;
    console.log('✅ Router de fallback (AppRouter) chargé');
  } catch (fallbackError) {
    console.error('❌ Aucun router disponible:', fallbackError.message);
  }
}

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

  // 🎯 SYSTÈME DE ROUTING AVEC FALLBACK AUTOMATIQUE
  const CurrentRouter = AppRoutes || AppRouter;
  
  if (!CurrentRouter) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-yellow-800 mb-4">Erreur de routing</h1>
          <p className="text-yellow-600 mb-4">Aucun système de routing disponible</p>
          <div className="text-sm text-gray-600">
            <p>Vérifiez que les fichiers suivants existent :</p>
            <ul className="mt-2 text-left">
              <li>• react-app/src/routes/index.jsx</li>
              <li>• react-app/src/components/routing/AppRouter.jsx</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Suspense fallback={<LoadingScreen />}>
        <CurrentRouter />
      </Suspense>
    </Router>
  );
};

export default App;

console.log('✅ [APP] App.jsx avec système de fallback chargé');
