// ==========================================
// 📁 react-app/src/App.jsx
// APPLICATION PRINCIPALE - Version simple et robuste
// ==========================================

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

// Loading component simple
const LoadingScreen = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <h1 className="text-white text-2xl font-bold mb-2">Synergia v3.5</h1>
      <p className="text-gray-400">Initialisation...</p>
    </div>
  </div>
);

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

// Composant App principal
function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [authStore, setAuthStore] = useState(null);
  const [appRouter, setAppRouter] = useState(null);

  // Charger les dépendances de façon asynchrone
  useEffect(() => {
    const loadDependencies = async () => {
      try {
        console.log('🚀 Chargement des dépendances...');
        
        // Charger le store d'auth
        const { useAuthStore } = await import('./shared/stores/authStore.js');
        setAuthStore(useAuthStore);
        
        // Charger le router
        const AppRouterModule = await import('./components/routing/AppRouter.jsx');
        setAppRouter(() => AppRouterModule.default);
        
        // Attendre un peu pour l'initialisation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('✅ Dépendances chargées');
        setIsLoading(false);
        
      } catch (error) {
        console.error('❌ Erreur chargement dépendances:', error);
        
        // Fallback : essayer de charger directement
        try {
          const AppRouterModule = await import('./components/routing/AppRouter.jsx');
          setAppRouter(() => AppRouterModule.default);
          setIsLoading(false);
        } catch (fallbackError) {
          console.error('❌ Erreur fallback:', fallbackError);
          // Rester en loading et afficher une erreur après un timeout
          setTimeout(() => {
            setIsLoading(false);
          }, 3000);
        }
      }
    };

    loadDependencies();
  }, []);

  // Affichage conditionnel
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Si pas de router, afficher une erreur
  if (!appRouter) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">❌</div>
          <h1 className="text-white text-xl mb-4">Erreur de chargement</h1>
          <p className="text-gray-400 mb-4">Impossible de charger le routeur de l'application.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Recharger
          </button>
        </div>
      </div>
    );
  }

  // Créer le composant Router
  const AppRouterComponent = appRouter;

  return (
    <ErrorBoundary>
      <Router>
        <div className="App min-h-screen bg-gray-900">
          <AppRouterComponent />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
