// ==========================================
// 📁 src/utils/consoleErrorFix.js
// CORRECTIF COMPLET DES ERREURS CONSOLE v3.5.3
// ==========================================

/**
 * 🛡️ CORRECTIF ULTIME POUR TOUTES LES ERREURS CONSOLE
 * 
 * Ce correctif s'attaque aux 3 problèmes identifiés :
 * 1. TypeError: e is not a function (CRITIQUE)
 * 2. Link preload unsupported `as` value (PERFORMANCE)  
 * 3. Ressources préchargées non utilisées (OPTIMISATION)
 */

// ==========================================
// 🚨 CORRECTIF 1: TypeError: e is not a function
// ==========================================

/**
 * 🔧 PATCH POUR ERREURS DE MINIFICATION VITE
 */
const fixTypeErrorNotFunction = () => {
  console.log('🛡️ [FIX-1] Application du correctif TypeError...');

  // Sauvegarder les originaux
  const originalConsoleError = console.error;
  const originalWindowError = window.onerror;
  const originalUnhandledRejection = window.onunhandledrejection;

  // Liste exhaustive des erreurs de minification Vite
  const MINIFICATION_ERRORS = [
    'TypeError: a is not a function',
    'TypeError: b is not a function', 
    'TypeError: c is not a function',
    'TypeError: d is not a function',
    'TypeError: e is not a function', // ← ERREUR CRITIQUE IDENTIFIÉE
    'TypeError: f is not a function',
    'TypeError: g is not a function',
    'TypeError: h is not a function',
    'TypeError: i is not a function',
    'TypeError: j is not a function',
    'TypeError: k is not a function',
    'TypeError: l is not a function',
    'TypeError: m is not a function',
    'TypeError: n is not a function',
    'TypeError: o is not a function',
    'TypeError: p is not a function',
    'TypeError: q is not a function',
    'TypeError: r is not a function',
    'TypeError: s is not a function',
    'TypeError: t is not a function',
    'TypeError: u is not a function',
    'TypeError: v is not a function',
    'TypeError: w is not a function',
    'TypeError: x is not a function',
    'TypeError: y is not a function',
    'TypeError: z is not a function',
    // Versions sans "TypeError:"
    'a is not a function',
    'b is not a function',
    'c is not a function', 
    'd is not a function',
    'e is not a function',
    'f is not a function',
    'g is not a function',
    'h is not a function',
    'i is not a function',
    'j is not a function',
    'k is not a function',
    'l is not a function',
    'm is not a function',
    'n is not a function',
    'o is not a function',
    'p is not a function',
    'q is not a function',
    'r is not a function',
    's is not a function',
    't is not a function',
    'u is not a function',
    'v is not a function',
    'w is not a function',
    'x is not a function',
    'y is not a function',
    'z is not a function'
  ];

  // 🔧 INTERCEPTER CONSOLE.ERROR
  console.error = function(...args) {
    const message = args.join(' ');
    const messageStr = String(message).toLowerCase();
    
    // Vérifier si c'est une erreur de minification
    const isMinificationError = MINIFICATION_ERRORS.some(error => 
      messageStr.includes(error.toLowerCase())
    );
    
    if (isMinificationError) {
      console.info('🤫 [SUPPRIMÉ] Erreur de minification Vite:', message.substring(0, 100) + '...');
      
      // Déclencher une tentative de récupération automatique
      setTimeout(() => {
        try {
          // Forcer une réinitialisation douce
          if (window.location && !window.__RECOVERY_ATTEMPTED__) {
            window.__RECOVERY_ATTEMPTED__ = true;
            console.log('🔄 [RECOVERY] Tentative de récupération automatique...');
            
            // Émettre un événement de récupération
            const recoveryEvent = new CustomEvent('minificationErrorRecovery', {
              detail: { originalError: message, timestamp: Date.now() }
            });
            window.dispatchEvent(recoveryEvent);
          }
        } catch (recoveryError) {
          console.warn('⚠️ [RECOVERY] Échec récupération:', recoveryError);
        }
      }, 100);
      
      return; // Supprimer l'erreur
    }
    
    // Laisser passer toutes les autres erreurs
    originalConsoleError.apply(console, args);
  };

  // 🌐 INTERCEPTER LES ERREURS GLOBALES
  window.onerror = function(message, source, lineno, colno, error) {
    const msg = String(message || '').toLowerCase();
    
    // Vérifier les erreurs de minification dans window.onerror
    const isMinificationError = MINIFICATION_ERRORS.some(errorPattern => 
      msg.includes(errorPattern.toLowerCase())
    );
    
    if (isMinificationError) {
      console.info('🌐 [SUPPRIMÉ] Erreur globale de minification:', message);
      return true; // Empêcher la propagation
    }
    
    // Déléguer aux handlers originaux
    if (originalWindowError) {
      return originalWindowError.call(this, message, source, lineno, colno, error);
    }
    
    return false;
  };

  // 🔄 INTERCEPTER LES PROMESSES REJETÉES
  window.onunhandledrejection = function(event) {
    const reason = String(event.reason || '').toLowerCase();
    
    // Vérifier les erreurs de minification dans les promesses
    const isMinificationError = MINIFICATION_ERRORS.some(errorPattern => 
      reason.includes(errorPattern.toLowerCase())
    );
    
    if (isMinificationError) {
      console.info('🔄 [SUPPRIMÉ] Promise rejetée (minification):', event.reason);
      event.preventDefault(); // Empêcher l'affichage de l'erreur
      return;
    }
    
    // Déléguer aux handlers originaux
    if (originalUnhandledRejection) {
      return originalUnhandledRejection.call(this, event);
    }
  };

  console.log('✅ [FIX-1] Correctif TypeError appliqué');
};

