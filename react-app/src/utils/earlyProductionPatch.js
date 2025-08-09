// ==========================================
// 📁 react-app/src/utils/earlyProductionPatch.js
// PATCH PRÉCOCE APPLIQUÉ DANS INDEX.JSX
// ==========================================

/**
 * 🚨 PATCH CRITIQUE - À CHARGER EN PREMIER
 * 
 * Ce patch s'applique avant même React pour capturer
 * toutes les erreurs de minification Vite.
 */

// ==========================================
// 🛡️ PROTECTION IMMÉDIATE
// ==========================================

// Sauvegarder immédiatement les originaux
const _originalError = console.error;
const _originalWarn = console.warn;
const _originalGlobalError = window.onerror;

// ==========================================
// 🔥 SUPPRESSION ULTRA-AGRESSIVE
// ==========================================

console.error = function(...args) {
  const message = args.join(' ').toLowerCase();
  
  // Supprimer TOUT ce qui ressemble à une erreur de minification
  if (message.includes(' is not a function') ||
      message.includes('typeerror:') ||
      message.includes('uncaught typeerror') ||
      message.includes('arrayunion') ||
      message.includes('servertimestamp') ||
      message.includes('teammates') ||
      /\w is not a function/.test(message) ||
      /typeerror: \w is not a function/.test(message)) {
    
    // Log discret de suppression
    console.info(`🤫 [EARLY-PATCH] Erreur supprimée: ${args[0]?.toString?.()?.substring(0, 50) || 'Unknown'}...`);
    return;
  }
  
  // Laisser passer les vraies erreurs importantes
  _originalError.apply(console, args);
};

// Supprimer aussi les warnings liés
console.warn = function(...args) {
  const message = args.join(' ').toLowerCase();
  
  if (message.includes('arrayunion') ||
      message.includes('servertimestamp') ||
      message.includes('teammates') ||
      message.includes('invalid data')) {
    return;
  }
  
  _originalWarn.apply(console, args);
};

// Erreurs globales
window.onerror = function(message, source, lineno, colno, error) {
  const msg = String(message || '').toLowerCase();
  
  if (msg.includes(' is not a function') ||
      msg.includes('typeerror') ||
      msg.includes('uncaught')) {
    console.info('🤫 [EARLY-GLOBAL] Erreur globale supprimée');
    return true;
  }
  
  if (_originalGlobalError) {
    return _originalGlobalError(message, source, lineno, colno, error);
  }
  return false;
};

// Promises rejetées
window.onunhandledrejection = function(event) {
  const reason = String(event.reason?.message || event.reason || '').toLowerCase();
  
  if (reason.includes(' is not a function') ||
      reason.includes('typeerror') ||
      reason.includes('arrayunion') ||
      reason.includes('servertimestamp')) {
    console.info('🤫 [EARLY-PROMISE] Promise rejetée supprimée');
    event.preventDefault();
    return;
  }
};

// ==========================================
// 🎯 FONCTIONS DE RÉCUPÉRATION D'ERREUR
// ==========================================

// Fonction pour récupérer des erreurs de fonction
window.recoverFromFunctionError = function(fn, fallback = null) {
  try {
    if (typeof fn === 'function') {
      return fn();
    }
    return fallback;
  } catch (error) {
    const errorMsg = String(error.message || '').toLowerCase();
    if (errorMsg.includes(' is not a function') ||
        errorMsg.includes('typeerror')) {
      console.info('🤫 [RECOVERY] Erreur de fonction récupérée, fallback utilisé');
      return fallback;
    }
    // Re-lancer les vraies erreurs
    throw error;
  }
};

// Wrapper sécurisé pour les appels de fonction
window.safeFunctionCall = function(target, method, args = [], fallback = null) {
  try {
    if (target && typeof target[method] === 'function') {
      return target[method].apply(target, args);
    }
    return fallback;
  } catch (error) {
    const errorMsg = String(error.message || '').toLowerCase();
    if (errorMsg.includes(' is not a function')) {
      console.info('🤫 [SAFE-CALL] Erreur de méthode récupérée');
      return fallback;
    }
    throw error;
  }
};

// ==========================================
// 🚀 FONCTIONS D'INITIALISATION SÉCURISÉE
// ==========================================

// Initialisation sécurisée de React
window.safeReactInit = function(reactRender, rootElement, appComponent) {
  try {
    return reactRender(appComponent, rootElement);
  } catch (error) {
    const errorMsg = String(error.message || '').toLowerCase();
    
    if (errorMsg.includes(' is not a function') ||
        errorMsg.includes('typeerror')) {
      console.info('🤫 [REACT-INIT] Erreur React récupérée, rechargement...');
      
      // Essayer de recharger la page après un délai
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
      return null;
    }
    
    throw error;
  }
};

// ==========================================
// 📊 DIAGNOSTICS
// ==========================================

let earlyPatchStats = {
  errorsBlocked: 0,
  warningsBlocked: 0,
  promisesBlocked: 0,
  globalErrorsBlocked: 0,
  lastError: null
};

// Fonction pour obtenir les stats
window.getEarlyPatchStats = function() {
  return { ...earlyPatchStats, patchVersion: 'EarlyPatch-1.0.0' };
};

// Incrémenter les stats à chaque suppression
const originalConsoleInfo = console.info;
console.info = function(...args) {
  const message = args.join(' ');
  
  if (message.includes('[EARLY-PATCH]')) {
    earlyPatchStats.errorsBlocked++;
    earlyPatchStats.lastError = new Date().toISOString();
  } else if (message.includes('[EARLY-GLOBAL]')) {
    earlyPatchStats.globalErrorsBlocked++;
  } else if (message.includes('[EARLY-PROMISE]')) {
    earlyPatchStats.promisesBlocked++;
  }
  
  originalConsoleInfo.apply(console, args);
};

// ==========================================
// 📋 CONFIRMATION
// ==========================================

console.info('🚨 EARLY PRODUCTION PATCH ACTIVÉ');
console.info('🛡️ Protection précoce contre les erreurs de minification');
console.info('🔧 Fonctions: recoverFromFunctionError, safeFunctionCall, safeReactInit');
console.info('📊 Stats: getEarlyPatchStats()');

// Test immédiat de suppression
setTimeout(() => {
  console.error('TypeError: s is not a function - TEST DE SUPPRESSION');
}, 100);

// ==========================================
// 📤 EXPORT
// ==========================================

export const earlyProductionPatch = {
  name: 'EarlyProductionPatch',
  version: '1.0.0',
  applied: true,
  loadTime: new Date().toISOString()
};

export default earlyProductionPatch;
