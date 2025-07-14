// ==========================================
// 📁 react-app/src/shared/layouts/PremiumLayout.jsx
// LAYOUT PREMIUM COMMUN POUR TOUTES LES PAGES SYNERGIA
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

/**
 * 🎨 LAYOUT PREMIUM COMMUN - Style Team Page pour toutes les pages
 */
const PremiumLayout = ({ 
  children, 
  title, 
  subtitle, 
  icon: Icon,
  headerActions = null,
  className = "",
  showStats = false,
  stats = []
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* 🎯 Header Premium unifié */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            
            {/* Titre avec icône et gradient */}
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

          {/* Statistiques optionnelles */}
          {showStats && stats.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-2xl font-bold ${stat.color || 'text-white'}`}>
                        {stat.value}
                      </div>
                      <div className="text-gray-400 text-sm">{stat.label}</div>
                    </div>
                    {stat.icon && (
                      <stat.icon className={`w-6 h-6 ${stat.iconColor || 'text-gray-400'}`} />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* 📄 Contenu principal avec animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`space-y-6 ${className}`}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

/**
 * 🎴 CARD PREMIUM RÉUTILISABLE
 */
export const PremiumCard = ({ 
  children, 
  className = "", 
  hover = true, 
  gradient = false,
  ...props 
}) => {
  const baseClasses = gradient 
    ? "bg-gradient-to-br from-gray-800/60 to-gray-900/60" 
    : "bg-gray-800/50";
    
  const hoverClasses = hover 
    ? "hover:bg-gray-800/70 hover:scale-[1.02] hover:shadow-xl" 
    : "";

  return (
    <motion.div
      whileHover={hover ? { y: -2 } : {}}
      transition={{ duration: 0.2 }}
      className={`
        ${baseClasses}
        backdrop-blur-sm 
        rounded-xl 
        p-6 
        border 
        border-gray-700/50
        transition-all 
        duration-300
        ${hoverClasses}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * 🔘 BUTTON PREMIUM RÉUTILISABLE
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
    primary: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg",
    secondary: "bg-gray-700 hover:bg-gray-600 text-white border border-gray-600",
    outline: "border-2 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white",
    ghost: "text-gray-400 hover:text-white hover:bg-gray-800"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        rounded-lg 
        font-medium 
        transition-all 
        duration-200 
        flex 
        items-center 
        space-x-2
        disabled:opacity-50 
        disabled:cursor-not-allowed
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
 * 📊 STAT CARD PREMIUM
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
    red: "from-red-500 to-red-600 text-red-100",
    indigo: "from-indigo-500 to-indigo-600 text-indigo-100"
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
 * 🔍 SEARCH BAR PREMIUM
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
