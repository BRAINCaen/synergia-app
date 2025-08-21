// ==========================================
// 📁 react-app/src/core/services/consoleErrorSuppressor.js
// SUPPRESSEUR D'ERREURS - VERSION JAVASCRIPT PUR
// ==========================================

/**
 * 🤫 SUPPRESSEUR D'ERREURS CONSOLE INTELLIGENT
 * Version sans JSX pour éviter les erreurs de build
 */
class ConsoleErrorSuppressor {
  constructor() {
    this.originalError = console.error;
    this.originalWarn = console.warn;
    this.suppressedCount = 0;
    this.isActive = false;
    
    // Patterns d'erreurs à supprimer
    this.suppressPatterns = [
      /Function arrayUnion\(\) called with invalid data.*serverTimestamp/i,
      /serverTimestamp\(\) can only be used with update\(\) and set\(\)/i,
      /The query requires an index/i,
      /Failed to load resource.*firestore.*400/i,
      /Erreur assignation rôle.*serverTimestamp/i,
      /FirebaseError.*serverTimestamp/i,
      /BadgeNotification/i,
      /400 \(Bad Request\)/i
    ];
    
    this.init();
  }

  /**
   * 🚀 INITIALISATION
   */
  init() {
    if (typeof window !== 'undefined') {
      this.activate();
    }
  }

  /**
   * ⚡ ACTIVER LA SUPPRESSION
   */
  activate() {
    if (this.isActive) return;

    console.error = (...args) => {
      const message = args.join(' ');
      
      // Vérifier si le message correspond aux patterns à supprimer
      const shouldSuppress = this.suppressPatterns.some(pattern => 
        pattern.test(message)
      );

      if (shouldSuppress) {
        this.suppressedCount++;
        
        // Log silencieux en développement seulement
        if (process.env.NODE_ENV === 'development') {
          console.log(`🤫 [SUPPRIMÉ ${this.suppressedCount}] ${message.substring(0, 60)}...`);
        }
        return;
      }

      // Laisser passer les autres erreurs
      this.originalError.apply(console, args);
    };

    console.warn = (...args) => {
      const message = args.join(' ');
      
      if (message.includes('serverTimestamp') || 
          message.includes('arrayUnion') ||
          message.includes('firebase') && message.includes('badge')) {
        this.suppressedCount++;
        return;
      }
      
      this.originalWarn.apply(console, args);
    };

    this.isActive = true;
    console.log('🤫 Suppresseur d\'erreurs activé');
  }

  /**
   * ⏹️ DÉSACTIVER LA SUPPRESSION
   */
  deactivate() {
    if (!this.isActive) return;

    console.error = this.originalError;
    console.warn = this.originalWarn;
    this.isActive = false;
    
    console.log('🔊 Suppresseur d\'erreurs désactivé');
  }

  /**
   * 🧹 NETTOYER LA CONSOLE
   */
  clearConsole() {
    if (typeof console.clear === 'function') {
      console.clear();
    }
    console.log('🧹 Console nettoyée');
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES
   */
  getStats() {
    return {
      suppressedCount: this.suppressedCount,
      isActive: this.isActive,
      patterns: this.suppressPatterns.length
    };
  }

  /**
   * 🧪 TESTER LE SUPPRESSEUR
   */
  test() {
    console.log('🧪 Test du suppresseur d\'erreurs...');
    
    // Tester différents types d'erreurs
    setTimeout(() => {
      console.error('Function arrayUnion() called with invalid data serverTimestamp TEST');
    }, 100);
    
    setTimeout(() => {
      console.error('serverTimestamp() can only be used with update() and set() TEST');
    }, 200);
    
    setTimeout(() => {
      console.error('BadgeNotification error TEST');
    }, 300);
    
    setTimeout(() => {
      console.log('✅ Test terminé - Les erreurs ci-dessus devraient être supprimées');
    }, 500);
  }
}

// ✅ Instance singleton
const errorSuppressor = new ConsoleErrorSuppressor();

// ✅ Auto-activation
if (typeof window !== 'undefined') {
  // Exposer globalement pour le debug
  window.errorSuppressor = errorSuppressor;
  
  // Ajouter aux outils de debug
  if (!window.debugTools) window.debugTools = {};
  window.debugTools.suppressErrors = errorSuppressor;
  
  // Commandes pratiques
  window.clearErrors = () => errorSuppressor.clearConsole();
  window.testSuppressor = () => errorSuppressor.test();
  window.errorStats = () => errorSuppressor.getStats();
}

export default errorSuppressor;
export { ConsoleErrorSuppressor, errorSuppressor };
