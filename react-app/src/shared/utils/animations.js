// ==========================================
// react-app/src/shared/utils/animations.js
// BIBLIOTHÈQUE D'ANIMATIONS SYNERGIA
// Animations Framer Motion réutilisables
// ==========================================

// ==========================================
// VARIANTES DE BASE
// ==========================================

// Fade In/Out simple
export const fadeVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' }
  }
};

// Slide depuis différentes directions
export const slideVariants = {
  fromLeft: {
    hidden: { x: -100, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    },
    exit: { x: -100, opacity: 0, transition: { duration: 0.2 } }
  },
  fromRight: {
    hidden: { x: 100, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    },
    exit: { x: 100, opacity: 0, transition: { duration: 0.2 } }
  },
  fromTop: {
    hidden: { y: -50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    },
    exit: { y: -50, opacity: 0, transition: { duration: 0.2 } }
  },
  fromBottom: {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    },
    exit: { y: 50, opacity: 0, transition: { duration: 0.2 } }
  }
};

// Scale avec bounce
export const scaleVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
      delay: 0.1
    }
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.2 }
  },
  tap: { scale: 0.95 },
  hover: { scale: 1.05 }
};

// Pop effect (badge, achievement)
export const popVariants = {
  hidden: { scale: 0, rotate: -180, opacity: 0 },
  visible: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 25,
      mass: 1
    }
  },
  exit: { scale: 0, rotate: 180, opacity: 0 }
};

// ==========================================
// ANIMATIONS DE LISTE/STAGGER
// ==========================================

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

export const staggerItem = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12
    }
  },
  exit: { y: -20, opacity: 0 }
};

export const staggerFast = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05
    }
  }
};

// ==========================================
// ANIMATIONS DE PAGE
// ==========================================

export const pageTransition = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

export const tabTransition = {
  initial: { opacity: 0, x: 20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.2 }
  }
};

// ==========================================
// ANIMATIONS SPÉCIALES
// ==========================================

// Pulse/Glow effect
export const pulseVariants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// Shake effect
export const shakeVariants = {
  initial: { x: 0 },
  shake: {
    x: [-10, 10, -10, 10, 0],
    transition: {
      duration: 0.5,
      ease: 'easeInOut'
    }
  }
};

// Float effect
export const floatVariants = {
  initial: { y: 0 },
  animate: {
    y: [-5, 5, -5],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// Rotate continuous
export const spinVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

// Bounce
export const bounceVariants = {
  initial: { y: 0 },
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: 'easeOut'
    }
  }
};

// ==========================================
// ANIMATIONS DE NOTIFICATION/TOAST
// ==========================================

export const toastVariants = {
  hidden: {
    opacity: 0,
    y: -100,
    scale: 0.8,
    rotateX: 45
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25
    }
  },
  exit: {
    opacity: 0,
    y: -50,
    scale: 0.8,
    transition: { duration: 0.2 }
  }
};

// ==========================================
// ANIMATIONS DE CARD/MODAL
// ==========================================

export const cardVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15
    }
  },
  hover: {
    y: -5,
    scale: 1.02,
    boxShadow: '0 20px 40px rgba(139, 92, 246, 0.3)',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25
    }
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 }
  }
};

export const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 50
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 50,
    transition: { duration: 0.2 }
  }
};

export const backdropVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

// ==========================================
// ANIMATIONS DE BOUTON
// ==========================================

export const buttonVariants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10
    }
  },
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 }
  },
  disabled: {
    opacity: 0.5,
    scale: 1
  }
};

export const iconButtonVariants = {
  initial: { scale: 1, rotate: 0 },
  hover: {
    scale: 1.1,
    rotate: 5,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10
    }
  },
  tap: {
    scale: 0.9,
    rotate: -5
  }
};

// ==========================================
// ANIMATIONS DE PROGRESS/LOADING
// ==========================================

export const progressVariants = {
  initial: { width: 0 },
  animate: (progress) => ({
    width: `${progress}%`,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  })
};

export const skeletonVariants = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

// ==========================================
// ANIMATIONS DE BADGE/ACHIEVEMENT
// ==========================================

export const badgeUnlockVariants = {
  hidden: {
    scale: 0,
    rotate: -180,
    opacity: 0
  },
  visible: {
    scale: [0, 1.3, 1],
    rotate: [0, 15, -10, 5, 0],
    opacity: 1,
    transition: {
      duration: 0.8,
      times: [0, 0.6, 1],
      ease: 'easeOut'
    }
  }
};

export const xpGainVariants = {
  hidden: {
    y: 0,
    opacity: 1,
    scale: 1
  },
  animate: {
    y: -50,
    opacity: 0,
    scale: 1.5,
    transition: {
      duration: 1,
      ease: 'easeOut'
    }
  }
};

export const levelUpVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: [0, 1.5, 1],
    opacity: [0, 1, 1],
    transition: {
      duration: 0.8,
      times: [0, 0.5, 1],
      ease: 'easeOut'
    }
  }
};

// ==========================================
// SPRING CONFIGS RÉUTILISABLES
// ==========================================

export const springConfigs = {
  gentle: { type: 'spring', stiffness: 120, damping: 14 },
  wobbly: { type: 'spring', stiffness: 180, damping: 12 },
  stiff: { type: 'spring', stiffness: 400, damping: 30 },
  slow: { type: 'spring', stiffness: 80, damping: 20 },
  molasses: { type: 'spring', stiffness: 50, damping: 15 },
  bouncy: { type: 'spring', stiffness: 600, damping: 15 }
};

// ==========================================
// HELPERS
// ==========================================

// Créer un délai pour stagger personnalisé
export const createStaggerDelay = (index, baseDelay = 0.1) => ({
  delay: index * baseDelay
});

// Créer une animation avec délai personnalisé
export const withDelay = (variants, delay) => ({
  ...variants,
  visible: {
    ...variants.visible,
    transition: {
      ...variants.visible?.transition,
      delay
    }
  }
});

// ==========================================
// ANIMATIONS CSS KEYFRAMES (pour Tailwind)
// ==========================================

export const cssAnimations = {
  shimmer: `
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `,
  pulse: `
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
      50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.6); }
    }
  `,
  float: `
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
  `,
  shake: `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }
  `
};

export default {
  fadeVariants,
  slideVariants,
  scaleVariants,
  popVariants,
  staggerContainer,
  staggerItem,
  staggerFast,
  pageTransition,
  tabTransition,
  pulseVariants,
  shakeVariants,
  floatVariants,
  spinVariants,
  bounceVariants,
  toastVariants,
  cardVariants,
  modalVariants,
  backdropVariants,
  buttonVariants,
  iconButtonVariants,
  progressVariants,
  skeletonVariants,
  badgeUnlockVariants,
  xpGainVariants,
  levelUpVariants,
  springConfigs,
  createStaggerDelay,
  withDelay
};
