// ==========================================
// shared/animations/presets.js
// Animation presets for Framer Motion
// Lightweight, GPU-optimized, accessibility-aware
// ==========================================

// Check for reduced motion preference
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// ==========================================
// TIMING FUNCTIONS
// ==========================================

export const easings = {
  smooth: [0.4, 0, 0.2, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
  elastic: [0.175, 0.885, 0.32, 1.275],
  snappy: [0.25, 0.1, 0.25, 1],
  gentle: [0.4, 0, 0.6, 1]
};

// ==========================================
// FADE ANIMATIONS
// ==========================================

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2, ease: easings.smooth }
};

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3, ease: easings.smooth }
};

export const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
  transition: { duration: 0.3, ease: easings.smooth }
};

export const fadeInScale = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { duration: 0.2, ease: easings.bounce }
};

// ==========================================
// SLIDE ANIMATIONS
// ==========================================

export const slideInLeft = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
  transition: { duration: 0.3, ease: easings.smooth }
};

export const slideInRight = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 30 },
  transition: { duration: 0.3, ease: easings.smooth }
};

// ==========================================
// SCALE ANIMATIONS
// ==========================================

export const scaleIn = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0, opacity: 0 },
  transition: { duration: 0.3, ease: easings.bounce }
};

export const popIn = {
  initial: { scale: 0.5, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.5, opacity: 0 },
  transition: { type: 'spring', stiffness: 400, damping: 15 }
};

// ==========================================
// STAGGER ANIMATIONS (for lists)
// ==========================================

export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: easings.smooth }
  }
};

export const staggerFadeItem = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.2 }
  }
};

// ==========================================
// HOVER ANIMATIONS
// ==========================================

export const hoverScale = {
  scale: 1.02,
  transition: { duration: 0.2, ease: easings.snappy }
};

export const hoverLift = {
  y: -4,
  boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
  transition: { duration: 0.2, ease: easings.snappy }
};

export const hoverGlow = {
  boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
  transition: { duration: 0.2 }
};

// ==========================================
// TAP ANIMATIONS
// ==========================================

export const tapScale = {
  scale: 0.95,
  transition: { duration: 0.1 }
};

export const tapBounce = {
  scale: 0.9,
  transition: { type: 'spring', stiffness: 400, damping: 10 }
};

// ==========================================
// PULSE & GLOW ANIMATIONS
// ==========================================

export const pulse = {
  scale: [1, 1.05, 1],
  transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
};

export const pulseGlow = {
  boxShadow: [
    '0 0 0 0 rgba(139, 92, 246, 0)',
    '0 0 0 10px rgba(139, 92, 246, 0.3)',
    '0 0 0 0 rgba(139, 92, 246, 0)'
  ],
  transition: { duration: 2, repeat: Infinity }
};

export const breathe = {
  scale: [1, 1.02, 1],
  opacity: [1, 0.8, 1],
  transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
};

// ==========================================
// SHAKE ANIMATIONS
// ==========================================

export const shake = {
  x: [0, -10, 10, -10, 10, 0],
  transition: { duration: 0.5 }
};

export const wiggle = {
  rotate: [0, -3, 3, -3, 3, 0],
  transition: { duration: 0.5 }
};

// ==========================================
// CELEBRATION ANIMATIONS
// ==========================================

export const celebratePop = {
  initial: { scale: 0, rotate: -180 },
  animate: {
    scale: [0, 1.2, 1],
    rotate: 0,
    transition: { duration: 0.5, ease: easings.bounce }
  }
};

export const celebrateFloat = {
  y: [0, -10, 0],
  transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
};

export const sparkle = {
  scale: [0, 1, 0],
  opacity: [0, 1, 0],
  rotate: [0, 180, 360],
  transition: { duration: 0.6 }
};

// ==========================================
// NUMBER COUNTER ANIMATION
// ==========================================

export const countUp = (from, to, duration = 1) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.3 }
});

// ==========================================
// MODAL ANIMATIONS
// ==========================================

export const modalBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 }
};

export const modalContent = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 },
  transition: { duration: 0.2, ease: easings.smooth }
};

// ==========================================
// PAGE TRANSITIONS
// ==========================================

export const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3 }
};

// ==========================================
// SKELETON LOADING
// ==========================================

export const shimmer = {
  backgroundPosition: ['200% 0', '-200% 0'],
  transition: { duration: 1.5, repeat: Infinity, ease: 'linear' }
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

// Get animation with reduced motion fallback
export const getAnimation = (animation) => {
  if (prefersReducedMotion()) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.1 }
    };
  }
  return animation;
};

// Create stagger delay for index
export const staggerDelay = (index, baseDelay = 0.05) => ({
  transition: { delay: index * baseDelay }
});

// Spring config presets
export const springs = {
  gentle: { type: 'spring', stiffness: 100, damping: 15 },
  bouncy: { type: 'spring', stiffness: 400, damping: 10 },
  stiff: { type: 'spring', stiffness: 500, damping: 30 },
  slow: { type: 'spring', stiffness: 50, damping: 20 }
};
