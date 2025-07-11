// ==========================================
// 📁 react-app/src/App.jsx
// VERSION AVEC VRAIES PAGES - Réintégration progressive
// ==========================================

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

console.log('🔄 RÉINTÉGRATION DES VRAIES PAGES - Démarrage...');

// 🎯 IMPORTS DES VRAIES PAGES (progressif)
let Dashboard = null;
let TasksPage = null;
let ProjectsPage = null;
let AnalyticsPage = null;
let TeamPage = null;
let ProfilePage = null;
let BadgesPage = null;
let GamificationPage = null;
let RewardsPage = null;

// 🚀 SYSTÈME D'IMPORT PROGRESSIF SÉCURISÉ
const importPageSafely = async (pageName, path) => {
  try {
    console.log(`📦 Import ${pageName}...`);
    const module = await import(path);
    console.log(`✅ ${pageName} importé avec succès`);
    return module.default;
  } catch (error) {
    console.error(`❌ Erreur import ${pageName}:`, error);
    // Retourner une page fallback en cas d'erreur
    return ({ title = pageName }) => (
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#dc2626' }}>
          Erreur de chargement
        </h1>
        <p style={{ color: '#64748b', marginBottom: '1rem' }}>
          Impossible de charger la page {title}
        </p>
        <details style={{ textAlign: 'left', fontSize: '0.875rem', color: '#6b7280' }}>
          <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>Détails de l'erreur</summary>
          <pre style={{ backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '6px', overflow: 'auto' }}>
            {error.message}
          </pre>
        </details>
      </div>
    );
  }
};

