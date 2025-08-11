// ==========================================
// 📁 react-app/src/components/layout/Layout.jsx
// RESTORATION EXACTE + CORRECTION HAMBURGER SEULEMENT
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

  // ✅ MENU ITEMS COMPLETS - RESTAURÉ EXACTEMENT
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

  // ✅ CRÉATION DU MENU AVEC DOM MANIPULATION - RESTAURÉ EXACTEMENT
  useEffect(() => {
    if (menuOpen) {
      // Créer le menu directement dans le body
      const menuOverlay = document.createElement('div');
      menuOverlay.id = 'hamburger-menu-overlay';
      menuOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 9999;
        display: flex;
        align-items: flex-start;
        justify-content: flex-start;
      `;

      const menuContainer = document.createElement('div');
      menuContainer.style.cssText = `
        background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
        width: 320px;
        height: 100vh;
        overflow-y: auto;
        transform: translateX(-100%);
        transition: transform 0.3s ease;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      `;

      // Header du menu
      const menuHeader = document.createElement('div');
      menuHeader.style.cssText = `
        padding: 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(0, 0, 0, 0.2);
      `;
      menuHeader.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 24px;">⚡</span>
            <span style="color: white; font-size: 20px; font-weight: bold;">Synergia v3.5</span>
            ${userIsAdmin ? '<span style="background: #ef4444; color: white; padding: 2px 8px; border-radius: 12px; font-size: 10px;">ADMIN</span>' : ''}
          </div>
          <button id="close-menu-btn" style="background: rgba(255,255,255,0.1); border: none; color: white; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
        </div>
      `;

      // Navigation
      const navContainer = document.createElement('div');
      navContainer.style.cssText = `padding: 20px 0;`;

      menuItems.forEach(section => {
        const sectionEl = document.createElement('div');
        sectionEl.style.cssText = `margin-bottom: 24px;`;

        const sectionTitle = document.createElement('h3');
        sectionTitle.style.cssText = `
          color: ${section.section === 'ADMINISTRATION' ? '#fca5a5' : '#9ca3af'};
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin: 0 0 12px 20px;
        `;
        sectionTitle.textContent = section.section;
        sectionEl.appendChild(sectionTitle);

        section.items.forEach(item => {
          const itemEl = document.createElement('a');
          itemEl.href = item.path;
          itemEl.className = 'menu-item';
          itemEl.style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 20px;
            color: ${location.pathname === item.path ? '#ffffff' : '#d1d5db'};
            background: ${location.pathname === item.path ? 'rgba(59, 130, 246, 0.8)' : 'transparent'};
            text-decoration: none;
            transition: all 0.2s ease;
            border-left: ${location.pathname === item.path ? '4px solid #3b82f6' : '4px solid transparent'};
          `;

          itemEl.onmouseover = () => {
            if (location.pathname !== item.path) {
              itemEl.style.background = 'rgba(255, 255, 255, 0.1)';
              itemEl.style.color = '#ffffff';
            }
          };

          itemEl.onmouseout = () => {
            if (location.pathname !== item.path) {
              itemEl.style.background = 'transparent';
              itemEl.style.color = '#d1d5db';
            }
          };

          itemEl.innerHTML = `
            <span style="font-size: 18px;">${item.icon}</span>
            <span style="font-weight: 500;">${item.label}</span>
            ${section.section === 'ADMINISTRATION' ? '<span style="color: #f87171; font-size: 12px; margin-left: auto;">🛡️</span>' : ''}
          `;

          sectionEl.appendChild(itemEl);
        });

        navContainer.appendChild(sectionEl);
      });

      // Section déconnexion
      const logoutSection = document.createElement('div');
      logoutSection.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(0, 0, 0, 0.2);
      `;

      logoutSection.innerHTML = `
        <button id="logout-btn" style="
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(239, 68, 68, 0.8);
          border: none;
          border-radius: 8px;
          color: white;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        ">
          <span style="font-size: 18px;">🚪</span>
          <span>Déconnexion</span>
        </button>
      `;

      // Assemblage
      menuContainer.appendChild(menuHeader);
      menuContainer.appendChild(navContainer);
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
      
      {/* ✅ HEADER RESTAURÉ - BOUTON HAMBURGER FIXÉ */}
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
            {/* 🔧 SEULE MODIFICATION: BOUTON HAMBURGER TOUJOURS VISIBLE */}
            <button
              onClick={() => setMenuOpen(true)}
              style={{
                display: 'flex !important',
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
                overflow: 'hidden',
                visibility: 'visible',
                opacity: '1'
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

      {/* ✅ CONTENU PRINCIPAL RESTAURÉ */}
      <main style={{ padding: '0' }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
