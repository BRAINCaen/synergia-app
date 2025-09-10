// ==========================================
// 📁 react-app/src/components/layout/Layout.jsx
// LAYOUT FINAL AVEC ISOLATION COMPLÈTE DU MENU - ANTI RE-RENDER + DEBUG
// ==========================================

import React, { useState, memo, useRef, useCallback } from 'react';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// 🔒 COMPOSANT MENU COMPLÈTEMENT ISOLÉ - OUTSIDE COMPONENT TREE
const HamburgerMenuStable = memo(({ isOpen, onClose, navigateFunction }) => {
  console.log('🎯 [MENU] Rendu composant menu - isOpen:', isOpen);
  
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
      { path: '/admin/analytics', label: 'Analytics Admin', icon: '📊' },
      { path: '/admin/settings', label: 'Paramètres Admin', icon: '⚙️' },
      { path: '/admin/badges', label: 'Gestion Badges', icon: '🏆' },
      { path: '/admin/rewards', label: 'Gestion Récompenses', icon: '🎁' },
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
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={onClose}
    >
      {/* CONTENU MENU */}
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '30px',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>Navigation</h2>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              backgroundColor: '#f3f4f6',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X style={{ width: '20px', height: '20px', color: '#6b7280' }} />
          </button>
        </div>

        {/* SECTIONS */}
        <div style={{ display: 'grid', gap: '25px' }}>
          {menuItems.map((section, index) => (
            <div key={index}>
              <h3 style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#6b7280', 
                marginBottom: '15px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {section.section}
              </h3>
              <div style={{ display: 'grid', gap: '8px' }}>
                {section.items.map((item, itemIndex) => (
                  <button
                    key={itemIndex}
                    onClick={() => handleNavigation(item.path)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: '500',
                      color: '#374151',
                      textAlign: 'left',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f3f4f6';
                      e.target.style.color = '#1f2937';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = '#374151';
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
      </div>
    </div>
  );
});

// 🔒 LAYOUT PRINCIPAL AVEC ISOLATION COMPLÈTE
const Layout = memo(({ children }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuOpenRef = useRef(false);

  // Navigation function stable
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

  // Debug: traquer les changements d'état
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
