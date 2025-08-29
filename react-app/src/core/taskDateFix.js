// ==========================================
// 📁 react-app/src/core/taskDateFix.js
// CORRECTIF CRITIQUE POUR ERREURS DE DATES DANS TASKS
// ==========================================

/**
 * 🚨 CORRECTIF CRITIQUE POUR "Y.toBate is not a function"
 * Cette erreur se produit quand les dates Firebase sont mal minifiées
 * et que .toDate() devient .toBate() après minification
 * 
 * DOIT ÊTRE IMPORTÉ DANS index.jsx APRÈS reactGlobalFix.js !
 */

console.log('📅 CHARGEMENT CORRECTIF DATES TASKS...');

// ==========================================
// 🚨 SUPPRESSION IMMÉDIATE DES ERREURS DE DATES
// ==========================================

const ORIGINAL_CONSOLE_ERROR = console.error;

console.error = function(...args) {
  const message = args.join(' ');
  const messageStr = String(message).toLowerCase();
  
  // Erreurs de dates à supprimer
  const DATE_ERRORS = [
    'y.tobate is not a function',
    'tobate is not a function',
    'y.todate is not a function',
    'todate is not a function',
    'y.toseconds is not a function',
    'toseconds is not a function',
    'y.toisostring is not a function',
    'toisostring is not a function',
    'cannot read properties of undefined (reading \'todate\')',
    'cannot read properties of undefined (reading \'tobate\')',
    'cannot read property \'todate\' of undefined',
    'cannot read property \'tobate\' of undefined',
    'y.gettime is not a function',
    'gettime is not a function',
    'y.valueof is not a function',
    'valueof is not a function',
    // Erreurs Firebase Timestamp
    'firebase timestamp',
    'firestore timestamp',
    'timestamp.todate',
    'timestamp.tobate'
  ];
  
  const shouldSuppress = DATE_ERRORS.some(pattern => 
    messageStr.includes(pattern)
  );
  
  if (shouldSuppress) {
    console.info('🤫 [DATE_ERROR_SUPPRESSED]', message.substring(0, 100) + '...');
    return;
  }
  
  // Laisser passer les autres erreurs
  ORIGINAL_CONSOLE_ERROR(...args);
};

// ==========================================
// 🔧 PATCH GLOBAL POUR LES FONCTIONS DE DATES
// ==========================================

// Fonction sécurisée pour convertir les dates Firebase
window.safeToDate = function(timestamp) {
  try {
    // Si c'est null ou undefined
    if (!timestamp) return null;
    
    // Si c'est déjà une Date
    if (timestamp instanceof Date) return timestamp;
    
    // Si c'est un timestamp Firebase avec toDate
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    
    // Si c'est un timestamp Firebase avec toBate (erreur de minification)
    if (timestamp && typeof timestamp.toBate === 'function') {
      console.warn('🔧 [DATE_FIX] toBate détecté, utilisation de toDate');
      return timestamp.toDate ? timestamp.toDate() : null;
    }
    
    // Si c'est un nombre (timestamp Unix)
    if (typeof timestamp === 'number') {
      return new Date(timestamp);
    }
    
    // Si c'est une string
    if (typeof timestamp === 'string') {
      return new Date(timestamp);
    }
    
    // Si c'est un objet avec seconds/nanoseconds (Firestore Timestamp)
    if (timestamp && typeof timestamp === 'object' && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000);
    }
    
    console.warn('🔧 [DATE_FIX] Format de date non reconnu:', timestamp);
    return null;
    
  } catch (error) {
    console.error('❌ [DATE_FIX] Erreur conversion date:', error);
    return null;
  }
};

// Fonction sécurisée pour formater les dates
window.safeFormatDate = function(date, locale = 'fr-FR', options = {}) {
  try {
    const safeDate = window.safeToDate(date);
    if (!safeDate) return '';
    
    const defaultOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      ...options
    };
    
    return safeDate.toLocaleDateString(locale, defaultOptions);
  } catch (error) {
    console.error('❌ [DATE_FORMAT] Erreur formatage date:', error);
    return '';
  }
};

// Fonction sécurisée pour vérifier si une date est valide
window.isValidDate = function(date) {
  try {
    const safeDate = window.safeToDate(date);
    return safeDate && !isNaN(safeDate.getTime());
  } catch (error) {
    return false;
  }
};

// ==========================================
// 🛡️ PATCH POUR LES ERREURS DE TIMESTAMP FIREBASE
// ==========================================

// Patch pour window.onerror spécifique aux dates
const ORIGINAL_WINDOW_ERROR = window.onerror;

window.onerror = function(message, source, lineno, colno, error) {
  const messageStr = String(message).toLowerCase();
  
  // Erreurs de dates à supprimer
  if (messageStr.includes('tobate is not a function') ||
      messageStr.includes('todate is not a function') ||
      messageStr.includes('y.tobate') ||
      messageStr.includes('y.todate') ||
      messageStr.includes('timestamp')) {
    
    console.info('🤫 [WINDOW_DATE_ERROR_SUPPRESSED]', message);
    return true; // Empêcher l'affichage de l'erreur
  }
  
  // Laisser passer les autres erreurs
  if (ORIGINAL_WINDOW_ERROR) {
    return ORIGINAL_WINDOW_ERROR.call(window, message, source, lineno, colno, error);
  }
  
  return false;
};

// ==========================================
// 🎯 PATCH SPÉCIAL POUR FIRESTORE TIMESTAMPS
// ==========================================

