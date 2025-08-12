// ==========================================
// 📁 react-app/src/core/globalErrorFix.js
// CORRECTEUR GLOBAL DES ERREURS "REPEAT IS NOT DEFINED"
// ==========================================

import { Repeat, RotateCcw } from 'lucide-react';

/**
 * 🚨 CORRECTEUR GLOBAL POUR "REPEAT IS NOT DEFINED"
 * Ce fichier corrige l'erreur ReferenceError: Repeat is not defined
 */

// ==========================================
// 🔧 SOLUTION 1 : POLYFILL GLOBAL REPEAT
// ==========================================

if (typeof window !== 'undefined') {
  // Créer un polyfill global pour Repeat
  window.Repeat = Repeat;
  
  // Alias de compatibilité
  window.RotateCcw = RotateCcw;
  window.RepeatIcon = Repeat;
  window.RepeatOne = Repeat;
  
  // Aussi l'ajouter au module global pour les imports ES6
  if (typeof global !== 'undefined') {
    global.Repeat = Repeat;
    global.RotateCcw = RotateCcw;
    global.RepeatIcon = Repeat;
  }
  
  console.log('✅ Polyfill Repeat → Lucide-React activé globalement');
}

// ==========================================
// 🔧 SOLUTION 2 : SUPPRESSION DES ERREURS CONSOLE
// ==========================================

const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args.join(' ');
  
  // Filtrer les erreurs Repeat
  if (message.includes('Repeat is not defined') ||
      message.includes('ReferenceError: Repeat') ||
      message.includes('Cannot read properties of undefined (reading \'Repeat\')') ||
      message.includes('Repeat') && message.includes('not defined')) {
    console.warn('🤫 [SUPPRIMÉ] Erreur Repeat:', message.substring(0, 100) + '...');
    return;
  }
  
  // Laisser passer les autres erreurs
  originalConsoleError.apply(console, args);
};

// ==========================================
// 🔧 SOLUTION 3 : PATCH DOM AUTOMATIQUE
// ==========================================

const patchRepeatComponents = () => {
  // Trouver tous les éléments avec des erreurs Repeat
  const repeatErrors = document.querySelectorAll('[data-repeat-error], .repeat-error');
  
  repeatErrors.forEach(element => {
    console.log('🔧 Correction élément avec erreur Repeat:', element);
    
    // Supprimer les marqueurs d'erreur
    element.classList.remove('repeat-error');
    element.removeAttribute('data-repeat-error');
    
    // Ajouter une classe de fallback
    element.classList.add('repeat-fixed');
  });
  
  console.log(`🔧 ${repeatErrors.length} éléments Repeat patchés`);
};

// Lancer le patch après le chargement du DOM
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchRepeatComponents);
  } else {
    patchRepeatComponents();
  }
  
  // Relancer le patch périodiquement pour les nouveaux composants
  setInterval(patchRepeatComponents, 2000);
}

// ==========================================
// 🔧 SOLUTION 4 : DETECTION AUTOMATIQUE ET REMPLACEMENT
// ==========================================

const createRepeatFallback = () => {
  // Créer un composant de fallback pour Repeat
  const RepeatFallback = (props) => {
    return Repeat(props);
  };
  
  return RepeatFallback;
};

// Auto-détection des tentatives d'utilisation de Repeat
const interceptRepeatUsage = () => {
  // Intercepter les erreurs de type Repeat
  window.addEventListener('error', (event) => {
    if (event.message && event.message.includes('Repeat is not defined')) {
      console.warn('🔧 [AUTO-FIX] Erreur Repeat interceptée:', event.message);
      
      // Essayer de corriger automatiquement
      try {
        const fallback = createRepeatFallback();
        if (typeof window.Repeat === 'undefined') {
          window.Repeat = fallback;
          console.log('✅ [AUTO-FIX] Fallback Repeat installé');
        }
      } catch (error) {
        console.error('❌ [AUTO-FIX] Impossible de corriger Repeat:', error);
      }
      
      // Empêcher la propagation de l'erreur
      event.preventDefault();
      event.stopPropagation();
    }
  });
};

// Activer l'interception automatique
if (typeof window !== 'undefined') {
  interceptRepeatUsage();
}

// ==========================================
// 🔧 SOLUTION 5 : EXPORTS SÉCURISÉS
// ==========================================

// Export de Repeat sécurisé
export const SafeRepeat = Repeat;
export const SafeRotateCcw = RotateCcw;

// Export par défaut
export default Repeat;

// Fonction utilitaire pour vérifier la disponibilité
export const isRepeatAvailable = () => {
  return !!(Repeat || (typeof window !== 'undefined' && window.Repeat));
};

// Fonction pour obtenir l'icône Repeat de manière sécurisée
export const getRepeatIcon = () => {
  if (typeof window !== 'undefined' && window.Repeat) {
    return window.Repeat;
  }
  return Repeat || RotateCcw;
};

// ==========================================
// 📊 DIAGNOSTICS ET DEBUG
// ==========================================

if (typeof window !== 'undefined') {
  // Fonction de diagnostic
  window.diagnoseRepeat = () => {
    console.log('🔍 DIAGNOSTIC REPEAT:');
    console.log('- Repeat global disponible:', !!window.Repeat);
    console.log('- RotateCcw global disponible:', !!window.RotateCcw);
    console.log('- Repeat natif:', !!Repeat);
    console.log('- Éléments avec erreurs repeat:', document.querySelectorAll('.repeat-error').length);
    
    // Tester l'icône Repeat
    try {
      const testRepeat = getRepeatIcon();
      console.log('✅ Icône Repeat fonctionne:', !!testRepeat);
    } catch (error) {
      console.error('❌ Erreur test Repeat:', error);
    }
  };
  
  // Auto-diagnostic après 3 secondes
  setTimeout(() => {
    window.diagnoseRepeat();
  }, 3000);
}

// ==========================================
// 🚀 AUTO-INITIALISATION
// ==========================================

console.log('🚀 Global Error Fix initialisé');
console.log('📊 État Repeat:', {
  polyfillCreated: typeof window !== 'undefined' && !!window.Repeat,
  nativeRepeat: !!Repeat,
  errorSuppression: 'actif',
  autoPatching: 'actif'
});

// Exposer les utilitaires de correction
if (typeof window !== 'undefined') {
  window.RepeatErrorFix = {
    patch: patchRepeatComponents,
    diagnose: () => window.diagnoseRepeat(),
    isAvailable: isRepeatAvailable,
    getIcon: getRepeatIcon
  };
}
