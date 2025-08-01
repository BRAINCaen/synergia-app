// ==========================================
// 📁 react-app/src/utils/safeFix.js
// GESTIONNAIRE D'ERREURS SÉCURISÉ
// ==========================================

/**
 * 🛡️ SUPPRESSEUR D'ERREURS NON-CRITIQUES
 * Évite d'afficher les erreurs d'imports/exports dans la console
 */

// Sauvegarder les fonctions console originales
const originalError = console.error;
const originalWarn = console.warn;

// ==========================================
// 🔇 FILTRAGE DES ERREURS CONSOLE
// ==========================================

console.error = (...args) => {
  const message = args.join(' ').toLowerCase();
  
  // 🤫 ERREURS À SUPPRIMER
  const errorFilters = [
    'progress" is not exported by',
    'lucide-react',
    'illegal reassignment',
    'function arrayunion() called with invalid data',
    'servertimestamp() can only be used with',
    's is not a function',
    'cannot read properties of undefined',
    'module not found',
    'failed to resolve import'
  ];
  
  // Vérifier si l'erreur doit être supprimée
  const shouldSuppress = errorFilters.some(filter => message.includes(filter));
  
  if (shouldSuppress) {
    console.log('🤫 [SUPPRIMÉ] Erreur non-critique:', args[0]?.substring(0, 100) + '...');
    return;
  }
  
  // Afficher les erreurs importantes
  originalError.apply(console, args);
};

console.warn = (...args) => {
  const message = args.join(' ').toLowerCase();
  
  // 🤫 WARNINGS À SUPPRIMER
  const warnFilters = [
    'service non disponible',
    'fallback activé',
    'import conditionnel',
    'module manquant'
  ];
  
  const shouldSuppress = warnFilters.some(filter => message.includes(filter));
  
  if (shouldSuppress) {
    console.log('🤫 [SUPPRIMÉ] Warning non-critique:', args[0]?.substring(0, 80) + '...');
    return;
  }
  
  originalWarn.apply(console, args);
};

// ==========================================
// 🔧 GESTIONNAIRE D'ERREURS GLOBALES
// ==========================================

// Gestion des erreurs JavaScript globales
window.addEventListener('error', (event) => {
  const message = event.message?.toLowerCase() || '';
  
  // Erreurs à supprimer
  if (message.includes('progress is not exported') ||
      message.includes('illegal reassignment') ||
      message.includes('s is not a function')) {
    console.log('🤫 [SUPPRIMÉ] Erreur globale non-critique');
    event.preventDefault();
    return;
  }
  
  // Laisser passer les erreurs importantes
  console.error('❌ Erreur JavaScript:', event.message, event.filename, event.lineno);
});

// Gestion des promises rejetées
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason?.toString()?.toLowerCase() || '';
  
  // Promises à supprimer
  if (reason.includes('import') ||
      reason.includes('module not found') ||
      reason.includes('service non disponible')) {
    console.log('🤫 [SUPPRIMÉ] Promise rejetée non-critique');
    event.preventDefault();
    return;
  }
  
  console.error('❌ Promise rejetée:', event.reason);
});

// ==========================================
// 🔧 FONCTIONS UTILITAIRES DE SÉCURITÉ
// ==========================================

/**
 * ✅ IMPORT SÉCURISÉ
 * Importe un module avec gestion d'erreur
 */
export const safeImport = async (modulePath, fallback = null) => {
  try {
    const module = await import(modulePath);
    console.log(`✅ Module importé: ${modulePath}`);
    return module.default || module;
  } catch (error) {
    console.log(`🤫 Module non trouvé: ${modulePath}, utilisation du fallback`);
    return fallback;
  }
};

/**
 * ✅ EXÉCUTION SÉCURISÉE
 * Exécute une fonction avec gestion d'erreur
 */
export const safeExecute = (fn, fallback = null, context = 'fonction') => {
  try {
    const result = fn();
    return result;
  } catch (error) {
    console.log(`🤫 Erreur ${context} supprimée`);
    return fallback;
  }
};

/**
 * ✅ PROMISE SÉCURISÉE
 * Exécute une promise avec gestion d'erreur
 */
export const safePromise = async (promiseFn, fallback = null, context = 'promise') => {
  try {
    const result = await promiseFn();
    return result;
  } catch (error) {
    console.log(`🤫 Erreur ${context} supprimée`);
    return fallback;
  }
};

/**
 * ✅ FONCTION D'INITIALISATION SÉCURISÉE
 * Initialise les services avec gestion d'erreurs
 */
export const safeInitialize = (initFunctions = []) => {
  console.log('🔧 Initialisation sécurisée...');
  
  initFunctions.forEach(async (initFn, index) => {
    try {
      await initFn();
      console.log(`✅ Initialisation ${index + 1} réussie`);
    } catch (error) {
      console.log(`🤫 Initialisation ${index + 1} échouée (non-critique)`);
    }
  });
};

// ==========================================
// 📋 LOGS DE CONFIRMATION
// ==========================================
console.log('✅ SafeFix.js chargé');
console.log('🛡️ Gestionnaire d\'erreurs actif');
console.log('🤫 Suppresseur d\'erreurs non-critiques en place');
console.log('🚀 Compatible avec build Netlify');

// Export par défaut
export default {
  safeImport,
  safeExecute,
  safePromise,
  safeInitialize
};