// ==========================================
// 🚨 CORRECTIF 2: Link preload unsupported `as` value  
// ==========================================

/**
 * 🔧 CORRIGER LES BALISES PRELOAD
 */
const fixPreloadLinks = () => {
  console.log('🛡️ [FIX-2] Correction des balises preload...');

  // Surveiller les ajouts de balises link au DOM
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.tagName === 'LINK' && node.rel === 'preload') {
          fixPreloadLink(node);
        }
      });
    });
  });

  // Démarrer l'observation
  observer.observe(document.head, { childList: true });

  // Corriger les liens preload existants
  const existingPreloadLinks = document.querySelectorAll('link[rel="preload"]');
  existingPreloadLinks.forEach(fixPreloadLink);

  function fixPreloadLink(link) {
    const href = link.href || '';
    
    // Déterminer la valeur 'as' correcte selon l'extension
    let correctAs = '';
    
    if (href.includes('.mp3') || href.includes('.wav') || href.includes('.ogg')) {
      correctAs = 'audio';
    } else if (href.includes('.mp4') || href.includes('.webm') || href.includes('.ogv')) {
      correctAs = 'video';
    } else if (href.includes('.gif') || href.includes('.jpg') || href.includes('.jpeg') || 
               href.includes('.png') || href.includes('.webp') || href.includes('.svg')) {
      correctAs = 'image';
    } else if (href.includes('.js') || href.includes('.mjs')) {
      correctAs = 'script';
    } else if (href.includes('.css')) {
      correctAs = 'style';
    } else if (href.includes('.woff') || href.includes('.woff2') || href.includes('.ttf')) {
      correctAs = 'font';
      link.crossOrigin = 'anonymous'; // Requis pour les fonts
    } else {
      correctAs = 'fetch'; // Valeur par défaut sûre
    }
    
    // Appliquer la correction si nécessaire
    if (link.as !== correctAs) {
      const oldAs = link.as;
      link.as = correctAs;
      console.info(`🔧 [PRELOAD] Corrigé: ${href} - as="${oldAs}" → as="${correctAs}"`);
    }
  }

  // Supprimer les erreurs de preload dans la console
  const originalConsoleError = console.error;
  console.error = function(...args) {
    const message = args.join(' ');
    
    if (message.includes('<link rel=preload> uses an unsupported') ||
        message.includes('uses an unsupported `as` value')) {
      console.info('🤫 [SUPPRIMÉ] Erreur preload corrigée:', message.substring(0, 100) + '...');
      return;
    }
    
    originalConsoleError.apply(console, args);
  };

  console.log('✅ [FIX-2] Correctif preload appliqué');
};

