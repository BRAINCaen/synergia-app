// ==========================================
// 📁 react-app/src/components/layout/Layout.jsx
// FIX D'URGENCE - DESKTOP + MOBILE GARANTIS
// ==========================================

import React, { useState } from 'react';
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

  const navigationSections = [
    {
      title: 'PRINCIPAL',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: Home },
        { path: '/tasks', label: 'Tâches', icon: CheckSquare },
        { path: '/projects', label: 'Projets', icon: FolderOpen },
        { path: '/analytics', label: 'Analytics', icon: BarChart3 }
      ]
    },
    {
      title: 'GAMIFICATION',
      items: [
        { path: '/gamification', label: 'Gamification', icon: Gamepad2 },
        { path: '/badges', label: 'Badges', icon: Award },
        { path: '/leaderboard', label: 'Classement', icon: Trophy },
        { path: '/rewards', label: 'Récompenses', icon: Gift }
      ]
    },
    {
      title: 'ÉQUIPE & SOCIAL',
      items: [
        { path: '/team', label: 'Équipe', icon: Users },
        { path: '/users', label: 'Utilisateurs', icon: UserCheck }
      ]
    },
    {
      title: 'OUTILS',
      items: [
        { path: '/onboarding', label: 'Intégration', icon: BookOpen },
        { path: '/timetrack', label: 'Pointeuse', icon: Clock },
        { path: '/profile', label: 'Mon Profil', icon: User },
        { path: '/settings', label: 'Paramètres', icon: Settings }
      ]
    }
  ];

  const adminSection = userIsAdmin ? {
    title: 'ADMINISTRATION',
    items: [
      { path: '/admin/task-validation', label: 'Validation Tâches', icon: Shield },
      { path: '/admin/complete-test', label: 'Test Admin', icon: TestTube },
      { path: '/admin/role-permissions', label: 'Permissions', icon: Lock },
      { path: '/admin/users', label: 'Admin Utilisateurs', icon: Crown },
      { path: '/admin/analytics', label: 'Admin Analytics', icon: PieChart },
      { path: '/admin/settings', label: 'Admin Config', icon: Settings }
    ]
  } : null;

  const allSections = adminSection ? [...navigationSections, adminSection] : navigationSections;
  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      
      {/* ✅ SIDEBAR DESKTOP - CSS FORCÉ VISIBLE */}
      <div 
        className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-gray-900 z-30"
        style={{
          display: window.innerWidth >= 1024 ? 'flex' : 'none',
          width: '256px',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          backgroundColor: '#111827',
          zIndex: 30,
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
        }}
      >
        {/* Header Desktop */}
        <div className="flex items-center h-16 px-4 bg-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-white font-semibold">Synergia</span>
              {userIsAdmin && <span className="text-red-400 text-xs ml-2">ADMIN</span>}
            </div>
          </div>
        </div>

        {/* Profile Desktop */}
        <div className="p-4 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
              {user?.email?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.displayName || user?.email || 'Utilisateur'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {userIsAdmin ? 'Administrateur' : 'Membre'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Desktop */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {allSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6">
              <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  const isAdminItem = section.title === 'ADMINISTRATION';

                  return (
                    <Link
                      key={itemIndex}
                      to={item.path}
                      className={`
                        group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                        ${active
                          ? isAdminItem ? 'bg-red-900 text-red-100' : 'bg-blue-900 text-blue-100'
                          : isAdminItem ? 'text-red-300 hover:bg-red-900' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }
                      `}
                    >
                      <Icon className={`mr-3 w-5 h-5 ${
                        active
                          ? isAdminItem ? 'text-red-300' : 'text-blue-300'
                          : isAdminItem ? 'text-red-400' : 'text-gray-400'
                      }`} />
                      <span>{item.label}</span>
                      {isAdminItem && <Shield className="w-3 h-3 ml-auto text-red-400" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Déconnexion Desktop */}
        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
          >
            <LogOut className="mr-3 w-5 h-5 text-gray-400" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* ✅ OVERLAY MOBILE - SÉPARÉ ET FORCÉ */}
      {sidebarOpen && window.innerWidth < 1024 && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999998,
            pointerEvents: 'auto'
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ✅ SIDEBAR MOBILE - FORCÉE VISIBLE */}
      {sidebarOpen && window.innerWidth < 1024 && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '320px',
            height: '100vh',
            backgroundColor: '#111827',
            zIndex: 999999,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
            overflow: 'auto',
            transform: 'translateX(0)',
            transition: 'none'
          }}
        >
          {/* Header Mobile */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '64px',
            padding: '0 16px',
            backgroundColor: '#374151',
            borderBottom: '1px solid #4b5563'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Zap style={{ width: '20px', height: '20px', color: '#ffffff' }} />
              </div>
              <div>
                <span style={{ color: '#ffffff', fontWeight: '600', fontSize: '16px' }}>
                  📱 Synergia Mobile
                </span>
                {userIsAdmin && (
                  <span style={{ color: '#f87171', fontSize: '10px', marginLeft: '8px' }}>
                    ADMIN
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#9ca3af',
                padding: '8px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              <X style={{ width: '20px', height: '20px' }} />
            </button>
          </div>

          {/* Profile Mobile */}
          <div style={{
            padding: '16px',
            backgroundColor: '#374151',
            borderBottom: '1px solid #4b5563'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                {user?.email?.[0]?.toUpperCase() || 'A'}
              </div>
              <div>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ffffff',
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '200px'
                }}>
                  {user?.displayName || user?.email || 'Utilisateur'}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#9ca3af',
                  margin: 0
                }}>
                  {userIsAdmin ? 'Administrateur' : 'Membre'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Mobile */}
          <nav style={{
            flex: '1 1 0%',
            padding: '16px 12px',
            overflow: 'auto'
          }}>
            {allSections.map((section, sectionIndex) => (
              <div key={sectionIndex} style={{ marginBottom: '24px' }}>
                <h3 style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  margin: '0 0 12px 12px'
                }}>
                  {section.title}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {section.items.map((item, itemIndex) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    const isAdminItem = section.title === 'ADMINISTRATION';

                    return (
                      <Link
                        key={itemIndex}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '12px',
                          fontSize: '14px',
                          fontWeight: '500',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          transition: 'all 0.2s',
                          backgroundColor: active
                            ? (isAdminItem ? '#7c2d12' : '#1e3a8a')
                            : 'transparent',
                          color: active
                            ? (isAdminItem ? '#fef2f2' : '#dbeafe')
                            : (isAdminItem ? '#fca5a5' : '#d1d5db')
                        }}
                      >
                        <Icon style={{
                          marginRight: '12px',
                          width: '20px',
                          height: '20px',
                          color: active
                            ? (isAdminItem ? '#fca5a5' : '#93c5fd')
                            : (isAdminItem ? '#f87171' : '#9ca3af')
                        }} />
                        <span>{item.label}</span>
                        {isAdminItem && (
                          <Shield style={{
                            width: '12px',
                            height: '12px',
                            marginLeft: 'auto',
                            color: '#f87171'
                          }} />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Déconnexion Mobile */}
          <div style={{
            padding: '16px',
            borderTop: '1px solid #4b5563',
            backgroundColor: '#374151'
          }}>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                padding: '12px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#d1d5db',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: '0.2s'
              }}
            >
              <LogOut style={{
                marginRight: '12px',
                width: '20px',
                height: '20px',
                color: '#9ca3af'
              }} />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      )}

      {/* ✅ CONTENU PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64 relative">
        
        {/* HEADER MOBILE */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 flex items-center">
            Synergia
            {userIsAdmin && <span className="text-red-500 text-sm ml-2">ADMIN</span>}
          </h1>
          <div className="w-10" />
        </div>

        {/* CONTENU DES PAGES */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
      
      {/* DEBUG TOTAL */}
      <div 
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#1f2937',
          color: '#ffffff',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '12px',
          zIndex: 1000000,
          border: '2px solid #ef4444'
        }}
      >
        <div>📏 Largeur: {window.innerWidth}px</div>
        <div>🖥️ Desktop: {window.innerWidth >= 1024 ? 'OUI' : 'NON'}</div>
        <div>📱 Mobile: {window.innerWidth < 1024 ? 'OUI' : 'NON'}</div>
        <div>🎯 Menu Mobile: {sidebarOpen ? 'OUVERT' : 'FERMÉ'}</div>
      </div>
    </div>
  );
};

export default Layout;
