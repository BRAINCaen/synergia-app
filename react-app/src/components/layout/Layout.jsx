// ==========================================
// 📁 react-app/src/components/layout/Layout.jsx
// SOLUTION RADICALE - INJECTION DOM DIRECTE
// ==========================================

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, CheckSquare, FolderOpen, BarChart3, Trophy, Users, Settings, 
  Menu, X, User, LogOut, Award, Clock, BookOpen, UserCheck, Shield,
  Crown, TestTube, Lock, Gift, PieChart, Gamepad2, Zap
} from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';

const isUserAdmin = (user) => {
  if (!user) return false;
  const adminEmails = ['alan.boehme61@gmail.com', 'tanguy.caron@gmail.com', 'admin@synergia.com'];
  return adminEmails.includes(user.email) || user.role === 'admin' || user.isAdmin === true;
};

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userIsAdmin = React.useMemo(() => {
    return isUserAdmin(user);
  }, [user?.email]);

  const handleLogout = async () => {
    try {
      setSidebarOpen(false);
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
    }
  };

  // ✅ INJECTION DOM DIRECTE - MENU DESKTOP
  useEffect(() => {
    // Supprimer ancien menu s'il existe
    const oldDesktopMenu = document.getElementById('synergia-desktop-menu');
    if (oldDesktopMenu) {
      oldDesktopMenu.remove();
    }

    // Créer le menu desktop directement dans le DOM
    if (window.innerWidth >= 1024) {
      const desktopMenu = document.createElement('div');
      desktopMenu.id = 'synergia-desktop-menu';
      desktopMenu.innerHTML = `
        <div style="
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 256px !important;
          height: 100vh !important;
          background-color: #111827 !important;
          z-index: 99999 !important;
          display: flex !important;
          flex-direction: column !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3) !important;
          font-family: Inter, sans-serif !important;
        ">
          <!-- Header -->
          <div style="
            display: flex !important;
            align-items: center !important;
            height: 64px !important;
            padding: 0 16px !important;
            background-color: #374151 !important;
            border-bottom: 1px solid #4b5563 !important;
          ">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="
                width: 32px;
                height: 32px;
                background: linear-gradient(45deg, #3b82f6, #8b5cf6);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 16px;
              ">⚡</div>
              <div>
                <span style="color: white; font-weight: 600; font-size: 16px;">
                  🖥️ DESKTOP SYNERGIA
                </span>
                ${userIsAdmin ? '<span style="color: #f87171; font-size: 10px; margin-left: 8px;">ADMIN</span>' : ''}
              </div>
            </div>
          </div>

          <!-- Profile -->
          <div style="
            padding: 16px !important;
            background-color: #374151 !important;
            border-bottom: 1px solid #4b5563 !important;
          ">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="
                width: 32px;
                height: 32px;
                background-color: #3b82f6;
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                font-weight: bold;
              ">${user?.email?.[0]?.toUpperCase() || '?'}</div>
              <div>
                <p style="
                  font-size: 14px;
                  font-weight: 500;
                  color: white;
                  margin: 0;
                  max-width: 180px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                ">${user?.displayName || user?.email || 'Utilisateur'}</p>
                <p style="
                  font-size: 12px;
                  color: #9ca3af;
                  margin: 0;
                ">${userIsAdmin ? 'Administrateur' : 'Membre'}</p>
              </div>
            </div>
          </div>

          <!-- Navigation -->
          <nav style="
            flex: 1;
            padding: 16px 12px;
            overflow-y: auto;
          ">
            <div style="margin-bottom: 24px;">
              <h3 style="
                font-size: 11px;
                font-weight: bold;
                color: #9ca3af;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                margin: 0 0 12px 12px;
              ">PRINCIPAL</h3>
              <div>
                <a href="/dashboard" style="
                  display: flex;
                  align-items: center;
                  padding: 8px 12px;
                  margin: 2px 0;
                  border-radius: 6px;
                  text-decoration: none;
                  font-size: 14px;
                  font-weight: 500;
                  color: ${location.pathname === '/dashboard' ? '#dbeafe' : '#d1d5db'};
                  background-color: ${location.pathname === '/dashboard' ? '#1e3a8a' : 'transparent'};
                ">
                  <span style="margin-right: 12px;">🏠</span>
                  <span>Dashboard</span>
                </a>
                <a href="/tasks" style="
                  display: flex;
                  align-items: center;
                  padding: 8px 12px;
                  margin: 2px 0;
                  border-radius: 6px;
                  text-decoration: none;
                  font-size: 14px;
                  font-weight: 500;
                  color: ${location.pathname === '/tasks' ? '#dbeafe' : '#d1d5db'};
                  background-color: ${location.pathname === '/tasks' ? '#1e3a8a' : 'transparent'};
                ">
                  <span style="margin-right: 12px;">✅</span>
                  <span>Tâches</span>
                </a>
                <a href="/projects" style="
                  display: flex;
                  align-items: center;
                  padding: 8px 12px;
                  margin: 2px 0;
                  border-radius: 6px;
                  text-decoration: none;
                  font-size: 14px;
                  font-weight: 500;
                  color: ${location.pathname === '/projects' ? '#dbeafe' : '#d1d5db'};
                  background-color: ${location.pathname === '/projects' ? '#1e3a8a' : 'transparent'};
                ">
                  <span style="margin-right: 12px;">📁</span>
                  <span>Projets</span>
                </a>
                <a href="/analytics" style="
                  display: flex;
                  align-items: center;
                  padding: 8px 12px;
                  margin: 2px 0;
                  border-radius: 6px;
                  text-decoration: none;
                  font-size: 14px;
                  font-weight: 500;
                  color: ${location.pathname === '/analytics' ? '#dbeafe' : '#d1d5db'};
                  background-color: ${location.pathname === '/analytics' ? '#1e3a8a' : 'transparent'};
                ">
                  <span style="margin-right: 12px;">📊</span>
                  <span>Analytics</span>
                </a>
              </div>
            </div>

            <div style="margin-bottom: 24px;">
              <h3 style="
                font-size: 11px;
                font-weight: bold;
                color: #9ca3af;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                margin: 0 0 12px 12px;
              ">GAMIFICATION</h3>
              <div>
                <a href="/gamification" style="
                  display: flex;
                  align-items: center;
                  padding: 8px 12px;
                  margin: 2px 0;
                  border-radius: 6px;
                  text-decoration: none;
                  font-size: 14px;
                  font-weight: 500;
                  color: ${location.pathname === '/gamification' ? '#dbeafe' : '#d1d5db'};
                  background-color: ${location.pathname === '/gamification' ? '#1e3a8a' : 'transparent'};
                ">
                  <span style="margin-right: 12px;">🎮</span>
                  <span>Gamification</span>
                </a>
                <a href="/badges" style="
                  display: flex;
                  align-items: center;
                  padding: 8px 12px;
                  margin: 2px 0;
                  border-radius: 6px;
                  text-decoration: none;
                  font-size: 14px;
                  font-weight: 500;
                  color: ${location.pathname === '/badges' ? '#dbeafe' : '#d1d5db'};
                  background-color: ${location.pathname === '/badges' ? '#1e3a8a' : 'transparent'};
                ">
                  <span style="margin-right: 12px;">🏆</span>
                  <span>Badges</span>
                </a>
                <a href="/team" style="
                  display: flex;
                  align-items: center;
                  padding: 8px 12px;
                  margin: 2px 0;
                  border-radius: 6px;
                  text-decoration: none;
                  font-size: 14px;
                  font-weight: 500;
                  color: ${location.pathname === '/team' ? '#dbeafe' : '#d1d5db'};
                  background-color: ${location.pathname === '/team' ? '#1e3a8a' : 'transparent'};
                ">
                  <span style="margin-right: 12px;">👥</span>
                  <span>Équipe</span>
                </a>
              </div>
            </div>
          </nav>

          <!-- Déconnexion -->
          <div style="
            padding: 16px;
            border-top: 1px solid #4b5563;
            background-color: #374151;
          ">
            <button id="desktop-logout-btn" style="
              width: 100%;
              display: flex;
              align-items: center;
              padding: 8px 12px;
              background: transparent;
              border: none;
              border-radius: 6px;
              color: #d1d5db;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
            ">
              <span style="margin-right: 12px;">🚪</span>
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      `;

      // Ajouter au DOM
      document.body.appendChild(desktopMenu);

      // Ajouter event listener pour déconnexion
      const logoutBtn = document.getElementById('desktop-logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
      }
    }

    // Cleanup
    return () => {
      const menuToRemove = document.getElementById('synergia-desktop-menu');
      if (menuToRemove) {
        menuToRemove.remove();
      }
    };
  }, [location.pathname, user, userIsAdmin]);

  // ✅ MENU MOBILE SIMPLE AVEC PORTAL
  const mobileMenuPortal = sidebarOpen && window.innerWidth < 1024 && (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
        pointerEvents: 'auto'
      }}
    >
      {/* Overlay */}
      <div
        onClick={() => setSidebarOpen(false)}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 999998
        }}
      />
      
      {/* Menu */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '300px',
        height: '100vh',
        backgroundColor: '#111827',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
        overflow: 'auto'
      }}>
        {/* Header Mobile */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
          padding: '0 20px',
          backgroundColor: '#374151',
          borderBottom: '1px solid #4b5563',
          flexShrink: 0
        }}>
          <span style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
            📱 MOBILE MENU
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              backgroundColor: '#ef4444',
              border: 'none',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            ✕
          </button>
        </div>

        {/* Navigation Mobile Simple */}
        <div style={{ padding: '20px', flex: 1 }}>
          <Link to="/dashboard" onClick={() => setSidebarOpen(false)} style={{
            display: 'block',
            padding: '12px',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            backgroundColor: location.pathname === '/dashboard' ? '#1e3a8a' : 'transparent',
            marginBottom: '8px'
          }}>
            🏠 Dashboard
          </Link>
          <Link to="/tasks" onClick={() => setSidebarOpen(false)} style={{
            display: 'block',
            padding: '12px',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            backgroundColor: location.pathname === '/tasks' ? '#1e3a8a' : 'transparent',
            marginBottom: '8px'
          }}>
            ✅ Tâches
          </Link>
          <Link to="/projects" onClick={() => setSidebarOpen(false)} style={{
            display: 'block',
            padding: '12px',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            backgroundColor: location.pathname === '/projects' ? '#1e3a8a' : 'transparent',
            marginBottom: '8px'
          }}>
            📁 Projets
          </Link>
          <Link to="/analytics" onClick={() => setSidebarOpen(false)} style={{
            display: 'block',
            padding: '12px',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            backgroundColor: location.pathname === '/analytics' ? '#1e3a8a' : 'transparent',
            marginBottom: '8px'
          }}>
            📊 Analytics
          </Link>
        </div>

        {/* Déconnexion Mobile */}
        <div style={{ padding: '20px', borderTop: '1px solid #4b5563' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#dc2626',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🚪 DÉCONNEXION
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      
      {/* MENU MOBILE PORTAL */}
      {mobileMenuPortal}

      {/* CONTENU PRINCIPAL AVEC MARGE DESKTOP */}
      <div 
        className="flex-1 flex flex-col min-w-0 relative"
        style={{
          marginLeft: window.innerWidth >= 1024 ? '256px' : '0'
        }}
      >
        
        {/* HEADER MOBILE */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              padding: '12px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            📱 MENU
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            Synergia {userIsAdmin && <span className="text-red-500 text-sm ml-2">ADMIN</span>}
          </h1>
          <div className="w-10" />
        </div>

        {/* CONTENU DES PAGES */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
      
      {/* DEBUG FINAL */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: '#000',
        color: '#fff',
        padding: '10px',
        borderRadius: '8px',
        fontSize: '12px',
        zIndex: 1000000,
        border: '2px solid #ff0000'
      }}>
        <div>💻 Desktop Menu: {document.getElementById('synergia-desktop-menu') ? '✅ INJECTÉ' : '❌ ABSENT'}</div>
        <div>📱 Mobile: {sidebarOpen ? '✅ OUVERT' : '❌ FERMÉ'}</div>
        <div>📏 Largeur: {window.innerWidth}px</div>
      </div>
    </div>
  );
};

export default Layout;
