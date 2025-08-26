// ==========================================
// 📁 react-app/src/shared/layouts/PremiumLayout.jsx
// LAYOUT PREMIUM - SYNTAXE JSX CORRIGÉE
// ==========================================

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 🎨 LAYOUT PREMIUM PRINCIPAL
 */
const PremiumLayout = ({ 
  children,
  title,
  subtitle,
  icon: Icon,
  className = "",
  showStats = false,
  stats = [],
  headerStats = [],
  headerActions = null
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      
      {/* 🌟 PARTICULES ANIMÉES EN ARRIÈRE-PLAN */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <AnimatePresence>
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-400/20 rounded-full"
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 10,
                opacity: 0 
              }}
              animate={{ 
                y: -10,
                opacity: [0, 0.6, 0],
                scale: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 5
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* 🎯 NAVIGATION STICKY */}
      <AnimatePresence>
        {true && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-700/50"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-3">
                  {Icon && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span className="text-white font-semibold">{title}</span>
                </div>
                <div className="flex items-center gap-3">
                  {headerActions}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📄 CONTENU PRINCIPAL */}
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 pt-20">
          
          {/* 🎯 HEADER PREMIUM */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            {/* Titre principal */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                {Icon && (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                )}
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="text-gray-400 text-lg mt-1">{subtitle}</p>
                  )}
                </div>
              </div>

              {/* Actions du header */}
              {headerActions && (
                <div className="flex items-center gap-3 flex-wrap">
                  {headerActions}
                </div>
              )}
            </div>

            {/* Statistiques du header */}
            {(showStats && stats.length > 0) || (headerStats && headerStats.length > 0) ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {(headerStats || stats).map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">{stat.label}</p>
                        <p className={`text-2xl font-bold ${stat.color || 'text-white'}`}>
                          {stat.value}
                        </p>
                      </div>
                      {stat.icon && (
                        <div className="w-10 h-10 rounded-lg bg-gray-700/50 flex items-center justify-center">
                          <stat.icon className="w-5 h-5 text-gray-300" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : null}
          </motion.div>

          {/* 🎨 CONTENU AVEC ANIMATION */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={className}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

/**
 * 🎴 COMPOSANT CARTE PREMIUM
 */
export const PremiumCard = ({ 
  children, 
  className = "", 
  padding = "p-6", 
  hover = true,
  ...props 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={hover ? { scale: 1.02, y: -5 } : {}}
    className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl ${padding} hover:shadow-xl transition-all duration-300 ${className}`}
    {...props}
  >
    {children}
  </motion.div>
);

/**
 * 📊 COMPOSANT CARTE STATISTIQUE
 */
export const PremiumStatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = "blue", 
  trend = null, 
  className = "",
  ...props 
}) => {
  const colorClasses = {
    blue: "text-blue-400 bg-blue-500/20 border-blue-500/30",
    green: "text-green-400 bg-green-500/20 border-green-500/30",
    red: "text-red-400 bg-red-500/20 border-red-500/30",
    yellow: "text-yellow-400 bg-yellow-500/20 border-yellow-500/30",
    purple: "text-purple-400 bg-purple-500/20 border-purple-500/30",
    gray: "text-gray-400 bg-gray-500/20 border-gray-500/30"
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05, y: -2 }}
      className={`${colorClasses[color] || colorClasses.blue} border rounded-xl p-6 backdrop-blur-sm ${className}`}
      {...props}
    >
      <div className="flex items-center justify-between mb-3">
        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-gray-700/50 flex items-center justify-center">
            <Icon className={`w-5 h-5 ${colorClasses[color]?.split(' ')[0] || 'text-blue-400'}`} />
          </div>
        )}
        {trend && (
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            trend > 0 ? 'text-green-400 bg-green-500/20' : 'text-red-400 bg-red-500/20'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      
      <div>
        <p className="text-sm text-gray-400 mb-1">{title}</p>
        <p className={`text-3xl font-bold ${colorClasses[color]?.split(' ')[0] || 'text-blue-400'}`}>
          {value}
        </p>
      </div>
    </motion.div>
  );
};

/**
 * 🔘 COMPOSANT BOUTON PREMIUM
 */
export const PremiumButton = ({ 
  children, 
  variant = "primary", 
  size = "md",
  icon: Icon,
  loading = false,
  className = "",
  ...props 
}) => {
  const variants = {
    primary: "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25",
    secondary: "bg-gray-700 hover:bg-gray-600 text-white border border-gray-600",
    success: "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25",
    danger: "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg shadow-red-500/25",
    warning: "bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white shadow-lg shadow-yellow-500/25",
    outline: "border-2 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white backdrop-blur-sm"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-3",
    lg: "px-8 py-4 text-lg"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        ${variants[variant]} 
        ${sizes[size]} 
        rounded-lg font-medium transition-all duration-200 
        flex items-center justify-center gap-2 
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          Chargement...
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4" />}
          {children}
        </>
      )}
    </motion.button>
  );
};

/**
 * 📈 COMPOSANT CARTE STATISTIQUE SIMPLE
 */
export const StatCard = PremiumStatCard; // Alias pour compatibilité

export default PremiumLayout;
