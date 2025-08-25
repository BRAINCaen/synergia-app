// ==========================================
// 📁 react-app/src/shared/layouts/PremiumLayout.jsx
// LAYOUT PREMIUM AVEC MENU HAMBURGER SIMPLIFIÉ
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
  stats = []
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

  // 🧭 NAVIGATION STRUCTURE SIMPLIFIÉE - SUPPRESSION USERS ET TIME-TRACK
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
      { path: '/rewards', label: 'Récompenses', icon: '🎁' }
    ]},
    { section: 'ÉQUIPE', items: [
      { path: '/team', label: 'Équipe', icon: '👥' }
      // ❌ SUPPRIMÉ : { path: '/users', label: 'Utilisateurs', icon: '👤' }
    ]},
    { section: 'OUTILS', items: [
      { path: '/onboarding', label: 'Intégration', icon: '📚' },
      // ❌ SUPPRIMÉ : { path: '/time-track', label: 'Pointeuse', icon: '⏰' },
      { path: '/profile', label: 'Mon Profil', icon: '👨‍💼' },
      { path: '/settings', label: 'Paramètres', icon: '⚙️' }
    ]}
  ];

  // ✅ ADMIN ITEMS (inchangés)
  if (userIsAdmin) {
    menuItems.push({
      section: 'ADMINISTRATION',
      items: [
        { path: '/admin/task-validation', label: 'Validation Tâches', icon: '🛡️' },
        { path: '/admin/test', label: 'Test Admin', icon: '🧪' },
        { path: '/admin/roles', label: 'Permissions', icon: '🔐' },
        { path: '/admin/users', label: 'Admin Utilisateurs', icon: '👑' },
        { path: '/admin/analytics', label: 'Admin Analytics', icon: '📈' },
        { path: '/admin/settings', label: 'Admin Config', icon: '🔧' }
      ]
    });
  }

  // 🍔 CRÉATION DU MENU HAMBURGER
  useEffect(() => {
    if (menuOpen) {
      // Créer le menu directement dans le body
      const menuOverlay = document.createElement('div');
      menuOverlay.id = 'premium-hamburger-menu-overlay';
      menuOverlay.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        background-color: rgba(0, 0, 0, 0.8) !important;
        z-index: 999999 !important;
        display: flex !important;
        animation: fadeIn 0.3s ease !important;
      `;

      const menuContainer = document.createElement('div');
      menuContainer.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 350px !important;
        height: 100vh !important;
        background: linear-gradient(135deg, #1e293b, #0f172a) !important;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5) !important;
        z-index: 999999 !important;
        overflow-y: auto !important;
        transform: translateX(-100%) !important;
        transition: transform 0.3s ease !important;
        font-family: Inter, system-ui, sans-serif !important;
      `;

      // Header du menu
      const header = document.createElement('div');
      header.style.cssText = `
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        padding: 20px !important;
        background: linear-gradient(135deg, #3b82f6, #8b5cf6) !important;
        border-bottom: 2px solid rgba(255, 255, 255, 0.1) !important;
      `;
      header.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px;">
          <div style="font-size: 24px;">⚡</div>
          <div>
            <div style="color: white; font-size: 20px; font-weight: bold;">
              SYNERGIA MENU
            </div>
            <div style="color: rgba(255,255,255,0.8); font-size: 12px;">
              ${userIsAdmin ? 'Accès Admin Activé' : 'Mode Utilisateur'}
            </div>
          </div>
        </div>
        <button id="close-premium-menu-btn" style="
          background: rgba(255, 255, 255, 0.2) !important;
          border: none !important;
          color: white !important;
          width: 40px !important;
          height: 40px !important;
          border-radius: 50% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          font-size: 18px !important;
          transition: all 0.2s !important;
        " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
          ✕
        </button>
      `;

      // Informations utilisateur
      const userInfo = document.createElement('div');
      userInfo.style.cssText = `
        padding: 20px !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
        background: rgba(0, 0, 0, 0.2) !important;
      `;
      userInfo.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px;">
          <div style="
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 18px;
          ">
            ${user?.email?.[0]?.toUpperCase() || '?'}
          </div>
          <div style="flex: 1;">
            <div style="color: white; font-weight: 600; font-size: 16px;">
              ${user?.displayName || user?.email || 'Utilisateur'}
            </div>
            <div style="color: rgba(255,255,255,0.7); font-size: 14px;">
              ${user?.email || 'Aucun email'}
            </div>
            ${userIsAdmin ? '<div style="color: #fbbf24; font-size: 12px; font-weight: bold; margin-top: 5px;">🛡️ ADMINISTRATEUR</div>' : ''}
          </div>
        </div>
      `;

      // Navigation
      const navigation = document.createElement('div');
      navigation.style.cssText = `
        flex: 1 !important;
        padding: 20px 0 !important;
        overflow-y: auto !important;
      `;

      let navHTML = '';
      menuItems.forEach((section) => {
        const isAdminSection = section.section === 'ADMINISTRATION';
        navHTML += `
          <div style="margin-bottom: 30px;">
            <div style="
              padding: 0 20px 10px 20px;
              color: ${isAdminSection ? '#fbbf24' : 'rgba(255,255,255,0.6)'};
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 1px;
              border-bottom: 1px solid ${isAdminSection ? 'rgba(251, 191, 36, 0.3)' : 'rgba(255,255,255,0.1)'};
            ">
              ${isAdminSection ? '🛡️ ' : ''}${section.section}
            </div>
            <div style="padding: 10px 0;">
        `;
        
        section.items.forEach(item => {
          const isActive = location.pathname === item.path;
          navHTML += `
            <a href="${item.path}" class="premium-menu-item" style="
              display: flex !important;
              align-items: center !important;
              gap: 15px !important;
              padding: 15px 20px !important;
              color: ${isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.8)'} !important;
              text-decoration: none !important;
              transition: all 0.2s !important;
              background: ${isActive ? (isAdminSection ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #3b82f6, #2563eb)') : 'transparent'} !important;
              border-left: 4px solid ${isActive ? (isAdminSection ? '#ef4444' : '#60a5fa') : 'transparent'} !important;
              font-weight: ${isActive ? '600' : '500'} !important;
            " onmouseover="
              if (!this.style.background.includes('gradient')) {
                this.style.background = '${isAdminSection ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)'}';
                this.style.borderLeft = '4px solid ${isAdminSection ? '#ef4444' : '#60a5fa'}';
              }
            " onmouseout="
              if (!this.style.background.includes('gradient')) {
                this.style.background = 'transparent';
                this.style.borderLeft = '4px solid transparent';
              }
            ">
              <span style="font-size: 18px;">${item.icon}</span>
              <span style="flex: 1;">${item.label}</span>
              ${isAdminSection ? '<span style="color: #fbbf24; font-size: 12px;">🛡️</span>' : ''}
            </a>
          `;
        });
        
        navHTML += `
            </div>
          </div>
        `;
      });

      navigation.innerHTML = navHTML;

      // Footer avec déconnexion
      const footer = document.createElement('div');
      footer.style.cssText = `
        padding: 20px !important;
        border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
        background: rgba(0, 0, 0, 0.2) !important;
      `;
      footer.innerHTML = `
        <button id="premium-logout-btn" style="
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          border: none;
          color: white;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 20px rgba(239, 68, 68, 0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
          <span style="font-size: 18px;">🚪</span>
          <span>Se déconnecter</span>
        </button>
        <div style="
          text-align: center;
          margin-top: 15px;
          color: rgba(255, 255, 255, 0.5);
          font-size: 12px;
        ">
          Synergia v3.5.3 - Premium ✨
        </div>
      `;

      // Assembler le menu
      menuContainer.appendChild(header);
      menuContainer.appendChild(userInfo);
      menuContainer.appendChild(navigation);
      menuContainer.appendChild(footer);
      menuOverlay.appendChild(menuContainer);
      document.body.appendChild(menuOverlay);

      // Animation d'entrée
      setTimeout(() => {
        menuContainer.style.transform = 'translateX(0)';
      }, 10);

      // Gestion des événements
      const closeBtn = document.getElementById('close-premium-menu-btn');
      const logoutBtn = document.getElementById('premium-logout-btn');
      
      closeBtn?.addEventListener('click', () => setMenuOpen(false));
      logoutBtn?.addEventListener('click', handleLogout);
      
      // Fermeture sur overlay
      menuOverlay.addEventListener('click', (e) => {
        if (e.target === menuOverlay) {
          setMenuOpen(false);
        }
      });

      // Gestion des liens
      const menuLinks = menuOverlay.querySelectorAll('.premium-menu-item');
      menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          navigate(link.getAttribute('href'));
          setMenuOpen(false);
        });
      });

    } else {
      // Supprimer le menu
      const existingMenu = document.getElementById('premium-hamburger-menu-overlay');
      if (existingMenu) {
        existingMenu.remove();
      }
    }

    // Cleanup
    return () => {
      const menuToRemove = document.getElementById('premium-hamburger-menu-overlay');
      if (menuToRemove) {
        menuToRemove.remove();
      }
    };
  }, [menuOpen, location.pathname, user, userIsAdmin, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      
      {/* BOUTON MENU HAMBURGER FLOTTANT */}
      <button
        onClick={() => setMenuOpen(true)}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 999998,
          width: '60px',
          height: '60px',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          border: 'none',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
          transition: 'all 0.3s ease',
          color: 'white'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px) scale(1.1)';
          e.target.style.boxShadow = '0 15px 35px rgba(59, 130, 246, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0) scale(1)';
          e.target.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.3)';
        }}
        title="Ouvrir le menu"
      >
        <Menu style={{ width: '24px', height: '24px' }} />
      </button>

      {/* CONTENU PREMIUM */}
      <div className="p-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
                {stats.map((stat, index) => (
                  <PremiumStatCard key={index} {...stat} />
                ))}
              </div>
            )}
          </motion.div>

          {/* Contenu principal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
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
 * 📊 COMPOSANT STAT CARD PREMIUM
 */
export const PremiumStatCard = ({ title, value, icon: Icon, color = "blue", trend }) => {
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
          {trend && (
            <p className={`text-xs mt-1 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
            </p>
          )}
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${colorClasses[color]} flex items-center justify-center shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

/**
 * 🎨 COMPOSANT CARTE PREMIUM
 */
export const PremiumCard = ({ children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:shadow-xl transition-all duration-300 ${className}`}
  >
    {children}
  </motion.div>
);

/**
 * 🔘 COMPOSANT BOUTON PREMIUM
 */
export const PremiumButton = ({ children, variant = "primary", size = "md", icon: Icon, className = "", ...props }) => {
  const variants = {
    primary: "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white",
    secondary: "bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white border border-gray-600",
    danger: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
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
        rounded-lg font-medium transition-all duration-300 
        flex items-center space-x-2 shadow-lg hover:shadow-xl
        ${className}
      `}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span>{children}</span>
    </motion.button>
  );
};

/**
 * 🔍 COMPOSANT BARRE DE RECHERCHE PREMIUM
 */
export const PremiumSearchBar = ({ placeholder = "Rechercher...", value, onChange, className = "" }) => (
  <div className={`relative ${className}`}>
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent backdrop-blur-sm"
    />
  </div>
);

export default PremiumLayout;
