// ==========================================
// 📁 react-app/src/layouts/DashboardLayout.jsx
// RESTAURATION DU LAYOUT ORIGINAL - Version qui marche !
// ==========================================

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../shared/stores/authStore.js';
import { isAdmin } from '../core/services/adminService.js';

/**
 * 🎨 DASHBOARD LAYOUT ORIGINAL - Compatible avec children prop
 */
const DashboardLayout = ({ children }) => {
  const { user, signOut } = useAuthStore();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Navigation items avec les vraies routes
  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { name: 'Tâches', href: '/tasks', icon: '✅' },
    { name: 'Projets', href: '/projects', icon: '📁' },
    { name: 'Analytics', href: '/analytics', icon: '📊' },
    { name: 'Gamification', href: '/gamification', icon: '🎮' },
    { name: 'Badges', href: '/badges', icon: '🏆' },
    { name: 'Classement', href: '/leaderboard', icon: '🥇' },
    { name: 'Récompenses', href: '/rewards', icon: '🎁' },
    { name: 'Équipe', href: '/team', icon: '👥' },
    { name: 'Utilisateurs', href: '/users', icon: '👤' },
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
          justifyContent: sidebarCollapsed ? 'center' : 'space-between',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>👑</span>
            {!sidebarCollapsed && (
              <div>
                <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                  Synergia
                </span>
                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                  v3.5 {isAdmin(user) && '• Admin'}
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              padding: '0.5rem',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '1rem',
              color: 'white'
            }}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* User Info */}
        {!sidebarCollapsed && user && (
          <div style={{
            padding: '1rem',
            borderBottom: '1px solid #e5e7eb',
            background: '#f8fafc'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold'
              }}>
                {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ 
                  fontWeight: '600', 
                  color: '#1f2937',
                  fontSize: '0.875rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {user.displayName || user.email}
                </div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#6b7280'
                }}>
                  {isAdmin(user) ? '👑 Administrateur' : '👤 Utilisateur'}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Navigation */}
        <nav style={{ 
          flex: 1, 
          padding: '1rem 0',
          overflowY: 'auto'
        }}>
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
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  color: isActive ? '#667eea' : '#4b5563',
                  backgroundColor: isActive ? '#f0f4ff' : 'transparent',
                  borderLeft: isActive ? '3px solid #667eea' : '3px solid transparent',
                  transition: 'all 0.2s ease',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? '600' : '500',
                  ...(isAdminRoute && {
                    background: isActive ? 'linear-gradient(135deg, #fef3c7, #fde68a)' : '#fff7ed',
                    border: '1px solid #f59e0b20'
                  })
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.target.style.backgroundColor = '#f8fafc';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{ 
                  fontSize: '1.25rem',
                  minWidth: '24px',
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
                {isActive && !sidebarCollapsed && (
                  <span style={{ 
                    marginLeft: 'auto',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#667eea'
                  }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div style={{ 
          padding: '1rem',
          borderTop: '1px solid #e5e7eb'
        }}>
          <button
            onClick={handleSignOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              width: '100%',
              padding: '0.75rem',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
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
        
        {/* TOP HEADER */}
        <header style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '1rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <div>
            <h1 style={{ 
              fontSize: '1.875rem', 
              fontWeight: 'bold', 
              color: '#1f2937',
              margin: 0,
              marginBottom: '0.25rem'
            }}>
              {getPageTitle(location.pathname)}
            </h1>
            <p style={{ 
              color: '#6b7280', 
              margin: 0,
              fontSize: '0.875rem'
            }}>
              {getPageDescription(location.pathname)}
            </p>
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem' 
          }}>
            {isAdmin(user) && (
              <div style={{
                padding: '0.5rem 1rem',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white',
                borderRadius: '0.5rem',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                👑 Admin
              </div>
            )}
            <div style={{ 
              color: '#6b7280', 
              fontSize: '0.875rem' 
            }}>
              {new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main style={{
          flex: 1,
          padding: '2rem',
          overflow: 'auto',
          backgroundColor: '#f9fafb'
        }}>
          {children}
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
    '/badges': 'Badges',
    '/leaderboard': 'Classement',
    '/rewards': 'Récompenses',
    '/team': 'Équipe',
    '/users': 'Utilisateurs',
    '/onboarding': 'Intégration',
    '/timetrack': 'Time Tracking',
    '/profile': 'Mon Profil',
    '/settings': 'Paramètres',
    '/admin/task-validation': 'Validation des Tâches',
    '/admin/profile-test': 'Test Profil Admin',
    '/admin/complete-test': 'Test Complet Admin'
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
    '/badges': 'Galerie de vos badges',
    '/leaderboard': 'Classement et compétition',
    '/rewards': 'Vos récompenses et achievements',
    '/team': 'Gérez votre équipe',
    '/users': 'Gestion des utilisateurs',
    '/onboarding': 'Parcours d\'intégration gamifié',
    '/timetrack': 'Suivi du temps de travail',
    '/profile': 'Gérez votre profil utilisateur',
    '/settings': 'Configuration de l\'application',
    '/admin/task-validation': 'Examinez et validez les soumissions d\'équipe',
    '/admin/profile-test': 'Tests et diagnostics des profils',
    '/admin/complete-test': 'Tests complets du système'
  };
  return descriptions[pathname] || 'Application de gestion collaborative';
};

export default DashboardLayout;
