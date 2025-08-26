// ==========================================
// 📁 react-app/src/shared/layouts/PremiumLayout.jsx
// LAYOUT PREMIUM AVEC MENU HAMBURGER COMPLET COMME DASHBOARD
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, User, Settings, Home, Target, BarChart3, Trophy, Award, Users, Clock, Wrench, Shield } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore.js';
import { isAdmin } from '../../core/services/adminService.js';

/**
 * 🎨 LAYOUT PREMIUM AVEC NAVIGATION COMPLÈTE COMME DASHBOARD
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
  // 🔌 HOOKS
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
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  // 🧭 STRUCTURE DE NAVIGATION COMPLÈTE
  const menuSections = [
    {
      title: 'PRINCIPAL',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: Home },
        { path: '/tasks', label: 'Tâches', icon: Target },
        { path: '/projects', label: 'Projets', icon: BarChart3 },
        { path: '/analytics', label: 'Analytics', icon: BarChart3 }
      ]
    },
    {
      title: 'GAMIFICATION', 
      items: [
        { path: '/gamification', label: 'Gamification', icon: Trophy },
        { path: '/badges', label: 'Badges', icon: Award },
        { path: '/leaderboard', label: 'Classement', icon: Trophy },
        { path: '/rewards', label: 'Récompenses', icon: Award }
      ]
    },
    {
      title: 'ÉQUIPE',
      items: [
        { path: '/team', label: 'Équipe', icon: Users },
        { path: '/users', label: 'Utilisateurs', icon: User }
      ]
    },
    {
      title: 'OUTILS',
      items: [
        { path: '/onboarding', label: 'Intégration', icon: Target },
        { path: '/timetrack', label: 'Time Track', icon: Clock },
        { path: '/profile', label: 'Mon Profil', icon: User },
        { path: '/settings', label: 'Paramètres', icon: Settings }
      ]
    }
  ];

  // Ajouter section admin si autorisé
  if (userIsAdmin) {
    menuSections.push({
      title: 'ADMINISTRATION',
      items: [
        { path: '/admin/task-validation', label: 'Validation Tâches', icon: Shield },
        { path: '/admin/objective-validation', label: 'Validation Objectifs', icon: Shield },
        { path: '/admin/complete-test', label: 'Test Complet', icon: Wrench },
        { path: '/admin/profile-test', label: 'Test Profil', icon: Wrench },
        { path: '/admin/role-permissions', label: 'Permissions', icon: Shield },
        { path: '/admin/rewards', label: 'Gestion Récompenses', icon: Award },
        { path: '/admin/badges', label: 'Gestion Badges', icon: Trophy },
        { path: '/admin/users', label: 'Gestion Utilisateurs', icon: Users },
        { path: '/admin/analytics', label: 'Analytics Admin', icon: BarChart3 },
        { path: '/admin/settings', label: 'Paramètres Admin', icon: Settings },
        { path: '/admin/sync', label: 'Synchronisation', icon: Wrench }
      ]
    });
  }

  // Navigation vers une page
  const navigateTo = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  // Fermer menu au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen && !event.target.closest('#hamburger-menu') && !event.target.closest('#hamburger-button')) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      
      {/* 🌟 PARTICULES D'ARRIÈRE-PLAN */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        {Array.from({ length: 12 }).map((_, i) => (
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

      {/* 🍔 BOUTON MENU HAMBURGER */}
      <motion.button
        id="hamburger-button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => setMenuOpen(!menuOpen)}
        className="fixed top-6 left-6 z-50 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg p-3 transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {menuOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* 📱 MENU OVERLAY */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Overlay sombre */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setMenuOpen(false)}
            />
            
            {/* Menu sidebar */}
            <motion.div
              id="hamburger-menu"
              initial={{ x: -400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -400, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 h-full w-80 bg-gradient-to-b from-slate-800 to-slate-900 border-r border-white/10 z-50 overflow-y-auto"
            >
              {/* Header du menu */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-xl">S</span>
                  </div>
                  <div>
                    <h1 className="text-white font-bold text-xl">Synergia</h1>
                    <p className="text-slate-400 text-sm">v3.5.3 - Stable</p>
                  </div>
                </div>
                
                {/* Info utilisateur */}
                {user && (
                  <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {user.displayName || 'Utilisateur'}
                        </p>
                        <p className="text-slate-400 text-xs truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="p-4">
                {menuSections.map((section, sectionIndex) => (
                  <div key={section.title} className="mb-6">
                    <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3 px-2">
                      {section.title}
                    </h3>
                    <nav className="space-y-1">
                      {section.items.map((item) => {
                        const isActive = location.pathname === item.path;
                        const IconComponent = item.icon;
                        
                        return (
                          <motion.button
                            key={item.path}
                            onClick={() => navigateTo(item.path)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left ${
                              isActive 
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                                : 'text-slate-300 hover:bg-white/10 hover:text-white'
                            }`}
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <IconComponent className="w-5 h-5 flex-shrink-0" />
                            <span className="font-medium">{item.label}</span>
                            {section.title === 'ADMINISTRATION' && (
                              <span className="ml-auto px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full font-medium">
                                ADMIN
                              </span>
                            )}
                          </motion.button>
                        );
                      })}
                    </nav>
                  </div>
                ))}
              </div>

              {/* Footer du menu avec déconnexion */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-slate-900/50">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Déconnexion</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 📄 CONTENU PRINCIPAL */}
      <div className="relative min-h-screen">
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          
          {/* 🎯 HEADER */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 ml-20" // Marge pour éviter le bouton hamburger
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

            {/* STATS HEADER */}
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
            className={`ml-20 ${className}`} // Marge pour éviter le bouton hamburger
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

/**
 * 🎴 COMPOSANTS ENFANTS IDENTIQUES AU DASHBOARD
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
    <PremiumCard hover className={className} {...props}>
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
    </PremiumCard>
  );
};

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

export const StatCard = PremiumStatCard;

export default PremiumLayout;
