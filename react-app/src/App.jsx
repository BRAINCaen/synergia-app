// ==========================================
// 📁 react-app/src/App.jsx
// APPLICATION PRINCIPALE - Version complète et corrigée
// ==========================================

import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

// Imports directs (compatible build)
import { useAuthStore } from './shared/stores/authStore.js';
import AppRouter from './components/routing/AppRouter.jsx';

// ✅ Imports Firebase pour initialisation
import { auth } from './core/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';

// Error Boundary simple
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-white text-2xl font-bold mb-4">Erreur de l'application</h1>
            <p className="text-gray-400 mb-6">Une erreur inattendue s'est produite.</p>
            <div className="space-y-3">
              <button 
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Recharger la page
              </button>
              <button 
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
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
 * Configuration complète et optimisée
 */
function App() {
  const { user, loading, initializeAuth, setUser, setLoading } = useAuthStore();

  // ✅ Initialisation de l'authentification
  useEffect(() => {
    console.log('🚀 Initialisation de App.jsx...');
    
    // Initialiser le store d'authentification
    const unsubscribe = initializeAuth();
    
    // Cleanup function
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [initializeAuth]);

  // ✅ Écran de chargement pendant l'initialisation
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-white text-xl font-semibold mb-2">Chargement de Synergia</h2>
          <p className="text-gray-400">Initialisation en cours...</p>
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

// ✅ Console de debug
console.log('✅ App.jsx chargé avec succès');
console.log('🔧 Mode:', import.meta.env.MODE);
console.log('🚀 Version:', import.meta.env.VITE_APP_VERSION || '3.5.2');
