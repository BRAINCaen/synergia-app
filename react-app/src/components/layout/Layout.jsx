// ==========================================
// 📁 react-app/src/components/layout/Layout.jsx
// DESKTOP FORCÉ - CSS INLINE TOTAL
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

  // Détection de la taille d'écran
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  React.useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isDesktop = windowWidth >= 1024; // lg breakpoint
  const isMobile = windowWidth < 1024;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      display: 'flex'
    }}>
      
      {/* ✅ SIDEBAR DESKTOP - FORCÉE AVEC CSS INLINE */}
      {isDesktop && (
        <div style={{
          display: 'flex',
          width: '256px', // w-64
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          backgroundColor: '#111827', // bg-gray-900
          zIndex: 30,
          border: '3px solid #ef4444' // Bordure rouge pour debug
        }}>
          
          {/* Header Desktop */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            height: '64px',
            padding: '0 16px',
            backgroundColor: '#374151' // bg-gray-800
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
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
                  🖥️ DESKTOP SYNERGIA
                </span>
                {userIsAdmin && (
                  <span style={{ color: '#f87171', fontSize: '10px', marginLeft: '8px' }}>
                    ADMIN
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Profile Desktop */}
          <div style={{
            padding: '16px',
            backgroundColor: '#374151',
            borderBottom: '1px solid #4b5563'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
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
              <div style={{ flex: '1 1 0%', minWidth: 0 }}>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ffffff',
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
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

          {/* Navigation Desktop */}
          <nav style={{
            flex: '1 1 0%',
            padding: '16px 12px',
            overflowY: 'auto'
          }}>
            {allSections.map((section, sectionIndex) => (
              <div key={sectionIndex} style={{ marginBottom: '24px' }}>
                <h3 style={{
                  padding: '0 12px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '12px',
                  margin: '0 0 12px 0'
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
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '8px 12px',
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

          {/* Déconnexion Desktop */}
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
                padding: '8px',
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

      {/* ✅ SIDEBAR MOBILE - SEULEMENT SUR MOBILE */}
      {isMobile && sidebarOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999999,
          pointerEvents: 'auto'
        }}>
          {/* Overlay Mobile */}
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
          
          {/* Menu Sidebar Mobile */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '300px',
            height: '100vh',
            backgroundColor: '#1f2937',
            zIndex: 999999,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            overflow: 'auto',
            border: '3px solid #10b981'
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
                  ⚡
                </div>
                <div>
                  <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '18px' }}>
                    📱 MOBILE MENU
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
                  backgroundColor: '#ef4444',
                  border: 'none',
                  color: '#ffffff',
                  padding: '10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}
              >
                ✕
              </button>
            </div>

            {/* Navigation Mobile - Identique à Desktop */}
            <nav style={{
              flex: '1 1 0%',
              padding: '20px',
              overflow: 'auto'
            }}>
              {allSections.map((section, sectionIndex) => (
                <div key={sectionIndex} style={{ marginBottom: '25px' }}>
                  <h3 style={{
                    color: '#10b981',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    margin: '0 0 15px 0',
                    borderBottom: '2px solid #10b981',
                    paddingBottom: '5px'
                  }}>
                    📂 {section.title}
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
                          onClick={() => setSidebarOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '15px 10px',
                            margin: '5px 0',
                            borderRadius: '10px',
                            textDecoration: 'none',
                            fontSize: '16px',
                            fontWeight: '500',
                            transition: '0.3s',
                            backgroundColor: active 
                              ? (isAdminItem ? '#dc2626' : '#2563eb')
                              : 'rgba(16, 185, 129, 0.1)',
                            color: active
                              ? '#ffffff'
                              : (isAdminItem ? '#fca5a5' : '#ffffff'),
                            border: active ? '2px solid #10b981' : '1px solid #374151'
                          }}
                        >
                          <Icon style={{
                            width: '20px',
                            height: '20px',
                            marginRight: '12px',
                            color: active
                              ? '#ffffff'
                              : (isAdminItem ? '#f87171' : '#10b981')
                          }} />
                          <span style={{ flex: '1 1 0%' }}>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Déconnexion Mobile */}
            <div style={{
              padding: '20px',
              borderTop: '2px solid #10b981',
              backgroundColor: '#374151',
              flexShrink: 0
            }}>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '15px',
                  backgroundColor: '#dc2626',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: '0.2s'
                }}
              >
                <LogOut style={{
                  width: '20px',
                  height: '20px',
                  marginRight: '10px'
                }} />
                <span>🚪 DÉCONNEXION</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ CONTENU PRINCIPAL */}
      <div style={{
        flex: '1 1 0%',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        marginLeft: isDesktop ? '256px' : 0, // Marge pour sidebar desktop
        position: 'relative'
      }}>
        
        {/* HEADER MOBILE SEULEMENT */}
        {isMobile && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e5e7eb',
            position: 'sticky',
            top: 0,
            zIndex: 30
          }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                padding: '12px',
                backgroundColor: '#10b981',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
              aria-label="Ouvrir le menu"
            >
              📱 MENU
            </button>
            <h1 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#111827',
              display: 'flex',
              alignItems: 'center',
              margin: 0
            }}>
              Synergia
              {userIsAdmin && (
                <span style={{
                  color: '#ef4444',
                  fontSize: '14px',
                  marginLeft: '8px'
                }}>
                  ADMIN
                </span>
              )}
            </h1>
            <div style={{ width: '40px' }} />
          </div>
        )}

        {/* CONTENU DES PAGES */}
        <main style={{
          flex: '1 1 0%',
          overflow: 'auto'
        }}>
          {children}
        </main>
      </div>
      
      {/* DEBUG ULTRA VISIBLE */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: isDesktop ? '#3b82f6' : (sidebarOpen ? '#10b981' : '#ef4444'),
        color: '#ffffff',
        padding: '12px 16px',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: 'bold',
        zIndex: 1000000,
        border: '2px solid #ffffff',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)'
      }}>
        {isDesktop ? '🖥️ DESKTOP' : `📱 MOBILE: ${sidebarOpen ? 'OUVERT' : 'FERMÉ'}`}
        <br />
        Largeur: {windowWidth}px
      </div>
    </div>
  );
};

export default Layout;
