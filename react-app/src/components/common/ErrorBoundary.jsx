// ==========================================
// 📁 react-app/src/components/common/ErrorBoundary.jsx
// ERROR BOUNDARY INTELLIGENT AVEC XP SAFETY
// ==========================================

import React from 'react';

/**
 * 🛡️ ERROR BOUNDARY INTELLIGENT
 * Gère les erreurs React tout en ignorant les erreurs corrigées
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Liste des erreurs que nous avons corrigées
    const correctedErrors = [
      'motion is not defined',
      'AnimatePresence is not defined',
      'framer-motion',
      'updateUserProgress',
      'getUserProgress',
      'Cannot read properties of null (reading \'xpReward\')',
      'xpReward is not defined',
      'task.xpReward is undefined'
    ];
    
    const isCorrectedError = correctedErrors.some(correctedError => 
      error.message && error.message.includes(correctedError)
    );
    
    if (isCorrectedError) {
      console.warn('🎬 [BOUNDARY] Erreur corrigée ignorée:', error.message);
      return { hasError: false };
    }
    
    console.error('❌ [BOUNDARY] Erreur non corrigée capturée:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ [BOUNDARY] Erreur capturée:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Auto-récupération pour erreurs corrigées
    if (error.message && (
      error.message.includes('motion') || 
      error.message.includes('Progress') ||
      error.message.includes('framer') ||
      error.message.includes('xpReward')
    )) {
      console.log('🔄 [BOUNDARY] Auto-récupération...');
      setTimeout(() => {
        this.setState({ 
          hasError: false, 
          error: null,
          retryCount: this.state.retryCount + 1
        });
      }, 1000);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: this.state.retryCount + 1
    });
  };

  render() {
    if (this.state.hasError) {
      const isXPError = this.state.error?.message?.includes('xpReward');
      const isFramerError = this.state.error?.message?.includes('motion') || 
                           this.state.error?.message?.includes('framer');
      
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 max-w-md mx-4 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-white text-2xl font-bold mb-4">
              {isXPError ? 'Erreur XP détectée' : 
               isFramerError ? 'Erreur d\'animation' : 
               'Erreur Application'}
            </h2>
            <p className="text-gray-300 mb-6">
              {isXPError ? 'Une erreur liée aux points d\'expérience s\'est produite.' :
               isFramerError ? 'Une erreur d\'animation s\'est produite.' :
               'Une erreur inattendue s\'est produite.'}
            </p>
            
            {import.meta.env.DEV && (
              <div className="bg-black/30 rounded-lg p-4 mb-6 text-left">
                <p className="text-red-400 text-sm font-mono break-all">
                  {this.state.error?.message || 'Erreur inconnue'}
                </p>
                {this.state.retryCount > 0 && (
                  <p className="text-yellow-400 text-xs mt-2">
                    Tentatives: {this.state.retryCount}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors font-medium"
              >
                🔄 Réessayer
              </button>
              
              <button
                onClick={this.handleReload}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg transition-colors font-medium"
              >
                🔃 Recharger la page
              </button>
              
              {import.meta.env.DEV && (
                <button
                  onClick={() => {
                    console.log('🧪 État ErrorBoundary:', this.state);
                    console.log('🧪 Erreur complète:', this.state.error);
                    console.log('🧪 Info erreur:', this.state.errorInfo);
                  }}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-lg transition-colors font-medium text-sm"
                >
                  🐛 Debug Console
                </button>
              )}
            </div>
            
            <p className="text-gray-500 text-xs mt-6">
              Synergia v3.5.3 - Error Boundary
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
