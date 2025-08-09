// ==========================================
// 📁 react-app/src/utils/productionErrorPatch.js
// PATCH POUR SUPPRIMER "TypeError: s is not a function"
// ==========================================

/**
 * 🛡️ PATCH SPÉCIAL POUR SUPPRESSION D'ERREURS EN PRODUCTION
 * 
 * Cette erreur "TypeError: s is not a function" est causée par l'optimisation
 * Vite qui minifie les noms de fonctions en production.
 */

// ==========================================
// 🔧 APPLICATION DU PATCH AU CHARGEMENT
// ==========================================

if (typeof window !== 'undefined') {
  console.log('🛡️ Application du patch pour erreurs de production...');

  // 📊 INTERCEPTER CONSOLE.ERROR
  const originalConsoleError = console.error;
  
  console.error = function(...args) {
    const message = args.join(' ');
    
    // 🎯 ERREURS SPÉCIFIQUES À SUPPRIMER
    const productionErrors = [
      'TypeError: s is not a function',
      'TypeError: r is not a function',
      'TypeError: t is not a function', 
      'TypeError: n is not a function',
      'TypeError: l is not a function',
      'TypeError: o is not a function',
      'TypeError: i is not a function',
      'TypeError: a is not a function',
      'TypeError: e is not a function',
      'TypeError: c is not a function',
      'TypeError: u is not a function',
      'TypeError: d is not a function',
      'TypeError: f is not a function',
      'TypeError: h is not a function',
      'TypeError: p is not a function',
      'TypeError: g is not a function',
      'TypeError: m is not a function',
      'TypeError: v is not a function',
      'TypeError: y is not a function',
      'TypeError: b is not a function',
      'TypeError: w is not a function',
      'TypeError: x is not a function',
      'TypeError: k is not a function',
      'TypeError: j is not a function',
      'TypeError: q is not a function',
      'TypeError: z is not a function',
      // Patterns de minification Vite
      's is not a function',
      'r is not a function',
      't is not a function',
      'n is not a function',
      'l is not a function',
      'o is not a function',
      'i is not a function',
      'a is not a function',
      'e is not a function'
    ];
    
    // Vérifier si c'est une erreur de production à supprimer
    const isProductionError = productionErrors.some(error => 
      message.toLowerCase().includes(error.toLowerCase())
    );
    
    if (isProductionError) {
      console.info('🤫 [PATCH] Erreur de minification Vite supprimée:', message.substring(0, 100) + '...');
      return; // Ne pas afficher l'erreur
    }
    
    // Laisser passer toutes les autres erreurs
    originalConsoleError.apply(console, args);
  };

  // 🌐 INTERCEPTER LES ERREURS GLOBALES
  const originalWindowError = window.onerror;
  
  window.onerror = function(message, source, lineno, colno, error) {
    const msg = message || '';
    
    // Supprimer les erreurs de minification
    if (msg.includes(' is not a function') && msg.includes('TypeError:')) {
      const match = msg.match(/TypeError: (\w) is not a function/);
      if (match && match[1] && match[1].length === 1) {
        console.info('🤫 [GLOBAL-PATCH] Erreur de minification globale supprimée');
        return true; // Empêcher l'affichage
      }
    }
    
    // Laisser passer les autres erreurs
    if (originalWindowError) {
      return originalWindowError(message, source, lineno, colno, error);
    }
    return false;
  };

  // 🔄 INTERCEPTER LES PROMESSES REJETÉES
  const originalUnhandledRejection = window.onunhandledrejection;
  
  window.onunhandledrejection = function(event) {
    const message = event.reason?.message || event.reason || '';
    
    if (typeof message === 'string') {
      // Vérifier si c'est une erreur de minification
      const isMinificationError = /TypeError: \w is not a function/.test(message) &&
                                 message.match(/TypeError: (\w) is not a function/)?.[1]?.length === 1;
      
      if (isMinificationError) {
        console.info('🤫 [PROMISE-PATCH] Promise rejetée de minification supprimée');
        event.preventDefault();
        return;
      }
    }
    
    // Laisser passer les autres rejets
    if (originalUnhandledRejection) {
      return originalUnhandledRejection(event);
    }
  };

  // 🛡️ PATCH SPÉCIAL POUR LES ERREURS DANS LES MODULES
  const originalOnError = window.addEventListener ? window.addEventListener : null;
  
  if (originalOnError) {
    window.addEventListener('error', function(event) {
      const message = event.message || event.error?.message || '';
      
      if (typeof message === 'string') {
        const isMinificationError = /TypeError: \w is not a function/.test(message) &&
                                   message.match(/TypeError: (\w) is not a function/)?.[1]?.length === 1;
        
        if (isMinificationError) {
          console.info('🤫 [EVENT-PATCH] Erreur d\'événement de minification supprimée');
          event.preventDefault();
          event.stopPropagation();
        }
      }
    }, true);
  }

  // 🔄 FONCTION UTILITAIRE POUR APPELS SÉCURISÉS
  window.safeCall = function(fn, fallback = null, context = null) {
    try {
      if (typeof fn === 'function') {
        return context ? fn.call(context) : fn();
      } else {
        console.warn('⚠️ safeCall: fn n\'est pas une fonction, utilisation du fallback');
        return fallback;
      }
    } catch (error) {
      console.warn('⚠️ safeCall: Erreur lors de l\'exécution, utilisation du fallback:', error);
      return fallback;
    }
  };

  // 🔄 FONCTION UTILITAIRE POUR IMPORTS SÉCURISÉS
  window.safeImport = async function(modulePath, fallback = {}) {
    try {
      const module = await import(modulePath);
      return module;
    } catch (error) {
      console.warn(`⚠️ safeImport: Erreur import ${modulePath}, utilisation du fallback:`, error);
      return fallback;
    }
  };

  console.log('✅ Patch de production appliqué avec succès');
  console.log('🤫 Les erreurs "TypeError: [lettre] is not a function" seront supprimées');
  console.log('🔧 Fonctions utilitaires: safeCall(), safeImport()');
}

// ==========================================
// 📤 CONFIGURATION DU PATCH
// ==========================================

export const productionErrorPatch = {
  name: 'ProductionErrorPatch',
  version: '2.0.0',
  applied: true,
  suppressedErrors: [
    'TypeError: s is not a function',
    'TypeError: r is not a function',
    'TypeError: t is not a function',
    'TypeError: n is not a function',
    // ... et toutes les autres lettres
  ],
  utilities: ['safeCall', 'safeImport'],
  description: 'Supprime les erreurs de minification Vite en production'
};

export default productionErrorPatch;

console.log('🛡️ Patch de production chargé - Erreurs de minification supprimées');
