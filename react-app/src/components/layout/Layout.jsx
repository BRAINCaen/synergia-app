// ==========================================
// 📁 react-app/src/components/layout/Layout.jsx
// LAYOUT FINAL AVEC MENU PREMIUM + DÉTECTION PAGE ACTIVE
// ==========================================

import React, { useState, memo, useRef, useCallback } from 'react';
import { Menu, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

// 🔒 COMPOSANT MENU PREMIUM AVEC DESIGN HARMONISÉ + DÉTECTION PAGE ACTIVE
const HamburgerMenuStable = memo(({ isOpen, onClose, navigateFunction, currentPath }) => {
  console.log('🎯 [MENU] Rendu composant menu - isOpen:', isOpen, 'currentPath:', currentPath);
  
  if (!isOpen) return null;

  const menuItems = [
    { section: 'PRINCIPAL', items: [
      { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
            { path: '/infos', label: 'Infos', icon: '📢' }, // ← NOUVELLE LIGNE AJOUTÉE

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
      { path: '/timetrack', label: 'Suivi Temps', icon: '⏱️' }
        { path: '/hr', label: 'Gestion RH', icon: '🏢' }  // ← AJOUTEZ CETTE LIGNE !
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

  // 🎯 FONCTION POUR DÉTERMINER SI UN BOUTON EST ACTIF
  const isActive = (itemPath) => {
    // Exacte correspondance ou page de base (/ = /dashboard)
    if (currentPath === itemPath) return true;
    if (currentPath === '/' && itemPath === '/dashboard') return true;
    
    // Pour les routes admin, vérifier si on est dans une sous-route
    if (itemPath.startsWith('/admin') && currentPath.startsWith('/admin')) {
      return currentPath === itemPath;
    }
    
    return false;
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
        pointerEvents: 'none'
      }}
    >
      {/* OVERLAY FOND */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          animation: 'fadeIn 0.3s ease-out',
          pointerEvents: 'auto'
        }}
      />

      {/* PANNEAU MENU */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '400px',
          maxWidth: '90vw',
          height: '100%',
          background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(31, 41, 55, 0.98) 100%)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 0 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: 'auto',
          overflow: 'hidden'
        }}
      >
        {/* HEADER */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid rgba(156, 163, 175, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)'
        }}>
          <div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '4px'
            }}>
              Navigation
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#9ca3af'
            }}>
              Explorer toutes les sections de Synergia
            </p>
          </div>
          
          {/* BOUTON FERMETURE */}
          <button
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '10px',
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
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '24px',
          padding: '24px',
          overflowY: 'auto',
          flex: 1
        }}>
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
                {section.items.map((item, itemIndex) => {
                  const active = isActive(item.path);
                  
                  return (
                    <button
                      key={itemIndex}
                      onClick={() => handleNavigation(item.path)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        background: active 
                          ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)'
                          : 'rgba(55, 65, 81, 0.5)',
                        border: active
                          ? '1px solid rgba(139, 92, 246, 0.5)'
                          : '1px solid rgba(156, 163, 175, 0.2)',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: active ? '600' : '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textAlign: 'left',
                        width: '100%',
                        transform: active ? 'translateX(8px)' : 'translateX(0)',
                        boxShadow: active 
                          ? '0 4px 12px rgba(139, 92, 246, 0.3)'
                          : 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          e.target.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)';
                          e.target.style.borderColor = 'rgba(139, 92, 246, 0.4)';
                          e.target.style.transform = 'translateX(4px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          e.target.style.background = 'rgba(55, 65, 81, 0.5)';
                          e.target.style.borderColor = 'rgba(156, 163, 175, 0.2)';
                          e.target.style.transform = 'translateX(0)';
                        }
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>{item.icon}</span>
                      <span>{item.label}</span>
                      {active && (
                        <span style={{
                          marginLeft: 'auto',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
                          boxShadow: '0 0 8px rgba(139, 92, 246, 0.6)'
                        }} />
                      )}
                    </button>
                  );
                })}
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
  const location = useLocation(); // 🎯 Hook pour obtenir le chemin actuel

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

      {/* 🔒 MENU PREMIUM - ISOLATION COMPLÈTE + PATH ACTUEL */}
      <HamburgerMenuStable 
        isOpen={menuOpen} 
        onClose={closeMenu}
        navigateFunction={navigateFunction}
        currentPath={location.pathname}
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
