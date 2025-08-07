// ==========================================
// 📁 react-app/src/components/layout/Layout.jsx
// LAYOUT FINAL AVEC MENU MOBILE FONCTIONNEL
// ==========================================

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  CheckSquare, 
  FolderOpen, 
  BarChart3, 
  Trophy, 
  Users, 
  Settings, 
  Menu, 
  X, 
  User, 
  LogOut,
  Target,
  Award,
  Flame,
  Clock,
  BookOpen,
  UserCheck,
  Shield,
  Crown,
  TestTube,
  Lock,
  Gift,
  PieChart,
  Gamepad2,
  GraduationCap,
  Activity,
  Calendar,
  Zap,
  Star
} from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';

/**
 * 🛡️ DÉTECTION ADMIN
 */
const isUserAdmin = (user) => {
  if (!user) return false;
  const adminEmails = ['alan.boehme61@gmail.com', 'tanguy.caron@gmail.com', 'admin@synergia.com'];
  return adminEmails.includes(user.email) || user.role === 'admin' || user.isAdmin === true;
};

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  
  // ÉTAT SIDEBAR COMPLÈTEMENT ISOLÉ
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // EMPÊCHER LA FERMETURE AUTOMATIQUE - Ne fermer QUE sur changement de page
  useEffect(() => {
    console.log('📍 Page changée vers:', location.pathname);
    // Délai pour éviter la fermeture immédiate
    const timer = setTimeout(() => {
      setSidebarOpen(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Mémoriser admin APRÈS l'état sidebar
  const userIsAdmin = React.useMemo(() => {
    const result = isUserAdmin(user);
    console.log('👤 Admin check (ne doit pas déclencher re-render):', result);
    return result;
  }, [user?.email]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
    }
  };

  // Navigation
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

  // Section admin
  const adminSection = {
    title: 'ADMINISTRATION',
    items: [
      { path: '/admin/task-validation', label: 'Validation Tâches', icon: Shield },
      { path: '/admin/complete-test', label: 'Test Admin', icon: TestTube },
      { path: '/admin/role-permissions', label: 'Permissions', icon: Lock },
      { path: '/admin/users', label: 'Admin Utilisateurs', icon: Crown },
      { path: '/admin/analytics', label: 'Admin Analytics', icon: PieChart },
      { path: '/admin/settings', label: 'Admin Config', icon: Settings }
    ]
  };

  const allSections = userIsAdmin ? [...navigationSections, adminSection] : navigationSections;
  const isActive = (path) => location.pathname === path;

  // Fonctions de contrôle STABLES
  const openSidebar = React.useCallback(() => {
    console.log('🔴 OUVERTURE sidebar - état actuel:', sidebarOpen);
    setSidebarOpen(true);
  }, []);

  const closeSidebar = React.useCallback(() => {
    console.log('🔴 FERMETURE sidebar - état actuel:', sidebarOpen);  
    setSidebarOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      
      {/* SIDEBAR DESKTOP */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-gray-900 z-30">
        {/* Header Sidebar Desktop */}
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

        {/* Info Utilisateur Desktop */}
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

      {/* CONTENU PRINCIPAL AVEC SIDEBAR MOBILE INTÉGRÉE */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64 relative">
        
        {/* OVERLAY MOBILE */}
        <div 
          className={`lg:hidden fixed inset-0 transition-opacity duration-300 z-40 ${
            sidebarOpen ? 'bg-black bg-opacity-50 pointer-events-auto' : 'bg-opacity-0 pointer-events-none'
          }`}
          onClick={closeSidebar}
        />

        {/* SIDEBAR MOBILE - VERSION FINALE FONCTIONNELLE */}
        {sidebarOpen && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '280px',
              height: '100vh',
              backgroundColor: '#1f2937',
              zIndex: 99999,
              display: 'block',
              visibility: 'visible',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Header */}
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
                  <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '18px' }}>Synergia</span>
                  {userIsAdmin && <span style={{ color: '#f87171', fontSize: '10px', marginLeft: '8px' }}>ADMIN</span>}
                </div>
              </div>
              <button 
                onClick={closeSidebar}
                style={{ 
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#9ca3af',
                  padding: '8px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#4b5563';
                  e.target.style.color = '#ffffff';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#9ca3af';
                }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            {/* Info Utilisateur */}
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
                  {user?.email?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p style={{ 
                    color: '#ffffff', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '180px'
                  }}>
                    {user?.displayName || user?.email || 'Utilisateur'}
                  </p>
                  <p style={{ 
                    color: '#9ca3af', 
                    fontSize: '12px', 
                    margin: 0 
                  }}>
                    {userIsAdmin ? 'Administrateur' : 'Membre'}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div style={{ 
              flex: 1, 
              padding: '16px 12px',
              overflow: 'auto',
              height: 'calc(100vh - 200px)'
            }}>
              {allSections.map((section, sectionIndex) => (
                <div key={sectionIndex} style={{ marginBottom: '24px' }}>
                  <h3 style={{
                    color: '#9ca3af',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: '0 0 12px 12px'
                  }}>
                    {section.title}
                  </h3>
                  <div>
                    {section.items.map((item, itemIndex) => {
                      const Icon = item.icon;
                      const active = isActive(item.path);
                      const isAdminItem = section.title === 'ADMINISTRATION';

                      return (
                        <Link
                          key={itemIndex}
                          to={item.path}
                          onClick={() => {
                            console.log('🔴 Navigation vers:', item.label, '- ne PAS fermer immédiatement');
                            // Navigation sans fermeture immédiate - laisser le useEffect de location.pathname s'en charger
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '10px 12px',
                            margin: '2px 0',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease',
                            backgroundColor: active 
                              ? (isAdminItem ? '#7f1d1d' : '#1e3a8a')
                              : 'transparent',
                            color: active 
                              ? '#ffffff'
                              : (isAdminItem ? '#fca5a5' : '#d1d5db')
                          }}
                          onMouseOver={(e) => {
                            if (!active) {
                              e.target.style.backgroundColor = isAdminItem ? '#991b1b' : '#374151';
                              e.target.style.color = '#ffffff';
                            }
                          }}
                          onMouseOut={(e) => {
                            if (!active) {
                              e.target.style.backgroundColor = 'transparent';
                              e.target.style.color = isAdminItem ? '#fca5a5' : '#d1d5db';
                            }
                          }}
                        >
                          <Icon style={{
                            width: '18px',
                            height: '18px',
                            marginRight: '12px',
                            color: active
                              ? (isAdminItem ? '#fca5a5' : '#93c5fd')
                              : (isAdminItem ? '#f87171' : '#9ca3af')
                          }} />
                          <span style={{ flex: 1 }}>{item.label}</span>
                          {isAdminItem && (
                            <Shield style={{
                              width: '14px',
                              height: '14px',
                              color: '#f87171',
                              marginLeft: '8px'
                            }} />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Déconnexion */}
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
                  padding: '10px 12px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#d1d5db',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#4b5563';
                  e.target.style.color = '#ffffff';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#d1d5db';
                }}
              >
                <LogOut style={{ 
                  width: '18px', 
                  height: '18px', 
                  marginRight: '12px',
                  color: '#9ca3af'
                }} />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        )}
        
        {/* Header Mobile */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-30">
          <button
            onClick={openSidebar}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 flex items-center">
            Synergia 
            {userIsAdmin && <span className="text-red-500 text-sm ml-2">ADMIN</span>}
          </h1>
          <div className="w-10"></div>
        </div>

        {/* Zone de contenu */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
