// ==========================================
// react-app/src/components/effects/CelebrationEffects.jsx
// EFFETS DE CÉLÉBRATION - CONFETTIS, PARTICULES, EXPLOSIONS
// ==========================================

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ==========================================
// CONFETTI COMPONENT
// ==========================================
const Confetti = ({
  active = false,
  duration = 3000,
  particleCount = 100,
  colors = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
  spread = 360,
  origin = { x: 0.5, y: 0.5 }
}) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: origin.x * 100,
      y: origin.y * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 10 + 5,
      angle: (Math.random() * spread) - (spread / 2),
      velocity: Math.random() * 50 + 30,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 720,
      shape: Math.random() > 0.5 ? 'circle' : 'rect'
    }));

    setParticles(newParticles);

    const timer = setTimeout(() => {
      setParticles([]);
    }, duration);

    return () => clearTimeout(timer);
  }, [active, particleCount, colors, spread, origin, duration]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              opacity: 1,
              scale: 1,
              rotate: particle.rotation
            }}
            animate={{
              left: `${particle.x + Math.cos(particle.angle * Math.PI / 180) * particle.velocity}%`,
              top: `${particle.y + Math.sin(particle.angle * Math.PI / 180) * particle.velocity + 50}%`,
              opacity: 0,
              scale: 0,
              rotate: particle.rotation + particle.rotationSpeed
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: duration / 1000,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            style={{
              position: 'absolute',
              width: particle.size,
              height: particle.shape === 'circle' ? particle.size : particle.size * 0.4,
              backgroundColor: particle.color,
              borderRadius: particle.shape === 'circle' ? '50%' : '2px'
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// SPARKLES COMPONENT
// ==========================================
const Sparkles = ({
  active = false,
  duration = 2000,
  count = 30,
  color = '#FFD700'
}) => {
  const [sparkles, setSparkles] = useState([]);

  useEffect(() => {
    if (!active) {
      setSparkles([]);
      return;
    }

    const newSparkles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 20 + 10,
      delay: Math.random() * 0.5
    }));

    setSparkles(newSparkles);

    const timer = setTimeout(() => {
      setSparkles([]);
    }, duration);

    return () => clearTimeout(timer);
  }, [active, count, duration]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      <AnimatePresence>
        {sparkles.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              rotate: [0, 180, 360]
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.8,
              delay: sparkle.delay,
              ease: 'easeOut'
            }}
            style={{
              position: 'absolute',
              left: `${sparkle.x}%`,
              top: `${sparkle.y}%`
            }}
          >
            <svg
              width={sparkle.size}
              height={sparkle.size}
              viewBox="0 0 24 24"
              fill={color}
            >
              <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// FIREWORKS COMPONENT
// ==========================================
const Fireworks = ({
  active = false,
  duration = 2500,
  burstCount = 3
}) => {
  const [bursts, setBursts] = useState([]);

  useEffect(() => {
    if (!active) {
      setBursts([]);
      return;
    }

    const colors = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B'];

    const newBursts = Array.from({ length: burstCount }, (_, i) => ({
      id: i,
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 40,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: i * 0.3,
      particles: Array.from({ length: 20 }, (_, j) => ({
        id: j,
        angle: (j / 20) * 360,
        distance: 50 + Math.random() * 50
      }))
    }));

    setBursts(newBursts);

    const timer = setTimeout(() => {
      setBursts([]);
    }, duration);

    return () => clearTimeout(timer);
  }, [active, burstCount, duration]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      <AnimatePresence>
        {bursts.map((burst) => (
          <div
            key={burst.id}
            style={{
              position: 'absolute',
              left: `${burst.x}%`,
              top: `${burst.y}%`
            }}
          >
            {burst.particles.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                animate={{
                  scale: [0, 1, 0.5],
                  x: Math.cos(particle.angle * Math.PI / 180) * particle.distance,
                  y: Math.sin(particle.angle * Math.PI / 180) * particle.distance + 30,
                  opacity: [1, 1, 0]
                }}
                transition={{
                  duration: 1.2,
                  delay: burst.delay,
                  ease: 'easeOut'
                }}
                style={{
                  position: 'absolute',
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: burst.color,
                  boxShadow: `0 0 10px ${burst.color}`
                }}
              />
            ))}
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// XP GAIN POPUP
// ==========================================
const XPGainPopup = ({
  amount,
  visible,
  onComplete,
  position = { x: '50%', y: '50%' }
}) => {
  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          initial={{ y: 0, opacity: 1, scale: 0.5 }}
          animate={{ y: -80, opacity: 0, scale: 1.5 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            left: position.x,
            top: position.y,
            transform: 'translate(-50%, -50%)'
          }}
          className="z-[9999] pointer-events-none"
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-white font-bold text-xl shadow-lg">
            <span className="text-2xl">⚡</span>
            +{amount} XP
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ==========================================
// LEVEL UP CELEBRATION
// ==========================================
const LevelUpCelebration = ({
  visible,
  newLevel,
  onComplete
}) => {
  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
          />

          {/* Central animation */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1.2, 1],
              opacity: 1
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.6, times: [0, 0.6, 1] }}
            className="fixed inset-0 flex items-center justify-center z-[9999]"
          >
            <div className="text-center">
              {/* Glow ring */}
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-64 h-64 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-30 blur-3xl" />
              </motion.div>

              {/* Level number */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 15,
                  delay: 0.2
                }}
                className="relative"
              >
                <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-orange-500 drop-shadow-2xl">
                  {newLevel}
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute -inset-8 border-4 border-dashed border-yellow-400/30 rounded-full"
                />
              </motion.div>

              {/* Text */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-4"
              >
                <div className="text-3xl font-bold text-white mb-2">
                  NIVEAU SUPÉRIEUR !
                </div>
                <div className="text-gray-300">
                  Félicitations, vous avez atteint le niveau {newLevel}
                </div>
              </motion.div>

              {/* Stars decoration */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 1,
                    delay: 0.5 + i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                  style={{
                    position: 'absolute',
                    left: `${50 + Math.cos(i * 45 * Math.PI / 180) * 40}%`,
                    top: `${50 + Math.sin(i * 45 * Math.PI / 180) * 40}%`
                  }}
                  className="text-yellow-400 text-2xl"
                >
                  ⭐
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Confetti */}
          <Confetti active={true} particleCount={150} duration={3000} />
        </>
      )}
    </AnimatePresence>
  );
};

// ==========================================
// BADGE UNLOCK CELEBRATION
// ==========================================
const BadgeUnlockCelebration = ({
  visible,
  badge,
  onComplete
}) => {
  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && badge && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998]"
          />

          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15
            }}
            className="fixed inset-0 flex items-center justify-center z-[9999]"
          >
            <div className="text-center">
              {/* Badge icon */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotateY: [0, 360]
                }}
                transition={{
                  y: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                  rotateY: { duration: 3, repeat: Infinity, ease: 'linear' }
                }}
                className="relative inline-block"
              >
                <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-6xl shadow-2xl border-4 border-white/20">
                  {badge.icon || '🏆'}
                </div>

                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-xl opacity-50 -z-10" />
              </motion.div>

              {/* Badge name */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6"
              >
                <div className="text-2xl font-bold text-white mb-2">
                  Nouveau Badge !
                </div>
                <div className="text-xl text-purple-300 font-semibold">
                  {badge.name}
                </div>
                {badge.description && (
                  <div className="text-gray-400 mt-2 max-w-xs mx-auto">
                    {badge.description}
                  </div>
                )}
              </motion.div>

              {/* XP reward */}
              {badge.xpReward && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/50 rounded-full"
                >
                  <span className="text-yellow-400">⚡</span>
                  <span className="text-yellow-300 font-bold">+{badge.xpReward} XP</span>
                </motion.div>
              )}
            </div>
          </motion.div>

          <Sparkles active={true} count={50} duration={3000} />
        </>
      )}
    </AnimatePresence>
  );
};

