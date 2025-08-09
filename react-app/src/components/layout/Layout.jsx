// ==========================================
// 📁 react-app/src/components/layout/Layout.jsx
// MENU HAMBURGER BULLETPROOF - RESTAURÉ EXACTEMENT
// ==========================================

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, CheckSquare, FolderOpen, BarChart3, Trophy, Users, Settings, 
  Menu, X, User, LogOut, Award, Clock, BookOpen, UserCheck, Shield,
  Crown, TestTube, Lock, Gift, PieChart, Gamepad2, Zap
} from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';

const isUserAdmin = (user) => {
  if (!user) return false;
  const adminEmails = ['alan.boehme61@gmail.com', 'tanguy.caron@gmail.com', 'admin@synergia.com'];
  return adminEmails.includes(user.email) || user.role === 'admin' || user.isAdmin === true;
};

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  
  // ✅ ÉTAT MENU SIMPLE
  const [menuOpen, setMenuOpen] = useState(false);

  const userIsAdmin = React.useMemo(() => {
    return isUserAdmin(user);
  }, [user?.email]);

  const handleLogout = async () => {
    try {
      setMenuOpen(false);
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
    }
  };

  // ✅ FERMETURE SUR ESCAPE
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // ✅ MENU ITEMS COMPLETS
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
      { path: '/team', label: 'Équipe', icon: '👥' },
      { path: '/users', label: 'Utilisateurs', icon: '👤' }
    ]},
    { section: 'OUTILS', items: [
      { path: '/onboarding', label: 'Intégration', icon: '📚' },
      { path: '/time-track', label: 'Pointeuse', icon: '⏰' },
      { path: '/profile', label: 'Mon Profil', icon: '👨‍💼' },
      { path: '/settings', label: 'Paramètres', icon: '⚙️' }
    ]}
  ];

  // ✅ ADMIN ITEMS
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
              ${userIsAdmin ? 'MODE ADMINISTRATEUR' : 'NAVIGATION PRINCIPALE'}
            </div>
          </div>
        </div>
        <button id="close-menu-btn" style="
          background: rgba(255,255,255,0.2) !important;
          border: none !important;
          color: white !important;
          padding: 10px !important;
          border-radius: 8px !important;
          cursor: pointer !important;
          font-size: 20px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.2s !important;
        " onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
           onmouseout="this.style.background='rgba(255,255,255,0.2)'">
          ✕
        </button>
      `;

      // Info utilisateur
      const userInfo = document.createElement('div');
      userInfo.style.cssText = `
        padding: 20px !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
        background: rgba(255, 255, 255, 0.05) !important;
      `;
      userInfo.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px;">
          <div style="
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #10b981, #059669);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 20px;
          ">
            ${user?.email?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <div style="color: white; font-weight: 600; font-size: 16px;">
              ${user?.displayName || user?.email?.split('@')[0] || 'Utilisateur'}
            </div>
            <div style="color: rgba(255,255,255,0.7); font-size: 14px;">
              ${user?.email || 'Pas d\'email'}
            </div>
            ${userIsAdmin ? `
              <div style="
                background: linear-gradient(135deg, #dc2626, #b91c1c);
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 10px;
                font-weight: bold;
                display: inline-block;
                margin-top: 5px;
              ">
                🛡️ ADMINISTRATEUR
              </div>
            ` : ''}
          </div>
        </div>
      `;

      // Menu de navigation
      const navigation = document.createElement('div');
      navigation.style.cssText = `
        flex: 1 !important;
        padding: 20px 0 !important;
        overflow-y: auto !important;
      `;

      let navHTML = '';
      menuItems.forEach(section => {
        const isAdminSection = section.section === 'ADMINISTRATION';
        navHTML += `
          <div style="margin-bottom: 30px;">
            <div style="
              padding: 0 20px 10px 20px;
              color: ${isAdminSection ? '#fca5a5' : 'rgba(255,255,255,0.6)'};
              font-size: 12px;
              font-weight: bold;
              letter-spacing: 1px;
              text-transform: uppercase;
              border-bottom: 1px solid ${isAdminSection ? 'rgba(252, 165, 165, 0.3)' : 'rgba(255,255,255,0.1)'};
            ">
              ${isAdminSection ? '🛡️ ' : ''}${section.section}
            </div>
            <div style="margin-top: 10px;">
        `;
        
        section.items.forEach(item => {
          const isActive = location.pathname === item.path;
          navHTML += `
            <a href="${item.path}" class="menu-item" style="
              display: flex !important;
              align-items: center !important;
              gap: 15px !important;
              padding: 12px 20px !important;
              color: ${isActive ? (isAdminSection ? '#fef2f2' : 'white') : 'rgba(255,255,255,0.8)'} !important;
              text-decoration: none !important;
              font-weight: ${isActive ? '600' : '500'} !important;
              background: ${isActive ? (isAdminSection ? 'linear-gradient(135deg, #dc2626, #b91c1c)' : 'linear-gradient(135deg, #3b82f6, #2563eb)') : 'transparent'} !important;
              border-left: 4px solid ${isActive ? (isAdminSection ? '#dc2626' : '#3b82f6') : 'transparent'} !important;
              transition: all 0.2s !important;
              margin: 2px 0 !important;
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
              ${isAdminSection ? '<span style="color: #fca5a5; font-size: 12px;">🛡️</span>' : ''}
            </a>
          `;
        });
        
        navHTML += `
            </div>
          </div>
        `;
      });
      navigation.innerHTML = navHTML;

      // Bouton de déconnexion
      const logoutSection = document.createElement('div');
      logoutSection.style.cssText = `
        padding: 20px !important;
        border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
        background: rgba(0, 0, 0, 0.2) !important;
      `;
      logoutSection.innerHTML = `
        <button id="logout-btn" style="
          width: 100% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 10px !important;
          padding: 15px !important;
          background: linear-gradient(135deg, #dc2626, #b91c1c) !important;
          color: white !important;
          border: none !important;
          border-radius: 10px !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          transition: all 0.2s !important;
          font-size: 16px !important;
        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 25px rgba(220, 38, 38, 0.3)'" 
           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
          <span style="font-size: 18px;">🚪</span>
          <span>DÉCONNEXION</span>
        </button>
      `;

      // Assembler le menu
      menuContainer.appendChild(header);
      menuContainer.appendChild(userInfo);
      menuContainer.appendChild(navigation);
      menuContainer.appendChild(logoutSection);
      menuOverlay.appendChild(menuContainer);

      // Ajouter au DOM
      document.body.appendChild(menuOverlay);

      // Animation d'entrée
      setTimeout(() => {
        menuContainer.style.transform = 'translateX(0)';
      }, 10);

      // Event listeners
      const closeBtn = document.getElementById('close-menu-btn');
      const logoutBtn = document.getElementById('logout-btn');
      
      closeBtn?.addEventListener('click', () => setMenuOpen(false));
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
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      
      {/* ✅ HEADER UNIVERSEL - PC ET MOBILE */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        padding: '0'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '15px 20px',
          maxWidth: '100%'
        }}>
          {/* Section gauche avec hamburger */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
            {/* BOUTON HAMBURGER ÉNORME */}
            <button
              onClick={() => setMenuOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '50px',
                height: '50px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '24px',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
              }}
              title="Ouvrir le menu"
            >
              <Menu style={{ width: '24px', height: '24px' }} />
            </button>
            
            <div>
              <h1 style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                ⚡ Synergia
              </h1>
              <div style={{
                fontSize: '12px',
                color: '#6b7280',
                fontWeight: '500'
              }}>
                v3.5 {userIsAdmin && '• ADMIN'}
              </div>
            </div>
          </div>

          {/* Indicateur utilisateur */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 15px',
            backgroundColor: '#f8fafc',
            borderRadius: '25px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              width: '30px',
              height: '30px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              {user?.email?.[0]?.toUpperCase() || '?'}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#374151',
              fontWeight: '500',
              maxWidth: '150px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {user?.displayName || user?.email || 'Utilisateur'}
            </div>
          </div>
        </div>
      </header>

      {/* ✅ CONTENU PRINCIPAL */}
      <main style={{ padding: '0' }}>
        {children}
      </main>

      {/* ✅ DEBUG VISIBLE */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '10px 15px',
        backgroundColor: menuOpen ? '#10b981' : '#ef4444',
        color: 'white',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: 'bold',
        zIndex: 1000000,
        border: '2px solid white',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
      }}>
        🍔 MENU: {menuOpen ? '✅ OUVERT' : '❌ FERMÉ'}
      </div>
    </div>
  );
};

export default Layout;
