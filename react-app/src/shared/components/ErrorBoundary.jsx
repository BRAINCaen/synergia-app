// ==========================================
// 📁 react-app/src/shared/components/ErrorBoundary.jsx
// COMPOSANT ERROR BOUNDARY POUR GESTION D'ERREURS
// ==========================================

import React from 'react';

/**
 * 🛡️ COMPOSANT ERROR BOUNDARY
 * Capture les erreurs React et affiche une interface de fallback
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Met à jour l'état pour afficher l'interface de fallback
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log l'erreur
    console.error('❌ [ErrorBoundary] Erreur capturée:', error);
    console.error('📊 [ErrorBoundary] Info erreur:', errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReload = () => {
    // Recharger la page
    window.location.reload();
  };

  handleReset = () => {
    // Réinitialiser l'état d'erreur
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      // Interface de fallback en cas d'erreur
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="max-w-2xl mx-auto p-8 text-center">
            {/* Icône d'erreur */}
            <div className="w-20 h-20 mx-auto mb-6 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-3xl">⚠️</span>
            </div>
            
            {/* Titre */}
            <h1 className="text-3xl font-bold text-white mb-4">
              Oups ! Une erreur s'est produite
            </h1>
            
            {/* Message */}
            <p className="text-gray-300 mb-6 text-lg">
              Synergia a rencontré un problème inattendu. 
              Ne vous inquiétez pas, vos données sont sauvegardées.
            </p>
            
            {/* Détails de l'erreur (mode développement) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 text-left">
                <h3 className="text-red-400 font-semibold mb-2">Détails de l'erreur :</h3>
                <pre className="text-red-200 text-sm overflow-auto max-h-40">
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
              >
                Réessayer
              </button>
              
              <button
                onClick={this.handleReload}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
              >
                Recharger la page
              </button>
            </div>
            
            {/* Support */}
            <div className="mt-8 p-4 bg-white/10 rounded-lg">
              <p className="text-gray-400 text-sm">
                Si le problème persiste, contactez le support technique avec le code d'erreur suivant :
              </p>
              <code className="text-yellow-400 font-mono text-xs mt-2 block">
                ERR_{Date.now().toString(36).toUpperCase()}
              </code>
            </div>
          </div>
        </div>
      );
    }

    // Rendu normal si pas d'erreur
    return this.props.children;
  }
}

export default ErrorBoundary;
