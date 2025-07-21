// ==========================================
// 📁 react-app/src/App.jsx
// APPLICATION PRINCIPALE - CORRIGÉE POUR MOTION
// ==========================================

import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

// 🔧 IMPORT CRITIQUE : CORRECTION MOTION EN PREMIER
import './core/motionImportFix.js';

// Imports directs (compatible build)
import { useAuthStore } from './shared/stores/authStore.js';
import AppRouter from './components/routing/AppRouter.jsx';

// ✅ Imports Firebase pour initialisation
import { auth } from './core/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';

// Error Boundary amélioré avec gestion Motion
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Vérifier si c'est une erreur motion
    const isMotionError = error.message && (
      error.message.includes('motion is not defined') ||
      error.message.includes('AnimatePresence is not defined') ||
      error.message.includes('framer-motion')
    );
    
    if (isMotionError) {
      console.warn('🎬 Erreur Motion détectée et gérée:', error.message);
      return { hasError: false }; // Ne pas afficher l'écran d'erreur pour motion
    }
    
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Tentative de récupération pour les erreurs motion
    if (error.message && error.message.includes('motion')) {
      console.log('🔄 Tentative de récupération motion...');
      setTimeout(() => {
        this.setState({ hasError: false, error: null });
      }, 1000);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-white text-2xl font-bold mb-4">Erreur de l'application</h1>
            <p className="text-gray-400 mb-6">Une erreur inattendue s'est produite.</p>
            
            {/* Détails de l'erreur en mode développement */}
            {import.meta.env.DEV && this.state.error && (
              <div className="text-left bg-gray-800 p-4 rounded-lg mb-6 text-xs text-gray-300">
                <div className="font-bold mb-2">Détails de l'erreur :</div>
                <div>{this.state.error.message}</div>
                {this.state.errorInfo && (
                  <div className="mt-2 opacity-75">
                    {this.state.errorInfo.componentStack.split('\n').slice(0, 5).join('\n')}
                  </div>
                )}
              </div>
            )}
            
            <div className="space-y-3">
              <button 
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Recharger la page
              </button>
              <button 
                onClick={() => {
                  // Diagnostic motion avant reload
                  if (typeof window.diagnoseMotion === 'function') {
                    window.diagnoseMotion();
                  }
                  localStorage.clear();
                  window.location.reload();
                }}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                Effacer les données et recharger
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 🚀 APPLICATION PRINCIPALE SYNERGIA v3.5
 * Configuration complète et optimisée avec correction Motion
 */
function App() {
  const { user, loading, initializeAuth, setUser, setLoading } = useAuthStore();

  // ✅ Initialisation de l'authentification + Motion fix
  useEffect(() => {
    console.log('🚀 Initialisation de App.jsx...');
    
    // Vérifier l'état de Motion
    setTimeout(() => {
      if (typeof window !== 'undefined' && typeof window.diagnoseMotion === 'function') {
        console.log('🔍 Diagnostic Motion automatique...');
        window.diagnoseMotion();
      }
    }, 1000);
    
    // Initialiser le store d'authentification
    const unsubscribe = initializeAuth();
    
    // Cleanup function
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [initializeAuth]);

  // ✅ Écran de chargement pendant l'initialisation (sans motion)
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          {/* Spinner CSS simple (pas de motion) */}
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-white text-xl font-semibold mb-2">Chargement de Synergia</h2>
          <p className="text-gray-400">Initialisation en cours...</p>
          
          {/* Indicateur Motion en mode dev */}
          {import.meta.env.DEV && (
            <div className="mt-4 text-xs text-gray-600">
              Motion: {typeof window !== 'undefined' && window.motion ? '✅' : '⚠️ Polyfill'}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <AppRouter />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;

// ✅ Console de debug avec info Motion
console.log('✅ App.jsx chargé avec succès');
console.log('🔧 Mode:', import.meta.env.MODE);
console.log('🚀 Version:', import.meta.env.VITE_APP_VERSION || '3.5.2');
console.log('🎬 Motion Fix:', typeof window !== 'undefined' && window.motion ? 'actif' : 'en attente');
