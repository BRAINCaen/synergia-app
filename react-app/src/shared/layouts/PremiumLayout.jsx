// ==========================================
// 📁 react-app/src/shared/layouts/PremiumLayout.jsx
// LAYOUT PREMIUM - DESIGN COHÉRENT RESTAURÉ IDENTIQUE AU DASHBOARD
// ==========================================

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 🎨 LAYOUT PREMIUM AVEC DESIGN COHÉRENT DASHBOARD
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      
      {/* 🌟 PARTICULES SUBTILES COMME DASHBOARD */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/40 rounded-full"
            animate={{
              x: [0, Math.random() * 100, 0],
              y: [0, Math.random() * 100, 0],
              opacity: [0.2, 0.8, 0.2]
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* 📄 CONTENU PRINCIPAL AVEC PADDING COMME DASHBOARD */}
      <div className="relative min-h-screen">
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          
          {/* 🎯 HEADER COMME DASHBOARD */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                {Icon && (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center backdrop-blur-sm">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                )}
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="text-slate-400 mt-1">{subtitle}</p>
                  )}
                </div>
              </div>

              {headerActions && (
                <div className="flex items-center gap-3 flex-wrap">
                  {headerActions}
                </div>
              )}
            </div>

            {/* STATS HEADER COMME DASHBOARD */}
            {(showStats && stats.length > 0) || (headerStats && headerStats.length > 0) ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {(headerStats || stats).map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                        <p className={`text-2xl font-bold ${stat.color || 'text-white'} mt-1`}>
                          {stat.value}
                        </p>
                      </div>
                      {stat.icon && (
                        <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center">
                          <stat.icon className="w-5 h-5 text-slate-300" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : null}
          </motion.div>

          {/* 🎨 CONTENU PRINCIPAL */}
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
 * 🎴 CARTE PREMIUM COMME DASHBOARD
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
    whileHover={hover ? { scale: 1.01, y: -2 } : {}}
    className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl ${padding} hover:bg-white/10 transition-all duration-300 ${className}`}
    {...props}
  >
    {children}
  </motion.div>
);

/**
 * 📊 CARTE STATISTIQUE COMME DASHBOARD
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
    blue: "text-blue-400",
    green: "text-emerald-400", 
    red: "text-red-400",
    yellow: "text-yellow-400",
    purple: "text-purple-400",
    gray: "text-slate-400"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 ${className}`}
      {...props}
    >
      <div className="flex items-center justify-between mb-4">
        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center">
            <Icon className={`w-5 h-5 ${colorClasses[color] || 'text-blue-400'}`} />
          </div>
        )}
        {trend && (
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            trend > 0 ? 'text-emerald-400 bg-emerald-500/20' : 'text-red-400 bg-red-500/20'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      
      <div>
        <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
        <p className={`text-3xl font-bold ${colorClasses[color] || 'text-blue-400'}`}>
          {value}
        </p>
      </div>
    </motion.div>
  );
};

/**
 * 🔘 BOUTON PREMIUM COMME DASHBOARD
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
    primary: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/25",
    secondary: "bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-sm",
    success: "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/25",
    danger: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/25",
    warning: "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-lg shadow-yellow-500/25",
    outline: "border border-blue-500/50 text-blue-400 hover:bg-blue-500/20 backdrop-blur-sm"
  };

  const sizes = {
    sm: "px-3 py-2 text-sm",
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
        rounded-lg font-medium transition-all duration-300
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
 * 🔍 BARRE DE RECHERCHE COMME DASHBOARD
 */
export const PremiumSearchBar = ({ 
  placeholder = "Rechercher...", 
  value = "", 
  onChange = () => {}, 
  onSearch = () => {},
  icon = null,
  className = "",
  ...props 
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSearch(value);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative ${className}`}
    >
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
            {React.createElement(icon, { className: "w-4 h-4" })}
          </div>
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className={`
            w-full bg-white/5 backdrop-blur-sm border border-white/10 
            rounded-lg px-4 py-3 text-white placeholder-slate-400
            focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
            hover:bg-white/10 transition-all duration-300
            ${icon ? 'pl-10' : ''}
          `}
          {...props}
        />
      </div>
    </motion.div>
  );
};

/**
 * 📈 ALIAS POUR COMPATIBILITÉ
 */
export const StatCard = PremiumStatCard;

export default PremiumLayout;
