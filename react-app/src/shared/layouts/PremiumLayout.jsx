// ==========================================
// 📁 react-app/src/shared/layouts/PremiumLayout.jsx  
// LAYOUT PREMIUM AVEC MENU HAMBURGER INTÉGRÉ - COMPLET
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore.js';
import { isAdmin } from '../../core/services/adminService.js';

/**
 * 🎨 COMPOSANT CARD PREMIUM
 */
export const PremiumCard = ({ 
  children, 
  className = "",
  hover = true,
  onClick,
  as: Component = "div"
}) => {
  return (
    <Component
      onClick={onClick}
      className={`
        bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 
        rounded-xl p-6 shadow-lg
        ${hover ? 'hover:scale-[1.02] hover:shadow-xl hover:border-purple-500/30' : ''}
        transition-all duration-300 cursor-pointer
        ${className}
      `}
    >
      {children}
    </Component>
  );
};

/**
 * 📊 COMPOSANT STAT CARD
 */
export const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = "blue",
  trend,
  subtitle 
}) => {
  const colorMap = {
    blue: "from-blue-500 to-cyan-500",
    purple: "from-purple-500 to-pink-500", 
    green: "from-green-500 to-emerald-500",
    orange: "from-orange-500 to-red-500",
    indigo: "from-indigo-500 to-purple-500"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:scale-[1.02] transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-br ${colorMap[color]} shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center">
          <span className={`text-sm font-medium ${trend.positive ? 'text-green-400' : 'text-red-400'}`}>
            {trend.positive ? '↗' : '↘'} {trend.value}
          </span>
          <span className="text-xs text-gray-500 ml-2">{trend.label}</span>
        </div>
      )}
    </motion.div>
  );
};

/**
 * 🚀 COMPOSANT BOUTON PREMIUM
 */