// ✅ AUTH NUCLEAR (gardé de la version qui marche)
const useNuclearAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 Auth Nuclear - Connexion automatique...');
    
    const timer = setTimeout(() => {
      const mockUser = {
        uid: 'real-pages-user-123',
        email: 'user@synergia.com',
        displayName: 'Utilisateur Synergia',
        photoURL: null,
        role: 'admin' // Pour accéder aux pages admin
      };
      
      setUser(mockUser);
      setLoading(false);
      console.log('✅ Utilisateur connecté (mode réintégration)');
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const signOut = () => {
    setUser(null);
    setLoading(false);
  };

  return { user, loading, signOut };
};

// ✅ LAYOUT NUCLEAR AMÉLIORÉ
const EnhancedNuclearLayout = ({ children, user, onSignOut }) => {
  const [currentPath, setCurrentPath] = useState('/dashboard');

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: '🏠', group: 'main' },
    { name: 'Tasks', path: '/tasks', icon: '✅', group: 'main' },
    { name: 'Projects', path: '/projects', icon: '📁', group: 'main' },
    { name: 'Analytics', path: '/analytics', icon: '📊', group: 'main' },
    { name: 'Gamification', path: '/gamification', icon: '🎮', group: 'game' },
    { name: 'Badges', path: '/badges', icon: '🏆', group: 'game' },
    { name: 'Rewards', path: '/rewards', icon: '🎁', group: 'game' },
    { name: 'Team', path: '/team', icon: '👥', group: 'social' },
    { name: 'Profile', path: '/profile', icon: '👤', group: 'user' }
  ];

  const groups = {
    main: { title: 'Principal', color: '#3b82f6' },
    game: { title: 'Gamification', color: '#8b5cf6' },
    social: { title: 'Social', color: '#10b981' },
    user: { title: 'Personnel', color: '#f59e0b' }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui' }}>
      {/* Sidebar Enhanced */}
      <div style={{
        width: '300px',
        backgroundColor: '#1e293b',
        color: 'white',
        padding: '1.5rem',
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '15px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
            fontSize: '28px',
            fontWeight: 'bold'
          }}>
            🚀
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>
            Synergia v3.5
          </h1>
          <p style={{ fontSize: '0.875rem', opacity: 0.7, margin: 0 }}>
            Vraies pages intégrées
          </p>
        </div>

        {/* Navigation par groupes */}
        {Object.entries(groups).map(([groupKey, groupInfo]) => {
          const groupItems = navigation.filter(item => item.group === groupKey);
          
          return (
            <div key={groupKey} style={{ marginBottom: '1.5rem' }}>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                color: groupInfo.color,
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
                paddingLeft: '0.5rem'
              }}>
                {groupInfo.title}
              </div>
              
              {groupItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    setCurrentPath(item.path);
                    window.history.pushState({}, '', item.path);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    margin: '0.125rem 0',
                    backgroundColor: currentPath === item.path ? groupInfo.color : 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    if (currentPath !== item.path) {
                      e.target.style.backgroundColor = '#334155';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPath !== item.path) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <span style={{ fontSize: '1.125rem' }}>{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          );
        })}

        {/* User Info */}
        <div style={{
          padding: '1rem',
          backgroundColor: '#334155',
          borderRadius: '12px',
          marginTop: 'auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'white' }}>
                {user?.displayName || 'Utilisateur'}
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.7, textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.email || 'email@example.com'}
              </div>
            </div>
          </div>
          <button
            onClick={onSignOut}
            style={{
              width: '100%',
              padding: '0.5rem',
              backgroundColor: '#dc2626',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            🚪 Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        {/* Header avec breadcrumb */}
        <header style={{
          backgroundColor: 'white',
          padding: '1rem 2rem',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between' }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '600', margin: '0 0 0.25rem 0', color: '#1e293b' }}>
                {navigation.find(item => item.path === currentPath)?.name || 'Dashboard'}
              </h1>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                {navigation.find(item => item.path === currentPath)?.icon} {' '}
                {groups[navigation.find(item => item.path === currentPath)?.group]?.title || 'Principal'}
              </div>
            </div>
            
            <div style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dcfce7',
              color: '#166534',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              ✅ Vraies pages actives
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: '2rem', minHeight: 'calc(100vh - 80px)' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

// ✅ LOADING AMÉLIORÉ
const EnhancedLoading = ({ message }) => (
  <div style={{
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1e293b, #3b82f6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontSize: '4rem',
        marginBottom: '1rem',
        animation: 'pulse 2s infinite'
      }}>
        🔄
      </div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 1rem 0' }}>
        Synergia
      </h1>
      <p style={{ fontSize: '1.125rem', margin: '0 0 1.5rem 0', opacity: 0.8 }}>
        {message || 'Chargement des vraies pages...'}
      </p>
      <div style={{
        width: '200px',
        height: '4px',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: '2px',
        margin: '0 auto',
        overflow: 'hidden'
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
          animation: 'loading 2s ease-in-out infinite'
        }}></div>
      </div>
    </div>
    <style dangerouslySetInnerHTML={{
      __html: `
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
      `
    }} />
  </div>
);

// 🚀 APP PRINCIPAL AVEC VRAIES PAGES
const App = () => {
  const { user, loading, signOut } = useNuclearAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [pagesLoaded, setPagesLoaded] = useState(false);
  const [pageComponents, setPageComponents] = useState({});

  // 📦 CHARGER LES VRAIES PAGES
  useEffect(() => {
    const loadAllPages = async () => {
      console.log('📦 Chargement de toutes les vraies pages...');
      
      const pages = [
        { name: 'Dashboard', path: './pages/Dashboard.jsx' },
        { name: 'TasksPage', path: './pages/TasksPage.jsx' },
        { name: 'ProjectsPage', path: './pages/ProjectsPage.jsx' },
        { name: 'AnalyticsPage', path: './pages/AnalyticsPage.jsx' },
        { name: 'TeamPage', path: './pages/TeamPage.jsx' },
        { name: 'ProfilePage', path: './pages/ProfilePage.jsx' },
        { name: 'BadgesPage', path: './pages/BadgesPage.jsx' },
        { name: 'GamificationPage', path: './pages/GamificationPage.jsx' },
        { name: 'RewardsPage', path: './pages/RewardsPage.jsx' }
      ];

      const loadedComponents = {};
      
      for (const page of pages) {
        loadedComponents[page.name] = await importPageSafely(page.name, page.path);
      }
      
      setPageComponents(loadedComponents);
      setPagesLoaded(true);
      console.log('✅ Toutes les pages chargées avec succès !');
    };

    if (user) {
      loadAllPages();
    }
  }, [user]);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace('/', '') || 'dashboard';
      setCurrentPage(path);
    };
    
    window.addEventListener('popstate', handlePopState);
    handlePopState();
    
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (loading) {
    return <EnhancedLoading message="Authentification..." />;
  }

  if (!user) {
    return <EnhancedLoading message="Connexion requise..." />;
  }

  if (!pagesLoaded) {
    return <EnhancedLoading message="Chargement des pages..." />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'tasks':
        return React.createElement(pageComponents.TasksPage || (() => <div>Page Tasks en cours de chargement...</div>));
      case 'projects':
        return React.createElement(pageComponents.ProjectsPage || (() => <div>Page Projects en cours de chargement...</div>));
      case 'analytics':
        return React.createElement(pageComponents.AnalyticsPage || (() => <div>Page Analytics en cours de chargement...</div>));
      case 'team':
        return React.createElement(pageComponents.TeamPage || (() => <div>Page Team en cours de chargement...</div>));
      case 'profile':
        return React.createElement(pageComponents.ProfilePage || (() => <div>Page Profile en cours de chargement...</div>));
      case 'badges':
        return React.createElement(pageComponents.BadgesPage || (() => <div>Page Badges en cours de chargement...</div>));
      case 'gamification':
        return React.createElement(pageComponents.GamificationPage || (() => <div>Page Gamification en cours de chargement...</div>));
      case 'rewards':
        return React.createElement(pageComponents.RewardsPage || (() => <div>Page Rewards en cours de chargement...</div>));
      default:
        return React.createElement(pageComponents.Dashboard || (() => <div>Dashboard en cours de chargement...</div>));
    }
  };

  return (
    <Router>
      <EnhancedNuclearLayout user={user} onSignOut={signOut}>
        {renderPage()}
      </EnhancedNuclearLayout>
    </Router>
  );
};

export default App;

console.log('🔄 RÉINTÉGRATION DES VRAIES PAGES - Prêt !');
console.log('📦 Import progressif et sécurisé de toutes les pages');
console.log('✅ Fallback en cas d\'erreur pour éviter les crashes');
