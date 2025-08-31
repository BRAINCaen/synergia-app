// ==========================================
// 📁 react-app/src/components/layout/Layout.jsx
// LAYOUT AVEC MENU REACT PORTAL - SOLUTION DÉFINITIVE
// ==========================================

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { isAdmin } from '../../core/services/adminService.js';

// Composant Menu séparé
const HamburgerMenu = ({ isOpen, onClose, user, userIsAdmin, location, navigate }) => {
  if (!isOpen) return null;

  const handleLogout = async () => {
    try {
      const { signOut } = useAuthStore.getState();
      await signOut();
      navigate('/login');
      onClose();
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

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
      { path: '/team', label: 'Équipe', icon: '👥' }
    ]},
    { section: 'OUTILS', items: [
      { path: '/onboarding', label: 'Intégration', icon: '📚' },
      { path: '/profile', label: 'Mon Profil', icon: '👨‍💼' },
      { path: '/settings', label: 'Paramètres', icon: '⚙️' },
      { path: '/timetrack', label: 'Suivi Temps', icon: '⏱️' }
    ]}
  ];

  if (userIsAdmin) {
    menuItems.push({
      section: 'ADMINISTRATION',
      items: [
        { path: '/admin', label: 'Dashboard Admin', icon: '🏠' },
        { path: '/admin/task-validation', label: 'Validation Tâches', icon: '🛡️' },
        { path: '/admin/objective-validation', label: 'Validation Objectifs', icon: '🎯' },
        { path: '/admin/users', label: 'Gestion Utilisateurs', icon: '👑' },
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
      ]
    });
  }

  return createPortal(
    <div 
      className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-sm"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999999 }}
    >
      <div className="fixed left-0 top-0 h-full w-80 bg-gradient-to-b from-gray-800 to-gray-900 shadow-2xl">
        
        {/* HEADER */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">S</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">SYNERGIA</h2>
                <p className="text-xs text-gray-400">v3.5</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 hover:bg-gray-700 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {user && (
            <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user.displayName?.[0] || user.email?.[0] || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">
                  {user.displayName || 'Utilisateur'}
                </p>
                <p className="text-sm text-gray-400 truncate">{user.email}</p>
                {userIsAdmin && (
                  <span className="inline-block px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full mt-1">
                    ADMIN
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* NAVIGATION */}
        <nav className="p-4 space-y-6 flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {menuItems.map((section, sectionIndex) => {
            const isAdminSection = section.section === 'ADMINISTRATION';
            return (
              <div key={sectionIndex}>
                <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 px-2 ${
                  isAdminSection ? 'text-yellow-400' : 'text-gray-500'
                }`}>
                  {isAdminSection ? '🛡️ ' : ''}{section.section}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item, itemIndex) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <button
                        key={itemIndex}
                        onClick={() => handleNavigation(item.path)}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
                          transition-all duration-200 group
                          ${isActive 
                            ? (isAdminSection 
                              ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 text-white border border-red-500/30'
                              : 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30'
                            ) 
                            : 'text-gray-300 hover:bg-gray-700/30 hover:text-white'
                          }
                        `}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span className="flex-1 font-medium">{item.label}</span>
                        {isAdminSection && (
                          <span className="px-1.5 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded">
                            ADMIN
                          </span>
                        )}
                        {isActive && (
                          <div className={`w-2 h-2 rounded-full shadow-lg ${
                            isAdminSection ? 'bg-red-400 shadow-red-400/50' : 'bg-blue-400 shadow-blue-400/50'
                          }`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* FOOTER */}
        <div className="p-4 border-t border-gray-700/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
          >
            <span className="text-lg">🚪</span>
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </div>

      {/* BACKDROP */}
      <div 
        className="absolute inset-0 -z-10" 
        onClick={onClose}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}
      />
    </div>,
    document.body
  );
};

const Layout = ({ children }) => {
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const userIsAdmin = isAdmin(user);

  // Empêcher le scroll du body quand le menu est ouvert
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [menuOpen]);

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* BOUTON HAMBURGER */}
      <button
        onClick={() => setMenuOpen(true)}
        className="fixed top-5 left-5 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        style={{ 
          position: 'fixed', 
          top: '20px', 
          left: '20px', 
          zIndex: 999998,
          width: '56px',
          height: '56px'
        }}
      >
        <Menu className="w-6 h-6 text-white" />
      </button>

      {/* MENU PORTAL */}
      <HamburgerMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        user={user}
        userIsAdmin={userIsAdmin}
        location={location}
        navigate={navigate}
      />

      {/* CONTENU */}
      <main className="min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default Layout;
