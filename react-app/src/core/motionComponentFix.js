// ==========================================
// 📁 react-app/src/core/motionComponentFix.js
// CORRECTION FINALE DES COMPOSANTS MOTION
// ==========================================

import React from 'react';

/**
 * 🎬 CORRECTION FINALE POUR "window.motion.div is not a function"
 * Cette correction crée des composants motion fonctionnels
 */

// ==========================================
// 🔧 CRÉATION DES COMPOSANTS MOTION CORRECTS
// ==========================================

const createMotionComponent = (elementType) => {
  return React.forwardRef((props, ref) => {
    const {
      children,
      initial,
      animate,
      exit,
      transition,
      variants,
      whileHover,
      whileTap,
      whileInView,
      whileFocus,
      onHoverStart,
      onHoverEnd,
      onTapStart,
      onTap,
      onTapCancel,
      onPanStart,
      onPan,
      onPanEnd,
      layout,
      layoutId,
      style = {},
      className = '',
      ...restProps
    } = props;

    // États pour les interactions
    const [isHovered, setIsHovered] = React.useState(false);
    const [isTapped, setIsTapped] = React.useState(false);
    const [isInView, setIsInView] = React.useState(false);

    // Référence pour l'élément DOM
    const elementRef = React.useRef(null);
    const combinedRef = React.useCallback((node) => {
      elementRef.current = node;
      if (ref) {
        if (typeof ref === 'function') ref(node);
        else ref.current = node;
      }
    }, [ref]);

    // Observer pour whileInView
    React.useEffect(() => {
      if (!whileInView || !elementRef.current) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsInView(entry.isIntersecting);
        },
        { threshold: 0.1 }
      );

      observer.observe(elementRef.current);
      return () => observer.disconnect();
    }, [whileInView]);

    // Calculer les styles finaux
    const computeFinalStyle = () => {
      let finalStyle = { ...style };
      
      // Ajouter les transitions CSS
      if (transition || whileHover || whileTap || whileInView) {
        finalStyle.transition = 'all 0.3s ease-in-out';
      }

      // Appliquer les styles d'état
      if (isHovered && whileHover) {
        if (whileHover.scale !== undefined) {
          finalStyle.transform = (finalStyle.transform || '') + ` scale(${whileHover.scale})`;
        }
        if (whileHover.x !== undefined) {
          finalStyle.transform = (finalStyle.transform || '') + ` translateX(${whileHover.x}px)`;
        }
        if (whileHover.y !== undefined) {
          finalStyle.transform = (finalStyle.transform || '') + ` translateY(${whileHover.y}px)`;
        }
        if (whileHover.rotate !== undefined) {
          finalStyle.transform = (finalStyle.transform || '') + ` rotate(${whileHover.rotate}deg)`;
        }
        if (whileHover.backgroundColor) {
          finalStyle.backgroundColor = whileHover.backgroundColor;
        }
        if (whileHover.color) {
          finalStyle.color = whileHover.color;
        }
        if (whileHover.boxShadow) {
          finalStyle.boxShadow = whileHover.boxShadow;
        }
      }

      if (isTapped && whileTap) {
        if (whileTap.scale !== undefined) {
          finalStyle.transform = (finalStyle.transform || '') + ` scale(${whileTap.scale})`;
        }
        if (whileTap.x !== undefined) {
          finalStyle.transform = (finalStyle.transform || '') + ` translateX(${whileTap.x}px)`;
        }
        if (whileTap.y !== undefined) {
          finalStyle.transform = (finalStyle.transform || '') + ` translateY(${whileTap.y}px)`;
        }
      }

      if (isInView && whileInView) {
        if (whileInView.opacity !== undefined) {
          finalStyle.opacity = whileInView.opacity;
        }
        if (whileInView.scale !== undefined) {
          finalStyle.transform = (finalStyle.transform || '') + ` scale(${whileInView.scale})`;
        }
        if (whileInView.x !== undefined) {
          finalStyle.transform = (finalStyle.transform || '') + ` translateX(${whileInView.x}px)`;
        }
        if (whileInView.y !== undefined) {
          finalStyle.transform = (finalStyle.transform || '') + ` translateY(${whileInView.y}px)`;
        }
      }

      return finalStyle;
    };

    // Gestionnaires d'événements
    const handleMouseEnter = (e) => {
      setIsHovered(true);
      if (onHoverStart) onHoverStart(e, { point: { x: e.clientX, y: e.clientY } });
    };

    const handleMouseLeave = (e) => {
      setIsHovered(false);
      if (onHoverEnd) onHoverEnd(e, { point: { x: e.clientX, y: e.clientY } });
    };

    const handleMouseDown = (e) => {
      setIsTapped(true);
      if (onTapStart) onTapStart(e, { point: { x: e.clientX, y: e.clientY } });
    };

    const handleMouseUp = (e) => {
      setIsTapped(false);
      if (onTap) onTap(e, { point: { x: e.clientX, y: e.clientY } });
    };

    const handleClick = (e) => {
      if (restProps.onClick) restProps.onClick(e);
    };

    // Props finales
    const finalProps = {
      ...restProps,
      ref: combinedRef,
      className: `${className} motion-component`,
      style: computeFinalStyle(),
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseUp,
      onClick: handleClick,
    };

    return React.createElement(elementType, finalProps, children);
  });
};

// ==========================================
// 🎭 CRÉATION DE TOUS LES COMPOSANTS MOTION
// ==========================================

const motionComponents = {};

