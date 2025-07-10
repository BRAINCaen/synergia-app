// ==========================================
// 📁 react-app/src/layouts/DashboardLayout.jsx
// DASHBOARD LAYOUT CORRIGÉ - Compatible avec Outlet + children
// ==========================================

import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../shared/stores/authStore.js';

// Service admin simple
const isAdmin = (user) => {
  return user?.role === 'admin' || user?.email?.includes('admin') || user?.isAdmin === true;
};

/**
 * 🎨 DASHBOARD LAYOUT CORRIGÉ - Compatible avec React Router v6
 */
const DashboardLayout = () => {
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
        width: sidebarCollapsed ? '64px' : '280px',
        backgroundColor: '#1f2937',
        color: 'white',
        padding: '1rem',
        transition: 'width 0.3s ease',
        overflowY: 'auto',
        boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
      }}>
        
        {/* Header Sidebar */}
        <div style={{ 
          marginBottom: '2rem',
          textAlign: sidebarCollapsed ? 'center' : 'left'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 'bold'
            }}>
              S
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 'bold', 
                  margin: 0 
                }}>
                  Synergia
                </h1>
                <p style={{ 
                  fontSize: '0.75rem', 
                  color: '#9ca3af', 
                  margin: 0 
                }}>
                  v3.5 Stable
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={{
            width: '100%',
            padding: '0.5rem',
            marginBottom: '1rem',
            backgroundColor: '#374151',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5563'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#374151'}
        >
          {sidebarCollapsed ? '→' : '← Réduire'}
        </button>

        {/* Navigation */}
        <nav style={{ space: '0.5rem' }}>
          {allNavigationItems.map((item) => {
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.href}
                to={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  margin: '0.25rem 0',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: isActive ? '#ffffff' : '#d1d5db',
                  backgroundColor: isActive ? '#3b82f6' : 'transparent',
                  fontWeight: isActive ? '600' : '500',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.target.style.backgroundColor = '#374151';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>
                  {item.icon}
                </span>
                {!sidebarCollapsed && (
                  <span>{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Profil utilisateur en bas */}
        <div style={{ 
          marginTop: 'auto', 
          paddingTop: '2rem',
          borderTop: '1px solid #374151'
        }}>
          {!sidebarCollapsed && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                padding: '0.75rem',
                backgroundColor: '#374151',
                borderRadius: '8px'
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  color: 'white'
                }}>
                  {user?.email?.[0]?.toUpperCase() || '?'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '600', 
                    margin: 0,
                    color: 'white',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap'
                  }}>
                    {user?.displayName || 'Utilisateur'}
                  </p>
                  <p style={{ 
                    fontSize: '0.75rem', 
                    color: '#9ca3af', 
                    margin: 0,
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap'
                  }}>
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <button
            onClick={handleSignOut}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#dc2626',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              gap: '0.5rem',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
          >
            <span>🚪</span>
            {!sidebarCollapsed && 'Déconnexion'}
          </button>
        </div>
      </div>

      {/* CONTENU PRINCIPAL */}
      <div style={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh'
      }}>
        
        {/* Header principal */}
        <header style={{
          backgroundColor: 'white',
          padding: '1rem 2rem',
          borderBottom: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h1 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                margin: 0, 
                color: '#1f2937' 
              }}>
                {/* Titre dynamique basé sur la route */}
                {navigationItems.find(item => item.href === location.pathname)?.name || 'Dashboard'}
              </h1>
              <p style={{ 
                fontSize: '0.875rem', 
                color: '#6b7280', 
                margin: '0.25rem 0 0 0' 
              }}>
                Bienvenue dans votre espace de travail collaboratif
              </p>
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem' 
            }}>
              {/* Indicateur de statut */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#f0fdf4',
                border: '1px solid #22c55e',
                borderRadius: '6px',
                fontSize: '0.875rem',
                color: '#15803d'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#22c55e'
                }}></div>
                En ligne
              </div>
              
              {/* Badge admin */}
              {isAdmin(user) && (
                <div style={{
                  padding: '0.25rem 0.75rem',
                  backgroundColor: '#fef3c7',
                  border: '1px solid #f59e0b',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#92400e'
                }}>
                  ADMIN
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Contenu de la page */}
        <main style={{ 
          flex: 1,
          backgroundColor: '#f9fafb',
          overflow: 'auto'
        }}>
          {/* 🔧 CORRECTION CRITIQUE : Utiliser Outlet au lieu de children */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
