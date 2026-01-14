// ==========================================
// shared/animations/components.jsx
// Reusable animated components
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fadeInUp, fadeInScale, popIn, staggerContainer, staggerItem,
  hoverScale, hoverLift, tapScale, pulse, celebratePop,
  modalBackdrop, modalContent, getAnimation, springs
} from './presets.js';

// ==========================================
// ANIMATED CARD
// ==========================================

export const AnimatedCard = ({
  children,
  className = '',
  delay = 0,
  hover = 'lift',
  onClick,
  ...props
}) => {
  const hoverEffect = hover === 'lift' ? hoverLift : hover === 'scale' ? hoverScale : {};

  return (
    <motion.div
      {...getAnimation(fadeInUp)}
      transition={{ ...fadeInUp.transition, delay }}
      whileHover={hoverEffect}
      whileTap={onClick ? tapScale : {}}
      onClick={onClick}
      className={`cursor-${onClick ? 'pointer' : 'default'} ${className}`}
      style={{ willChange: 'transform, opacity' }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// ==========================================
// ANIMATED LIST
// ==========================================

export const AnimatedList = ({ children, className = '', ...props }) => (
  <motion.div
    variants={staggerContainer}
    initial="initial"
    animate="animate"
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

export const AnimatedListItem = ({ children, className = '', index = 0, ...props }) => (
  <motion.div
    variants={staggerItem}
    className={className}
    style={{ willChange: 'transform, opacity' }}
    {...props}
  >
    {children}
  </motion.div>
);

// ==========================================
// ANIMATED BUTTON
// ==========================================

export const AnimatedButton = ({
  children,
  className = '',
  variant = 'default',
  disabled = false,
  onClick,
  ...props
}) => {
  const variants = {
    default: {
      whileHover: { scale: 1.02, y: -2 },
      whileTap: { scale: 0.98 }
    },
    bounce: {
      whileHover: { scale: 1.05 },
      whileTap: { scale: 0.9 }
    },
    glow: {
      whileHover: {
        scale: 1.02,
        boxShadow: '0 0 25px rgba(139, 92, 246, 0.5)'
      },
      whileTap: { scale: 0.98 }
    }
  };

  return (
    <motion.button
      {...variants[variant]}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{ willChange: 'transform' }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// ==========================================
// XP POPUP ANIMATION
// ==========================================

export const XPPopup = ({ amount, show, onComplete, position = 'center' }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onComplete, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  const positionClasses = {
    center: 'fixed inset-0 flex items-center justify-center',
    top: 'fixed top-20 left-1/2 -translate-x-1/2',
    bottom: 'fixed bottom-20 left-1/2 -translate-x-1/2'
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={`${positionClasses[position]} z-50 pointer-events-none`}
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0.5, 1.2, 1, 0.8],
            y: [20, 0, -10, -30]
          }}
          transition={{ duration: 2, times: [0, 0.2, 0.8, 1] }}
        >
          <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-bold text-2xl px-6 py-3 rounded-full shadow-lg shadow-yellow-500/50">
            +{amount} XP
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ==========================================
// LEVEL UP ANIMATION
// ==========================================

export const LevelUpPopup = ({ level, show, onComplete }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop glow */}
          <motion.div
            className="absolute inset-0 bg-purple-500/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 2 }}
          />

          {/* Main content */}
          <motion.div
            className="text-center"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: [0, 1.3, 1], rotate: 0 }}
            transition={{ duration: 0.8, ease: [0.68, -0.55, 0.265, 1.55] }}
          >
            <motion.div
              className="text-6xl mb-2"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              🎉
            </motion.div>
            <motion.div
              className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              NIVEAU {level}
            </motion.div>
            <motion.div
              className="text-white/70 text-lg mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Félicitations !
            </motion.div>
          </motion.div>

          {/* Particles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{
                background: ['#a855f7', '#ec4899', '#f59e0b', '#10b981'][i % 4],
                left: '50%',
                top: '50%'
              }}
              initial={{ x: 0, y: 0, scale: 0 }}
              animate={{
                x: Math.cos(i * 30 * Math.PI / 180) * 150,
                y: Math.sin(i * 30 * Math.PI / 180) * 150,
                scale: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ==========================================
// BADGE EARNED ANIMATION
// ==========================================

export const BadgeEarnedPopup = ({ badge, show, onComplete }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onComplete, 3500);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && badge && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onComplete}
        >
          <motion.div
            className="bg-slate-900/95 border border-white/20 rounded-3xl p-8 text-center max-w-sm mx-4"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Badge icon with glow */}
            <motion.div
              className="relative inline-block mb-4"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                className="absolute inset-0 blur-2xl bg-purple-500/50 rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="relative text-7xl block">{badge.icon}</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-purple-400 text-sm font-medium mb-1">NOUVEAU BADGE</div>
              <div className="text-2xl font-bold text-white mb-2">{badge.name}</div>
              <div className="text-gray-400 text-sm">{badge.description}</div>
              {badge.xp && (
                <motion.div
                  className="mt-4 inline-block px-4 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring' }}
                >
                  +{badge.xp} XP
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ==========================================
// CONFETTI EXPLOSION
// ==========================================

export const Confetti = ({ show, duration = 3000 }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (show) {
      const newParticles = [...Array(50)].map((_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        color: ['#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'][Math.floor(Math.random() * 5)],
        delay: Math.random() * 0.5,
        rotation: Math.random() * 360
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => setParticles([]), duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-3 h-3 rounded-sm"
          style={{ backgroundColor: p.color, left: p.x, top: -20 }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{
            y: window.innerHeight + 20,
            rotate: p.rotation + 720,
            opacity: [1, 1, 0]
          }}
          transition={{
            duration: 3,
            delay: p.delay,
            ease: 'easeIn'
          }}
        />
      ))}
    </div>
  );
};

// ==========================================
// ANIMATED COUNTER
// ==========================================

export const AnimatedCounter = ({ value, duration = 1, className = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;
    const startValue = displayValue;
    const endValue = value;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic

      setDisplayValue(Math.floor(startValue + (endValue - startValue) * easeProgress));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span className={className}>{displayValue.toLocaleString()}</span>;
};

// ==========================================
// SKELETON LOADER
// ==========================================

export const Skeleton = ({ className = '', variant = 'default' }) => {
  const variants = {
    default: 'h-4 w-full',
    text: 'h-4 w-3/4',
    title: 'h-6 w-1/2',
    avatar: 'h-12 w-12 rounded-full',
    card: 'h-32 w-full rounded-xl'
  };

  return (
    <motion.div
      className={`bg-white/10 rounded ${variants[variant]} ${className}`}
      animate={{
        opacity: [0.5, 1, 0.5]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    />
  );
};

// ==========================================
// ANIMATED PROGRESS BAR
// ==========================================

export const AnimatedProgress = ({ value, max = 100, className = '', color = 'purple' }) => {
  const percent = Math.min((value / max) * 100, 100);

  const colors = {
    purple: 'from-purple-500 to-pink-500',
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    yellow: 'from-yellow-500 to-orange-500'
  };

  return (
    <div className={`h-2 bg-white/10 rounded-full overflow-hidden ${className}`}>
      <motion.div
        className={`h-full bg-gradient-to-r ${colors[color]} rounded-full`}
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      />
    </div>
  );
};

// ==========================================
// NOTIFICATION TOAST
// ==========================================

export const Toast = ({ message, type = 'info', show, onClose, duration = 4000 }) => {
  useEffect(() => {
    if (show && duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  const types = {
    info: { bg: 'bg-blue-500', icon: 'ℹ️' },
    success: { bg: 'bg-green-500', icon: '✅' },
    warning: { bg: 'bg-yellow-500', icon: '⚠️' },
    error: { bg: 'bg-red-500', icon: '❌' },
    xp: { bg: 'bg-gradient-to-r from-yellow-500 to-amber-500', icon: '⚡' }
  };

  const config = types[type];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed bottom-4 right-4 z-50"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <div className={`${config.bg} text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3`}>
            <span className="text-xl">{config.icon}</span>
            <span className="font-medium">{message}</span>
            <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
