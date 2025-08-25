// ==========================================
// 📁 react-app/src/App.jsx - VERSION CORRIGÉE UTILISANT AppRoutes
// REMPLACER COMPLÈTEMENT LE FICHIER EXISTANT PAR CE CODE
// ==========================================

import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

// 🔧 IMPORTS CORE
import { useAuthStore, initializeAuthStore } from './shared/stores/authStore.js';
import LoadingScreen from './components/ui/LoadingScreen.jsx';

// ✅ IMPORT DU ROUTER COMPLET AVEC TOUTES LES ROUTES ADMIN
import AppRoutes from './routes/index.jsx';

/**
 * 🎯 COMPOSANT APP PRINCIPAL - VERSION CORRIGÉE
 * UTILISE AppRoutes QUI CONTIENT TOUTES LES ROUTES ADMIN
 */
const App = () => {
  const [appReady, setAppReady] = useState(false);
  const [error, setError] = useState(null);

  // 🚀 INITIALISATION UNIQUE ET SÉCURISÉE
  useEffect(() => {
    const initApp = async () => {
      try {
        console.log('🚀 [APP] Synergia v3.5.3 - Initialisation avec AppRoutes complet');
        
        // Initialiser l'auth store
        await initializeAuthStore();
        
        console.log('✅ [APP] Auth store initialisé');
        console.log('✅ [APP] Toutes les routes admin disponibles via AppRoutes');
        
        setAppReady(true);
        
      } catch (error) {
        console.error('❌ [APP] Erreur initialisation:', error);
        setError(error);
      }
    };

    initApp();
  }, []);

  // 🚨 GESTION D'ERREUR
  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-red-800 mb-4">
              ❌ Erreur d'initialisation
            </h1>
            <p className="text-red-600 mb-6">
              {error.message || 'Une erreur est survenue lors du démarrage de l\'application.'}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              🔄 Recharger l'application
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ⏳ ÉCRAN DE CHARGEMENT
  if (!appReady) {
    return <LoadingScreen />;
  }

  // 🎯 APPLICATION PRINCIPALE AVEC ROUTER COMPLET
  return (
    <Router>
      <div className="app">
        <Suspense 
          fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement de la page...</p>
              </div>
            </div>
          }
        >
          {/* ✅ UTILISATION D'AppRoutes QUI CONTIENT TOUTES LES ROUTES */}
          <AppRoutes />
        </Suspense>
      </div>
    </Router>
  );
};

export default App;

// ==========================================
// 📊 LOG DE CONFIRMATION
// ==========================================

console.log('✅ [APP] App.jsx utilise maintenant AppRoutes');
console.log('🛡️ [APP] Toutes les routes admin sont maintenant disponibles:');
console.log('   • /admin/task-validation');
console.log('   • /admin/objective-validation'); 
console.log('   • /admin/complete-test');
console.log('   • /admin/profile-test');
console.log('   • /admin/role-permissions');
console.log('   • /admin/rewards');
console.log('   • /admin/badges');
console.log('   • /admin/users');
console.log('   • /admin/analytics');
console.log('   • /admin/settings');
console.log('   • /admin/sync');
console.log('   • Et toutes les autres routes...');
console.log('🚀 [APP] Synergia v3.5.3 - Router unifié actif');
