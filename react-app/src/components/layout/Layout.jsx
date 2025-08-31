// ==========================================
// 📁 react-app/src/components/layout/Layout.jsx
// VERSION DEBUG ULTRA-SIMPLE POUR DIAGNOSTIC
// ==========================================

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

const Layout = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  console.log('🔍 [LAYOUT DEBUG] Render - menuOpen:', menuOpen);

  const openMenu = () => {
    console.log('🟢 [LAYOUT DEBUG] Ouverture menu');
    setMenuOpen(true);
  };

  const closeMenu = () => {
    console.log('🔴 [LAYOUT DEBUG] Fermeture menu');
    setMenuOpen(false);
  };

  const navigate = (path) => {
    console.log('🧭 [LAYOUT DEBUG] Navigation vers:', path);
    window.location.href = path; // Navigation simple sans React Router
    closeMenu();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* BOUTON HAMBURGER ULTRA-SIMPLE */}
      <div 
        onClick={openMenu}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 999998,
          width: '60px',
          height: '60px',
          background: '#3b82f6',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}
      >
        <Menu style={{ width: '24px', height: '24px', color: 'white' }} />
      </div>

      {/* MENU ULTRA-SIMPLE */}
      {menuOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999999,
            backgroundColor: 'rgba(0,0,0,0.8)'
          }}
        >
          {/* PANEL MENU */}
          <div 
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              width: '300px',
              height: '100vh',
              backgroundColor: '#1f2937',
              padding: '20px'
            }}
          >
            
            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
                SYNERGIA DEBUG
              </h2>
              <button 
                onClick={closeMenu}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  fontSize: '20px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            {/* LIENS SIMPLES */}
            <div>
              <div 
                onClick={() => navigate('/dashboard')}
                style={{
                  padding: '12px',
                  color: 'white',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  backgroundColor: '#374151'
                }}
              >
                🏠 Dashboard
              </div>

              <div 
                onClick={() => navigate('/admin')}
                style={{
                  padding: '12px',
                  color: 'white',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  backgroundColor: '#ef4444'
                }}
              >
                👑 Admin Dashboard
              </div>

              <div 
                onClick={() => navigate('/admin/task-validation')}
                style={{
                  padding: '12px',
                  color: 'white',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  backgroundColor: '#ef4444'
                }}
              >
                🛡️ Validation Tâches
              </div>

              <div 
                onClick={() => navigate('/admin/users')}
                style={{
                  padding: '12px',
                  color: 'white',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  backgroundColor: '#ef4444'
                }}
              >
                👥 Gestion Utilisateurs
              </div>
            </div>

            {/* DÉCONNEXION */}
            <div 
              onClick={() => {
                console.log('🚪 [LAYOUT DEBUG] Déconnexion');
                window.location.href = '/login';
              }}
              style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                right: '20px',
                padding: '12px',
                color: '#ef4444',
                cursor: 'pointer',
                borderRadius: '8px',
                backgroundColor: '#7f1d1d'
              }}
            >
              🚪 Déconnexion
            </div>
          </div>

          {/* BACKDROP */}
          <div 
            onClick={closeMenu}
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
      )}

      {/* CONTENU */}
      <main style={{ minHeight: '100vh', paddingTop: '80px' }}>
        <div style={{ padding: '20px' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>
            Layout DEBUG - Menu Test
          </h1>
          <p style={{ marginBottom: '20px' }}>
            État menu: <strong>{menuOpen ? 'OUVERT' : 'FERMÉ'}</strong>
          </p>
          <p style={{ marginBottom: '20px' }}>
            Si ce menu simple fonctionne, le problème vient des hooks React Router.
          </p>
        </div>
        {children}
      </main>
    </div>
  );
};

export default Layout;
