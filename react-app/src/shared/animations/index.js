// ==========================================
// shared/animations/index.js
// Animation system exports
// ==========================================

// Animation presets
export {
  easings,
  springs,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  fadeInScale,
  popIn,
  staggerContainer,
  staggerItem,
  hoverScale,
  hoverLift,
  hoverGlow,
  tapScale,
  pulse,
  celebratePop,
  shimmer,
  slideUp,
  slideDown,
  modalBackdrop,
  modalContent,
  notificationSlide,
  prefersReducedMotion,
  getAnimation
} from './presets.js';

// Animated components
export {
  AnimatedCard,
  AnimatedList,
  AnimatedListItem,
  AnimatedButton,
  XPPopup,
  LevelUpPopup,
  BadgeEarnedPopup,
  Confetti,
  AnimatedCounter,
  Skeleton,
  AnimatedProgress,
  Toast
} from './components.jsx';

// Provider and hooks for automatic reward animations
export {
  RewardAnimationsProvider,
  useRewardAnimationsTriggers
} from './RewardAnimationsProvider.jsx';
