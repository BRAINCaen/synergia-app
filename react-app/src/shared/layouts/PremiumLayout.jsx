// ==========================================
// 📁 react-app/src/shared/layouts/PremiumLayout.jsx
// LAYOUT PREMIUM SIMPLE ET FONCTIONNEL
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

/**
 * 🎨 LAYOUT PREMIUM SIMPLE
 */
const PremiumLayout = ({ 
  children, 
  title = "Page", 
  subtitle = "", 
  icon: Icon,
  headerActions = null,
  className = "",
  showStats = false,
  stats = []
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            
            {/* Titre avec icône */}
            <div className="flex items-center space-x-4">
              {Icon && (
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Icon className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-gray-400 mt-2 text-lg">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            
            {/* Actions header */}
            {headerActions && (
              <div className="flex space-x-3">
                {headerActions}
              </div>
            )}
          </div>

          {/* Statistiques */}
          {showStats && stats.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">{stat.label}</p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                    {stat.icon && (
                      <stat.icon className={`w-6 h-6 ${stat.color || 'text-blue-400'}`} />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Contenu */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={className}
        >
          {children}
        </motion.div>
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
  hover = true,
  ...props 
}) => {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02 } : {}}
      transition={{ duration: 0.2 }}
      className={`
        bg-gray-800/50 
        backdrop-blur-sm 
        border 
        border-gray-700/50 
        rounded-lg 
        p-6 
        shadow-lg
        ${hover ? 'hover:shadow-xl' : ''}
        transition-all 
        duration-300
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * 🎯 BOUTON PREMIUM
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
    primary: "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white",
    secondary: "bg-gray-700 hover:bg-gray-600 text-white border border-gray-600",
    outline: "border border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
  };
  
  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        ${variants[variant]} 
        ${sizes[size]}
        rounded-lg 
        font-medium 
        flex 
        items-center 
        space-x-2 
        transition-all 
        duration-200
        disabled:opacity-50
        ${className}
      `}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        Icon && <Icon className="w-4 h-4" />
      )}
      <span>{children}</span>
    </motion.button>
  );
};

/**
 * 📊 STAT CARD
 */
export const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = "blue",
  trend = null,
  className = ""
}) => {
  const colors = {
    blue: "from-blue-500 to-blue-600 text-blue-100",
    purple: "from-purple-500 to-purple-600 text-purple-100",
    green: "from-green-500 to-green-600 text-green-100",
    yellow: "from-yellow-500 to-yellow-600 text-yellow-100",
    red: "from-red-500 to-red-600 text-red-100"
  };

  return (
    <PremiumCard className={`bg-gradient-to-br ${colors[color]} text-white ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {trend && (
            <p className="text-white/70 text-xs mt-1">{trend}</p>
          )}
        </div>
        {Icon && (
          <Icon className="w-8 h-8 text-white/60" />
        )}
      </div>
    </PremiumCard>
  );
};

/**
 * 🔍 SEARCH BAR
 */
export const PremiumSearchBar = ({ 
  placeholder = "Rechercher...", 
  value, 
  onChange,
  icon: Icon,
  className = ""
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {Icon ? (
          <Icon className="w-5 h-5 text-gray-400" />
        ) : (
          <Search className="w-5 h-5 text-gray-400" />
        )}
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full 
          pl-10 
          pr-4 
          py-3 
          bg-gray-800/50 
          backdrop-blur-sm 
          border 
          border-gray-700 
          rounded-lg 
          text-white 
          placeholder-gray-400 
          focus:outline-none 
          focus:ring-2 
          focus:ring-blue-500 
          focus:border-transparent
          transition-all 
          duration-200
        "
      />
    </div>
  );
};

export default PremiumLayout;
