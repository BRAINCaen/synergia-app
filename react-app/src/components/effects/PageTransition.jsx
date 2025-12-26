// ==========================================
// react-app/src/components/effects/PageTransition.jsx
// TRANSITIONS DE PAGE ANIMÉES
// ==========================================

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

// ==========================================
// VARIANTES DE TRANSITION
// ==========================================

const transitionVariants = {
  // Slide depuis la droite (défaut)
  slideRight: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 }
  },

  // Slide depuis la gauche
  slideLeft: {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 }
  },

  // Slide depuis le bas
  slideUp: {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '-50%', opacity: 0 }
  },

  // Fade simple
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },

  // Scale avec fade
  scale: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.1, opacity: 0 }
  },

  // Zoom in
  zoomIn: {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.5, opacity: 0 }
  },

  // Rotate et scale
  rotate: {
    initial: { scale: 0.8, rotate: -10, opacity: 0 },
    animate: { scale: 1, rotate: 0, opacity: 1 },
    exit: { scale: 0.8, rotate: 10, opacity: 0 }
  },

  // Flip horizontal
  flipX: {
    initial: { rotateY: 90, opacity: 0 },
    animate: { rotateY: 0, opacity: 1 },
    exit: { rotateY: -90, opacity: 0 }
  },

  // Flip vertical
  flipY: {
    initial: { rotateX: 90, opacity: 0 },
    animate: { rotateX: 0, opacity: 1 },
    exit: { rotateX: -90, opacity: 0 }
  },

  // Blur fade
  blur: {
    initial: { filter: 'blur(10px)', opacity: 0, scale: 0.95 },
    animate: { filter: 'blur(0px)', opacity: 1, scale: 1 },
    exit: { filter: 'blur(10px)', opacity: 0, scale: 1.05 }
  },

  // Morph
  morph: {
    initial: { borderRadius: '50%', scale: 0, opacity: 0 },
    animate: { borderRadius: '0%', scale: 1, opacity: 1 },
    exit: { borderRadius: '50%', scale: 0, opacity: 0 }
  },

  // Glitch effect
  glitch: {
    initial: {
      x: 0,
      opacity: 0,
      filter: 'hue-rotate(90deg)'
    },
    animate: {
      x: [0, -5, 5, -3, 3, 0],
      opacity: 1,
      filter: 'hue-rotate(0deg)',
      transition: {
        x: { duration: 0.3, times: [0, 0.2, 0.4, 0.6, 0.8, 1] },
        opacity: { duration: 0.2 },
        filter: { duration: 0.3 }
      }
    },
    exit: {
      x: [0, 5, -5, 3, -3, 0],
      opacity: 0,
      filter: 'hue-rotate(-90deg)'
    }
  }
};

// Configurations de transition
const transitionConfigs = {
  spring: {
    type: 'spring',
    stiffness: 100,
    damping: 15
  },
  smooth: {
    duration: 0.4,
    ease: [0.25, 0.46, 0.45, 0.94]
  },
  fast: {
    duration: 0.2,
    ease: 'easeOut'
  },
  slow: {
    duration: 0.6,
    ease: 'easeInOut'
  },
  bounce: {
    type: 'spring',
    stiffness: 300,
    damping: 20
  }
};

// ==========================================
// COMPOSANT PRINCIPAL
// ==========================================

/**
 * Wrapper pour les transitions de page
 */
export const PageTransition = ({
  children,
  variant = 'fade',
  transition = 'smooth',
  className = ''
}) => {
  const variants = transitionVariants[variant] || transitionVariants.fade;
  const config = transitionConfigs[transition] || transitionConfigs.smooth;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={config}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Container pour AnimatePresence avec location
 */
export const AnimatedRoutes = ({ children }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname}>
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Transition de contenu (pour les onglets, modales, etc.)
 */
export const ContentTransition = ({
  children,
  show = true,
  variant = 'scale',
  transition = 'spring',
  className = ''
}) => {
  const variants = transitionVariants[variant] || transitionVariants.scale;
  const config = transitionConfigs[transition] || transitionConfigs.spring;

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants}
          transition={config}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Transition de liste avec stagger
 */
export const StaggerContainer = ({
  children,
  staggerDelay = 0.1,
  className = ''
}) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Item de liste avec animation
 */
export const StaggerItem = ({
  children,
  className = '',
  onClick
}) => {
  return (
    <motion.div
      variants={{
        hidden: { y: 20, opacity: 0 },
        visible: {
          y: 0,
          opacity: 1,
          transition: {
            type: 'spring',
            stiffness: 100,
            damping: 12
          }
        }
      }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Transition de modal/overlay
 */
export const ModalTransition = ({
  children,
  show,
  onClose,
  backdropClassName = '',
  contentClassName = ''
}) => {
  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] ${backdropClassName}`}
          />

          {/* Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 25
            }}
            className={`fixed inset-0 flex items-center justify-center z-[101] pointer-events-none ${contentClassName}`}
          >
            <div className="pointer-events-auto">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/**
 * Transition de tab/onglet
 */
export const TabTransition = ({
  children,
  activeTab,
  direction = 1 // 1 = droite, -1 = gauche
}) => {
  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={activeTab}
        custom={direction}
        initial={{ x: direction * 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: direction * -50, opacity: 0 }}
        transition={{
          duration: 0.3,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Accordion/Collapse transition
 */
export const CollapseTransition = ({
  children,
  show,
  className = ''
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{
            height: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
            opacity: { duration: 0.2 }
          }}
          className={`overflow-hidden ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ==========================================
// EXPORTS
// ==========================================

export {
  transitionVariants,
  transitionConfigs
};

export default PageTransition;