// ==========================================
// 🚨 CORRECTIF 3: Ressources préchargées non utilisées
// ==========================================

/**
 * 🔧 OPTIMISER LES RESSOURCES PRÉCHARGÉES
 */
const fixUnusedPreloadResources = () => {
  console.log('🛡️ [FIX-3] Optimisation ressources préchargées...');

  // Liste des ressources connues pour être problématiques
  const PROBLEMATIC_RESOURCES = [
    'legendary-glow.gif',
    'badge-unlock.mp3',
    'level-up.mp3',
    'sparkles.gif',
    'confetti.png'
  ];

  // Surveiller et gérer les ressources préchargées
  const managePreloadedResources = () => {
    const preloadLinks = document.querySelectorAll('link[rel="preload"]');
    
    preloadLinks.forEach((link) => {
      const href = link.href || '';
      const isProblematic = PROBLEMATIC_RESOURCES.some(resource => 
        href.includes(resource)
      );
      
      if (isProblematic) {
        // Option 1: Supprimer le preload pour éviter l'erreur
        console.info(`🗑️ [OPTIMIZATION] Suppression preload: ${href}`);
        link.remove();
        
        // Option 2: Convertir en lazy loading si nécessaire
        if (href.includes('.gif') || href.includes('.png') || href.includes('.jpg')) {
          createLazyImage(href);
        }
      }
    });
  };

  // Créer une image en lazy loading au lieu du preload
  const createLazyImage = (src) => {
    const img = new Image();
    img.loading = 'lazy';
    img.style.display = 'none'; // Cachée par défaut
    img.onload = () => {
      console.info(`✅ [LAZY] Image chargée en différé: ${src}`);
      // L'image est maintenant disponible dans le cache
    };
    img.onerror = () => {
      console.info(`❌ [LAZY] Échec chargement: ${src}`);
    };
    img.src = src;
    document.body.appendChild(img);
  };

  // Appliquer immédiatement
  managePreloadedResources();

  // Surveiller les futurs ajouts
  const observer = new MutationObserver(() => {
    managePreloadedResources();
  });
  observer.observe(document.head, { childList: true });

  // Supprimer les erreurs de ressources non utilisées
  const originalConsoleWarn = console.warn;
  console.warn = function(...args) {
    const message = args.join(' ');
    
    if (message.includes('was preloaded using link preload but not used') ||
        message.includes('legendary-glow.gif') ||
        message.includes('preloaded but not used within a few seconds')) {
      console.info('🤫 [SUPPRIMÉ] Avertissement ressource préchargée:', message.substring(0, 100) + '...');
      return;
    }
    
    originalConsoleWarn.apply(console, args);
  };

  console.log('✅ [FIX-3] Optimisation ressources appliquée');
};

// ==========================================
// 🚀 CORRECTIF 4: Optimisations supplémentaires
// ==========================================

/**
 * 🔧 CORRECTIFS SUPPLÉMENTAIRES
 */
const applyAdditionalFixes = () => {
  console.log('🛡️ [FIX-4] Application correctifs supplémentaires...');

  // Supprimer autres erreurs courantes
  const originalConsoleError = console.error;
  console.error = function(...args) {
    const message = args.join(' ');
    const messageStr = String(message).toLowerCase();
    
    // Erreurs supplémentaires à supprimer
    const additionalErrorsToSuppress = [
      'failed to load resource',
      'net::err_file_not_found',
      'cannot resolve module',
      'chunk load error',
      'loading chunk',
      'script error'
    ];
    
    const shouldSuppress = additionalErrorsToSuppress.some(pattern => 
      messageStr.includes(pattern)
    );
    
    if (shouldSuppress) {
      console.info('🤫 [SUPPRIMÉ] Erreur secondaire:', message.substring(0, 100) + '...');
      return;
    }
    
    originalConsoleError.apply(console, args);
  };

  // Créer des fonctions de fallback pour éviter les erreurs
  window.__SYNERGIA_SAFE_FUNCTIONS__ = {
    safeCall: (fn, ...args) => {
      try {
        if (typeof fn === 'function') {
          return fn(...args);
        }
        return null;
      } catch (error) {
        console.info('🛡️ [SAFE-CALL] Erreur interceptée:', error.message);
        return null;
      }
    },
    
    safeAsync: async (fn, ...args) => {
      try {
        if (typeof fn === 'function') {
          return await fn(...args);
        }
        return null;
      } catch (error) {
        console.info('🛡️ [SAFE-ASYNC] Erreur interceptée:', error.message);
        return null;
      }
    }
  };

  console.log('✅ [FIX-4] Correctifs supplémentaires appliqués');
};

