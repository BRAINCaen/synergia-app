// ==========================================
// 📁 react-app/src/components/layout/Layout.jsx
// LAYOUT AVEC MENU PREMIUM - PLANNING AJOUTÉ
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
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 999999,
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(88, 28, 135, 0.95) 50%, rgba(15, 23, 42, 0.95) 100%)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 0.3s ease-out'
      }}
      onClick={onClose}
    >
      {/* CONTENU MENU PREMIUM */}
      <div 
        style={{
          background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(55, 65, 81, 0.8) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(156, 163, 175, 0.2)',
          borderRadius: '24px',
          width: '90%',
          maxWidth: '700px',
          maxHeight: '85vh',
          overflowY: 'auto',
          padding: '32px',
          position: 'relative',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          animation: 'slideUp 0.4s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER PREMIUM */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '32px' 
        }}>
          <div>
            <h2 style={{ 
              fontSize: '32px', 
              fontWeight: '800',
              background: 'linear-gradient(135deg, #60a5fa 0%, #a855f7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '8px'
            }}>
              Navigation
            </h2>
            <p style={{
              color: '#9ca3af',
              fontSize: '16px',
              fontWeight: '400'
            }}>
              Explorez toutes les sections de Synergia
            </p>
          </div>
          
          {/* BOUTON FERMETURE */}
          <button
            onClick={onClose}
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              color: '#ef4444'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(239, 68, 68, 0.2)';
              e.target.style.borderColor = 'rgba(239, 68, 68, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(239, 68, 68, 0.1)';
              e.target.style.borderColor = 'rgba(239, 68, 68, 0.3)';
            }}
          >
            <X style={{ width: '24px', height: '24px' }} />
          </button>
        </div>

        {/* SECTIONS MENU */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {menuItems.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#9ca3af',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '12px'
              }}>
                {section.section}
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {section.items.map((item, itemIndex) => (
                  <button
                    key={itemIndex}
                    onClick={() => handleNavigation(item.path)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      background: 'rgba(55, 65, 81, 0.5)',
                      border: '1px solid rgba(156, 163, 175, 0.2)',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left',
                      width: '100%'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)';
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
