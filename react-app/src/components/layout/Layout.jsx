// ==========================================
// 📁 react-app/src/components/layout/Layout.jsx
// LAYOUT AVEC MENU COMPLET - ADMIN REWARDS AJOUTÉ
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
      { path: '/admin/rewards', label: 'Validation Récompenses', icon: '🎁' }, // ✅ AJOUT
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
                fontSize: '24px',
                boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.4)'
              }}>
                ⚡
              </div>
              <div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '0.5px'
                }}>
                  SYNERGIA
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#9ca3af',
                  fontWeight: '600',
                  letterSpacing: '1px',
                  marginTop: '2px'
                }}>
                  NAVIGATION
                </div>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              style={{
                width: '40px',
                height: '40px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9ca3af',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                e.currentTarget.style.color = '#ef4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = '#9ca3af';
              }}
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Menu Sections */}
        <div style={{ padding: '16px' }}>
          {menuItems.map((section, idx) => (
            <div key={idx} style={{ marginBottom: '24px' }}>
              <div style={{
                fontSize: '11px',
                fontWeight: '700',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '1.2px',
                marginBottom: '12px',
                paddingLeft: '12px'
              }}>
                {section.section}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {section.items.map((item, itemIdx) => (
                  <button
                    key={itemIdx}
                    onClick={() => handleNavigation(item.path)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '10px',
                      color: '#e5e7eb',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'left',
                      width: '100%'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)';
                      e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.transform = 'translateX(0)';
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

        {/* Footer Info */}
        <div style={{
          padding: '20px 24px',
          borderTop: '1px solid rgba(156, 163, 175, 0.1)',
          background: 'rgba(17, 24, 39, 0.5)',
          marginTop: 'auto'
        }}>
          <div style={{
            fontSize: '11px',
            color: '#6b7280',
            textAlign: 'center',
            fontWeight: '500'
          }}>
            Synergia v3.5 • 2024
          </div>
        </div>
      </div>

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
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
});

/**
 * 🎨 LAYOUT PRINCIPAL AVEC MENU HAMBURGER
 */
const Layout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  // 🔒 Navigation avec fermeture de menu
  const handleNavigation = useCallback((path) => {
    console.log('🚀 [LAYOUT] Navigation initiée vers:', path);
    setIsMenuOpen(false);
    setTimeout(() => {
      navigate(path);
    }, 100);
  }, [navigate]);

  // 🎯 Toggle menu
  const toggleMenu = useCallback(() => {
    console.log('🔄 [LAYOUT] Toggle menu');
    setIsMenuOpen(prev => !prev);
  }, []);

  // 🚪 Fermer menu
  const closeMenu = useCallback(() => {
    console.log('❌ [LAYOUT] Fermeture menu');
    setIsMenuOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Bouton Hamburger */}
      <button
        onClick={toggleMenu}
        className="fixed top-6 left-6 z-50 p-3 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-110 border border-white/20"
        style={{
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)'
        }}
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Menu Hamburger */}
      <HamburgerMenuStable
        ref={menuRef}
        isOpen={isMenuOpen}
        onClose={closeMenu}
        navigateFunction={handleNavigation}
      />

      {/* Contenu principal */}
      <main className="min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default Layout;
