// ==========================================
// 📁 react-app/src/layouts/DashboardLayout.jsx
// DASHBOARD LAYOUT ORIGINAL - INTERFACE SOMBRE AVEC SIDEBAR
// ==========================================

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../shared/stores/authStore.js';
import { isAdmin } from '../core/services/adminService.js';

/**
 * 🎨 DASHBOARD LAYOUT ORIGINAL - Interface sombre avec sidebar comme dans les captures
 */
const DashboardLayout = ({ children }) => {
  const { user, signOut } = useAuthStore();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Navigation complète comme dans les captures
  const navigationSections = [
    {
      title: 'PRINCIPAL',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
        { name: 'Tâches', href: '/tasks', icon: '📋' },
        { name: 'Projets', href: '/projects', icon: '📁' },
        { name: 'Analytics', href: '/analytics', icon: '📊' }
      ]
    },
    {
      title: 'GAMIFICATION',
      items: [
        { name: 'Gamification', href: '/gamification', icon: '🎮' },
        { name: 'Badges', href: '/badges', icon: '🏆' },
        { name: 'Classement', href: '/leaderboard', icon: '🥇' },
        { name: 'Récompenses', href: '/rewards', icon: '🎁' }
      ]
    },
    {
      title: 'PROGRESSION',
      items: [
        { name: 'Progression Roles', href: '/progression', icon: '🎯' },
        { name: 'Tâches par Rôle', href: '/role/tasks', icon: '📝' },
        { name: 'Badges Rôles', href: '/role/badges', icon: '🏅' },
        { name: 'Escape Progression', href: '/escape-progression', icon: '🚀' }
      ]
    },
    {
      title: 'ÉQUIPE & SOCIAL',
      items: [
        { name: 'Équipe', href: '/team', icon: '👥' },
        { name: 'Utilisateurs', href: '/users', icon: '👤' }
      ]
    },
    {
      title: 'OUTILS',
      items: [
        { name: 'Onboarding', href: '/onboarding', icon: '🎯' },
        { name: 'Pointeuse', href: '/timetrack', icon: '⏰' },
        { name: 'Profil', href: '/profile', icon: '🧑‍💼' },
        { name: 'Paramètres', href: '/settings', icon: '⚙️' }
      ]
    }
  ];

  // Routes admin comme dans les captures
  const adminSection = {
    title: 'ADMINISTRATION',
    items: [
      { name: 'Dashboard Tuteur', href: '/admin/dashboard', icon: '🛡️' },
      { name: 'Validation Tâches', href: '/admin/task-validation', icon: '✅' },
      { name: 'Test Complet', href: '/admin/complete-test', icon: '🧪' },
      { name: 'Permissions Roles', href: '/admin/permissions', icon: '🔐' },
      { name: 'Gestion Récompenses', href: '/admin/rewards', icon: '🎁' },
      { name: 'Gestion Badges', href: '/admin/badges', icon: '🏆' },
      { name: 'Gestion Utilisateurs', href: '/admin/users', icon: '👥' },
      { name: 'Analytics Admin', href: '/admin/analytics', icon: '📊' },
      { name: 'Paramètres Admin', href: '/admin/settings', icon: '⚙️' }
    ]
  };

  // Fusionner selon les permissions
  const allSections = isAdmin(user) 
    ? [...navigationSections, adminSection]
    : navigationSections;

  const handleSignOut = async () => {
    try {
      await signOut();
      console.log('✅ Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: '#1f2937' // Background sombre global
    }}>
      
      {/* SIDEBAR SOMBRE - Comme dans les captures */}
      <div style={{
        width: sidebarCollapsed ? '80px' : '280px',
        backgroundColor: '#111827', // Sidebar très sombre
        borderRight: '1px solid #374151',
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '4px 0 15px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        zIndex: 10
      }}>
        
        {/* Header Sidebar avec logo Synergia */}
        <div style={{
          padding: '1.5rem 1rem',
          borderBottom: '1px solid #374151',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'space-between',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', // Gradient violet
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px'
            }}>
              S
            </div>
            {!sidebarCollapsed && (
              <div>
                <div style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 'bold',
                  letterSpacing: '-0.025em'
                }}>
                  Synergia
                </div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  opacity: 0.8,
                  fontWeight: '400'
                }}>
                  v3.5 • {isAdmin(user) ? 'Admin' : 'Utilisateur'}
                </div>
              </div>
            )}
          </div>
          
          {!sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{
                padding: '6px',
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                color: 'white',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.25)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.15)';
              }}
            >
              ←
            </button>
          )}
        </div>

        {/* User Profile Section */}
        {!sidebarCollapsed && user && (
          <div style={{
            padding: '1rem',
            borderBottom: '1px solid #374151',
            backgroundColor: '#1f2937'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '14px'
              }}>
                {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '600', 
                  color: '#f9fafb',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {user.displayName || user.email?.split('@')[0] || 'Utilisateur'}
                </div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#9ca3af',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {user.email}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation par sections */}
        <nav style={{ 
          flex: 1, 
          padding: '0.5rem 0',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
          {allSections.map((section, sectionIndex) => (
            <div key={section.title} style={{ marginBottom: '1.5rem' }}>
              {/* Section Title */}
              {!sidebarCollapsed && (
                <div style={{
                  padding: '0 1rem 0.5rem 1rem',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#6b7280',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}>
                  {section.title}
                </div>
              )}

              {/* Section Items */}
              {section.items.map((item) => {
                const isActive = location.pathname === item.href;
                const isAdminRoute = item.href.startsWith('/admin/');
                
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: sidebarCollapsed ? 0 : '0.75rem',
                      padding: sidebarCollapsed ? '0.75rem' : '0.75rem 1rem',
                      margin: '0 0.5rem 0.25rem 0.5rem',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: isActive ? '#ffffff' : '#d1d5db',
                      backgroundColor: isActive 
                        ? (isAdminRoute ? '#dc2626' : '#6366f1')
                        : 'transparent',
                      transition: 'all 0.2s ease',
                      fontSize: '0.875rem',
                      fontWeight: isActive ? '600' : '500',
                      position: 'relative',
                      ...(isActive && {
                        boxShadow: isAdminRoute 
                          ? '0 4px 12px rgba(220, 38, 38, 0.3)'
                          : '0 4px 12px rgba(99, 102, 241, 0.3)'
                      })
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.target.style.backgroundColor = '#374151';
                        e.target.style.color = '#ffffff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = '#d1d5db';
                      }
                    }}
                  >
                    <span style={{ 
                      fontSize: '1.1rem',
                      minWidth: '20px',
                      textAlign: 'center'
                    }}>
                      {item.icon}
                    </span>
                    {!sidebarCollapsed && (
                      <span style={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {item.name}
                      </span>
                    )}
                    
                    {/* Indicateur actif */}
                    {isActive && (
                      <div style={{
                        position: 'absolute',
                        right: '8px',
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#ffffff'
                      }} />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Puck Time section en bas */}
        <div style={{
          padding: '1rem',
          borderTop: '1px solid #374151',
          backgroundColor: '#111827'
        }}>
          {!sidebarCollapsed && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#6366f1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px'
              }}>
                ⏰
              </div>
              <div>
                <div style={{ 
                  fontSize: '0.875rem', 
                  color: '#f9fafb',
                  fontWeight: '600'
                }}>
                  Puck Time
                </div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#9ca3af'
                }}>
                  alanboehmec1@gmail.com
                </div>
              </div>
            </div>
          )}

          {/* Bouton Déconnexion - ROUGE */}
          <button
            onClick={handleSignOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              width: '100%',
              padding: sidebarCollapsed ? '0.75rem' : '0.75rem 1rem',
              background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #b91c1c, #991b1b)';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #dc2626, #b91c1c)';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>🚪</span>
            {!sidebarCollapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </div>

      {/* CONTENU PRINCIPAL avec header violet */}
      <div style={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#1f2937',
        minHeight: '100vh'
      }}>
        
        {/* Header principal avec fond violet gradiant */}
        <header style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
          padding: '1.5rem 2rem',
          borderBottom: '1px solid #374151',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: 'white',
                margin: 0,
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
              }}>
                {location.pathname === '/dashboard' ? 'Dashboard' :
                 location.pathname === '/gamification' ? 'Gamification' :
                 location.pathname === '/tasks' ? 'Système de Volontaires Synergia' :
                 location.pathname === '/onboarding' ? 'Planifier un entretien' :
                 location.pathname.includes('/role/tasks') ? 'Rôles par Utilisateur' :
                 'Synergia'}
              </h1>
              <p style={{
                fontSize: '1rem',
                color: 'rgba(255, 255, 255, 0.8)',
                margin: '0.25rem 0 0 0'
              }}>
                {location.pathname === '/dashboard' ? 'Vue d\'ensemble de votre activité' :
                 location.pathname === '/gamification' ? 'Suivez votre progression et débloquez des récompenses' :
                 location.pathname === '/tasks' ? 'Participez aux tâches collaboratives et gagnez de l\'XP !' :
                 location.pathname === '/onboarding' ? 'Planifier un entretien' :
                 location.pathname.includes('/role/tasks') ? 'Gestion des rôles et tâches par utilisateur' :
                 'Plateforme de gestion collaborative'}
              </p>
            </div>

            {/* Actions header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '0.875rem',
                textAlign: 'right'
              }}>
                <div style={{ fontWeight: '600' }}>
                  Salut, Utilisateur !
                </div>
                <div style={{ opacity: 0.8 }}>
                  vendredi 1 août 2025 • 20:15
                </div>
              </div>
              
              <div style={{
                width: '2px',
                height: '32px',
                backgroundColor: 'rgba(255, 255, 255, 0.3)'
              }} />
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '0.875rem'
              }}>
                <span>⭐</span>
                <span style={{ fontWeight: '600' }}>Niveau 1</span>
              </div>
            </div>
          </div>
        </header>

        {/* Zone de contenu principal */}
        <main style={{
          flex: 1,
          backgroundColor: '#1f2937',
          padding: 0,
          overflow: 'auto'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
