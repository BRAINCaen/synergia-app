// ==========================================
// 📁 react-app/src/components/layout/Layout.jsx
// LAYOUT FINAL AVEC ISOLATION COMPLÈTE DU MENU - ANTI RE-RENDER
// ==========================================

import React, { useState, memo, useRef, useCallback } from 'react';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// 🔒 COMPOSANT MENU COMPLÈTEMENT ISOLÉ - OUTSIDE COMPONENT TREE
const HamburgerMenuStable = memo(({ isOpen, onClose, navigateFunction }) => {
  if (!isOpen) return null;

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
      { path: '/users', label: 'Utilisateurs', icon: '👤' },
      { path: '/profile', label: 'Profil', icon: '🧑‍💼' },
      { path: '/settings', label: 'Paramètres', icon: '⚙️' }
    ]},
    { section: 'OUTILS', items: [
      { path: '/onboarding', label: 'Intégration', icon: '🎯' },
      { path: '/timetrack', label: 'Suivi Temps', icon: '⏱️' }
    ]},
    { section: 'ADMIN', items: [
      { path: '/admin', label: 'Dashboard Admin', icon: '👑' },
      { path: '/admin/task-validation', label: 'Validation Tâches', icon: '🛡️' },
      { path: '/admin/objective-validation', label: 'Validation Objectifs', icon: '🎯' },
      { path: '/admin/users', label: 'Gestion Utilisateurs', icon: '👥' },
      { path: '/admin/analytics', label: 'Analytics Admin', icon: '📈' },
      { path: '/admin/settings', label: 'Config Système', icon: '⚙️' },
      { path: '/admin/badges', label: 'Gestion Badges', icon: '🏆' },
      { path: '/admin/rewards', label: 'Gestion Récompenses', icon: '🎁' },
      { path: '/admin/role-permissions', label: 'Permissions & Rôles', icon: '🔐' },
      { path: '/admin/sync', label: 'Synchronisation', icon: '🔄' },
      { path: '/admin/dashboard-tuteur', label: 'Dashboard Tuteur', icon: '🎓' },
      { path: '/admin/dashboard-manager', label: 'Dashboard Manager', icon: '📊' },
      { path: '/admin/interview', label: 'Gestion Entretiens', icon: '💼' },
      { path: '/admin/demo-cleaner', label: 'Nettoyage Démo', icon: '🧹' },
      { path: '/admin/complete-test', label: 'Test Complet', icon: '🧪' },
      { path: '/admin/profile-test', label: 'Test Profil', icon: '👤' }
    ]}
  ];

  // Navigation handler stable
  const handleNavigation = useCallback((path) => {
    console.log('🧭 [LAYOUT] Navigation vers:', path);
    onClose(); // Fermer le menu AVANT la navigation
    setTimeout(() => {
      navigateFunction(path);
    }, 100); // Petit délai pour permettre la fermeture
  }, [onClose, navigateFunction]);

  // Handle backdrop click avec protection renforcée
  const handleBackdropClick = useCallback((e) => {
    // Protection contre fermeture immédiate après ouverture
    const now = Date.now();
    if (lastOpenTime.current && now - lastOpenTime.current < 500) {
      console.log('🛡️ FERMETURE BACKDROP BLOQUÉE - trop rapide');
      return;
    }
    
    // Vérifier que le clic est vraiment sur le backdrop
    if (e.target === e.currentTarget && menuOpenRef.current) {
      console.log('🔴 BACKDROP CLIC - Fermeture menu');
      onClose();
    }
  }, [onClose]);

  // Handle panel click - prevent close avec protection
  const handlePanelClick = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
  }, []);

  return (
    <div 
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
        backgroundColor: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(4px)'
      }}
    >
      {/* MENU PANEL */}
      <div 
        onClick={handlePanelClick}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: '320px',
          height: '100vh',
          backgroundColor: '#1f2937',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          overflowY: 'auto',
          zIndex: 1000000
        }}
      >
        {/* HEADER MENU */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px',
          borderBottom: '1px solid #374151'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              🚀
            </div>
            <div>
              <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
                Synergia
              </h2>
              <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>
                v3.5.4
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = 'white';
              e.target.style.backgroundColor = '#374151';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#9ca3af';
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* SECTIONS MENU */}
        <div style={{ padding: '16px' }}>
          {menuItems.map((section, sectionIndex) => (
            <div key={section.section} style={{ marginBottom: '24px' }}>
              <h3 style={{
                color: '#9ca3af',
                fontSize: '11px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '12px',
                paddingLeft: '8px'
              }}>
                {section.section}
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {section.items.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      background: 'none',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#d1d5db',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      width: '100%'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#374151';
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = '#d1d5db';
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>{item.icon}</span>
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER MENU */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px',
          borderTop: '1px solid #374151',
          backgroundColor: '#111827'
        }}>
          <button
            onClick={() => {
              onClose();
              // Ajouter ici la logique de déconnexion
              console.log('Déconnexion...');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 12px',
              color: '#ef4444',
              background: 'none',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: '#7f1d1d20',
              transition: 'all 0.2s',
              width: '100%',
              cursor: 'pointer'
            }}
          >
            <span style={{ fontSize: '16px' }}>🚪</span>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>Déconnexion</span>
          </button>
        </div>
      </div>
    </div>
  );
});

// 🔒 LAYOUT PRINCIPAL AVEC ISOLATION COMPLÈTE DES RE-RENDERS
const Layout = memo(({ children }) => {
  // État du menu complètement isolé
  const [menuOpen, setMenuOpen] = useState(false);
  const menuOpenRef = useRef(false);
  const navigate = useNavigate();
  
  // 🔒 FONCTION NAVIGATION STABLE
  const navigateFunction = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  // 🔒 FONCTION OUVERTURE STABLE
  const openMenu = useCallback(() => {
    console.log('🟢 MENU OUVERTURE');
    setMenuOpen(true);
    menuOpenRef.current = true;
  }, []);

  // 🔒 FONCTION FERMETURE STABLE  
  const closeMenu = useCallback(() => {
    console.log('🔴 MENU FERMETURE');
    setMenuOpen(false);
    menuOpenRef.current = false;
  }, []);

  // Debug uniquement quand le menu change réellement
  if (menuOpenRef.current !== menuOpen) {
    console.log('🔄 [LAYOUT RENDER]', { menuOpen });
    menuOpenRef.current = menuOpen;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      
      {/* 🔒 BOUTON HAMBURGER STABLE - PAS DE RE-RENDER */}
      <button
        onClick={openMenu}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 999998,
          width: '56px',
          height: '56px',
          backgroundColor: '#3b82f6',
          border: 'none',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 10px 25px rgba(59, 130, 246, 0.4)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1)';
          e.target.style.backgroundColor = '#2563eb';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.backgroundColor = '#3b82f6';
        }}
      >
        <Menu style={{ width: '24px', height: '24px', color: 'white' }} />
      </button>

      {/* 🔒 MENU STABLE - ISOLATION COMPLÈTE */}
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
