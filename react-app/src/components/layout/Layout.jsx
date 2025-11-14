// ==========================================
// 📁 react-app/src/components/layout/Layout.jsx
// LAYOUT AVEC MENU COMPLET - RH & PLANNING AJOUTÉS
// ==========================================

import React, { useState, memo, useRef, useCallback } from 'react';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// 🔒 COMPOSANT MENU PREMIUM AVEC DESIGN HARMONISÉ
const HamburgerMenuStable = memo(({ isOpen, onClose, navigateFunction }) => {
  console.log('🎯 [MENU] Rendu composant menu - isOpen:', isOpen);
  
  if (!isOpen) return null;

  const menuItems = [
    { section: 'PRINCIPAL', items: [
      { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
          { path: '/info', label: 'Info', icon: 'ℹ️' },
      { path: '/tasks', label: 'Quêtes', icon: '⚔️' },
      { path: '/projects', label: 'Campagnes', icon: '🎯' },
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
      { path: '/profile', label: 'Profil', icon: '🧑‍💼' },
      { path: '/settings', label: 'Paramètres', icon: '⚙️' }
    ]},
    { section: 'OUTILS', items: [
      { path: '/onboarding', label: 'Intégration', icon: '🎯' },
      { path: '/timetrack', label: 'Suivi Temps', icon: '⏱️' },
      // 🆕 NOUVELLES ROUTES AJOUTÉES
      { path: '/hr', label: 'RH', icon: '🏢' },
      { path: '/planning', label: 'Planning', icon: '📅' }
    ]},
    { section: 'ADMIN', items: [
      { path: '/admin', label: 'Dashboard Admin', icon: '👑' },
      { path: '/admin/task-validation', label: 'Validation Quêtes', icon: '🛡️' },
      { path: '/admin/objective-validation', label: 'Validation Objectifs', icon: '🎯' },
      { path: '/admin/analytics', label: 'Analytics Admin', icon: '📊' },
      { path: '/admin/settings', label: 'Paramètres Admin', icon: '⚙️' },
      { path: '/admin/role-permissions', label: 'Permissions & Rôles', icon: '🔐' },
      { path: '/admin/sync', label: 'Synchronisation', icon: '🔄' }
    ]}
  ];

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
          background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(31, 41, 55, 0.95) 100%)',
          borderRight: '1px solid rgba(139, 92, 246, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(139, 92, 246, 0.1)',
          overflowY: 'auto',
          animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '32px 24px 24px',
          borderBottom: '1px solid rgba(156, 163, 175, 0.1)',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)',
                fontSize: '24px'
              }}>
                🎮
              </div>
              <div>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
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
        <div style={{ padding: '24px' }}>
          {menuItems.map((section, sectionIndex) => (
            <div 
              key={sectionIndex}
              style={{ 
                marginBottom: '32px',
                animation: `slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${sectionIndex * 0.05}s backwards`
              }}
            >
              <h3 style={{
                fontSize: '12px',
                fontWeight: '600',
                color: 'rgba(139, 92, 246, 1)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '12px',
                paddingLeft: '12px'
              }}>
                {section.section}
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {section.items.map((item, itemIndex) => (
                  <button
                    key={itemIndex}
                    onClick={() => handleNavigation(item.path)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 16px',
                      background: 'rgba(55, 65, 81, 0.5)',
                      border: '1px solid rgba(156, 163, 175, 0.2)',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '15px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      width: '100%',
                      textAlign: 'left',
                      animation: `slideUp 0.3s ease ${(sectionIndex * 0.05) + (itemIndex * 0.03)}s backwards`
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(139, 92, 246, 0.15)';
                      e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                      e.target.style.transform = 'translateX(8px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(55, 65, 81, 0.5)';
                      e.target.style.borderColor = 'rgba(156, 163, 175, 0.2)';
                      e.target.style.transform = 'translateX(0)';
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* STYLES D'ANIMATION */}
        <style>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          
          /* Scrollbar personnalisée pour le menu */
          div::-webkit-scrollbar {
            width: 8px;
          }
          
          div::-webkit-scrollbar-track {
            background: rgba(55, 65, 81, 0.3);
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
  const menuOpenRef = useRef(false);
  const navigate = useNavigate();

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
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      
      {/* 🔒 BOUTON HAMBURGER PREMIUM */}
      <button
        onClick={openMenu}
        style={{
          position: 'fixed',
          top: '24px',
          left: '24px',
          zIndex: 999998,
          width: '64px',
          height: '64px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          border: 'none',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 20px 40px -10px rgba(59, 130, 246, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          backdropFilter: 'blur(10px)'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.05) translateY(-2px)';
          e.target.style.background = 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)';
          e.target.style.boxShadow = '0 25px 50px -10px rgba(59, 130, 246, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1) translateY(0)';
          e.target.style.background = 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)';
          e.target.style.boxShadow = '0 20px 40px -10px rgba(59, 130, 246, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)';
        }}
      >
        <Menu style={{ width: '28px', height: '28px', color: 'white' }} />
      </button>

      {/* 🔒 MENU PREMIUM - ISOLATION COMPLÈTE */}
      <HamburgerMenuStable 
        isOpen={menuOpen} 
        onClose={closeMenu}
        navigateFunction={navigateFunction}
      />

      {/* CONTENU */}
      <main style={{ minHeight: '100vh', paddingTop: '20px' }}>
        {children}
      </main>
    </div>
  );
});

// Noms pour React DevTools
Layout.displayName = 'Layout';
HamburgerMenuStable.displayName = 'HamburgerMenuStable';

export default Layout;
