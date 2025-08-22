// ==========================================
// 📁 react-app/src/App.jsx
// ÉTAPE 1: AJOUT DU ROUTING DE BASE
// ==========================================

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';

/**
 * 📄 PAGE DE DEMO DASHBOARD
 */
const DashboardPage = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1 style={{ color: '#1f2937', marginBottom: '1rem' }}>🏠 Dashboard</h1>
    <p style={{ color: '#6b7280' }}>Tableau de bord principal de Synergia</p>
    <div style={{ marginTop: '2rem' }}>
      <Link to="/badges" style={{ 
        background: '#3b82f6', 
        color: 'white', 
        padding: '12px 24px', 
        borderRadius: '6px', 
        textDecoration: 'none',
        marginRight: '1rem'
      }}>
        Voir les badges
      </Link>
      <Link to="/profile" style={{ 
        background: '#10b981', 
        color: 'white', 
        padding: '12px 24px', 
        borderRadius: '6px', 
        textDecoration: 'none'
      }}>
        Mon profil
      </Link>
    </div>
  </div>
);

/**
 * 🏆 PAGE DE DEMO BADGES
 */
const BadgesPage = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1 style={{ color: '#1f2937', marginBottom: '1rem' }}>🏆 Badges</h1>
    <p style={{ color: '#6b7280' }}>Système de badges et récompenses</p>
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
      gap: '1rem',
      marginTop: '2rem',
      maxWidth: '600px',
      margin: '2rem auto'
    }}>
      {['🎯 Premier pas', '⚡ Rapide', '🎓 Apprenant', '🔥 Motivé'].map(badge => (
        <div key={badge} style={{
          background: 'white',
          border: '2px solid #e5e7eb',
          borderRadius: '8px',
          padding: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{badge.split(' ')[0]}</div>
          <div style={{ fontWeight: 'bold', color: '#1f2937' }}>{badge.split(' ').slice(1).join(' ')}</div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * 👤 PAGE DE DEMO PROFIL
 */
const ProfilePage = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1 style={{ color: '#1f2937', marginBottom: '1rem' }}>👤 Mon Profil</h1>
    <div style={{
      background: 'white',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      padding: '2rem',
      maxWidth: '400px',
      margin: '2rem auto',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👨‍💻</div>
      <h3 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>Utilisateur Synergia</h3>
      <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Niveau 5 • 2,450 XP</p>
      <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '1rem' }}>
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>8</div>
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Badges</div>
        </div>
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>42</div>
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Tâches</div>
        </div>
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>12</div>
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Projets</div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * 🧭 NAVIGATION SIMPLE
 */
const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/badges', label: 'Badges', icon: '🏆' },
    { path: '/profile', label: 'Profil', icon: '👤' }
  ];
  
  return (
    <nav style={{
      background: 'white',
      borderBottom: '1px solid #e5e7eb',
      padding: '1rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.5rem' }}>🎯</span>
        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1f2937' }}>Synergia v3.5</span>
      </div>
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              textDecoration: 'none',
              color: location.pathname === item.path ? '#3b82f6' : '#6b7280',
              background: location.pathname === item.path ? '#eff6ff' : 'transparent',
              fontWeight: location.pathname === item.path ? 'bold' : 'normal'
            }}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

/**
 * 🎯 COMPOSANT PRINCIPAL - ÉTAPE 1
 */
const App = () => {
  const [debugInfo, setDebugInfo] = useState({
    routerLoaded: false,
    navigationWorking: false
  });

  React.useEffect(() => {
    console.log('🚀 App étape 1 - Router initialisé');
    setDebugInfo(prev => ({ ...prev, routerLoaded: true }));
  }, []);

  try {
    return (
      <Router>
        <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
          <Navigation />
          
          <main>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/badges" element={<BadgesPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <h1 style={{ color: '#dc2626' }}>404 - Page non trouvée</h1>
                  <Link to="/" style={{ color: '#3b82f6' }}>Retour au dashboard</Link>
                </div>
              } />
            </Routes>
          </main>

          {/* Debug panel */}
          <div style={{
            position: 'fixed',
            bottom: '1rem',
            right: '1rem',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '0.5rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            zIndex: 1000
          }}>
            ✅ Étape 1: Routing • Router: {debugInfo.routerLoaded ? '✅' : '❌'}
          </div>
        </div>
      </Router>
    );

  } catch (error) {
    console.error('❌ Erreur étape 1:', error);
    
    return (
      <div style={{
        minHeight: '100vh',
        background: '#dc2626',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h1>❌ Erreur Étape 1 - Routing</h1>
          <p>Le routing React Router a échoué</p>
          <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '6px',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            Recharger
          </button>
        </div>
      </div>
    );
  }
};

console.log('🚀 App étape 1 défini avec succès - Routing de base');

export default App;
