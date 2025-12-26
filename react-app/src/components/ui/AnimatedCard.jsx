// ==========================================
// react-app/src/components/ui/AnimatedCard.jsx
// CARTE ANIMÉE RÉUTILISABLE
// ==========================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Carte avec animations avancées
 */
const AnimatedCard = ({
  children,
  className = '',
  delay = 0,
  hover = true,
  glow = false,
  glowColor = 'purple',
  float = false,
  onClick,
  disabled = false,
  variant = 'default', // default, glass, gradient, outline
  gradient = 'from-purple-500 to-pink-500'
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Variantes de style
  const variantStyles = {
    default: 'bg-white/5 border border-white/10',
    glass: 'bg-white/10 backdrop-blur-xl border border-white/20',
    gradient: `bg-gradient-to-br ${gradient}`,
    outline: 'bg-transparent border-2 border-purple-500/50'
  };

  // Couleurs de glow
  const glowColors = {
    purple: 'rgba(139, 92, 246, 0.4)',
    pink: 'rgba(236, 72, 153, 0.4)',
    blue: 'rgba(59, 130, 246, 0.4)',
    green: 'rgba(16, 185, 129, 0.4)',
    yellow: 'rgba(245, 158, 11, 0.4)',
    red: 'rgba(239, 68, 68, 0.4)'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{
        opacity: 1,
        y: float && isHovered ? -5 : 0,
        scale: 1
      }}
      whileHover={hover && !disabled ? {
        y: -8,
        scale: 1.02,
        transition: {
          type: 'spring',
          stiffness: 400,
          damping: 25
        }
      } : undefined}
      whileTap={onClick && !disabled ? { scale: 0.98 } : undefined}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={!disabled ? onClick : undefined}
      className={`
        relative rounded-2xl overflow-hidden
        ${variantStyles[variant]}
        ${onClick && !disabled ? 'cursor-pointer' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      style={{
        boxShadow: glow && isHovered
          ? `0 0 30px ${glowColors[glowColor]}, 0 20px 40px rgba(0,0,0,0.3)`
          : '0 4px 20px rgba(0,0,0,0.2)'
      }}
    >
      {/* Shine effect on hover */}
      {hover && (
        <motion.div
          initial={{ x: '-100%', opacity: 0 }}
          animate={{
            x: isHovered ? '200%' : '-100%',
            opacity: isHovered ? 0.3 : 0
          }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent -skew-x-12 pointer-events-none"
        />
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

/**
 * Carte de statistique animée
 */
export const AnimatedStatCard = ({
  icon: Icon,
  label,
  value,
  suffix = '',
  trend,
  trendValue,
  color = 'purple',
  delay = 0,
  onClick
}) => {
  const colors = {
    purple: {
      bg: 'from-purple-500/20 to-pink-500/20',
      icon: 'text-purple-400',
      glow: 'purple'
    },
    blue: {
      bg: 'from-blue-500/20 to-cyan-500/20',
      icon: 'text-blue-400',
      glow: 'blue'
    },
    green: {
      bg: 'from-green-500/20 to-emerald-500/20',
      icon: 'text-green-400',
      glow: 'green'
    },
    yellow: {
      bg: 'from-yellow-500/20 to-orange-500/20',
      icon: 'text-yellow-400',
      glow: 'yellow'
    },
    pink: {
      bg: 'from-pink-500/20 to-rose-500/20',
      icon: 'text-pink-400',
      glow: 'pink'
    }
  };

  const c = colors[color] || colors.purple;

  return (
    <AnimatedCard
      delay={delay}
      glow
      glowColor={c.glow}
      onClick={onClick}
      className="p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20,
              delay: delay + 0.2
            }}
            className="text-3xl font-bold text-white mb-1"
          >
            <CountUp value={value} suffix={suffix} />
          </motion.div>
          <div className="text-gray-400 text-sm">{label}</div>

          {trend && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.4 }}
              className={`flex items-center gap-1 mt-2 text-sm ${
                trend === 'up' ? 'text-green-400' : 'text-red-400'
              }`}
            >
              <span>{trend === 'up' ? '↑' : '↓'}</span>
              <span>{trendValue}</span>
            </motion.div>
          )}
        </div>

        {Icon && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
              delay: delay + 0.3
            }}
            className={`p-3 rounded-xl bg-gradient-to-br ${c.bg}`}
          >
            <Icon className={`w-8 h-8 ${c.icon}`} />
          </motion.div>
        )}
      </div>
    </AnimatedCard>
  );
};

/**
 * Animation de compteur
 */
const CountUp = ({ value, suffix = '', duration = 1 }) => {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    const numValue = typeof value === 'number' ? value : parseInt(value) || 0;
    const startTime = Date.now();
    const endTime = startTime + duration * 1000;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / (duration * 1000), 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic

      setDisplayValue(Math.round(numValue * easeProgress));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [value, duration]);

  return (
    <>
      {displayValue.toLocaleString()}{suffix}
    </>
  );
};

/**
 * Badge animé
 */
export const AnimatedBadge = ({
  icon,
  name,
  description,
  rarity = 'common', // common, rare, epic, legendary
  earned = false,
  delay = 0,
  onClick
}) => {
  const rarityStyles = {
    common: {
      border: 'border-gray-500',
      bg: 'from-gray-600 to-gray-700',
      glow: 'rgba(156, 163, 175, 0.3)'
    },
    rare: {
      border: 'border-blue-500',
      bg: 'from-blue-500 to-cyan-500',
      glow: 'rgba(59, 130, 246, 0.4)'
    },
    epic: {
      border: 'border-purple-500',
      bg: 'from-purple-500 to-pink-500',
      glow: 'rgba(139, 92, 246, 0.5)'
    },
    legendary: {
      border: 'border-yellow-500',
      bg: 'from-yellow-400 to-orange-500',
      glow: 'rgba(245, 158, 11, 0.6)'
    }
  };

  const style = rarityStyles[rarity] || rarityStyles.common;

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180, opacity: 0 }}
      animate={{
        scale: earned ? 1 : 0.8,
        rotate: 0,
        opacity: earned ? 1 : 0.5
      }}
      whileHover={earned ? {
        scale: 1.1,
        rotate: [0, -5, 5, 0],
        transition: { duration: 0.3 }
      } : undefined}
      whileTap={earned ? { scale: 0.95 } : undefined}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay
      }}
      onClick={earned ? onClick : undefined}
      className={`
        relative p-4 rounded-xl border-2 ${style.border}
        ${earned ? 'cursor-pointer' : 'grayscale cursor-not-allowed'}
      `}
      style={{
        boxShadow: earned ? `0 0 20px ${style.glow}` : 'none'
      }}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${style.bg} opacity-20`} />

      {/* Icon */}
      <motion.div
        animate={earned ? {
          y: [0, -5, 0],
          rotateY: [0, 360]
        } : {}}
        transition={{
          y: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
          rotateY: { duration: 3, repeat: Infinity, ease: 'linear' }
        }}
        className="text-4xl text-center mb-2"
      >
        {icon || '🏆'}
      </motion.div>

      {/* Name */}
      <div className="text-white font-bold text-center text-sm">
        {name}
      </div>

      {/* Locked overlay */}
      {!earned && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
          <span className="text-2xl">🔒</span>
        </div>
      )}
    </motion.div>
  );
};

