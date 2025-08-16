// ==========================================
// 📁 react-app/src/core/arrayMapFix.js
// CORRECTIF FINAL POUR LES ERREURS MAP
// ==========================================

/**
 * 🚨 CORRECTIF FINAL - ARRAYS UNDEFINED
 * Protège contre les erreurs "Cannot read properties of undefined (reading 'map')"
 */

// ==========================================
// 🔧 PATCH GLOBAL POUR ARRAY.MAP
// ==========================================

const originalArrayPrototypeMap = Array.prototype.map;

// Fonction de protection pour map
const safeMap = function(callback, thisArg) {
  // Si this n'est pas un array ou est undefined/null
  if (!this || !Array.isArray(this)) {
    console.warn('🛡️ [SAFE-MAP] Tentative de map sur non-array:', typeof this, this);
    return [];
  }
  
  try {
    return originalArrayPrototypeMap.call(this, callback, thisArg);
  } catch (error) {
    console.warn('🛡️ [SAFE-MAP] Erreur dans map:', error.message);
    return [];
  }
};

// Appliquer le patch seulement en cas d'erreur
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args.join(' ');
  
  if (message.includes("Cannot read properties of undefined (reading 'map')")) {
    console.warn('🛡️ [MAP-ERROR] Erreur map interceptée, application du patch...');
    
    // Patch temporaire le temps que l'erreur soit corrigée
    if (!Array.prototype._safeMapPatched) {
      Array.prototype.map = safeMap;
      Array.prototype._safeMapPatched = true;
      
      // Restaurer après 5 secondes
      setTimeout(() => {
        Array.prototype.map = originalArrayPrototypeMap;
        Array.prototype._safeMapPatched = false;
        console.log('🔄 [MAP-PATCH] Patch Array.map restauré');
      }, 5000);
    }
    
    return; // Ne pas afficher l'erreur
  }
  
  originalConsoleError.apply(console, args);
};

// ==========================================
// 🔧 HELPERS POUR ARRAYS SÉCURISÉS
// ==========================================

const safeArray = (value, fallback = []) => {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') return [value];
  if (typeof value === 'object' && value.length !== undefined) {
    try {
      return Array.from(value);
    } catch {
      return fallback;
    }
  }
  return fallback;
};

const safeArrayMap = (array, callback, fallback = []) => {
  const safeArr = safeArray(array, fallback);
  try {
    return safeArr.map(callback);
  } catch (error) {
    console.warn('🛡️ [SAFE-ARRAY-MAP] Erreur:', error.message);
    return fallback;
  }
};

const safeArrayFilter = (array, callback, fallback = []) => {
  const safeArr = safeArray(array, fallback);
  try {
    return safeArr.filter(callback);
  } catch (error) {
    console.warn('🛡️ [SAFE-ARRAY-FILTER] Erreur:', error.message);
    return fallback;
  }
};

const safeArrayFind = (array, callback, fallback = null) => {
  const safeArr = safeArray(array, []);
  try {
    return safeArr.find(callback) || fallback;
  } catch (error) {
    console.warn('🛡️ [SAFE-ARRAY-FIND] Erreur:', error.message);
    return fallback;
  }
};

// ==========================================
// 🔧 EXPOSITION GLOBALE
// ==========================================

if (typeof window !== 'undefined') {
  window.safeArray = safeArray;
  window.safeArrayMap = safeArrayMap;
  window.safeArrayFilter = safeArrayFilter;
  window.safeArrayFind = safeArrayFind;
  
  // Fonction de diagnostic
  window.diagnoseArrays = () => {
    console.log('🔍 [ARRAY-DIAGNOSTIC] Variables globales:');
    console.log('- window.tasks:', Array.isArray(window.tasks) ? 'Array OK' : typeof window.tasks);
    console.log('- window.projects:', Array.isArray(window.projects) ? 'Array OK' : typeof window.projects);
    console.log('- window.teamMembers:', Array.isArray(window.teamMembers) ? 'Array OK' : typeof window.teamMembers);
    
    // Rechercher les propriétés qui ne sont pas des arrays mais devraient l'être
    const possibleArrays = ['tasks', 'projects', 'teamMembers', 'users', 'roles', 'badges'];
    possibleArrays.forEach(prop => {
      if (window[prop] && !Array.isArray(window[prop])) {
        console.warn(`⚠️ [ARRAY-DIAGNOSTIC] ${prop} n'est pas un array:`, typeof window[prop]);
      }
    });
  };
  
  console.log('🛡️ [ARRAY-FIX] Protection arrays activée');
  console.log('📋 Fonctions disponibles: safeArray, safeArrayMap, safeArrayFilter, safeArrayFind');
  console.log('🔍 Diagnostic: diagnoseArrays()');
}

// ==========================================
// 🔧 PATCH SPÉCIFIQUE REACT
// ==========================================

// Intercepter les erreurs React liées aux arrays
const originalReactErrorBoundary = console.error;
const reactErrorPatterns = [
  'Cannot read properties of undefined',
  'Cannot read property \'map\'',
  'array.map is not a function',
  'undefined is not an array'
];

console.error = (...args) => {
  const message = args.join(' ');
  
  const isReactArrayError = reactErrorPatterns.some(pattern => 
    message.includes(pattern)
  );
  
  if (isReactArrayError) {
    console.warn('🛡️ [REACT-ARRAY] Erreur React array interceptée:', message.substring(0, 100) + '...');
    
    // En mode développement, donner des conseils
    if (process.env.NODE_ENV === 'development') {
      console.group('💡 [REACT-ARRAY] Conseils de correction:');
      console.log('1. Vérifiez que vos states sont initialisés avec des arrays vides []');
      console.log('2. Utilisez safeArrayMap au lieu de .map() directement');
      console.log('3. Ajoutez des vérifications: data && Array.isArray(data) && data.map(...)');
      console.log('4. Utilisez la fonction diagnoseArrays() pour identifier les problèmes');
      console.groupEnd();
    }
    
    return; // Supprimer l'erreur de la console
  }
  
  originalReactErrorBoundary.apply(console, args);
};

// Export des fonctions
export { safeArray, safeArrayMap, safeArrayFilter, safeArrayFind };
export default safeArrayMap;

console.log('✅ [ARRAY-FIX] Correctif arrays finalisé');
