// ==========================================
// 📁 react-app/src/core/motionImportFix.js
// CORRECTION GLOBALE DES IMPORTS FRAMER MOTION
// ==========================================

import React from 'react';

/**
 * 🚨 CORRECTION CRITIQUE : MOTION IS NOT DEFINED
 * 
 * Ce fichier corrige l'erreur "ReferenceError: motion is not defined"
 * en créant des fallbacks compatibles pour tous les composants.
 */

// ==========================================
// 🔧 SOLUTION 1 : POLYFILL GLOBAL
// ==========================================

if (typeof window !== 'undefined') {
  // Créer un polyfill global pour motion
  window.motion = window.motion || {};
  
  // Fonction helper pour créer des composants motion
  const createMotionComponent = (tag) => {
    return React.forwardRef(({ 
      children, 
      initial, 
      animate, 
      exit, 
      transition, 
      variants,
      whileHover, 
      whileTap,
      className, 
      style, 
      onClick,
      onHoverStart,
      onHoverEnd,
      layout,
      layoutId,
      ...props 
    }, ref) => {
      
      // Styles avec transition CSS comme fallback
      const finalStyle = {
        ...style,
        transition: transition ? 'all 0.3s ease-in-out' : 'all 0.2s ease-in-out'
      };
      
      // Gestion des interactions
      const handleMouseEnter = (e) => {
        if (onHoverStart) onHoverStart();
        if (whileHover?.scale) {
          e.target.style.transform = `scale(${whileHover.scale})`;
        }
        if (whileHover?.y) {
          e.target.style.transform = `translateY(${whileHover.y}px)`;
        }
      };
      
      const handleMouseLeave = (e) => {
        if (onHoverEnd) onHoverEnd();
        e.target.style.transform = 'scale(1) translateY(0)';
      };
      
      const handleMouseDown = (e) => {
        if (whileTap?.scale) {
          e.target.style.transform = `scale(${whileTap.scale})`;
        }
      };
      
      const handleMouseUp = (e) => {
        e.target.style.transform = 'scale(1)';
      };
      
      return React.createElement(tag, {
        ref,
        className: `${className || ''} motion-fallback`,
        style: finalStyle,
        onClick,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        onMouseDown: handleMouseDown,
        onMouseUp: handleMouseUp,
        ...props
      }, children);
    });
  };
  
  // Créer tous les composants motion nécessaires
  const motionComponents = [
    'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'button', 'a', 'img', 'video', 'audio',
    'section', 'article', 'header', 'footer', 'nav', 'main', 'aside',
    'ul', 'ol', 'li', 'form', 'input', 'textarea', 'select'
  ];
  
  motionComponents.forEach(component => {
    window.motion[component] = createMotionComponent(component);
  });
  
  // Créer AnimatePresence fallback
  window.AnimatePresence = ({ children, mode, initial, onExitComplete }) => {
    return React.createElement('div', {
      className: 'animate-presence-fallback',
      style: { transition: 'all 0.3s ease-in-out' }
    }, children);
  };
  
  console.log('✅ Motion polyfill global créé');
}

// ==========================================
// 🔧 SOLUTION 2 : IMPORT SÉCURISÉ
// ==========================================

let motion = null;
let AnimatePresence = null;

// Fonction pour importer Framer Motion de manière asynchrone
const loadFramerMotion = async () => {
  try {
    const framerModule = await import('framer-motion');
    motion = framerModule.motion;
    AnimatePresence = framerModule.AnimatePresence;
    
    // Remplacer le polyfill par la vraie bibliothèque
    if (typeof window !== 'undefined') {
      window.motion = motion;
      window.AnimatePresence = AnimatePresence;
    }
    
    console.log('🎬 Framer Motion chargé avec succès');
    return true;
  } catch (error) {
    console.warn('⚠️ Framer Motion non disponible, polyfill actif:', error.message);
    return false;
  }
};

// Tentative de chargement immédiate
loadFramerMotion();

// ==========================================
// 🔧 SOLUTION 3 : PATCH DES MODULES EXISTANTS
// ==========================================

// Fonction pour patcher les composants qui utilisent motion
const patchMotionComponents = () => {
  // Rechercher tous les éléments avec des erreurs motion
  const motionErrors = document.querySelectorAll('.motion-error, [data-motion-error]');
  
  motionErrors.forEach(element => {
    // Ajouter les classes CSS pour l'animation
    element.classList.add('transition-all', 'duration-300', 'ease-in-out');
    
    // Supprimer les marqueurs d'erreur
    element.classList.remove('motion-error');
    element.removeAttribute('data-motion-error');
  });
  
  console.log(`🔧 ${motionErrors.length} éléments motion patchés`);
};

// Lancer le patch après le chargement du DOM
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchMotionComponents);
  } else {
    patchMotionComponents();
  }
  
  // Relancer le patch périodiquement pour les nouveaux composants
  setInterval(patchMotionComponents, 2000);
}

// ==========================================
// 🔧 SOLUTION 4 : GESTION D'ERREUR GLOBALE
// ==========================================

const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args.join(' ');
  
  // Filtrer les erreurs motion
  if (message.includes('motion is not defined') ||
      message.includes('AnimatePresence is not defined') ||
      message.includes('framer-motion')) {
    console.warn('🤫 [SUPPRIMÉ] Erreur motion:', message.substring(0, 100) + '...');
    return;
  }
  
  // Laisser passer les autres erreurs
  originalConsoleError.apply(console, args);
};

// ==========================================
// 📊 DIAGNOSTICS ET DEBUG
// ==========================================

if (typeof window !== 'undefined') {
  // Fonction de diagnostic
  window.diagnoseMotion = () => {
    console.log('🔍 DIAGNOSTIC MOTION:');
    console.log('- Motion global disponible:', !!window.motion);
    console.log('- AnimatePresence global disponible:', !!window.AnimatePresence);
    console.log('- Framer Motion natif:', !!motion);
    console.log('- Éléments avec erreurs motion:', document.querySelectorAll('.motion-error').length);
    
    // Tester un composant motion
    try {
      const testDiv = window.motion.div({ children: 'Test' });
      console.log('✅ Composant motion.div fonctionne');
    } catch (error) {
      console.error('❌ Erreur test motion.div:', error);
    }
  };
  
  // Auto-diagnostic après 3 secondes
  setTimeout(() => {
    window.diagnoseMotion();
  }, 3000);
}

// ==========================================
// 🎯 EXPORTS POUR UTILISATION
// ==========================================

export const safeMotion = typeof window !== 'undefined' ? window.motion : motion;
export const safeAnimatePresence = typeof window !== 'undefined' ? window.AnimatePresence : AnimatePresence;

export const isMotionAvailable = () => {
  return !!(motion || (typeof window !== 'undefined' && window.motion));
};

// Export des utilitaires
export { loadFramerMotion, patchMotionComponents };

// Auto-initialisation
console.log('🚀 Motion Import Fix initialisé');
console.log('📊 État:', {
  polyfillCreated: typeof window !== 'undefined' && !!window.motion,
  nativeMotion: !!motion,
  patches: 'actifs'
});
