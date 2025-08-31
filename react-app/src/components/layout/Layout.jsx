// ==========================================
// 📁 react-app/src/components/layout/Layout.jsx
// LAYOUT FINAL AVEC MEMO ET STABILITÉ GARANTIE
// ==========================================

import React, { useState, memo, useRef } from 'react';
import { Menu, X } from 'lucide-react';

// Composant Menu externe pour éviter les re-renders
const HamburgerMenuStable = memo(({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const menuItems = [
    { section: 'PRINCIPAL', items: [
      { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
      { path: '/tasks', label: 'Tâches', icon: '✅' },
      { path: '/projects', label: 'Projets', icon: '📁' },
      { path: '/analytics', label: 'Analytics', icon: '📊' }
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

  return (
    <div 
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
      <div 
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: '320px',
          height: '100vh',
          backgroundColor: '#1f2937',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          overflowY: 'auto'
        }}
      >
        
        {/* HEADER FIXE */}
        <div style={{ padding: '24px', borderBottom: '1px solid #374151' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
                SYNERGIA
              </h2>
              <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>Administration</p>
            </div>
            <button 
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#9ca3af',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px'
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* NAVIGATION FIXE */}
        <div style={{ padding: '16px' }}>
          {menuItems.map((section, sectionIndex) => (
            <div key={sectionIndex} style={{ marginBottom: '24px' }}>
              
              <h3 style={{ 
                color: section.section === 'ADMIN' ? '#fbbf24' : '#9ca3af',
                fontSize: '11px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '12px',
                paddingLeft: '8px'
              }}>
                {section.section === 'ADMIN' ? '🛡️ ' : ''}{section.section}
              </h3>
              
              <div>
                {section.items.map((item, itemIndex) => (
                  <a
                    key={itemIndex}
                    href={item.path}
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = item.path;
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      marginBottom: '4px',
                      backgroundColor: section.section === 'ADMIN' ? '#ef444420' : '#37415120',
                      border: section.section === 'ADMIN' ? '1px solid #ef444440' : '1px solid transparent',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = section.section === 'ADMIN' ? '#ef444440' : '#37415140';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = section.section === 'ADMIN' ? '#ef444420' : '#37415120';
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>{item.icon}</span>
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.label}</span>
                    {section.section === 'ADMIN' && (
                      <span style={{
                        marginLeft: 'auto',
                        padding: '2px 6px',
                        fontSize: '10px',
                        backgroundColor: '#fbbf2420',
                        color: '#fbbf24',
                        borderRadius: '4px'
                      }}>
                        ADMIN
                      </span>
                    )}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER FIXE */}
        <div style={{ 
          position: 'absolute', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          padding: '16px', 
          borderTop: '1px solid #374151' 
        }}>
          <a
            href="/login"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = '/login';
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 12px',
              color: '#ef4444',
              textDecoration: 'none',
              borderRadius: '8px',
              backgroundColor: '#7f1d1d20',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ fontSize: '16px' }}>🚪</span>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>Déconnexion</span>
          </a>
        </div>
      </div>

      {/* BACKDROP */}
      <div 
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1
        }}
      />
    </div>
  );
});

// Layout principal avec memo pour éviter les re-renders
const Layout = memo(({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuStateRef = useRef(menuOpen);
  
  // Sync ref avec state
  menuStateRef.current = menuOpen;

  const openMenu = () => {
    console.log('🟢 MENU OUVERTURE');
    setMenuOpen(true);
  };

  const closeMenu = () => {
    console.log('🔴 MENU FERMETURE');
    setMenuOpen(false);
  };

  console.log('🔄 [LAYOUT RENDER]', { menuOpen });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      
      {/* BOUTON HAMBURGER STABLE */}
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

      {/* MENU STABLE */}
      <HamburgerMenuStable 
        isOpen={menuOpen} 
        onClose={closeMenu}
      />

      {/* CONTENU */}
      <main style={{ minHeight: '100vh', paddingTop: '20px' }}>
        {children}
      </main>
    </div>
  );
});

Layout.displayName = 'Layout';
HamburgerMenuStable.displayName = 'HamburgerMenuStable';

export default Layout;
