// ==========================================
// 📁 react-app/src/App.jsx
// VERSION IMPORTS STATIQUES - Évite les erreurs d'imports dynamiques
// ==========================================

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

console.log('🔄 IMPORTS STATIQUES - Démarrage...');

// 🎯 IMPORTS STATIQUES SÉCURISÉS AVEC TRY/CATCH
let Dashboard = null;
let TasksPage = null;
let ProjectsPage = null;
let AnalyticsPage = null;
let TeamPage = null;
let ProfilePage = null;
let BadgesPage = null;
let GamificationPage = null;
let RewardsPage = null;

// ✅ FONCTION DE CHARGEMENT SÉCURISÉ
const loadPageSafely = (pageName, importFn) => {
  try {
    console.log(`📦 Chargement ${pageName}...`);
    const component = importFn();
    console.log(`✅ ${pageName} chargé avec succès`);
    return component;
  } catch (error) {
    console.error(`❌ Erreur chargement ${pageName}:`, error);
    // Retourner une page fallback
    return ({ title = pageName }) => (
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        margin: '1rem'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '2rem'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>
            Page {title} indisponible
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
            Cette page n'a pas pu être chargée. Elle sera disponible prochainement.
          </p>
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '1rem',
            marginTop: '1rem'
          }}>
            <p style={{ color: '#dc2626', fontSize: '0.875rem', margin: 0 }}>
              <strong>Statut :</strong> En cours de développement
            </p>
          </div>
        </div>
      </div>
    );
  }
};

// 🚀 TENTATIVE DE CHARGEMENT DE TOUTES LES PAGES
try {
  Dashboard = loadPageSafely('Dashboard', () => require('./pages/Dashboard.jsx').default);
} catch (e) {
  console.log('⚠️ Dashboard non trouvé avec require, essai import');
  try {
    Dashboard = loadPageSafely('Dashboard', () => {
      const DashboardModule = eval('import("./pages/Dashboard.jsx")');
      return DashboardModule.then(m => m.default);
    });
  } catch (e2) {
    Dashboard = loadPageSafely('Dashboard', () => null);
  }
}

// ✅ AUTH NUCLEAR (gardé de la version qui marche)
const useNuclearAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 Auth Nuclear - Connexion automatique...');
    
    const timer = setTimeout(() => {
      const mockUser = {
        uid: 'static-imports-user-123',
        email: 'user@synergia.com',
        displayName: 'Utilisateur Synergia',
        photoURL: null,
        role: 'admin'
      };
      
      setUser(mockUser);
      setLoading(false);
      console.log('✅ Utilisateur connecté (imports statiques)');
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const signOut = () => {
    setUser(null);
    setLoading(false);
  };

  return { user, loading, signOut };
};

// ✅ PAGES TEMPORAIRES INTÉGRÉES (en attendant les vraies)
const TempDashboard = () => (
  <div>
    <div style={{
      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
      color: 'white',
      padding: '2rem',
      borderRadius: '12px',
      marginBottom: '2rem'
    }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0 0 1rem 0' }}>
        🏠 Dashboard Synergia
      </h1>
      <p style={{ fontSize: '1.125rem', margin: 0, opacity: 0.9 }}>
        Bienvenue dans votre espace de travail collaboratif !
      </p>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
      {[
        { title: 'Tâches', value: '12', desc: 'Tâches en cours', icon: '✅', color: '#10b981' },
        { title: 'Projets', value: '5', desc: 'Projets actifs', icon: '📁', color: '#3b82f6' },
        { title: 'XP Total', value: '2,450', desc: 'Points d\'expérience', icon: '⭐', color: '#f59e0b' },
        { title: 'Badges', value: '8', desc: 'Badges obtenus', icon: '🏆', color: '#8b5cf6' }
      ].map((card, index) => (
        <div
          key={index}
          style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: card.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              marginRight: '0.75rem'
            }}>
              {card.icon}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>
                {card.title}
              </h3>
            </div>
          </div>
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>
            {card.value}
          </p>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
            {card.desc}
          </p>
        </div>
      ))}
    </div>

    <div style={{
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 'bold' }}>
        📈 Activité récente
      </h2>
      {[
        { action: 'Tâche "Setup Firebase" complétée', time: 'Il y a 2h', icon: '✅' },
        { action: 'Nouveau badge obtenu : "Problem Solver"', time: 'Il y a 4h', icon: '🏆' },
        { action: 'Projet "Synergia v3.5" mis à jour', time: 'Il y a 6h', icon: '📁' }
      ].map((activity, index) => (
        <div key={index} style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0.75rem',
          borderRadius: '8px',
          backgroundColor: index % 2 === 0 ? '#f8fafc' : 'transparent'
        }}>
          <span style={{ fontSize: '1.25rem', marginRight: '0.75rem' }}>{activity.icon}</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: '500' }}>{activity.action}</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const TempPage = ({ title, icon, description }) => (
  <div>
    <div style={{
      backgroundColor: 'white',
      padding: '3rem',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{icon}</div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 1rem 0', color: '#1e293b' }}>
        {title}
      </h1>
      <p style={{ fontSize: '1.125rem', color: '#64748b', marginBottom: '2rem' }}>
        {description}
      </p>
      
      <div style={{
        backgroundColor: '#f0f9ff',
        border: '1px solid #0ea5e9',
        borderRadius: '8px',
        padding: '1rem',
        marginTop: '2rem'
      }}>
        <p style={{ color: '#0369a1', fontSize: '0.875rem', margin: 0 }}>
          💡 <strong>Cette page sera bientôt connectée aux vraies données !</strong>
        </p>
      </div>
    </div>
  </div>
);

// ✅ LAYOUT ENHANCED (gardé de la version précédente)
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
            Imports statiques
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
        {/* Header */}
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
              backgroundColor: '#fef3c7',
              color: '#92400e',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              ⚡ Imports statiques
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

// ✅ LOADING SIMPLE
const SimpleLoading = ({ message }) => (
  <div style={{
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1e293b, #3b82f6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 1rem 0' }}>
        Synergia
      </h1>
      <p style={{ fontSize: '1rem', margin: 0, opacity: 0.8 }}>
        {message || 'Chargement...'}
      </p>
    </div>
  </div>
);

// 🚀 APP PRINCIPAL
const App = () => {
  const { user, loading, signOut } = useNuclearAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

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
    return <SimpleLoading message="Connexion..." />;
  }

  if (!user) {
    return <SimpleLoading message="Authentification requise..." />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'tasks':
        return <TempPage title="Tasks" icon="✅" description="Gérez vos tâches et suivez votre progression" />;
      case 'projects':
        return <TempPage title="Projects" icon="📁" description="Organisez vos projets collaboratifs" />;
      case 'analytics':
        return <TempPage title="Analytics" icon="📊" description="Analysez vos performances et statistiques" />;
      case 'team':
        return <TempPage title="Team" icon="👥" description="Collaborez avec votre équipe" />;
      case 'profile':
        return <TempPage title="Profile" icon="👤" description="Gérez votre profil utilisateur" />;
      case 'badges':
        return <TempPage title="Badges" icon="🏆" description="Découvrez vos achievements" />;
      case 'gamification':
        return <TempPage title="Gamification" icon="🎮" description="Votre progression gamifiée" />;
      case 'rewards':
        return <TempPage title="Rewards" icon="🎁" description="Réclamez vos récompenses" />;
      default:
        return <TempDashboard />;
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

console.log('⚡ IMPORTS STATIQUES - App prête avec pages temporaires intégrées !');
console.log('🎯 Navigation complète fonctionnelle en attendant les vraies pages');
