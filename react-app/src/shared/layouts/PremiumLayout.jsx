// ==========================================
// 📁 react-app/src/shared/layouts/PremiumLayout.jsx
// LAYOUT PREMIUM COMPLET AVEC TOUS LES COMPOSANTS
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

/**
 * 🎨 LAYOUT PREMIUM PRINCIPAL
 */
const PremiumLayout = ({ 
  children, 
  title = "Page", 
  subtitle = "", 
  icon: Icon,
  headerActions = null,
  className = "",
  showStats = false,
  stats = [],
  headerStats = []
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      
      {/* Particules d'arrière-plan */}
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

      {/* Contenu principal */}
      <div className="relative min-h-screen">
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          
          {/* Header */}
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

            {/* Stats header */}
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

          {/* Contenu principal */}
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
 * 🎴 CARTE PREMIUM
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
 * 🔘 BOUTON PREMIUM
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
        font-medium rounded-lg 
        transition-all duration-300
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
 * 🔍 BARRE DE RECHERCHE PREMIUM
 */
export const PremiumSearchBar = ({
  placeholder = "Rechercher...",
  value = "",
  onChange = () => {},
  onSearch = () => {},
  icon: Icon = Search,
  className = "",
  ...props
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSearch(value);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        className="block w-full pl-10 pr-3 py-3 border border-gray-600 bg-gray-700/50 backdrop-blur-sm rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
        {...props}
      />
    </div>
  );
};

/**
 * 📊 CARTE STATISTIQUE PREMIUM
 */
export const PremiumStatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = "blue", 
  trend = null, 
  change,
  className = "",
  ...props 
}) => {
  const colorClasses = {
    yellow: 'from-yellow-400 to-orange-500',
    green: 'from-green-400 to-emerald-500',
    red: 'from-red-400 to-pink-500',
    blue: 'from-blue-400 to-cyan-500',
    purple: 'from-purple-400 to-violet-500'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 ${className}`}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {(trend !== undefined || change !== undefined) && (
            <p className={`text-xs mt-1 ${(trend > 0 || change > 0) ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend !== undefined ? (trend > 0 ? '+' : '') + trend + '%' : ''}
              {change !== undefined ? (change > 0 ? '+' : '') + change : ''}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
};

/**
 * 📊 ALIAS POUR COMPATIBILITÉ
 */
export const StatCard = PremiumStatCard;

export default PremiumLayout;