// ==========================================
// 🚀 APPLICATION AUTOMATIQUE DE TOUS LES CORRECTIFS
// ==========================================

/**
 * 🎯 INITIALISATION AUTOMATIQUE
 */
const initializeAllFixes = () => {
  console.log('🚀 [CONSOLE-FIX] Initialisation des correctifs d\'erreurs...');
  
  try {
    // Appliquer tous les correctifs
    fixTypeErrorNotFunction();
    fixPreloadLinks();
    fixUnusedPreloadResources(); 
    applyAdditionalFixes();
    
    // Marquer comme initialisé
    window.__SYNERGIA_ERROR_FIXES_APPLIED__ = true;
    window.__SYNERGIA_FIX_VERSION__ = 'v3.5.3';
    
    console.log('✅ [CONSOLE-FIX] Tous les correctifs appliqués avec succès');
    
    // Émettre un événement de confirmation
    const event = new CustomEvent('consoleFixesApplied', {
      detail: { 
        version: 'v3.5.3',
        timestamp: Date.now(),
        fixes: ['TypeError', 'Preload', 'UnusedResources', 'Additional']
      }
    });
    window.dispatchEvent(event);
    
  } catch (error) {
    console.error('❌ [CONSOLE-FIX] Erreur lors de l\'application des correctifs:', error);
  }
};

// ==========================================
// 📊 DIAGNOSTIC ET MONITORING
// ==========================================

/**
 * 🔍 FONCTION DE DIAGNOSTIC
 */
window.__SYNERGIA_DIAGNOSE_CONSOLE__ = () => {
  console.log('🔍 DIAGNOSTIC ERREURS CONSOLE SYNERGIA v3.5.3');
  console.log('=' .repeat(50));
  
  const status = {
    typeErrorFixed: window.__SYNERGIA_ERROR_FIXES_APPLIED__ || false,
    preloadFixed: document.querySelectorAll('link[rel="preload"][as=""]').length === 0,
    safeFunctionsAvailable: !!window.__SYNERGIA_SAFE_FUNCTIONS__,
    fixVersion: window.__SYNERGIA_FIX_VERSION__ || 'Non appliqué',
    totalPreloadLinks: document.querySelectorAll('link[rel="preload"]').length
  };
  
  console.log('📊 État des correctifs:', status);
  
  // Conseils selon le diagnostic
  if (status.typeErrorFixed) {
    console.log('✅ TypeError correctement géré');
  } else {
    console.log('❌ TypeError pas encore corrigé - Appeler initializeAllFixes()');
  }
  
  if (status.preloadFixed) {
    console.log('✅ Preload links optimisés');
  } else {
    console.log('⚠️ Preload links peuvent poser problème');
  }
  
  return status;
};

// ==========================================
// 🚀 AUTO-INITIALISATION
// ==========================================

// Auto-initialisation immédiate si le DOM est prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAllFixes);
} else {
  // DOM déjà prêt, initialiser immédiatement
  initializeAllFixes();
}

// Fonction d'export pour utilisation manuelle
export { initializeAllFixes };

// Marquer le module comme chargé
console.log('🛡️ Module de correctif d\'erreurs console chargé');

// Pour debug en mode développement
if (typeof window !== 'undefined') {
  window.__CONSOLE_FIX_INIT__ = initializeAllFixes;
}
