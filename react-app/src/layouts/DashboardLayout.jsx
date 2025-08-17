// ==========================================
// 📁 react-app/src/layouts/DashboardLayout.jsx
// DASHBOARD LAYOUT SANS BARRE DE NAVIGATION DU HAUT
// ==========================================

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../shared/stores/authStore.js';
import { isAdmin } from '../core/services/adminService.js';

/**
 * 🎨 DASHBOARD LAYOUT SANS TOP HEADER - Compatible avec children prop
 */
const DashboardLayout = ({ children }) => {
  const { user, signOut } = useAuthStore();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Navigation items avec les vraies routes - SANS DOUBLONS
  const navigationItems = [
    // 📋 SECTION PRINCIPALE
    { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { name: 'Tâches', href: '/tasks', icon: '✅' },
    { name: 'Projets', href: '/projects', icon: '📁' },
    { name: 'Analytics', href: '/analytics', icon: '📊' },
    
    // 🎮 SECTION GAMIFICATION
    { name: 'Gamification', href: '/gamification', icon: '🎮' },
    { name: 'Badges', href: '/badges', icon: '🏆' },
    { name: 'Classement', href: '/leaderboard', icon: '🥇' },
    { name: 'Récompenses', href: '/rewards', icon: '🎁' },
    
    // 👥 SECTION ÉQUIPE
    { name: 'Équipe', href: '/team', icon: '👥' },
    { name: 'Utilisateurs', href: '/users', icon: '👤' },
    
    // 🛠️ SECTION OUTILS
    { name: 'Intégration', href: '/onboarding', icon: '🎯' },
    { name: 'Time Track', href: '/timetrack', icon: '⏰' },
    { name: 'Mon Profil', href: '/profile', icon: '🧑‍💼' },
    { name: 'Paramètres', href: '/settings', icon: '⚙️' }
  ];

  // Routes admin conditionnelles
  const adminRoutes = [
    { name: 'Validation Tâches', href: '/admin/task-validation', icon: '🛡️' },
    { name: 'Test Profil', href: '/admin/profile-test', icon: '🧪' },
    { name: 'Test Complet', href: '/admin/complete-test', icon: '🔍' }
  ];

  // Fusionner les routes selon les permissions
  const allNavigationItems = isAdmin(user) 
    ? [...navigationItems, ...adminRoutes]
    : navigationItems;

  const handleSignOut = async () => {
    try {
      await signOut();
      console.log('✅ Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      
      {/* SIDEBAR */}
      <div style={{
        width: sidebarCollapsed ? '80px' : '280px',
        backgroundColor: 'white',
        borderRight: '1px solid #e5e7eb',
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        
        {/* Header Sidebar */}
        <div style={{
          padding: '1rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'space-between'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#3b82f6',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px'
            }}>
              ⚡
            </div>
            {!sidebarCollapsed && (
              <div>
                <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937' }}>
                  Synergia
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  v3.5
                </div>
              </div>
            )}
          </div>
          
          {!sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(true)}
              style={{
                padding: '0.5rem',
                color: '#6b7280',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f3f4f6';
                e.target.style.color = '#374151';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#6b7280';
              }}
            >
              ←
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '1rem 0' }}>
          {allNavigationItems.map((item) => {
            const isActive = location.pathname === item.href;
            const isAdminRoute = item.href.startsWith('/admin');
            
            return (
              <Link
                key={item.href}
                to={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: sidebarCollapsed ? '0.75rem' : '0.75rem 1rem',
                  margin: '0 0.5rem',
                  color: isActive ? '#1f2937' : '#6b7280',
                  backgroundColor: isActive ? '#f3f4f6' : 'transparent',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? '600' : '500',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.target.style.backgroundColor = '#f9fafb';
                    e.target.style.color = '#374151';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#6b7280';
                  }
                }}
              >
                <span style={{ 
                  fontSize: '1.125rem',
                  filter: isAdminRoute ? 'hue-rotate(45deg)' : 'none'
                }}>
                  {item.icon}
                </span>
                {!sidebarCollapsed && <span>{item.name}</span>}
                {isAdminRoute && !sidebarCollapsed && (
                  <span style={{
                    fontSize: '0.625rem',
                    backgroundColor: '#fef3c7',
                    color: '#d97706',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    marginLeft: 'auto'
                  }}>
                    ADMIN
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bouton Collapse en mode collapsed */}
        {sidebarCollapsed && (
          <div style={{ padding: '1rem' }}>
            <button
              onClick={() => setSidebarCollapsed(false)}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#f3f4f6',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1.125rem',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#f3f4f6';
              }}
            >
              →
            </button>
          </div>
        )}

        {/* User Section & Logout */}
        <div style={{
          borderTop: '1px solid #e5e7eb',
          padding: '1rem'
        }}>
          {/* User info - collapsed */}
          {sidebarCollapsed && user && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '0.75rem'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#ddd6fe',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#7c3aed'
              }}>
                {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
              </div>
            </div>
          )}

          {/* User info - expanded */}
          {!sidebarCollapsed && user && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.75rem',
              padding: '0.75rem',
              backgroundColor: '#f9fafb',
              borderRadius: '8px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#ddd6fe',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#7c3aed'
              }}>
                {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {user.displayName || 'Utilisateur'}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {user.email}
                </div>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleSignOut}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(107, 114, 128, 0.4)'; // Ombre grise
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>🚪</span>
            {!sidebarCollapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        
        {/* SUPPRESSION COMPLÈTE DU TOP HEADER - PLUS DE BARRE DU HAUT ! */}

        {/* PAGE CONTENT - MAINTENANT FULL SCREEN */}
        <main style={{ 
          flex: 1,
          overflow: 'auto',
          padding: '2rem',
          backgroundColor: '#f9fafb'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
