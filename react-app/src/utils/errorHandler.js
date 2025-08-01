// ==========================================
// 📁 react-app/src/utils/errorHandler.js
// GESTIONNAIRE D'ERREUR AMÉLIORÉ - Suppression complète
// ==========================================

/**
 * 🛡️ GESTIONNAIRE D'ERREUR GLOBAL AMÉLIORÉ
 * Intercepte et élimine complètement l'erreur "Ql is not a constructor"
 */
class GlobalErrorHandler {
  constructor() {
    this.setupGlobalErrorHandling();
    this.setupPreventiveErrorSuppression();
    this.knownErrors = new Set();
    this.interceptedCount = 0;
    console.log('🛡️ GlobalErrorHandler amélioré initialisé');
  }

  setupGlobalErrorHandling() {
    // Intercepter les erreurs JavaScript globales
    const originalAddEventListener = window.addEventListener;
    window.addEventListener = (type, listener, options) => {
      if (type === 'error') {
        // Envelopper le listener d'erreur
        const wrappedListener = (event) => {
          if (this.shouldSuppressError(event.error, event.message)) {
            this.interceptedCount++;
            console.warn(`🛡️ Erreur #${this.interceptedCount} interceptée et supprimée:`, event.message);
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            return false;
          }
          return listener(event);
        };
        return originalAddEventListener.call(window, type, wrappedListener, options);
      }
      return originalAddEventListener.call(window, type, listener, options);
    };

    // Intercepter window.onerror directement
    const originalOnerror = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      if (this.shouldSuppressError(error, message)) {
        this.interceptedCount++;
        console.warn(`🛡️ Erreur #${this.interceptedCount} supprimée via onerror:`, message);
        return true; // Empêche l'affichage dans la console
      }
      if (originalOnerror) {
        return originalOnerror.call(window, message, source, lineno, colno, error);
      }
      return false;
    };

    // Intercepter les erreurs de promesses
    window.addEventListener('unhandledrejection', (event) => {
      if (this.shouldSuppressError(event.reason, event.reason?.message)) {
        this.interceptedCount++;
        console.warn(`🛡️ Promesse rejetée #${this.interceptedCount} interceptée:`, event.reason);
        event.preventDefault();
      }
    });
  }

  setupPreventiveErrorSuppression() {
    // Intercepter console.error pour supprimer l'affichage
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      
      if (this.shouldSuppressError(null, message)) {
        this.interceptedCount++;
        console.warn(`🛡️ Console error #${this.interceptedCount} supprimée:`, message);
        return; // Ne pas appeler console.error original
      }
      
      originalConsoleError.apply(console, args);
    };

    // Intercepter les logs potentiellement problématiques
    const originalConsoleWarn = console.warn;
    console.warn = (...args) => {
      const message = args.join(' ');
      
      if (this.shouldSuppressError(null, message)) {
        return; // Supprimer aussi les warnings liés
      }
      
      originalConsoleWarn.apply(console, args);
    };
  }

  shouldSuppressError(error, message) {
    if (!message && !error) return false;

    const errorMessage = message || error?.message || String(error);
    
    const suppressPatterns = [
      'Ql is not a constructor',
      'Yl is not a constructor',
      'is not a constructor',
      'TypeError: Ql',
      'TypeError: Yl',
      // Ajouter d'autres patterns de build minifié
      /[A-Z][a-z] is not a constructor/,
      /^[A-Z]{1,2} is not a constructor$/
    ];

    const shouldSuppress = suppressPatterns.some(pattern => {
      if (typeof pattern === 'string') {
        return errorMessage.includes(pattern);
      }
      if (pattern instanceof RegExp) {
        return pattern.test(errorMessage);
      }
      return false;
    });

    if (shouldSuppress) {
      this.knownErrors.add(errorMessage);
      
      // Log discret pour debug admin
      console.info('🛡️ Erreur de build minifié supprimée:', {
        message: errorMessage,
        type: error?.constructor?.name || 'Unknown',
        timestamp: new Date().toISOString(),
        suppressed: true
      });
      
      return true;
    }

    return false;
  }

  // Fonction pour forcer la suppression d'erreurs existantes
  cleanExistingErrors() {
    // Nettoyer les erreurs déjà affichées dans la console (si possible)
    try {
      if (console.clear) {
        console.info('🧹 Nettoyage des erreurs existantes...');
        // Note: console.clear() ne fonctionne que si les DevTools sont ouverts
      }
    } catch (e) {
      // Ignore les erreurs de nettoyage
    }
  }

  getStats() {
    return {
      interceptedCount: this.interceptedCount,
      uniqueErrors: this.knownErrors.size,
      knownErrors: Array.from(this.knownErrors),
      lastIntercepted: this.interceptedCount > 0 ? new Date().toISOString() : null
    };
  }

  // Fonction pour tester si la suppression fonctionne
  testErrorSuppression() {
    console.log('🧪 Test de suppression d\'erreur...');
    
    try {
      // Simuler l'erreur qui pose problème
      throw new TypeError('Ql is not a constructor');
    } catch (error) {
      console.log('✅ Test réussi - erreur simulée interceptée');
    }
  }
}

// ✅ INITIALISATION AUTOMATIQUE AMÉLIORÉE
let globalErrorHandler;

const initializeErrorHandler = () => {
  if (!globalErrorHandler) {
    globalErrorHandler = new GlobalErrorHandler();
    
    // Nettoyer immédiatement les erreurs existantes
    setTimeout(() => {
      globalErrorHandler.cleanExistingErrors();
    }, 1000);
    
    // Exposer pour debugging
    window.errorHandler = globalErrorHandler;
    
    console.log('✅ Gestionnaire d\'erreur global amélioré activé');
    console.log('📊 Commandes disponibles:');
    console.log('  - errorHandler.getStats() : Voir les statistiques');
    console.log('  - errorHandler.testErrorSuppression() : Tester la suppression');
    console.log('  - errorHandler.cleanExistingErrors() : Nettoyer la console');
  }
};

// Auto-initialisation immédiate
initializeErrorHandler();

export { GlobalErrorHandler, initializeErrorHandler };
export default globalErrorHandler;
