// ==========================================
// 📁 react-app/src/App.jsx
// APPLICATION PRINCIPALE - Version compatible build production
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
  const { setUser, setLoading, initializeAuth } = useAuthStore();

  // 🎯 Initialisation Firebase au démarrage
  useEffect(() => {
    console.log('🚀 Initialisation Synergia v3.5...');
    
    // Initialiser l'authentification
    initializeAuth();
    
    // Écouter les changements d'authentification
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        console.log('✅ Utilisateur connecté:', firebaseUser.email);
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified
        });
      } else {
        console.log('👤 Aucun utilisateur connecté');
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup
    return () => {
      console.log('🧹 Nettoyage App.jsx');
      unsubscribe();
    };
  }, [setUser, setLoading, initializeAuth]);

  return (
    <ErrorBoundary>
      <Router>
        <div className="App min-h-screen bg-gray-900">
          <AppRouter />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