export const PremiumButton = ({ 
  children, 
  variant = "primary", 
  size = "md",
  icon: Icon,
  onClick,
  disabled = false,
  className = "",
  ...props 
}) => {
  const variants = {
    primary: "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white",
    secondary: "bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 border border-gray-600",
    ghost: "hover:bg-gray-700/30 text-gray-300",
    danger: "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant]} ${sizes[size]}
        rounded-lg font-medium transition-all duration-200
        flex items-center gap-2 shadow-lg
        disabled:opacity-50 disabled:cursor-not-allowed
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
 * 🔍 COMPOSANT SEARCH BAR PREMIUM
 */
export const PremiumSearchBar = ({ 
  placeholder = "Rechercher...", 
  value, 
  onChange,
  className = "" 
}) => {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="
          w-full pl-10 pr-4 py-2 
          bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 
          rounded-lg text-white placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50
          transition-all duration-200
        "
      />
    </div>
  );
};

/**
 * 🎨 LAYOUT PREMIUM PRINCIPAL AVEC MENU HAMBURGER
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

  // 🧭 NAVIGATION STRUCTURE COMPLÈTE
  const menuItems = [
    { section: 'PRINCIPAL', items: [
      { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
      { path: '/tasks', label: 'Tâches', icon: '✅' },
      { path: '/projects', label: 'Projets', icon: '📁' },
      { path: '/analytics', label: 'Analytics', icon: '📊' }
    ]},
    { section: 'GAMIFICATION', items: [
      { path: '/gamification', label: 'Gamification', icon: '🎮' },
      { path: '/badges', label: 'Badges', icon: '🏆' },
      { path: '/leaderboard', label: 'Classement', icon: '🥇' },
      { path: '/rewards', label: 'Récompenses', icon: '🎁' },
      { path: '/time-track', label: 'Suivi Temps', icon: '⏱️' }
    ]},
    { section: 'UTILISATEURS', items: [
      { path: '/team', label: 'Équipe', icon: '👥' },
      { path: '/users', label: 'Utilisateurs', icon: '👤' },
      { path: '/profile', label: 'Profil', icon: '🧑‍💼' },
      { path: '/settings', label: 'Paramètres', icon: '⚙️' }
    ]},
    { section: 'OUTILS', items: [
      { path: '/onboarding', label: 'Intégration', icon: '🎯' }
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
        { path: '/admin/task-validation', label: 'Validation Tâches', icon: '🛡️' },
        { path: '/admin/complete-test', label: 'Test Complet', icon: '🧪' },
        { path: '/admin/profile-test', label: 'Test Profil', icon: '🧑‍🔬' }
      ]
    });
  }

  // Navigation handler avec fermeture menu
  const handleNavigation = (path) => {
    console.log('🧭 [PREMIUM-LAYOUT] Navigation vers:', path);
    setMenuOpen(false);
    navigate(path);
  };

  // Fermeture menu
  const closeMenu = () => {
    console.log('❌ [PREMIUM-LAYOUT] Fermeture menu');
    setMenuOpen(false);
  };

  // Gestion clavier et scroll body
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && menuOpen) {
        closeMenu();
      }
    };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      
      {/* 📱 MENU HAMBURGER OVERLAY */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              onClick={closeMenu}
            />
            
            {/* Menu Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 w-80 h-full bg-gradient-to-b from-gray-900 to-slate-900 z-50 shadow-2xl overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
            >
              
              {/* Header Menu */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">⚡</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      Synergia
                    </h2>
                    <p className="text-xs text-gray-400">v3.5 Premium</p>
                  </div>
                </div>
                <button
                  onClick={closeMenu}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Info */}
              {user && (
                <div className="p-6 border-b border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">
                        {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {user.displayName || 'Utilisateur'}
                      </p>
                      <p className="text-sm text-gray-400 truncate">{user.email}</p>
                      {userIsAdmin && (
                        <span className="inline-block px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full mt-1">
                          ADMIN
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Menu */}
              <nav className="p-4 space-y-6">
                {menuItems.map((section, sectionIndex) => (
                  <div key={sectionIndex}>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                      {section.section}
                    </h3>
                    <div className="space-y-1">
                      {section.items.map((item, itemIndex) => {
                        const isActive = location.pathname === item.path;
                        const isAdminRoute = item.path.startsWith('/admin');
                        
                        return (
                          <motion.button
                            key={itemIndex}
                            onClick={() => handleNavigation(item.path)}
                            whileHover={{ x: 4 }}
                            className={`
                              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
                              transition-all duration-200 group
                              ${isActive 
                                ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30' 
                                : 'text-gray-300 hover:bg-gray-700/30 hover:text-white'
                              }
                            `}
                          >
                            <span className="text-lg">{item.icon}</span>
                            <span className="flex-1 font-medium">{item.label}</span>
                            {isAdminRoute && (
                              <span className="px-1.5 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded">
                                ADMIN
                              </span>
                            )}
                            {isActive && (
                              <div className="w-2 h-2 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50" />
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              {/* Footer Menu - Déconnexion */}
              <div className="mt-auto p-4 border-t border-gray-700/50">
                <motion.button
                  onClick={handleLogout}
                  whileHover={{ x: 4 }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
                >
                  <span className="text-lg">🚪</span>
                  <span className="font-medium">Déconnexion</span>
                </motion.button>
              </div>
              
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 📱 HEADER MOBILE AVEC MENU HAMBURGER */}
      <header className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50">
        <div className="flex items-center justify-between p-4">
          
          {/* Menu Hamburger + Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMenuOpen(true)}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            {/* Logo Desktop */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">⚡</span>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Synergia
                </h1>
              </div>
            </div>
          </div>

          {/* Menu Hamburger Desktop */}
          <button
            onClick={() => setMenuOpen(true)}
            className="hidden lg:flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
            <span className="text-sm font-medium">Menu</span>
          </button>
        </div>
      </header>

      {/* 📄 CONTENU PRINCIPAL */}
      <main className="flex-1">
        
        {/* Header Page avec Titre */}
        <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/30">
          <div className="max-w-7xl mx-auto px-6 py-8">
            
            {/* Titre Principal */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                {Icon && (
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                )}
                <div>
                  <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                  >
                    {title}
                  </motion.h1>
                  {subtitle && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-gray-400 text-lg mt-1"
                    >
                      {subtitle}
                    </motion.p>
                  )}
                </div>
              </div>
              
              {/* Actions Header */}
              {headerActions && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-3"
                >
                  {headerActions}
                </motion.div>
              )}
            </div>

            {/* Stats Header */}
            {(showStats && stats.length > 0) || headerStats.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                {(headerStats.length > 0 ? headerStats : stats).map((stat, index) => (
                  <div 
                    key={index} 
                    className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-3">
                      {stat.icon && (
                        <div className={`p-2 rounded-lg ${stat.color || 'bg-blue-500/20'}`}>
                          <stat.icon className="w-5 h-5 text-blue-400" />
                        </div>
                      )}
                      <div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className="text-xs text-gray-400">{stat.label}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
            
          </div>
        </div>

        {/* Contenu de la page */}
        <div className={`max-w-7xl mx-auto px-6 py-8 ${className}`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {children}
          </motion.div>
        </div>
        
      </main>
    </div>
  );
};

export default PremiumLayout;