// ==========================================
// FLOATING PARTICLES BACKGROUND
// ==========================================
const FloatingParticles = ({
  count = 20,
  colors = ['#8B5CF6', '#EC4899', '#3B82F6'],
  minSize = 2,
  maxSize = 6
}) => {
  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * (maxSize - minSize) + minSize,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5
    })),
    [count, colors, minSize, maxSize]
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            x: `${particle.x}vw`,
            y: `${particle.y}vh`,
            opacity: 0.3
          }}
          animate={{
            x: [`${particle.x}vw`, `${(particle.x + 20) % 100}vw`, `${particle.x}vw`],
            y: [`${particle.y}vh`, `${(particle.y - 30 + 100) % 100}vh`, `${particle.y}vh`],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'linear'
          }}
          style={{
            position: 'absolute',
            width: particle.size,
            height: particle.size,
            borderRadius: '50%',
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`
          }}
        />
      ))}
    </div>
  );
};

// ==========================================
// PULSE RING EFFECT
// ==========================================
const PulseRing = ({
  active = true,
  color = '#8B5CF6',
  size = 100,
  duration = 2
}) => {
  if (!active) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{
            scale: [0.8, 1.5],
            opacity: [0.5, 0]
          }}
          transition={{
            duration: duration,
            delay: i * (duration / 3),
            repeat: Infinity,
            ease: 'easeOut'
          }}
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: '50%',
            border: `2px solid ${color}`
          }}
        />
      ))}
    </div>
  );
};

// ==========================================
// EXPORTS
// ==========================================

export {
  Confetti,
  Sparkles,
  Fireworks,
  XPGainPopup,
  LevelUpCelebration,
  BadgeUnlockCelebration,
  FloatingParticles,
  PulseRing
};

export default {
  Confetti,
  Sparkles,
  Fireworks,
  XPGainPopup,
  LevelUpCelebration,
  BadgeUnlockCelebration,
  FloatingParticles,
  PulseRing
};
