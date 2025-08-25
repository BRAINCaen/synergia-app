// ==========================================
// 📁 react-app/src/components/layout/Layout.jsx
// LAYOUT STANDARD AVEC MENU HAMBURGER ET TOUTES LES PAGES ADMIN
// ==========================================

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { isAdmin } from '../../core/services/adminService.js';

/**
 * 🎯 LAYOUT PRINCIPAL AVEC MENU HAMBURGER - SANS HEADER
 */
const Layout = ({ children }) => {
  // 🔌 HOOKS
  const { user, signOut } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  
  // 📱 ÉTATS
  const [menuOpen, setMenuOpen] = useState(false);
  
  // 🛡️ PERMISSIONS
  const userIsAdmin = isAdmin(user);

  // 🚪 DÉCONNEXION
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
      console.log('✅ [LAYOUT] Déconnexion réussie');
    } catch (error) {
      console.error('❌ [LAYOUT] Erreur déconnexion:', error);
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
      { path: '/badges', label: 'Badges', icon: '🏆' },
      { path: '/leaderboard', label: 'Classement', icon: '🥇' },
      { path: '/rewards', label: 'Récompenses', icon: '🎁' }
    ]},
    { section: 'ÉQUIPE', items: [
      { path: '/team', label: 'Équipe', icon: '👥' }
    ]},
    { section: 'OUTILS', items: [
      { path: '/onboarding', label: 'Intégration', icon: '📚' },
      { path: '/profile', label: 'Mon Profil', icon: '👨‍💼' },
      { path: '/settings', label: 'Paramètres', icon: '⚙️' }
    ]}
  ];

  // 🛡️ TOUTES LES PAGES ADMIN - MENU COMPLET
  if (userIsAdmin) {
    menuItems.push({
      section: 'ADMINISTRATION',
      items: [
        // Pages Admin Principales
        { path: '/admin', label: 'Dashboard Admin', icon: '🏠' },
        { path: '/admin/task-validation', label: 'Validation Tâches', icon: '🛡️' },
        { path: '/admin/objective-validation', label: 'Validation Objectifs', icon: '🎯' },
        { path: '/admin/users', label: 'Gestion Utilisateurs', icon: '👑' },
        { path: '/admin/analytics', label: 'Analytics Admin', icon: '📈' },
        { path: '/admin/settings', label: 'Config Système', icon: '🔧' },
        
        // Gamification Admin
        { path: '/admin/badges', label: 'Gestion Badges', icon: '🏆' },
        { path: '/admin/rewards', label: 'Gestion Récompenses', icon: '🎁' },
        
        // Sécurité & Permissions
        { path: '/admin/role-permissions', label: 'Permissions & Rôles', icon: '🔐' },
        
        // Outils Admin Avancés
        { path: '/admin/sync', label: 'Synchronisation', icon: '🔄' },
        { path: '/admin/dashboard-tuteur', label: 'Dashboard Tuteur', icon: '👨‍🏫' },
        { path: '/admin/dashboard-manager', label: 'Dashboard Manager', icon: '👨‍💼' },
        { path: '/admin/interview', label: 'Gestion Entretiens', icon: '🎤' },
        { path: '/admin/demo-cleaner', label: 'Nettoyage Démo', icon: '🧹' },
        
        // Pages de Test Admin
        { path: '/admin/complete-test', label: 'Test Complet', icon: '🧪' },
        { path: '/admin/profile-test', label: 'Test Profil', icon: '👤' }
      ]
    });
  }

  // ✅ FERMETURE MENU SUR NAVIGATION
  const handleNavClick = () => {
    setMenuOpen(false);
  };

  // ✅ CRÉATION DU MENU AVEC DOM MANIPULATION
  useEffect(() => {
    if (menuOpen) {
      // Créer le menu directement dans le body
      const menuOverlay = document.createElement('div');
      menuOverlay.id = 'hamburger-menu-overlay';
      menuOverlay.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        background: rgba(0, 0, 0, 0.8) !important;
        z-index: 999999 !important;
        backdrop-filter: blur(10px) !important;
      `;

      // Conteneur du menu
      const menuContainer = document.createElement('div');
      menuContainer.style.cssText = `
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 350px !important;
        height: 100vh !important;
        background: linear-gradient(135deg, #1e293b 0%, #334155 100%) !important;
        transform: translateX(-100%) !important;
        transition: transform 0.3s ease !important;
        overflow-y: auto !important;
        scrollbar-width: thin !important;
        scrollbar-color: rgba(255,255,255,0.3) transparent !important;
      `;

      // Header du menu
      const header = document.createElement('div');
      header.style.cssText = `
        padding: 25px 20px !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
        background: linear-gradient(135deg, #0f172a, #1e293b) !important;
      `;
      header.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <h2 style="color: white; font-size: 20px; font-weight: bold; margin: 0;">SYNERGIA v3.5</h2>
          <button id="close-menu-btn" style="background: rgba(255,255,255,0.1); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
        </div>
        <p style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 0;">Navigation principale</p>
      `;

      // Informations utilisateur
      const userInfo = document.createElement('div');
      userInfo.style.cssText = `
        padding: 20px !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
        background: rgba(255,255,255,0.05) !important;
      `;
      userInfo.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">
          <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
            ${user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </div>
          <div>
            <div style="color: white; font-weight: 600; font-size: 14px;">${user?.displayName || 'Utilisateur'}</div>
            <div style="color: rgba(255,255,255,0.6); font-size: 12px;">${user?.email || ''}</div>
          </div>
        </div>
        ${userIsAdmin ? '<div style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; text-align: center; text-transform: uppercase;">🛡️ ADMINISTRATEUR</div>' : ''}
      `;

      // Navigation avec sections
      const navigation = document.createElement('nav');
      navigation.style.cssText = 'flex: 1 !important; padding-bottom: 20px !important;';

      let navHTML = '';
      menuItems.forEach(section => {
        const isAdminSection = section.section === 'ADMINISTRATION';
        navHTML += `
          <div style="padding: 20px 20px 0 20px;">
            <div style="
              color: ${isAdminSection ? '#fbbf24' : 'rgba(255,255,255,0.6)'};
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 1px;
              border-bottom: 1px solid ${isAdminSection ? 'rgba(251, 191, 36, 0.3)' : 'rgba(255,255,255,0.1)'};
              padding-bottom: 8px;
              margin-bottom: 10px;
            ">
              ${isAdminSection ? '🛡️ ' : ''}${section.section}
            </div>
            <div style="padding: 10px 0;">
        `;
        
        section.items.forEach(item => {
          const isActive = location.pathname === item.path;
          navHTML += `
            <a href="${item.path}" class="menu-item" style="
              display: flex !important;
              align-items: center !important;
              gap: 15px !important;
              padding: 12px 15px !important;
              color: ${isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.8)'} !important;
              text-decoration: none !important;
              transition: all 0.2s !important;
              background: ${isActive ? (isAdminSection ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #3b82f6, #2563eb)') : 'transparent'} !important;
              border-left: 3px solid ${isActive ? (isAdminSection ? '#ef4444' : '#60a5fa') : 'transparent'} !important;
              border-radius: 8px !important;
              margin-bottom: 4px !important;
              font-weight: ${isActive ? '600' : '500'} !important;
            " onmouseover="
              if (!this.style.background.includes('gradient')) {
                this.style.background = '${isAdminSection ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)'}';
                this.style.borderLeft = '3px solid ${isAdminSection ? '#ef4444' : '#60a5fa'}';
              }
            " onmouseout="
              if (!this.style.background.includes('gradient')) {
                this.style.background = 'transparent';
                this.style.borderLeft = '3px solid transparent';
              }
            ">
              <span style="font-size: 16px;">${item.icon}</span>
              <span style="flex: 1; font-size: 14px;">${item.label}</span>
              ${isAdminSection ? '<span style="color: #fbbf24; font-size: 10px;">ADMIN</span>' : ''}
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
        background: rgba(0,0,0,0.2) !important;
      `;
      footer.innerHTML = `
        <button id="logout-btn" style="
          width: 100% !important;
          padding: 12px !important;
          background: linear-gradient(135deg, #ef4444, #dc2626) !important;
          color: white !important;
          border: none !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          transition: all 0.2s !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 8px !important;
        ">
          🚪 Se déconnecter
        </button>
      `;

      // Assemblage
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
      const closeBtn = document.getElementById('close-menu-btn');
      const logoutBtn = document.getElementById('logout-btn');
      
      closeBtn?.addEventListener('click', handleNavClick);
      logoutBtn?.addEventListener('click', handleLogout);
      
      // Fermeture sur overlay
      menuOverlay.addEventListener('click', (e) => {
        if (e.target === menuOverlay) {
          setMenuOpen(false);
        }
      });

      // Gestion des liens
      const menuLinks = menuOverlay.querySelectorAll('.menu-item');
      menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          navigate(link.getAttribute('href'));
          setMenuOpen(false);
        });
      });

    } else {
      // Supprimer le menu
      const existingMenu = document.getElementById('hamburger-menu-overlay');
      if (existingMenu) {
        existingMenu.remove();
      }
    }

    // Cleanup
    return () => {
      const menuToRemove = document.getElementById('hamburger-menu-overlay');
      if (menuToRemove) {
        menuToRemove.remove();
      }
    };
  }, [menuOpen, location.pathname, user, userIsAdmin, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      
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
          boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1)';
          e.target.style.boxShadow = '0 12px 35px rgba(59, 130, 246, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.3)';
        }}
      >
        <Menu className="w-6 h-6 text-white" />
      </button>

      {/* CONTENU PRINCIPAL */}
      <main style={{ minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