/**
 * Progress bar animée
 */
export const AnimatedProgress = ({
  value,
  max = 100,
  color = 'purple',
  showLabel = true,
  height = 8,
  delay = 0,
  animated = true
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  const colors = {
    purple: 'from-purple-500 to-pink-500',
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    yellow: 'from-yellow-500 to-orange-500',
    red: 'from-red-500 to-pink-500',
    rainbow: 'from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500'
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>{value.toLocaleString()}</span>
          <span>{max.toLocaleString()}</span>
        </div>
      )}

      <div
        className="w-full bg-gray-700/50 rounded-full overflow-hidden"
        style={{ height }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: 1,
            delay,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          className={`h-full bg-gradient-to-r ${colors[color]} rounded-full relative`}
        >
          {/* Shine animation */}
          {animated && (
            <motion.div
              animate={{
                x: ['-100%', '200%']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
                ease: 'linear'
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

/**
 * Bouton animé
 */
export const AnimatedButton = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary', // primary, secondary, outline, ghost
  size = 'md', // sm, md, lg
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  className = ''
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500',
    secondary: 'bg-gray-700 text-white hover:bg-gray-600',
    outline: 'bg-transparent border-2 border-purple-500 text-purple-400 hover:bg-purple-500/20',
    ghost: 'bg-transparent text-gray-300 hover:bg-white/10'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        relative rounded-xl font-medium transition-all duration-200
        flex items-center justify-center gap-2
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {loading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
        />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-5 h-5" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-5 h-5" />}
        </>
      )}
    </motion.button>
  );
};

export default AnimatedCard;