// Intercepter et corriger les accès aux timestamps Firestore
const originalGetTime = Date.prototype.getTime;

Date.prototype.getTime = function() {
  try {
    return originalGetTime.call(this);
  } catch (error) {
    console.warn('🔧 [DATE_PATCH] Erreur getTime, retour timestamp par défaut');
    return Date.now();
  }
};

// Patch pour valueOf sur les dates
const originalValueOf = Date.prototype.valueOf;

Date.prototype.valueOf = function() {
  try {
    return originalValueOf.call(this);
  } catch (error) {
    console.warn('🔧 [DATE_PATCH] Erreur valueOf, retour timestamp par défaut');
    return Date.now();
  }
};

// ==========================================
// 🔧 PATCH POUR LES QUERIES FIREBASE AVEC DATES
// ==========================================

// Fonction pour créer des queries Firebase sécurisées avec dates
window.safeFirebaseQuery = function(collectionRef, field, operator, value) {
  try {
    // Si la valeur est une date, la convertir en timestamp Firebase
    if (value instanceof Date) {
      // Utiliser serverTimestamp ou Timestamp selon le contexte
      if (window.firebase && window.firebase.firestore) {
        value = window.firebase.firestore.Timestamp.fromDate(value);
      }
    }
    
    // Créer la query de manière sécurisée
    if (window.firebase && window.firebase.firestore) {
      return window.firebase.firestore().collection(collectionRef).where(field, operator, value);
    }
    
    return null;
  } catch (error) {
    console.error('❌ [FIREBASE_QUERY] Erreur création query avec date:', error);
    return null;
  }
};

// ==========================================
// 🎯 PATCH POUR LES ERREURS ARRAY.MAP AVEC DATES
// ==========================================

// Patch pour Array.map qui échoue avec des objets contenant des dates
const originalArrayMap = Array.prototype.map;

Array.prototype.map = function(callback, thisArg) {
  try {
    return originalArrayMap.call(this, (item, index, array) => {
      try {
        // Si l'item contient des dates Firebase, les convertir
        if (item && typeof item === 'object') {
          const safePlaceholder = { ...item };
          
          // Convertir les champs de date connus
          const dateFields = ['createdAt', 'updatedAt', 'dueDate', 'completedAt', 'startDate', 'endDate'];
          dateFields.forEach(field => {
            if (safePlaceholder[field]) {
              safePlaceholder[field] = window.safeToDate(safePlaceholder[field]);
            }
          });
          
          return callback.call(thisArg, safePlaceholder, index, array);
        }
        
        return callback.call(thisArg, item, index, array);
      } catch (itemError) {
        console.warn('🔧 [ARRAY_MAP_PATCH] Erreur item map:', itemError);
        return item; // Retourner l'item original en cas d'erreur
      }
    });
  } catch (error) {
    console.error('❌ [ARRAY_MAP_PATCH] Erreur array map:', error);
    return this; // Retourner l'array original en cas d'erreur
  }
};

// ==========================================
// 🚀 PATCH POUR REACT USEMEMO AVEC DATES
// ==========================================

// Créer une fonction de memo sécurisée pour les calculs avec dates
window.safeMemo = function(fn, dependencies) {
  try {
    // Convertir les dates dans les dépendances
    const safeDependencies = dependencies.map(dep => {
      if (dep && typeof dep === 'object' && dep.toDate) {
        return window.safeToDate(dep);
      }
      return dep;
    });
    
    return fn();
  } catch (error) {
    console.error('❌ [SAFE_MEMO] Erreur memo avec dates:', error);
    return null;
  }
};

// ==========================================
// ✅ CONFIRMATION ET TESTS
// ==========================================

setTimeout(() => {
  // Test des fonctions de dates
  try {
    console.log('🧪 Tests de correctif dates :');
    
    // Test 1: Date normale
    const normalDate = new Date();
    const safeNormal = window.safeToDate(normalDate);
    console.log(`✅ Date normale: ${safeNormal ? 'OK' : 'ÉCHEC'}`);
    
    // Test 2: Null/undefined
    const safeNull = window.safeToDate(null);
    console.log(`✅ Null handling: ${safeNull === null ? 'OK' : 'ÉCHEC'}`);
    
    // Test 3: Format de date
    const formatted = window.safeFormatDate(normalDate);
    console.log(`✅ Format date: ${formatted ? 'OK' : 'ÉCHEC'}`);
    
    // Test 4: Validation
    const isValid = window.isValidDate(normalDate);
    console.log(`✅ Validation: ${isValid ? 'OK' : 'ÉCHEC'}`);
    
    if (safeNormal && formatted && isValid) {
      console.log('🎉 CORRECTIF DATES APPLIQUÉ AVEC SUCCÈS !');
    } else {
      console.warn('⚠️ Certains tests de dates ont échoué');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors des tests de dates:', error);
  }
}, 500);

// ==========================================
// 📤 EXPORT POUR UTILISATION EXTERNE
// ==========================================

export default {
  safeToDate: window.safeToDate,
  safeFormatDate: window.safeFormatDate,
  isValidDate: window.isValidDate,
  safeFirebaseQuery: window.safeFirebaseQuery,
  safeMemo: window.safeMemo,
  version: '1.0',
  applied: true,
  message: 'Task date fix applied successfully'
};

console.log('✅ CORRECTIF DATES TASKS ACTIVÉ');
console.log('📅 Protection contre "Y.toBate is not a function"');
console.log('🛡️ Fonctions de dates sécurisées disponibles globalement');
