// ==========================================
// 📁 react-app/src/shared/layouts/PremiumLayout.jsx
// LAYOUT PREMIUM AVEC MENU HAMBURGER COMPLET
// ==========================================

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, Bell, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../stores/authStore.js';
import { isAdmin } from '../../core/services/adminService.js';

/**
 * 📊 COMPOSANT DE STATISTIQUE PREMIUM
 */
export const PremiumStat = ({ 
  title, 
  value, 
  change, 
  icon: Icon,
  trend = null,
  color = "blue"
}) => {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600", 
    green: "from-green-500 to-green-600",
    orange: "from-orange-500 to-orange-600",
    pink: "from-pink-500 to-pink-600"
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50"
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${colors[color]} flex items-center justify-center`}>
          {Icon && <Icon className="w-5 h-5 text-white" />}
        </div>
        {change && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            change.startsWith('+') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {change}
          </span>
        )}
      </div>
      
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-gray-400">{title}</p>
      
      {trend && (
        <div className="flex items-center mt-2">
          <span className={`text-xs font-medium ${
            trend.positive ? 'text-green-400' : 'text-red-400'}`}>
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
      { path: '/timetrack', label: 'Suivi Temps', icon: '⏱️' }
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

  // 🛡️ MENU ADMIN COMPLET (conditionnel) - AVEC TOUS LES LIENS RÉELS
  if (userIsAdmin) {
    menuItems.push({
      section: 'ADMINISTRATION', 
      items: [
        { path: '/admin', label: 'Dashboard Admin', icon: '🏠' },
        { path: '/admin/task-validation', label: 'Validation Tâches', icon: '🛡️' },
        { path: '/admin/objective-validation', label: 'Validation Objectifs', icon: '🎯' },
        { path: '/admin/users', label: 'Gestion Utilisateurs', icon: '👥' },
        { path: '/admin/analytics', label: 'Analytics Admin', icon: '📈' },
        { path: '/admin/settings', label: 'Config Système', icon: '⚙️' },
        { path: '/admin/badges', label: 'Gestion Badges', icon: '🏆' },
        { path: '/admin/rewards', label: 'Gestion Récompenses', icon: '🎁' },
        { path: '/admin/role-permissions', label: 'Permissions & Rôles', icon: '🔐' },
        { path: '/admin/sync', label: 'Synchronisation', icon: '🔄' },
        { path: '/admin/dashboard-tuteur', label: 'Dashboard Tuteur', icon: '🎓' },
        { path: '/admin/dashboard-manager', label: 'Dashboard Manager', icon: '📊' },
        { path: '/admin/interview', label: 'Gestion Entretiens', icon: '💼' },
        { path: '/admin/demo-cleaner', label: 'Nettoyage Démo', icon: '🧹' },
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
              transition={{ type: 'spring', damping: 20 }}
              className="fixed left-0 top-0 h-full w-80 bg-gradient-to-b from-gray-800 to-gray-900 shadow-2xl z-50"
            >
              
              {/* Header Menu */}
              <div className="p-6 border-b border-gray-700/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">S</span>
                    </div>
                    <h2 className="text-xl font-bold text-white">SYNERGIA</h2>
                  </div>
                  <button onClick={closeMenu} className="text-gray-400 hover:text-white p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* User Info */}
                {user && (
                  <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {user.displayName?.[0] || user.email?.[0] || 'U'}
                        </span>
                      </div>
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
                )}
              </div>

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
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            
            {/* Left - Menu Button */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMenuOpen(true)}
                className="p-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              <div className="flex items-center gap-3">
                {Icon && (
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  <h1 className="text-lg font-bold text-white">{title}</h1>
                  {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
                </div>
              </div>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center gap-2">
              {headerActions}
              
              {/* Notifications */}
              <button className="p-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200 relative">
                <Bell className="w-5 h-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </button>
              
              {/* Profile */}
              <button className="p-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200">
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Header Stats Row */}
          {headerStats && headerStats.length > 0 && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {headerStats.map((stat, index) => (
                <div key={index} className="bg-gray-800/50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* 📊 STATISTIQUES EN HEADER (optionnel) */}
      {showStats && stats.length > 0 && (
        <div className="bg-gray-800/30 backdrop-blur-sm border-b border-gray-700/50">
          <div className="px-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <PremiumStat key={index} {...stat} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 📄 CONTENU PRINCIPAL */}
      <main className={`flex-1 ${className}`}>
        <div className="px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default PremiumLayout;
