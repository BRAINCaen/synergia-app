// ==========================================
// 📁 react-app/src/components/layout/Layout.jsx
// LAYOUT AVEC MENU COMPLET + GODMOD
// ==========================================

import React, { useState, memo, useRef, useCallback } from 'react';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../shared/stores/authStore.js';

// 🔒 COMPOSANT MENU PREMIUM AVEC DESIGN HARMONISÉ + GODMOD
const HamburgerMenuStable = memo(({ isOpen, onClose, navigateFunction, userEmail }) => {
  console.log('🎯 [MENU] Rendu composant menu - isOpen:', isOpen);
  
  if (!isOpen) return null;

  // 👑 Vérifier si l'utilisateur est l'admin principal
  const isGodMode = userEmail === 'alan.boehme61@gmail.com';

  const menuItems = [
    { section: 'PRINCIPAL', items: [
      { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
      { path: '/infos', label: 'Info', icon: 'ℹ️' },
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

  // 👑 AJOUTER GODMOD SI L'UTILISATEUR EST ALAN
  if (isGodMode) {
    menuItems.push({
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
                marginBottom: sectionIndex < menuItems.length - 1 ? '28px' : '0'
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
                      color: item.isGodMode ? '#fbbf24' : 'rgba(243, 244, 246, 1)',
                      fontSize: '15px',
                      fontWeight: '500',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      if (item.isGodMode) {
                        e.target.style.background = 'linear-gradient(135deg, rgba(251, 191, 36, 0.25) 0%, rgba(245, 158, 11, 0.25) 100%)';
                        e.target.style.borderColor = 'rgba(251, 191, 36, 0.5)';
                        e.target.style.boxShadow = '0 8px 25px -5px rgba(251, 191, 36, 0.3)';
                      } else {
                        e.target.style.background = 'rgba(55, 65, 81, 0.7)';
                        e.target.style.borderColor = 'rgba(139, 92, 246, 0.4)';
                        e.target.style.boxShadow = '0 4px 15px -3px rgba(139, 92, 246, 0.2)';
                      }
                      e.target.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      if (item.isGodMode) {
                        e.target.style.background = 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%)';
                        e.target.style.borderColor = 'rgba(251, 191, 36, 0.3)';
                        e.target.style.boxShadow = 'none';
                      } else {
                        e.target.style.background = 'rgba(31, 41, 55, 0.5)';
                        e.target.style.borderColor = 'rgba(75, 85, 99, 0.3)';
                        e.target.style.boxShadow = 'none';
                      }
                      e.target.style.transform = 'translateX(0)';
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>{item.icon}</span>
                    <span>{item.label}</span>
                    {item.isGodMode && (
                      <span style={{
                        marginLeft: 'auto',
                        background: 'rgba(251, 191, 36, 0.2)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: '700',
                        color: '#fbbf24'
                      }}>GOD</span>
                    )}
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
  const { user } = useAuthStore(); // 👑 Récupérer l'utilisateur pour vérifier l'email

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

      {/* 🔒 MENU PREMIUM - ISOLATION COMPLÈTE + GODMOD */}
      <HamburgerMenuStable 
        isOpen={menuOpen} 
        onClose={closeMenu}
        navigateFunction={navigateFunction}
        userEmail={user?.email} // 👑 Passer l'email pour vérifier GODMOD
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
