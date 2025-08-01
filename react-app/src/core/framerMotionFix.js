// ==========================================
// 📁 react-app/src/core/framerMotionFix.js
// CORRECTION DES IMPORTS FRAMER MOTION - ANTI-BUG
// ==========================================

/**
 * 🎬 GESTION SÉCURISÉE DE FRAMER MOTION
 * Évite les erreurs "motion is not defined"
 */

let motion = null;
let AnimatePresence = null;

try {
  // Tentative d'import de Framer Motion
  const framerMotion = await import('framer-motion');
  motion = framerMotion.motion;
  AnimatePresence = framerMotion.AnimatePresence;
  
  console.log('✅ Framer Motion importé avec succès');
} catch (error) {
  console.warn('⚠️ Framer Motion non disponible, fallback activé:', error);
  
  // Fallback : Composants React simples
  motion = {
    div: ({ children, initial, animate, exit, transition, className, style, onClick, onHoverStart, onHoverEnd, layout, layoutId, ...props }) => {
      return React.createElement('div', {
        className,
        style: {
          ...style,
          // Simulation de transitions avec CSS
          transition: transition ? 'all 0.3s ease-in-out' : undefined
        },
        onClick,
        onMouseEnter: onHoverStart,
        onMouseLeave: onHoverEnd,
        ...props
      }, children);
    },
    
    button: ({ children, whileHover, whileTap, className, onClick, disabled, ...props }) => {
      return React.createElement('button', {
        className: `${className || ''} transition-all duration-200`,
        onClick,
        disabled,
        style: {
          transform: whileHover ? 'scale(1.05)' : undefined,
          ...props.style
        },
        onMouseEnter: (e) => {
          if (whileHover?.scale) {
            e.target.style.transform = `scale(${whileHover.scale})`;
          }
        },
        onMouseLeave: (e) => {
          e.target.style.transform = 'scale(1)';
        },
        ...props
      }, children);
    },
    
    span: ({ children, className, ...props }) => {
      return React.createElement('span', { className, ...props }, children);
    },
    
    img: ({ src, alt, className, ...props }) => {
      return React.createElement('img', { src, alt, className, ...props });
    },
    
    section: ({ children, className, ...props }) => {
      return React.createElement('section', { className, ...props }, children);
    },
    
    article: ({ children, className, ...props }) => {
      return React.createElement('article', { className, ...props }, children);
    },
    
    header: ({ children, className, ...props }) => {
      return React.createElement('header', { className, ...props }, children);
    },
    
    footer: ({ children, className, ...props }) => {
      return React.createElement('footer', { className, ...props }, children);
    },
    
    nav: ({ children, className, ...props }) => {
      return React.createElement('nav', { className, ...props }, children);
    },
    
    main: ({ children, className, ...props }) => {
      return React.createElement('main', { className, ...props }, children);
    },
    
    aside: ({ children, className, ...props }) => {
      return React.createElement('aside', { className, ...props }, children);
    },
    
    form: ({ children, className, onSubmit, ...props }) => {
      return React.createElement('form', { 
        className, 
        onSubmit: (e) => {
          e.preventDefault();
          if (onSubmit) onSubmit(e);
        }, 
        ...props 
      }, children);
    },
    
    h1: ({ children, className, ...props }) => {
      return React.createElement('h1', { className, ...props }, children);
    },
    
    h2: ({ children, className, ...props }) => {
      return React.createElement('h2', { className, ...props }, children);
    },
    
    h3: ({ children, className, ...props }) => {
      return React.createElement('h3', { className, ...props }, children);
    },
    
    p: ({ children, className, ...props }) => {
      return React.createElement('p', { className, ...props }, children);
    },
    
    ul: ({ children, className, ...props }) => {
      return React.createElement('ul', { className, ...props }, children);
    },
    
    li: ({ children, className, ...props }) => {
      return React.createElement('li', { className, ...props }, children);
    }
  };
  
  // AnimatePresence fallback
  AnimatePresence = ({ children, mode = 'wait', initial = true }) => {
    return React.createElement('div', { 
      className: 'animate-presence-fallback',
      style: {
        transition: 'all 0.3s ease-in-out'
      }
    }, children);
  };
}

/**
 * 🎭 ANIMATION VARIANTS SÉCURISÉES
 */
export const SAFE_VARIANTS = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  },
  
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  },
  
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
  },
  
  bounce: {
    visible: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  }
};

/**
 * 🚀 TRANSITIONS PRÉDÉFINIES
 */
export const SAFE_TRANSITIONS = {
  default: { duration: 0.3, ease: "easeInOut" },
  fast: { duration: 0.15, ease: "easeInOut" },
  slow: { duration: 0.6, ease: "easeInOut" },
  bounce: { type: "spring", stiffness: 300, damping: 20 },
  gentle: { type: "spring", stiffness: 100, damping: 15 },
  elastic: { type: "spring", stiffness: 400, damping: 10 }
};

/**
 * 🎯 HOOK POUR UTILISER FRAMER MOTION DE FAÇON SÉCURISÉE
 */
export const useMotion = () => {
  return {
    motion,
    AnimatePresence,
    variants: SAFE_VARIANTS,
    transitions: SAFE_TRANSITIONS,
    isAvailable: motion !== null
  };
};

// Export par défaut
export { motion, AnimatePresence };

/**
 * 📱 COMPOSANTS ANIMATION RÉUTILISABLES
 */
export const MotionDiv = ({ children, variant = 'fadeIn', ...props }) => {
  const Component = motion.div;
  return (
    <Component
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={SAFE_VARIANTS[variant]}
      transition={SAFE_TRANSITIONS.default}
      {...props}
    >
      {children}
    </Component>
  );
};

export const MotionButton = ({ children, ...props }) => {
  const Component = motion.button;
  return (
    <Component
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={SAFE_TRANSITIONS.fast}
      {...props}
    >
      {children}
    </Component>
  );
};

export const MotionCard = ({ children, ...props }) => {
  const Component = motion.div;
  return (
    <Component
      initial="hidden"
      animate="visible"
      variants={SAFE_VARIANTS.slideUp}
      whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
      transition={SAFE_TRANSITIONS.gentle}
      {...props}
    >
      {children}
    </Component>
  );
};

// Log de confirmation
console.log('🎬 Framer Motion Fix initialisé', { 
  motionAvailable: motion !== null,
  AnimatePresenceAvailable: AnimatePresence !== null 
});
