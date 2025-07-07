// ==========================================
// 📁 react-app/src/layouts/DashboardLayout.jsx
// VERSION MINIMAL SANS FRAMER-MOTION - Résout l'erreur "Ql constructor"
// ==========================================

import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../shared/stores/authStore.js';

/**
 * 🎨 DASHBOARD LAYOUT MINIMAL - Sans animations
 */
const DashboardLayout = () => {
  const { user, signOut } = useAuthStore();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Navigation items
  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { name: 'Tâches', href: '/tasks', icon: '✅' },
    { name: 'Projets', href: '/projects', icon: '📁' },
    { name: 'Analytics', href: '/analytics', icon: '📊' },
    { name: 'Gamification', href: '/gamification', icon: '🎮' },
    { name: 'Récompenses', href: '/rewards', icon: '🎁' },
    { name: 'Utilisateurs', href: '/users', icon: '👥' },
    { name: 'Intégration', href: '/onboarding', icon: '🎯' },
    { name: 'Time Track', href: '/timetrack', icon: '⏰' },
    { name: 'Mon Profil', href: '/profile', icon: '👤' },
    { name: 'Paramètres', href: '/settings', icon: '⚙️' }
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      
      {/* SIDEBAR MINIMAL */}
      <div style={{
        width: sidebarCollapsed ? '80px' : '280px',
        backgroundColor: 'white',
        borderRight: '1px solid #e5e7eb',
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* Header Sidebar */}
        <div style={{
          padding: '1rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🚀</span>
            {!sidebarCollapsed && (
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937' }}>
                Synergia
              </span>
            )}
          </div>
          
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              padding: '0.5rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '1rem 0' }}>
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href;
            
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
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  color: isActive ? '#3b82f6' : '#6b7280',
                  backgroundColor: isActive ? '#eff6ff' : 'transparent',
                  fontWeight: isActive ? '600' : '400',
                  transition: 'all 0.2s ease',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.target.style.backgroundColor = '#f3f4f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                {!sidebarCollapsed && (
                  <span style={{ fontSize: '0.875rem' }}>{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div style={{
          padding: '1rem',
          borderTop: '1px solid #e5e7eb'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}>
              {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            
            {!sidebarCollapsed && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {user?.displayName || 'Utilisateur'}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {user?.email}
                </div>
              </div>
            )}
            
            {!sidebarCollapsed && (
              <button
                onClick={handleSignOut}
                style={{
                  padding: '0.5rem',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.75rem'
                }}
                title="Déconnexion"
              >
                🚪
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CONTENU PRINCIPAL */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <header style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '1rem 2rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: '0 0 0.25rem 0'
              }}>
                {getPageTitle(location.pathname)}
              </h1>
              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                margin: 0
              }}>
                {getPageDescription(location.pathname)}
              </p>
            </div>
            
            <div style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#f3f4f6',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              color: '#374151'
            }}>
              🟢 En ligne
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main style={{
          flex: 1,
          padding: '2rem',
          overflow: 'auto'
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Fonction pour obtenir le titre de la page
const getPageTitle = (pathname) => {
  const titles = {
    '/dashboard': 'Dashboard',
    '/tasks': 'Tâches',
    '/projects': 'Projets',
    '/analytics': 'Analytics',
    '/gamification': 'Gamification',
    '/rewards': 'Récompenses',
    '/users': 'Utilisateurs',
    '/onboarding': 'Intégration',
    '/timetrack': 'Time Tracking',
    '/profile': 'Mon Profil',
    '/settings': 'Paramètres'
  };
  return titles[pathname] || 'Synergia';
};

// Fonction pour obtenir la description de la page
const getPageDescription = (pathname) => {
  const descriptions = {
    '/dashboard': 'Vue d\'ensemble de votre activité',
    '/tasks': 'Gérez vos tâches et objectifs',
    '/projects': 'Collaborez sur vos projets',
    '/analytics': 'Analysez vos performances',
    '/gamification': 'Badges, XP et progression',
    '/rewards': 'Vos récompenses et achievements',
    '/users': 'Équipe et classements',
    '/onboarding': 'Parcours d\'intégration gamifié',
    '/timetrack': 'Suivi du temps de travail',
    '/profile': 'Gérez votre profil utilisateur',
    '/settings': 'Configuration de l\'application'
  };
  return descriptions[pathname] || 'Application de gestion collaborative';
};

export default DashboardLayout;
