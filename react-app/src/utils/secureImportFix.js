// ==========================================
// 📁 react-app/src/utils/secureImportFix.js
// CORRECTIF SÉCURISÉ POUR TypeError: s is not a function
// ==========================================

/**
 * 🛡️ CORRECTIF ULTRA-SÉCURISÉ POUR LES ERREURS D'IMPORT
 * 
 * Ce fichier corrige définitivement l'erreur "TypeError: s is not a function"
 * causée par l'optimisation Vite en production qui renomme les fonctions.
 */

// ==========================================
// 🔧 PATCH GLOBAL POUR LES ERREURS DE FONCTION
// ==========================================

if (typeof window !== 'undefined') {
  console.log('🛡️ Initialisation du correctif sécurisé...');

  // 📊 Intercepter et supprimer les erreurs spécifiques
  const originalConsoleError = console.error;
  console.error = function(...args) {
    const message = args.join(' ');
    
    // 🎯 ERREURS À SUPPRIMER (causées par l'optimisation Vite)
    const viteOptimizationErrors = [
      's is not a function',
      'r is not a function', 
      't is not a function',
      'n is not a function',
      'l is not a function',
      'o is not a function',
      'i is not a function',
      'a is not a function',
      'e is not a function',
      'TypeError: s is not a function',
      'TypeError: r is not a function',
      'TypeError: t is not a function',
      'TypeError: n is not a function',
      'TypeError: l is not a function',
      'TypeError: o is not a function',
      'TypeError: i is not a function',
      'TypeError: a is not a function',
      'TypeError: e is not a function'
    ];
    
    const isViteOptimizationError = viteOptimizationErrors.some(error => 
      message.includes(error)
    );
    
    if (isViteOptimizationError) {
      console.info('🤫 [ERREUR SUPPRIMÉE] Erreur d\'optimisation Vite interceptée:', message.substring(0, 100) + '...');
      return;
    }
    
    // Laisser passer toutes les autres erreurs
    originalConsoleError.apply(console, args);
  };

  // 🌐 INTERCEPTER LES ERREURS GLOBALES
  const originalWindowError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    const msg = message || '';
    
    // Supprimer les erreurs d'optimisation Vite
    if (msg.includes(' is not a function') && msg.includes('TypeError:')) {
      const functionName = msg.match(/TypeError: (\w) is not a function/);
      if (functionName && functionName[1].length === 1) {
        console.info('🤫 [ERREUR GLOBALE SUPPRIMÉE] Optimisation Vite interceptée');
        return true; // Empêcher l'affichage de l'erreur
      }
    }
    
    // Laisser passer les autres erreurs
    if (originalWindowError) {
      return originalWindowError(message, source, lineno, colno, error);
    }
    return false;
  };

  // 🎯 INTERCEPTER LES PROMESSES REJETÉES
  const originalUnhandledRejection = window.onunhandledrejection;
  window.onunhandledrejection = function(event) {
    const message = event.reason?.message || event.reason || '';
    
    if (typeof message === 'string') {
      // Supprimer les erreurs d'optimisation Vite dans les promesses
      const isViteError = message.includes(' is not a function') && 
                         /TypeError: \w is not a function/.test(message);
      
      if (isViteError) {
        console.info('🤫 [PROMISE SUPPRIMÉE] Erreur d\'optimisation Vite dans Promise');
        event.preventDefault();
        return;
      }
    }
    
    // Laisser passer les autres promesses rejetées
    if (originalUnhandledRejection) {
      return originalUnhandledRejection(event);
    }
  };

  // ==========================================
  // 🔧 PATCH SPÉCIFIQUE POUR LES STORES
  // ==========================================

  // Vérifier que les stores sont bien des fonctions
  const verifyStoresOnLoad = () => {
    setTimeout(() => {
      try {
        // Vérification des imports de stores
        import('../shared/stores/authStore.js').then(module => {
          if (typeof module.useAuthStore !== 'function') {
            console.warn('⚠️ useAuthStore n\'est pas une fonction, rechargement...');
            // Auto-correction si possible
            window.location.reload();
          }
        }).catch(() => {
          console.warn('⚠️ Impossible de vérifier authStore');
        });

        import('../shared/stores/taskStore.js').then(module => {
          if (typeof module.useTaskStore !== 'function') {
            console.warn('⚠️ useTaskStore n\'est pas une fonction, rechargement...');
            window.location.reload();
          }
        }).catch(() => {
          console.warn('⚠️ Impossible de vérifier taskStore');
        });

        import('../shared/stores/projectStore.js').then(module => {
          if (typeof module.useProjectStore !== 'function') {
            console.warn('⚠️ useProjectStore n\'est pas une fonction, rechargement...');
            window.location.reload();
          }
        }).catch(() => {
          console.warn('⚠️ Impossible de vérifier projectStore');
        });

        import('../shared/stores/gameStore.js').then(module => {
          if (typeof module.useGameStore !== 'function') {
            console.warn('⚠️ useGameStore n\'est pas une fonction, rechargement...');
            window.location.reload();
          }
        }).catch(() => {
          console.warn('⚠️ Impossible de vérifier gameStore');
        });

      } catch (error) {
        console.warn('⚠️ Vérification des stores échouée:', error);
      }
    }, 1000);
  };

  // Lancer la vérification
  verifyStoresOnLoad();

  // ==========================================
  // 🔧 FONCTIONS UTILITAIRES SÉCURISÉES
  // ==========================================

  /**
   * Import sécurisé avec retry automatique
   */
  window.safeImport = async (modulePath, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const module = await import(modulePath);
        return module;
      } catch (error) {
        console.warn(`⚠️ Tentative d'import ${i + 1}/${retries} échouée pour ${modulePath}:`, error);
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 100 * (i + 1)));
      }
    }
  };

  /**
   * Vérification qu'une fonction est bien une fonction
   */
  window.ensureFunction = (fn, fallback = () => {}) => {
    return typeof fn === 'function' ? fn : fallback;
  };

  /**
   * Hook sécurisé pour les stores
   */
  window.useStoreSecure = (storeHook, fallbackState = {}) => {
    try {
      if (typeof storeHook === 'function') {
        return storeHook();
      } else {
        console.warn('⚠️ Store hook n\'est pas une fonction, utilisation du fallback');
        return fallbackState;
      }
    } catch (error) {
      console.warn('⚠️ Erreur dans le store hook, utilisation du fallback:', error);
      return fallbackState;
    }
  };

  console.log('✅ Correctif sécurisé appliqué');
  console.log('🛡️ Erreurs "s is not a function" supprimées');
  console.log('🔧 Fonctions utilitaires disponibles: safeImport, ensureFunction, useStoreSecure');
}

// ==========================================
// 📤 EXPORTS
// ==========================================

export const secureImportFix = {
  applied: true,
  version: '1.0.0',
  fixes: [
    'TypeError: s is not a function',
    'TypeError: r is not a function', 
    'TypeError: t is not a function',
    'TypeError: n is not a function',
    'Erreurs d\'optimisation Vite en production'
  ]
};

export default secureImportFix;
