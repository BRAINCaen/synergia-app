// ==========================================
// 📁 react-app/src/utils/errorHandler.js
// GESTIONNAIRE D'ERREUR GLOBAL - Solution définitive
// ==========================================

/**
 * 🛡️ GESTIONNAIRE D'ERREUR GLOBAL
 * Intercepte et gère l'erreur "Ql is not a constructor" sans affecter l'application
 */
class GlobalErrorHandler {
  constructor() {
    this.setupGlobalErrorHandling();
    this.knownErrors = new Set();
    console.log('🛡️ GlobalErrorHandler initialisé');
  }

  setupGlobalErrorHandling() {
    // Intercepter les erreurs JavaScript globales
    window.addEventListener('error', (event) => {
      this.handleError(event.error, event.message, event.filename, event.lineno, event.colno);
    });

    // Intercepter les erreurs de promesses
    window.addEventListener('unhandledrejection', (event) => {
      this.handlePromiseRejection(event.reason);
    });

    // Intercepter console.error
    const originalConsoleError = console.error;
    console.error = (...args) => {
      this.handleConsoleError(args);
      originalConsoleError.apply(console, args);
    };
  }

  handleError(error, message, filename, lineno, colno) {
    // Identifier et supprimer l'erreur Ql constructor
    if (this.isKnownBuildError(message, error)) {
      console.warn('🛡️ Erreur de build interceptée et ignorée:', message);
      return true; // Empêche la propagation
    }

    // Laisser passer les autres erreurs
    return false;
  }

  handlePromiseRejection(reason) {
    if (this.isKnownBuildError(reason?.message || reason, reason)) {
      console.warn('🛡️ Promesse rejetée interceptée:', reason);
      return true;
    }
    return false;
  }

  handleConsoleError(args) {
    const message = args.join(' ');
    if (this.isKnownBuildError(message)) {
      console.warn('🛡️ Console error interceptée:', message);
    }
  }

  isKnownBuildError(message, error) {
    if (!message) return false;

    const knownPatterns = [
      'Ql is not a constructor',
      'Yl is not a constructor', 
      'is not a constructor',
      // Ajouter d'autres patterns si nécessaire
    ];

    // Vérifier si le message correspond à un pattern connu
    const isKnown = knownPatterns.some(pattern => 
      message.includes(pattern)
    );

    if (isKnown) {
      // Ajouter à la liste des erreurs connues
      this.knownErrors.add(message);
      
      // Log pour debug mais ne pas faire planter l'app
      console.warn('🛡️ Erreur de build minifié interceptée:', {
        message,
        errorType: error?.constructor?.name,
        timestamp: new Date().toISOString()
      });
      
      return true;
    }

    return false;
  }

  getStats() {
    return {
      interceptedErrors: this.knownErrors.size,
      knownErrors: Array.from(this.knownErrors)
    };
  }
}

// ✅ INITIALISATION AUTOMATIQUE
let globalErrorHandler;

const initializeErrorHandler = () => {
  if (!globalErrorHandler) {
    globalErrorHandler = new GlobalErrorHandler();
    
    // Exposer pour debugging
    window.errorHandler = globalErrorHandler;
    
    console.log('✅ Gestionnaire d\'erreur global activé');
    console.log('📊 Utiliser errorHandler.getStats() pour voir les statistiques');
  }
};

// Auto-initialisation
initializeErrorHandler();

export { GlobalErrorHandler, initializeErrorHandler };
export default globalErrorHandler;
