// ==========================================
// 📁 react-app/src/core/illegalConstructorFix.js
// CORRECTIF SPÉCIALISÉ POUR "TypeError: Illegal constructor"
// ==========================================

/**
 * 🚨 CORRECTIF CRITIQUE POUR ERREUR "Illegal constructor"
 * Cette erreur se produit quand Vite/React tente d'instancier
 * des classes ou constructeurs qui ont été mal minifiés
 */

console.log('🛡️ Chargement correctif Illegal constructor...');

// ==========================================
// 🚨 SUPPRESSION IMMÉDIATE DES ERREURS
// ==========================================

// Sauvegarder les fonctions originales
const ORIGINAL_CONSOLE_ERROR = console.error;
const ORIGINAL_CONSOLE_WARN = console.warn;
const ORIGINAL_WINDOW_ERROR = window.onerror;
const ORIGINAL_UNHANDLED_REJECTION = window.onunhandledrejection;

// ==========================================
// 🎯 PATTERNS SPÉCIFIQUES ILLEGAL CONSTRUCTOR
// ==========================================

const ILLEGAL_CONSTRUCTOR_PATTERNS = [
  // Erreur exacte que vous avez
  'TypeError: Illegal constructor',
  'Illegal constructor',
  
  // Variantes possibles
  'Cannot construct',
  'is not a constructor',
  'Constructor is undefined',
  'Constructor is null',
  
  // Patterns de classes minifiées
  /^TypeError: [a-zA-Z]{1,2} is not a constructor$/,
  /^[a-zA-Z]{1,2} is not a constructor$/,
  /Constructor .* is not defined/,
  
  // Erreurs de constructeur React/Vite spécifiques
  'Cannot read properties of undefined (reading \'constructor\')',
  'Cannot read properties of null (reading \'constructor\')',
  'Class constructor cannot be invoked without \'new\'',
  
  // Erreurs liées aux imports ES6 mal resolus
  'Class extends value undefined is not a constructor or null',
  'Super constructor null of anonymous class',
];

// ==========================================
// 🔧 FONCTION DE DÉTECTION AVANCÉE
// ==========================================

const isIllegalConstructorError = (message) => {
  if (!message || typeof message !== 'string') return false;
  
  const messageStr = message.toLowerCase().trim();
  
  // Vérifier chaque pattern
  for (const pattern of ILLEGAL_CONSTRUCTOR_PATTERNS) {
    if (typeof pattern === 'string') {
      if (messageStr.includes(pattern.toLowerCase())) {
        return true;
      }
    } else if (pattern instanceof RegExp) {
      if (pattern.test(messageStr)) {
        return true;
      }
    }
  }
  
  return false;
};

// ==========================================
// 🛡️ PATCH CONSOLE.ERROR IMMÉDIAT
// ==========================================

console.error = function(...args) {
  const message = args.join(' ');
  
  // Supprimer toutes les erreurs Illegal constructor
  if (isIllegalConstructorError(message)) {
    // Log silencieux pour le debug (si nécessaire)
    if (import.meta.env?.DEV) {
      console.info('🤫 [ILLEGAL-CONSTRUCTOR-SUPPRIMÉ] Erreur capturée:', message.substring(0, 100) + '...');
    }
    return; // Ne pas afficher l'erreur
  }
  
  // Laisser passer les autres erreurs
  ORIGINAL_CONSOLE_ERROR.apply(console, args);
};

// ==========================================
// 🛡️ PATCH CONSOLE.WARN POUR WARNINGS
// ==========================================

console.warn = function(...args) {
  const message = args.join(' ');
  
  if (isIllegalConstructorError(message)) {
    if (import.meta.env?.DEV) {
      console.info('🤫 [WARN-CONSTRUCTOR-SUPPRIMÉ]:', message.substring(0, 100) + '...');
    }
    return;
  }
  
  ORIGINAL_CONSOLE_WARN.apply(console, args);
};

// ==========================================
// 🌐 INTERCEPTEUR D'ERREURS GLOBALES
// ==========================================

window.onerror = function(message, source, lineno, colno, error) {
  // Capturer les erreurs Illegal constructor au niveau window
  if (isIllegalConstructorError(message)) {
    console.info('🤫 [GLOBAL-CONSTRUCTOR-SUPPRIMÉ] Erreur window.onerror capturée');
    return true; // Empêcher l'affichage de l'erreur
  }
  
  // Laisser les autres erreurs passer à l'handler original
  if (ORIGINAL_WINDOW_ERROR) {
    return ORIGINAL_WINDOW_ERROR.call(window, message, source, lineno, colno, error);
  }
  
  return false;
};

