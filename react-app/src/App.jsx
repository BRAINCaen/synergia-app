// ==========================================
// 📁 react-app/src/App.jsx
// APP PRINCIPAL AVEC SYNCHRONISATION XP INTÉGRÉE
// ==========================================

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppRoutes } from './routes/index.jsx';
import { useAuthStore, initializeAuthStore } from './shared/stores/authStore.js';
import { syncInitializer } from './core/services/syncInitializer.js';
import ErrorBoundary from './shared/components/ErrorBoundary.jsx';
import Toast from './shared/components/Toast.jsx';

/**
 * 🚀 APPLICATION PRINCIPALE AVEC SYNCHRONISATION XP GARANTIE
 */
function App() {
  const { loading: authLoading, error: authError } = useAuthStore();
  const [syncInitialized, setSyncInitialized] = useState(false);
  const [syncError, setSyncError] = useState(null);

  // ✅ INITIALISATION UNIQUE AU DÉMARRAGE
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 [APP] Initialisation application Synergia v3.5');
        
        // 1. Initialiser l'authentification
        console.log('🔐 [APP] Initialisation AuthStore...');
        initializeAuthStore();
        
        // 2. Initialiser la synchronisation XP
        console.log('📡 [APP] Initialisation synchronisation XP...');
        const syncSuccess = await syncInitializer.initialize();
        
        if (syncSuccess) {
          setSyncInitialized(true);
          console.log('✅ [APP] Application initialisée avec succès');
        } else {
          throw new Error('Échec initialisation synchronisation');
        }
        
      } catch (error) {
        console.error('❌ [APP] Erreur initialisation:', error);
        setSyncError(error.message);
      }
    };

    initializeApp();

    // ✅ NETTOYAGE AU DÉMONTAGE
    return () => {
      console.log('🧹 [APP] Nettoyage application');
      if (syncInitialized) {
        syncInitializer.cleanup();
      }
    };
  }, []);

  // 🎭 GESTIONNAIRES D'ÉVÉNEMENTS GLOBAUX POUR UX
  useEffect(() => {
    // Écouter les événements de synchronisation
    const handleConnectionRestored = () => {
      Toast.show('✅ Connexion rétablie - Données synchronisées', 'success');
    };

    const handleConnectionLost = () => {
      Toast.show('📴 Connexion perdue - Mode hors ligne', 'warning');
    };

    const handleXpUpdate = (event) => {
      const { gamificationData } = event.detail;
      if (gamificationData?.totalXp) {
        // Toast.show(`🎯 +XP Données mises à jour`, 'info');
      }
    };

    window.addEventListener('connectionRestored', handleConnectionRestored);
    window.addEventListener('connectionLost', handleConnectionLost);
    window.addEventListener('xpDataUpdated', handleXpUpdate);

    return () => {
      window.removeEventListener('connectionRestored', handleConnectionRestored);
      window.removeEventListener('connectionLost', handleConnectionLost);
      window.removeEventListener('xpDataUpdated', handleXpUpdate);
    };
  }, []);

  // 🔄 ÉCRAN DE CHARGEMENT INITIAL
  if (authLoading || !syncInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            {/* Logo Synergia animé */}
            <div className="w-16 h-16 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl animate-pulse"></div>
              <div className="absolute inset-2 bg-white rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  S
                </span>
              </div>
            </div>
            
            {/* Indicateur de progression */}
            <div className="w-64 h-2 bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse w-3/4"></div>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2">Synergia v3.5</h1>
          <p className="text-gray-400 mb-4">
            {authLoading ? 'Authentification...' : 
             !syncInitialized ? 'Synchronisation XP...' : 
             'Chargement...'}
          </p>
          
          {/* Statuts détaillés */}
          <div className="text-sm text-gray-500 space-y-1">
            <div className="flex items-center justify-center gap-2">
              <div className={`w-2 h-2 rounded-full ${authLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
              <span>Authentification</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className={`w-2 h-2 rounded-full ${!syncInitialized ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
              <span>Synchronisation XP</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ❌ ÉCRAN D'ERREUR
  if (authError || syncError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 mx-auto mb-6 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl">⚠️</span>
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-4">Erreur d'initialisation</h1>
          
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-200 text-sm">
              {authError || syncError}
            </p>
          </div>
          
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            Recharger l'application
          </button>
          
          <p className="text-gray-400 text-xs mt-4">
            Si le problème persiste, contactez le support technique
          </p>
        </div>
      </div>
    );
  }

  // 🎯 APPLICATION PRINCIPALE
  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          {/* Routes principales */}
          <AppRoutes />
          
          {/* Composant Toast global */}
          <Toast />
          
          {/* Indicateur de statut de synchronisation (debug) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="fixed bottom-4 right-4 z-50">
              <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2 text-xs text-white">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>XP Sync Active</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
