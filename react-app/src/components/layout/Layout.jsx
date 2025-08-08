// ==========================================
// 📁 react-app/src/components/layout/Layout.jsx
// MENU HAMBURGER BULLETPROOF - GARANTI FONCTIONNEL
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
      { path: '/timetrack', label: 'Pointeuse', icon: '⏰' },
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
        { path: '/admin/complete-test', label: 'Test Admin', icon: '🧪' },
        { path: '/admin/role-permissions', label: 'Permissions', icon: '🔐' },
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
              ${userIsAdmin ? '🛡️ ADMIN' : '👤 MEMBRE'}
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
          font-size: 18px !important;
          font-weight: bold !important;
        ">✕</button>
      `;

      // Profile
      const profile = document.createElement('div');
      profile.style.cssText = `
        padding: 20px !important;
        border-bottom: 1px solid rgba(255,255,255,0.1) !important;
        background: rgba(255,255,255,0.05) !important;
      `;
      profile.innerHTML = `
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
            font-size: 20px;
            font-weight: bold;
          ">${user?.email?.[0]?.toUpperCase() || 'U'}</div>
          <div>
            <div style="color: white; font-size: 16px; font-weight: 600;">
              ${user?.displayName || user?.email || 'Utilisateur'}
            </div>
            <div style="color: #94a3b8; font-size: 14px;">
              ${userIsAdmin ? 'Administrateur' : 'Membre de l\'équipe'}
            </div>
          </div>
        </div>
      `;

      // Navigation
      const nav = document.createElement('div');
      nav.style.cssText = `
        padding: 20px 0 !important;
        flex: 1 !important;
      `;

      let navHTML = '';
      menuItems.forEach(section => {
        const isAdminSection = section.section === 'ADMINISTRATION';
        navHTML += `
          <div style="margin-bottom: 25px;">
            <h3 style="
              color: ${isAdminSection ? '#f87171' : '#94a3b8'};
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              margin: 0 0 15px 20px;
              padding-bottom: 5px;
              border-bottom: 2px solid ${isAdminSection ? '#f87171' : '#334155'};
            ">${section.section}</h3>
            <div style="padding: 0 15px;">
        `;
        
        section.items.forEach(item => {
          const isActive = location.pathname === item.path;
          navHTML += `
            <a href="${item.path}" class="menu-item" style="
              display: flex !important;
              align-items: center !important;
              padding: 15px 10px !important;
              margin: 5px 0 !important;
              border-radius: 10px !important;
              text-decoration: none !important;
              font-size: 16px !important;
              font-weight: 500 !important;
              transition: all 0.3s ease !important;
              background: ${isActive 
                ? (isAdminSection ? '#dc2626' : '#3b82f6') 
                : 'rgba(255,255,255,0.05)'} !important;
              color: ${isActive ? 'white' : (isAdminSection ? '#fca5a5' : '#e2e8f0')} !important;
              border: 2px solid ${isActive 
                ? 'rgba(255,255,255,0.3)' 
                : 'transparent'} !important;
            " onmouseover="this.style.background='${isAdminSection ? '#dc2626' : '#3b82f6'}'; this.style.color='white';" 
               onmouseout="this.style.background='${isActive 
                 ? (isAdminSection ? '#dc2626' : '#3b82f6') 
                 : 'rgba(255,255,255,0.05)'}'; this.style.color='${isActive ? 'white' : (isAdminSection ? '#fca5a5' : '#e2e8f0')}';">
              <span style="font-size: 20px; margin-right: 15px;">${item.icon}</span>
              <span>${item.label}</span>
              ${isActive ? '<span style="margin-left: auto; font-size: 16px;">●</span>' : ''}
            </a>
          `;
        });
        
        navHTML += '</div></div>';
      });
      nav.innerHTML = navHTML;

      // Footer avec déconnexion
      const footer = document.createElement('div');
      footer.style.cssText = `
        padding: 20px !important;
        border-top: 2px solid rgba(255,255,255,0.1) !important;
        background: rgba(0,0,0,0.2) !important;
      `;
      footer.innerHTML = `
        <button id="logout-btn" style="
          width: 100% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 15px !important;
          background: linear-gradient(135deg, #dc2626, #b91c1c) !important;
          border: none !important;
          border-radius: 10px !important;
          color: white !important;
          font-size: 16px !important;
          font-weight: bold !important;
          cursor: pointer !important;
          transition: all 0.3s ease !important;
        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
          <span style="margin-right: 10px; font-size: 20px;">🚪</span>
          DÉCONNEXION
        </button>
      `;

      // Assemblage
      menuContainer.appendChild(header);
      menuContainer.appendChild(profile);
      menuContainer.appendChild(nav);
      menuContainer.appendChild(footer);
      menuOverlay.appendChild(menuContainer);

      // Ajout au DOM
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
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '15px 20px'
        }}>
          
          {/* Bouton Hamburger + Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button
              onClick={() => setMenuOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '50px',
                height: '50px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '20px',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'scale(1.1)';
                e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'scale(1)';
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