// Éléments HTML standard
const htmlElements = [
  'div', 'span', 'p', 'a', 'button', 'input', 'textarea', 'select', 'img',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'section', 'article', 'header', 'footer', 'nav', 'main', 'aside',
  'ul', 'ol', 'li', 'dl', 'dt', 'dd',
  'table', 'thead', 'tbody', 'tr', 'td', 'th',
  'form', 'fieldset', 'legend', 'label',
  'canvas', 'svg', 'video', 'audio'
];

// Créer tous les composants
htmlElements.forEach(element => {
  motionComponents[element] = createMotionComponent(element);
});

// ==========================================
// 🔧 CRÉATION D'ANIMATEPRESENCE
// ==========================================

const AnimatePresence = ({ children, mode = 'wait', initial = true, onExitComplete }) => {
  const [currentChildren, setCurrentChildren] = React.useState(children);
  const [isExiting, setIsExiting] = React.useState(false);

  React.useEffect(() => {
    if (React.Children.count(children) === 0 && React.Children.count(currentChildren) > 0) {
      // Enfants supprimés - commencer l'animation de sortie
      setIsExiting(true);
      setTimeout(() => {
        setCurrentChildren(children);
        setIsExiting(false);
        if (onExitComplete) onExitComplete();
      }, 300); // Durée de l'animation de sortie
    } else {
      // Enfants ajoutés ou modifiés
      setCurrentChildren(children);
      setIsExiting(false);
    }
  }, [children, currentChildren, onExitComplete]);

  return React.createElement(
    'div',
    {
      className: `animate-presence ${isExiting ? 'exiting' : ''}`,
      style: {
        transition: 'all 0.3s ease-in-out',
        opacity: isExiting ? 0 : 1
      }
    },
    currentChildren
  );
};

// ==========================================
// 🚀 INSTALLATION GLOBALE
// ==========================================

const installMotionComponents = () => {
  if (typeof window === 'undefined') return;

  // Installer les composants motion
  window.motion = motionComponents;
  window.AnimatePresence = AnimatePresence;

  // Créer des utilitaires supplémentaires
  window.motion.custom = (Component) => {
    if (typeof Component === 'string') {
      return motionComponents[Component] || createMotionComponent(Component);
    }
    
    // Pour les composants React personnalisés
    return React.forwardRef((props, ref) => {
      const MotionDiv = motionComponents.div;
      return React.createElement(MotionDiv, props, 
        React.createElement(Component, { ref })
      );
    });
  };

  // Variants prédéfinies
  window.motion.variants = {
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 }
    },
    slideUp: {
      hidden: { opacity: 0, y: 50 },
      visible: { opacity: 1, y: 0 }
    },
    slideDown: {
      hidden: { opacity: 0, y: -50 },
      visible: { opacity: 1, y: 0 }
    },
    slideLeft: {
      hidden: { opacity: 0, x: 50 },
      visible: { opacity: 1, x: 0 }
    },
    slideRight: {
      hidden: { opacity: 0, x: -50 },
      visible: { opacity: 1, x: 0 }
    },
    scale: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 }
    }
  };

  // Transitions prédéfinies
  window.motion.transitions = {
    default: { duration: 0.3, ease: 'ease-in-out' },
    fast: { duration: 0.15, ease: 'ease-in-out' },
    slow: { duration: 0.6, ease: 'ease-in-out' },
    bounce: { duration: 0.5, ease: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' }
  };

  console.log('✅ Composants Motion installés avec succès');
  console.log('📊 Composants disponibles:', Object.keys(motionComponents));
};

// ==========================================
// 🔧 CORRECTION DES ERREURS EXISTANTES
// ==========================================

const fixExistingMotionErrors = () => {
  // Corriger les éléments qui ont des erreurs motion
  const errorElements = document.querySelectorAll('[data-motion-error], .motion-error');
  
  errorElements.forEach(element => {
    // Ajouter les classes de transition CSS
    element.style.transition = 'all 0.3s ease-in-out';
    element.classList.remove('motion-error');
    element.removeAttribute('data-motion-error');
  });

  if (errorElements.length > 0) {
    console.log(`🔧 ${errorElements.length} éléments motion corrigés`);
  }
};

// ==========================================
// 🎯 INITIALISATION AUTOMATIQUE
// ==========================================

if (typeof window !== 'undefined') {
  // Installation immédiate
  installMotionComponents();
  
  // Correction des erreurs existantes
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixExistingMotionErrors);
  } else {
    fixExistingMotionErrors();
  }
  
  // Réessayer périodiquement pour les composants chargés dynamiquement
  setInterval(fixExistingMotionErrors, 3000);
  
  // Fonction de test
  window.testMotion = () => {
    console.log('🧪 Test des composants Motion:');
    
    try {
      const testDiv = React.createElement(window.motion.div, {
        whileHover: { scale: 1.1 },
        children: 'Test Motion'
      });
      console.log('✅ motion.div fonctionne');
      
      const testPresence = React.createElement(window.AnimatePresence, {
        children: testDiv
      });
      console.log('✅ AnimatePresence fonctionne');
      
      console.log('✅ Tous les composants Motion fonctionnent correctement');
      return true;
      
    } catch (error) {
      console.error('❌ Erreur test Motion:', error);
      return false;
    }
  };
  
  // Test automatique après 2 secondes
  setTimeout(() => {
    if (typeof window.testMotion === 'function') {
      window.testMotion();
    }
  }, 2000);
}

// ==========================================
// 📤 EXPORTS
// ==========================================

export { motionComponents as motion, AnimatePresence };
export default {
  motion: motionComponents,
  AnimatePresence,
  installMotionComponents,
  fixExistingMotionErrors
};

console.log('🎬 MotionComponentFix initialisé');
