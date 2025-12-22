// ==========================================
// 📁 react-app/src/components/layout/Layout.jsx
// LAYOUT AVEC MENU COMPLET + GODMOD + NOTIFICATIONS v2.0
// MODULE 6 - SYSTÈME DE NOTIFICATIONS AMÉLIORÉ
// ==========================================

import React, { useState, useEffect, memo, useRef, useCallback } from 'react';
import { Menu, X, Bell, Check, Trash2, ExternalLink, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../shared/stores/authStore.js';
import useNotificationToast from '../../shared/hooks/useNotificationToast.js';
import { NotificationCenter, NotificationToast } from '../notifications';
import { useTheme } from '../../shared/hooks/useTheme.js';
import { hasAdminMenuAccess } from '../../core/services/modulePermissionsService.js';


// 🔒 COMPOSANT MENU PREMIUM AVEC DESIGN HARMONISÉ + GODMOD
const HamburgerMenuStable = memo(({ isOpen, onClose, navigateFunction, userEmail, userIsAdmin }) => {
  console.log('🎯 [MENU] Rendu composant menu - isOpen:', isOpen);

  if (!isOpen) return null;

  // 👑 Vérifier si l'utilisateur est l'admin principal
  const isGodMode = userEmail === 'alan.boehme61@gmail.com';

  // 🔐 Vérifier si l'utilisateur a des droits admin
  const hasAdminAccess = userIsAdmin || isGodMode;

  const menuItems = [
    { section: 'PRINCIPAL', items: [
      { path: '/pulse', label: 'Poste de Garde', icon: '🛡️' },
      { path: '/dashboard', label: 'Mon Aventure', icon: '🚀' },
      { path: '/infos', label: 'Le Crieur', icon: '📢' },
      { path: '/tasks', label: 'Quêtes', icon: '⚔️' },
      { path: '/projects', label: 'Conquêtes', icon: '👑' }
    ]},
    { section: 'GAMIFICATION', items: [
      { path: '/badges', label: 'Badges', icon: '🏆' },
      { path: '/skills', label: 'Competences', icon: '🌳' },
      { path: '/rewards', label: 'Recompenses', icon: '🎁' },
      { path: '/customization', label: 'Personnalisation', icon: '🎨' }
    ]},
    { section: 'ÉQUIPE', items: [
      { path: '/team', label: 'Équipe', icon: '👥' },
      { path: '/boosts', label: 'Boosts', icon: '⚡' },
      { path: '/mentoring', label: 'Académie', icon: '🎓' },
      { path: '/settings', label: 'Paramètres', icon: '⚙️' }
    ]},
    { section: 'OUTILS', items: [
      { path: '/onboarding', label: 'Intégration', icon: '🎯' },
      { path: '/hr', label: 'RH', icon: '🏢' },
      { path: '/planning', label: 'Planning', icon: '📅' }
    ]},
    { section: 'AIDE', items: [
      { path: '/tutorial', label: 'Guide & Tutoriel', icon: '📚' }
    ]},
    { section: 'ADMIN', items: [
      { path: '/admin/analytics', label: 'Analytics', icon: '📊' },
      { path: '/admin/task-validation', label: 'Validation Quêtes', icon: '🛡️' },
      { path: '/admin/objective-validation', label: 'Gestion Campagnes', icon: '🎯' },
      { path: '/admin/rewards', label: 'Validation Récompenses', icon: '🎁' },
      { path: '/admin/settings', label: 'Paramètres Admin', icon: '⚙️' },
      { path: '/admin/role-permissions', label: 'Permissions & Rôles', icon: '🔐' },
      { path: '/admin/ranks', label: 'Gestion des Rangs', icon: '🎖️' },
      { path: '/admin/sync', label: 'Synchronisation', icon: '🔄' }
    ]}
  ];

  // 🔐 FILTRER LE MENU ADMIN SI L'UTILISATEUR N'A PAS LES DROITS
  const filteredMenuItems = menuItems.filter(section => {
    // Cacher la section ADMIN si pas de droits admin
    if (section.section === 'ADMIN' && !hasAdminAccess) {
      return false;
    }
    return true;
  });

  // 👑 AJOUTER GODMOD SI L'UTILISATEUR EST ALAN
  if (isGodMode) {
    filteredMenuItems.push({
      section: '👑 GODMOD',
      items: [
        { path: '/godmod', label: 'GODMOD', icon: '👑', isGodMode: true }
      ]
    });
  }

  const handleNavigation = (path) => {
    console.log('🧭 [MENU] Navigation vers:', path);
    onClose(); // Fermer le menu
    navigateFunction(path); // Naviguer
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      {/* Overlay */}
      <div 
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)'
        }}
      />

      {/* Menu Panel */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: '400px',
          maxWidth: '85vw',
          background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(31, 41, 55, 0.98) 100%)',
          boxShadow: '4px 0 30px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideIn 0.3s ease-out'
        }}
      >
        {/* Header */}
        <div 
          style={{
            padding: '24px',
            borderBottom: '1px solid rgba(75, 85, 99, 0.3)',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                boxShadow: '0 8px 20px -4px rgba(59, 130, 246, 0.4)'
              }}>
                🎮
              </div>
              <div>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  margin: 0,
                  lineHeight: '1.2'
                }}>
                  Synergia
                </h2>
                <p style={{
                  fontSize: '14px',
                  color: 'rgba(156, 163, 175, 1)',
                  margin: '4px 0 0 0'
                }}>
                  v3.5 - Menu Principal
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              style={{
                width: '40px',
                height: '40px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                color: 'rgba(248, 113, 113, 1)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                e.target.style.borderColor = 'rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                e.target.style.borderColor = 'rgba(239, 68, 68, 0.2)';
              }}
            >
              <X style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {filteredMenuItems.map((section, sectionIndex) => (
            <div
              key={sectionIndex}
              style={{
                marginBottom: sectionIndex < filteredMenuItems.length - 1 ? '28px' : '0'
              }}
            >
              {/* Section Header */}
              <div style={{
                fontSize: '11px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                color: section.section.includes('GODMOD') ? '#fbbf24' : 'rgba(156, 163, 175, 1)',
                marginBottom: '12px',
                paddingLeft: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {section.section.includes('GODMOD') && (
                  <span style={{
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    color: '#000',
                    fontWeight: '900'
                  }}>EXCLUSIF</span>
                )}
                {section.section}
              </div>

              {/* Section Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {section.items.map((item, itemIndex) => (
                  <button
                    key={itemIndex}
                    onClick={() => handleNavigation(item.path)}
                    style={{
                      padding: '14px 16px',
                      background: item.isGodMode 
                        ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%)'
                        : 'rgba(31, 41, 55, 0.5)',
                      border: item.isGodMode
                        ? '1px solid rgba(251, 191, 36, 0.3)'
                        : '1px solid rgba(75, 85, 99, 0.3)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      color: item.isGodMode ? '#fbbf24' : 'rgba(229, 231, 235, 1)',
                      textAlign: 'left',
                      width: '100%'
                    }}
                    onMouseEnter={(e) => {
                      if (item.isGodMode) {
                        e.target.style.background = 'linear-gradient(135deg, rgba(251, 191, 36, 0.25) 0%, rgba(245, 158, 11, 0.25) 100%)';
                        e.target.style.borderColor = 'rgba(251, 191, 36, 0.5)';
                        e.target.style.transform = 'translateX(8px)';
                      } else {
                        e.target.style.background = 'rgba(55, 65, 81, 0.8)';
                        e.target.style.borderColor = 'rgba(96, 165, 250, 0.5)';
                        e.target.style.transform = 'translateX(8px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (item.isGodMode) {
                        e.target.style.background = 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%)';
                        e.target.style.borderColor = 'rgba(251, 191, 36, 0.3)';
                      } else {
                        e.target.style.background = 'rgba(31, 41, 55, 0.5)';
                        e.target.style.borderColor = 'rgba(75, 85, 99, 0.3)';
                      }
                      e.target.style.transform = 'translateX(0)';
                    }}
                  >
                    <span style={{ 
                      fontSize: '20px',
                      width: '28px',
                      textAlign: 'center'
                    }}>
                      {item.icon}
                    </span>
                    <span style={{ 
                      fontSize: '15px',
                      fontWeight: '500'
                    }}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(75, 85, 99, 0.3)',
          background: 'rgba(17, 24, 39, 0.5)'
        }}>
          <p style={{
            fontSize: '12px',
            color: 'rgba(107, 114, 128, 1)',
            margin: 0,
            textAlign: 'center'
          }}>
            © 2025 Synergia - Brain Escape & Quiz Game
          </p>
        </div>

        {/* Styles animations */}
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideIn {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
          }
          div::-webkit-scrollbar {
            width: 6px;
          }
          div::-webkit-scrollbar-track {
            background: rgba(31, 41, 55, 0.3);
            border-radius: 4px;
          }
          div::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            border-radius: 4px;
          }
          div::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
          }
        `}</style>
      </div>
    </div>
  );
});

// 🔒 COMPOSANT LAYOUT PRINCIPAL
const Layout = memo(({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const menuOpenRef = useRef(false);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // 🎨 MODULE 16: Theme hook
  const { isDark, toggleTheme } = useTheme();

  // 🔔 MODULE 6: Hook de notifications avec toasts
  const {
    toasts,
    notifications,
    unreadCount,
    dismissToast,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotificationToast(user?.uid, {
    maxToasts: 3,
    soundEnabled: true
  });

  const openMenu = useCallback(() => {
    console.log('🔓 [LAYOUT] Ouverture menu demandée');
    setMenuOpen(true);
  }, []);

  const closeMenu = useCallback(() => {
    console.log('🔒 [LAYOUT] Fermeture menu demandée');
    setMenuOpen(false);
  }, []);

  const navigateFunction = useCallback((path) => {
    console.log('🧭 [LAYOUT] Navigation vers:', path);
    navigate(path);
  }, [navigate]);

  // Debug logging
  if (menuOpenRef.current !== menuOpen) {
    console.log('🔄 [LAYOUT] État menu changé:', {
      ancien: menuOpenRef.current,
      nouveau: menuOpen,
      timestamp: new Date().toLocaleTimeString()
    });
    menuOpenRef.current = menuOpen;
  }

  return (
    <div style={{
        minHeight: '100vh',
        background: isDark
          ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)'
          : '#f9fafb',
        transition: 'background 0.3s ease'
      }}>
      
      {/* 🔒 BOUTON HAMBURGER PREMIUM - Responsive */}
      <button
        onClick={openMenu}
        className="layout-menu-btn"
        style={{
          position: 'fixed',
          top: '12px',
          left: '12px',
          zIndex: 999998,
          width: '48px',
          height: '48px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          border: 'none',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 10px 25px -8px rgba(59, 130, 246, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          backdropFilter: 'blur(10px)'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.05) translateY(-2px)';
          e.target.style.background = 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1) translateY(0)';
          e.target.style.background = 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)';
        }}
      >
        <Menu style={{ width: '22px', height: '22px', color: 'white' }} />
      </button>

      {/* 🎨 MODULE 16: BOUTON THEME - Responsive */}
      <button
        onClick={toggleTheme}
        className="layout-theme-btn"
        style={{
          position: 'fixed',
          top: '12px',
          right: '68px',
          zIndex: 999998,
          width: '44px',
          height: '44px',
          background: isDark
            ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
            : 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
          border: 'none',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: isDark
            ? '0 10px 20px -6px rgba(99, 102, 241, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)'
            : '0 10px 20px -6px rgba(245, 158, 11, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          backdropFilter: 'blur(10px)'
        }}
        title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      >
        {isDark ? (
          <Moon style={{ width: '20px', height: '20px', color: '#fcd34d' }} />
        ) : (
          <Sun style={{ width: '20px', height: '20px', color: 'white' }} />
        )}
      </button>

      {/* 🔔 BOUTON NOTIFICATIONS - Responsive */}
      <button
        onClick={() => setNotifOpen(true)}
        className="layout-notif-btn"
        style={{
          position: 'fixed',
          top: '12px',
          right: '12px',
          zIndex: 999998,
          width: '44px',
          height: '44px',
          background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
          border: 'none',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 10px 20px -6px rgba(245, 158, 11, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          backdropFilter: 'blur(10px)'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.05) translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1) translateY(0)';
        }}
      >
        <Bell style={{ width: '20px', height: '20px', color: 'white' }} />

        {/* Badge compteur */}
        {unreadCount > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              minWidth: '18px',
              height: '18px',
              background: '#ef4444',
              borderRadius: '9px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: '700',
              color: 'white',
              border: '2px solid white',
              padding: '0 4px',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </button>

      {/* 🔒 MENU PREMIUM - ISOLATION COMPLÈTE + GODMOD */}
      <HamburgerMenuStable
        isOpen={menuOpen}
        onClose={closeMenu}
        navigateFunction={navigateFunction}
        userEmail={user?.email}
        userIsAdmin={hasAdminMenuAccess(user)}
      />

      {/* 🔔 MODULE 6: CENTRE DE NOTIFICATIONS AMÉLIORÉ */}
      <NotificationCenter
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onDelete={deleteNotification}
        onNavigate={navigateFunction}
      />

      {/* 🔔 MODULE 6: TOASTS EN TEMPS RÉEL */}
      <NotificationToast
        toasts={toasts}
        onDismiss={dismissToast}
      />

      {/* CONTENU */}
      <main style={{ minHeight: '100vh', paddingTop: '70px' }}>
        {children}
      </main>
    </div>
  );
});

// Noms pour React DevTools
Layout.displayName = 'Layout';
HamburgerMenuStable.displayName = 'HamburgerMenuStable';

export default Layout;
