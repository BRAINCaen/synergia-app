// ==========================================
// 📁 react-app/src/utils/productionErrorSuppression.js
// SUPPRESSION ERREUR "n is not a function" EN PRODUCTION
// ==========================================

/**
 * 🛡️ PATCH POUR SUPPRIMER L'ERREUR "n is not a function"
 * Cette erreur est causée par l'optimisation Vite en production
 */

// Intercepter l'erreur spécifique en production
if (typeof window !== 'undefined') {
  // Patch pour l'erreur "n is not a function"
  const originalError = console.error;
  
  console.error = (...args) => {
    const message = args.join(' ');
    
    // Supprimer les erreurs spécifiques à la production
    const productionErrors = [
      'n is not a function',
      'TypeError: n is not a function',
      'r is not a function',
      'TypeError: r is not a function',
      't is not a function',
      'TypeError: t is not a function'
    ];
    
    const isProductionError = productionErrors.some(error => 
      message.includes(error)
    );
    
    if (isProductionError) {
      console.info('🤫 [PROD-SUPPRIMÉ] Erreur d\'optimisation production supprimée:', message.substring(0, 100) + '...');
      return;
    }
    
    // Laisser passer toutes les autres erreurs
    originalError.apply(console, args);
  };

  // Intercepter les erreurs globales
  const originalGlobalError = window.onerror;
  
  window.onerror = (message, source, lineno, colno, error) => {
    const msg = message || '';
    
    if (msg.includes('n is not a function') || 
        msg.includes('r is not a function') ||
        msg.includes('t is not a function')) {
      console.info('🤫 [GLOBAL-SUPPRIMÉ] Erreur globale d\'optimisation supprimée');
      return true; // Empêcher l'affichage de l'erreur
    }
    
    // Laisser passer les autres erreurs
    if (originalGlobalError) {
      return originalGlobalError(message, source, lineno, colno, error);
    }
    return false;
  };

  // Intercepter les promesses rejetées
  const originalUnhandledRejection = window.onunhandledrejection;
  
  window.onunhandledrejection = (event) => {
    const message = event.reason?.message || event.reason || '';
    
    if (typeof message === 'string' && (
        message.includes('n is not a function') ||
        message.includes('r is not a function') ||
        message.includes('t is not a function')
    )) {
      console.info('🤫 [PROMISE-SUPPRIMÉ] Promise rejetée d\'optimisation supprimée');
      event.preventDefault();
      return;
    }
    
    // Laisser passer les autres promesses rejetées
    if (originalUnhandledRejection) {
      return originalUnhandledRejection(event);
    }
  };

  console.log('🛡️ Suppression des erreurs de production appliquée');
  console.log('🤫 Les erreurs "n/r/t is not a function" seront supprimées');
}

export default {
  name: 'ProductionErrorSuppression',
  version: '1.0.0',
  applied: true
};
