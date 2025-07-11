// ==========================================
// 📁 react-app/src/layouts/DashboardLayout.jsx
// DASHBOARDLAYOUT CORRIGÉ - BOUTON DÉCONNEXION GRIS
// ==========================================

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../shared/stores/authStore.js';
import { isAdmin } from '../core/services/adminService.js';

/**
 * 🎨 DASHBOARD LAYOUT CORRIGÉ - Sans bouton rouge
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

  // Fonction pour obtenir le titre de la page
  const getPageTitle = (pathname) => {
    const item = allNavigationItems.find(item => item.href === pathname);
    return item ? item.name : 'Synergia';
  };

  // Fonction pour obtenir la description de la page
  const getPageDescription = (pathname) => {
    const descriptions = {
      '/dashboard': 'Vue d\'ensemble de votre activité',
      '/tasks': 'Gérez vos tâches et projets',
      '/projects': 'Suivez l\'avancement de vos projets',
      '/analytics': 'Analysez vos performances',
      '/gamification': 'Système de motivation et récompenses',
      '/badges': 'Vos accomplissements et badges',
      '/leaderboard': 'Classement de l\'équipe',
      '/rewards': 'Récompenses et objectifs',
      '/team': 'Gestion de votre équipe',
      '/users': 'Gestion des utilisateurs',
      '/onboarding': 'Processus d\'intégration',
      '/timetrack': 'Suivi du temps de travail',
      '/profile': 'Votre profil personnel',
      '/settings': 'Paramètres de l\'application'
    };
    return descriptions[pathname] || 'Plateforme de gestion collaborative';
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
                {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '600', 
                  color: '#1f2937',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {user.displayName || user.email?.split('@')[0] || 'Utilisateur'}
                </div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#6b7280',
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

        {/* Navigation */}
        <nav style={{ 
          flex: 1, 
          padding: '1rem 0',
          overflowY: 'auto'
        }}>
          {allNavigationItems.map((item) => {
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

        {/* ✅ BOUTON DÉCONNEXION CORRIGÉ - MAINTENANT GRIS */}
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
              background: 'linear-gradient(135deg, #6b7280, #4b5563)', // ✅ GRIS au lieu de ROUGE
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
              e.target.style.boxShadow = '0 4px 12px rgba(107, 114, 128, 0.4)'; // ✅ Ombre grise
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
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {user && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>
                <span>👋</span>
                <span>
                  Salut, {user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'Utilisateur'} !
                </span>
              </div>
            )}
          </div>
        </header>

        {/* PAGE CONTENT */}
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
