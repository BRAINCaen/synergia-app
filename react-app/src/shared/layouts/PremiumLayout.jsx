// ==========================================
// 📁 react-app/src/shared/layouts/PremiumLayout.jsx
// LAYOUT PREMIUM AVEC TOUS LES EXPORTS REQUIS - CORRECTION PREMIUMSEARCHBAR
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Menu } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore.js';
import { isAdmin } from '../../core/services/adminService.js';

/**
 * 🎨 LAYOUT PREMIUM PRINCIPAL AVEC NAVIGATION
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
  // 🔌 HOOKS POUR LE MENU HAMBURGER
  const { user, signOut } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  
  // 🛡️ PERMISSIONS
  const userIsAdmin = isAdmin(user);

  // 🚪 DÉCONNEXION
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
      console.log('✅ [PREMIUM-LAYOUT] Déconnexion réussie');
    } catch (error) {
      console.error('❌ [PREMIUM-LAYOUT] Erreur déconnexion:', error);
    }
  };

  // 🧭 NAVIGATION STRUCTURE AVEC TOUTES LES PAGES ADMIN
  const menuItems = [
    { section: 'PRINCIPAL', items: [
      { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
      { path: '/tasks', label: 'Tâches', icon: '✅' },
      { path: '/projects', label: 'Projets', icon: '📁' },
      { path: '/analytics', label: 'Analytics', icon: '📊' }
    ]},
    { section: 'GAMIFICATION', items: [
      { path: '/gamification', label: 'Gamification', icon: '🎮' },
      { path: '/rewards', label: 'Récompenses', icon: '🎁' },
      { path: '/time-track', label: 'Suivi Temps', icon: '⏱️' }
    ]},
    { section: 'UTILISATEURS', items: [
      { path: '/team', label: 'Équipe', icon: '👥' },
      { path: '/profile', label: 'Profil', icon: '👤' },
      { path: '/settings', label: 'Paramètres', icon: '⚙️' }
    ]}
  ];

  // 🛡️ MENU ADMIN (conditionnel)
  if (userIsAdmin) {
    menuItems.push({
      section: 'ADMINISTRATION', 
      items: [
        { path: '/admin', label: 'Admin Dashboard', icon: '👑' },
        { path: '/admin/users', label: 'Gestion Utilisateurs', icon: '👨‍💼' },
        { path: '/admin/analytics', label: 'Analytics Admin', icon: '📈' },
        { path: '/admin/settings', label: 'Config Système', icon: '🔧' }
      ]
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* 🍔 MENU HAMBURGER MOBILE */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-3 bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white hover:bg-gray-700/90 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* 📱 MENU MOBILE OVERLAY */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="bg-black/50 inset-0 absolute" onClick={() => setMenuOpen(false)} />
          <div className="bg-gray-900/95 backdrop-blur-sm w-80 h-full border-r border-gray-700/50 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Navigation</h2>
                <button 
                  onClick={() => setMenuOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              {menuItems.map((section, idx) => (
                <div key={idx} className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    {section.section}
                  </h3>
                  {section.items.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors mb-1 flex items-center gap-3 ${
                        location.pathname === item.path
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                          : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </div>
              ))}
              
              <div className="pt-4 border-t border-gray-700/50">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-lg text-red-400 hover:bg-red-600/10 transition-colors"
                >
                  🚪 Déconnexion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📄 CONTENU PRINCIPAL */}
      <div className="lg:ml-0 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
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
            {(showStats && stats.length > 0) || (headerStats && headerStats.length > 0) && (
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
            )}
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
 * 🔘 COMPOSANT BOUTON PREMIUM
 */
export const PremiumButton = ({ 
  children, 
  variant = "primary", 
  size = "md",
  icon: Icon,
  className = "",
  ...props 
}) => {
  const variants = {
    primary: "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white",
    secondary: "bg-gray-700 hover:bg-gray-600 text-white border border-gray-600",
    success: "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white",
    danger: "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white",
    warning: "bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white",
    outline: "border-2 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-3",
    lg: "px-8 py-4 text-lg"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        ${variants[variant]} 
        ${sizes[size]}
        font-medium rounded-lg 
        transition-all duration-200 
        flex items-center justify-center gap-2
        ${className}
      `}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </motion.button>
  );
};

/**
 * 🔍 COMPOSANT BARRE DE RECHERCHE PREMIUM
 */
export const PremiumSearchBar = ({
  placeholder = "Rechercher...",
  value = "",
  onChange = () => {},
  icon: Icon = Search,
  className = "",
  ...props
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full pl-10 pr-3 py-3 border border-gray-600 bg-gray-700/50 backdrop-blur-sm rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
        {...props}
      />
    </div>
  );
};

/**
 * 📊 COMPOSANT STAT CARD PREMIUM
 */
export const PremiumStatCard = ({ title, value, icon: Icon, color = "blue", trend, change }) => {
  const colorClasses = {
    yellow: 'from-yellow-400 to-orange-500',
    green: 'from-green-400 to-emerald-500',
    red: 'from-red-400 to-pink-500',
    blue: 'from-blue-400 to-cyan-500',
    purple: 'from-purple-400 to-violet-500'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {(trend !== undefined || change !== undefined) && (
            <p className={`text-xs mt-1 ${(trend > 0 || change > 0) ? 'text-green-400' : 'text-red-400'}`}>
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
 * 📊 ALIAS STATCARD POUR COMPATIBILITÉ
 */
export const StatCard = PremiumStatCard;

export default PremiumLayout;
