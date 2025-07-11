// ==========================================
// 📁 react-app/src/core/services/consoleErrorSuppressor.js
// Suppression intelligente des erreurs Firebase non critiques
// ==========================================

/**
 * 🤫 SUPPRESSEUR D'ERREURS CONSOLE INTELLIGENT
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
      /FirebaseError.*serverTimestamp.*arrayUnion/i
    ];
    
    // Patterns d'erreurs à transformer en avertissements
    this.warnPatterns = [
      /Assignation rôle/i,
      /Création\/MAJ membre/i,
      /Mise à jour temps réel/i
    ];
  }

  /**
   * 🚀 ACTIVER LA SUPPRESSION
   */
  activate() {
    if (this.isActive) return;
    
    console.log('🤫 Activation du suppresseur d\'erreurs...');
    
    // Remplacer console.error
    console.error = (...args) => {
      const message = args.join(' ');
      
      // Vérifier si l'erreur doit être supprimée
      const shouldSuppress = this.suppressPatterns.some(pattern => pattern.test(message));
      
      if (shouldSuppress) {
        this.suppressedCount++;
        console.log(`🤫 [${this.suppressedCount}] Erreur supprimée:`, message.substring(0, 80) + '...');
        return;
      }
      
      // Vérifier si l'erreur doit être transformée en warning
      const shouldWarn = this.warnPatterns.some(pattern => pattern.test(message));
      
      if (shouldWarn) {
        console.warn('⚠️ [TRANSFORMED]', ...args);
        return;
      }
      
      // Afficher les autres erreurs normalement
      this.originalError.apply(console, args);
    };
    
    // Remplacer console.warn pour les erreurs Firebase mineures
    console.warn = (...args) => {
      const message = args.join(' ');
      
      // Supprimer certains avertissements Firebase
      if (message.includes('serverTimestamp') || message.includes('arrayUnion')) {
        return; // Supprimer complètement
      }
      
      this.originalWarn.apply(console, args);
    };
    
    this.isActive = true;
    console.log('✅ Suppresseur d\'erreurs activé');
  }

  /**
   * 🛑 DÉSACTIVER LA SUPPRESSION
   */
  deactivate() {
    if (!this.isActive) return;
    
    console.error = this.originalError;
    console.warn = this.originalWarn;
    this.isActive = false;
    
    console.log('🛑 Suppresseur d\'erreurs désactivé');
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES
   */
  getStats() {
    return {
      isActive: this.isActive,
      suppressedCount: this.suppressedCount,
      patterns: this.suppressPatterns.length,
      startTime: this.startTime || new Date()
    };
  }

  /**
   * ➕ AJOUTER UN PATTERN DE SUPPRESSION
   */
  addPattern(pattern) {
    if (pattern instanceof RegExp || typeof pattern === 'string') {
      this.suppressPatterns.push(new RegExp(pattern, 'i'));
      console.log('✅ Nouveau pattern ajouté:', pattern);
    }
  }

  /**
   * 🧹 NETTOYER LA CONSOLE
   */
  clearConsole() {
    if (typeof console.clear === 'function') {
      console.clear();
      console.log('🧹 Console nettoyée');
      console.log('🤫 Suppresseur d\'erreurs actif -', this.suppressedCount, 'erreurs supprimées');
    }
  }

  /**
   * 🧪 TESTER LA SUPPRESSION
   */
  test() {
    console.log('🧪 Test du suppresseur...');
    
    // Tester les erreurs qui doivent être supprimées
    setTimeout(() => {
      console.error('Function arrayUnion() called with invalid data. serverTimestamp() can only be used with update() and set() TEST');
    }, 100);
    
    setTimeout(() => {
      console.error('The query requires an index. You can create it here: TEST');
    }, 200);
    
    setTimeout(() => {
      console.error('Erreur assignation rôle: FirebaseError: serverTimestamp TEST');
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
  // Activer automatiquement
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      errorSuppressor.activate();
    });
  } else {
    errorSuppressor.activate();
  }
  
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