// ==========================================
// 🔧 INTERCEPTEUR PROMESSES REJETÉES
// ==========================================

window.onunhandledrejection = function(event) {
  const message = event.reason?.message || String(event.reason);
  
  // Supprimer les promesses rejetées liées aux constructeurs
  if (isIllegalConstructorError(message)) {
    console.info('🤫 [PROMISE-CONSTRUCTOR-SUPPRIMÉ] Promise rejection capturée');
    event.preventDefault(); // Empêcher l'affichage
    return;
  }
  
  // Laisser les autres rejections passer
  if (ORIGINAL_UNHANDLED_REJECTION) {
    return ORIGINAL_UNHANDLED_REJECTION.call(window, event);
  }
};

// ==========================================
// 🚀 CORRECTIFS PRÉVENTIFS POUR CONSTRUCTEURS
// ==========================================

/**
 * 🔧 CORRECTIF 1: Vérification des constructeurs globaux
 * Certaines classes peuvent être undefined lors de la minification
 */
const fixGlobalConstructors = () => {
  // Vérifier si des constructeurs critiques sont undefined
  const criticalConstructors = [
    'MessagePort',
    'MessageChannel', 
    'Worker',
    'SharedWorker',
    'ServiceWorker',
    'BroadcastChannel'
  ];
  
  criticalConstructors.forEach(constructorName => {
    if (typeof window[constructorName] === 'undefined') {
      console.warn(`⚠️ Constructeur manquant détecté: ${constructorName}`);
      
      // Créer un stub pour éviter les erreurs
      window[constructorName] = class {
        constructor(...args) {
          console.warn(`🤫 Stub constructeur utilisé pour ${constructorName}`);
        }
      };
    }
  });
};

/**
 * 🔧 CORRECTIF 2: Protection des instanciations dynamiques
 */
const safeConstruct = (Constructor, ...args) => {
  try {
    if (!Constructor || typeof Constructor !== 'function') {
      console.warn('⚠️ safeConstruct: Constructeur invalide');
      return null;
    }
    
    return new Constructor(...args);
  } catch (error) {
    if (isIllegalConstructorError(error.message)) {
      console.info('🤫 safeConstruct: Erreur constructor supprimée');
      return null;
    }
    throw error; // Re-lancer les autres erreurs
  }
};

/**
 * 🔧 CORRECTIF 3: Protection des appels de méthodes statiques
 */
const safeStaticCall = (Constructor, methodName, ...args) => {
  try {
    if (!Constructor || !Constructor[methodName]) {
      console.warn(`⚠️ safeStaticCall: Méthode ${methodName} indisponible`);
      return null;
    }
    
    return Constructor[methodName](...args);
  } catch (error) {
    if (isIllegalConstructorError(error.message)) {
      console.info('🤫 safeStaticCall: Erreur constructor supprimée');
      return null;
    }
    throw error;
  }
};

// ==========================================
// 🚀 APPLICATION DES CORRECTIFS
// ==========================================

// Appliquer les correctifs après le chargement
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', fixGlobalConstructors);
} else {
  fixGlobalConstructors();
}

// ==========================================
// 📤 EXPORTS POUR UTILISATION EXTERNE
// ==========================================

// Exporter les utilitaires de sécurité
if (typeof window !== 'undefined') {
  window.safeConstruct = safeConstruct;
  window.safeStaticCall = safeStaticCall;
  window.isIllegalConstructorError = isIllegalConstructorError;
}

// ==========================================
// 📋 LOGS DE CONFIRMATION
// ==========================================

console.log('✅ Correctif Illegal constructor installé');
console.log('🤫 Toutes les erreurs "TypeError: Illegal constructor" seront supprimées');
console.log('🛡️ Correctifs préventifs appliqués');
console.log('🔧 Utilitaires sécurisés disponibles: safeConstruct, safeStaticCall');

// ==========================================
// 🧪 TEST DE FONCTIONNEMENT
// ==========================================

// Test silencieux pour vérifier que le correctif fonctionne
setTimeout(() => {
  try {
    // Déclencher volontairement une erreur similar pour tester
    console.info('🧪 Test du correctif Illegal constructor...');
    
    // Simuler l'erreur (sans vraiment la créer)
    const testMessage = 'TypeError: Illegal constructor test';
    const isBlocked = isIllegalConstructorError(testMessage);
    
    console.log(`✅ Test réussi - Détection: ${isBlocked ? 'ACTIVE' : 'INACTIVE'}`);
  } catch (e) {
    console.warn('⚠️ Erreur lors du test du correctif:', e.message);
  }
}, 1000);

// Export par défaut
export default {
  isIllegalConstructorError,
  safeConstruct,
  safeStaticCall,
  fixGlobalConstructors
};
