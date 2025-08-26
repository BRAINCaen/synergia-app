// ==========================================
// 📁 react-app/src/shared/layouts/PremiumLayout.jsx
// LAYOUT PREMIUM AVEC MENU HAMBURGER FONCTIONNEL - VERSION CORRIGÉE
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X } from 'lucide-react';
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
      setMenuOpen(false);
      console.log('✅ [PREMIUM-LAYOUT] Déconnexion réussie');
    } catch (error) {
      console.error('❌ [PREMIUM-LAYOUT] Erreur déconnexion:', error);
    }
  };

  // 🧭 NAVIGATION STRUCTURE AVEC TOUTES LES PAGES
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
        { path: '/admin/settings', label: 'Config Système', icon: '🔧' },
        { path: '/admin/complete-test', label: 'Test Complet', icon: '🧪' }
      ]
    });
  }

  // Navigation handler
  const handleNavigation = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  // Fermer le menu avec Escape et gestion du body scroll
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
      }
    };

    // Gestion du scroll du body
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    } else {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [menuOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      {/* 🍔 BOUTON MENU HAMBURGER - VISIBLE SUR TOUTES LES PAGES */}
      <motion.button
        onClick={() => setMenuOpen(true)}
        className="fixed top-5 left-5 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl flex items-center justify-center text-white shadow-lg transition-all duration-200"
        style={{ zIndex: 9997 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Menu className="w-6 h-6" />
      </motion.button>

      {/* 📱 MENU OVERLAY - VERSION REACT CORRIGÉE */}
      <AnimatePresence mode="wait">
        {menuOpen && (
          <>
            {/* Fond overlay avec z-index fixe */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              style={{ zIndex: 9998 }}
              onClick={() => setMenuOpen(false)}
            />

            {/* Menu sidebar avec z-index supérieur */}
            <motion.div
              initial={{ x: -400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -400, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="fixed top-0 left-0 w-80 h-full bg-gradient-to-b from-gray-900 via-slate-800 to-gray-900 border-r border-gray-700/50 backdrop-blur-sm overflow-y-auto shadow-2xl"
              style={{ zIndex: 9999 }}
            >
              {/* Header du menu */}
              <div className="p-6 border-b border-gray-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    SYNERGIA v3.5
                  </h2>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="w-8 h-8 bg-gray-700/50 hover:bg-gray-600 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Info utilisateur */}
                <div className="flex items-center gap-3 bg-gray-800/50 rounded-lg p-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">
                      {user?.displayName || 'Utilisateur'}
                    </p>
                    <p className="text-sm text-gray-400 truncate">
                      {user?.email || ''}
                    </p>
                  </div>
                </div>

                {/* Badge admin */}
                {userIsAdmin && (
                  <div className="mt-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg px-3 py-2 text-center">
                    <span className="text-white font-bold text-sm">🛡️ ADMINISTRATEUR</span>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4">
                {menuItems.map((section, sectionIndex) => (
                  <div key={section.section} className="mb-6">
                    <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 px-2 ${
                      section.section === 'ADMINISTRATION' 
                        ? 'text-yellow-400' 
                        : 'text-gray-400'
                    }`}>
                      {section.section === 'ADMINISTRATION' && '🛡️ '}
                      {section.section}
                    </h3>
                    
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const isActive = location.pathname === item.path;
                        const isAdminItem = section.section === 'ADMINISTRATION';
                        
                        return (
                          <motion.button
                            key={item.path}
                            onClick={() => handleNavigation(item.path)}
                            className={`w-full text-left px-3 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 group ${
                              isActive
                                ? isAdminItem
                                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                                  : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                            }`}
                            whileHover={{ x: 2 }}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: sectionIndex * 0.1 + 0.1 }}
                          >
                            <span className="text-lg flex-shrink-0">{item.icon}</span>
                            <span className="font-medium">{item.label}</span>
                            {isActive && (
                              <span className="ml-auto text-sm opacity-75">•</span>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              {/* Footer du menu */}
              <div className="p-4 border-t border-gray-700/50">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 rounded-lg text-white font-medium transition-all duration-200 flex items-center justify-center gap-2"
                >
                  🚪 Déconnexion
                </button>
              </div>
            </motion.div>
          </>
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
