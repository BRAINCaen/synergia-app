// ==========================================
// 📁 react-app/src/App.jsx
// VERSION EMERGENCY - BYPASS TOTAL pour démarrer l'app
// ==========================================

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

console.log('🚨 EMERGENCY MODE - Bypass total activé !');

// ✅ COMPOSANTS SIMPLES SANS IMPORTS COMPLEXES
const EmergencyLayout = ({ children }) => {
  const [user] = useState({
    uid: 'emergency-user',
    email: 'emergency@synergia.com',
    displayName: 'Mode Emergency'
  });

  const handleLogout = () => {
    window.location.reload();
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Sidebar simple */}
      <div style={{
        width: '250px',
        backgroundColor: '#1f2937',
        color: 'white',
        padding: '1rem'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>
            🚨 Synergia Emergency
          </h1>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>
            Mode de démarrage forcé
          </p>
        </div>

        <nav>
          {[
            { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
            { name: 'Tasks', href: '/tasks', icon: '✅' },
            { name: 'Projects', href: '/projects', icon: '📁' },
            { name: 'Analytics', href: '/analytics', icon: '📊' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                margin: '0.25rem 0',
                borderRadius: '8px',
                textDecoration: 'none',
                color: '#d1d5db',
                fontWeight: '500',
                fontSize: '0.875rem'
              }}
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', item.href);
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </a>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#dc2626',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            🚪 Reset
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      <div style={{ flex: 1, padding: '2rem' }}>
        {children}
      </div>
    </div>
  );
};

// ✅ PAGES EMERGENCY SIMPLES
const EmergencyDashboard = () => (
  <div>
    <div style={{
      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
      color: 'white',
      padding: '2rem',
      borderRadius: '12px',
      marginBottom: '2rem'
    }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 1rem 0' }}>
        🚨 Emergency Dashboard
      </h1>
      <p style={{ margin: 0, opacity: 0.9 }}>
        Application démarrée en mode emergency - Tous les services sont bypassés
      </p>
    </div>

    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    }}>
      {[
        { title: 'Status', value: '🟢 ACTIF', color: '#10b981' },
        { title: 'Mode', value: 'EMERGENCY', color: '#f59e0b' },
        { title: 'Firebase', value: 'BYPASS', color: '#ef4444' },
        { title: 'Services', value: 'MOCKÉS', color: '#8b5cf6' }
      ].map((card, index) => (
        <div
          key={index}
          style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}
        >
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
            {card.title}
          </h3>
          <p style={{ 
            margin: 0, 
            fontSize: '1.25rem', 
            fontWeight: 'bold',
            color: card.color
          }}>
            {card.value}
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
        🔧 Diagnostic
      </h2>
      <div style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.6' }}>
        <div>✅ React Router fonctionne</div>
        <div>✅ Layout s'affiche correctement</div>
        <div>✅ Navigation fonctionne</div>
        <div>⚠️ Firebase bypassé</div>
        <div>⚠️ authStore bypassé</div>
        <div>⚠️ Services externes bypassés</div>
      </div>
    </div>

    <div style={{
      backgroundColor: '#fef3c7',
      border: '1px solid #f59e0b',
      padding: '1rem',
      borderRadius: '8px',
      marginTop: '1rem'
    }}>
      <div style={{ fontWeight: 'bold', color: '#92400e', marginBottom: '0.5rem' }}>
        📋 Actions de debug :
      </div>
      <div style={{ fontSize: '0.875rem', color: '#92400e' }}>
        1. Si cette page s'affiche = Le problème ne vient pas de React<br/>
        2. Le problème vient de Firebase ou des imports authStore<br/>
        3. Vérifier les variables d'environnement Netlify<br/>
        4. Vérifier la console pour les erreurs d'import
      </div>
    </div>
  </div>
);

const EmergencyTasks = () => (
  <div>
    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
      📋 Tasks (Emergency)
    </h1>
    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px' }}>
      <p>Page Tasks en mode emergency - Services de tâches bypassés</p>
    </div>
  </div>
);

const EmergencyProjects = () => (
  <div>
    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
      📁 Projects (Emergency)
    </h1>
    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px' }}>
      <p>Page Projects en mode emergency - Services de projets bypassés</p>
    </div>
  </div>
);

const EmergencyAnalytics = () => (
  <div>
    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
      📊 Analytics (Emergency)
    </h1>
    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px' }}>
      <p>Page Analytics en mode emergency - Services analytics bypassés</p>
    </div>
  </div>
);

// ✅ LOADING EMERGENCY
const EmergencyLoading = () => (
  <div style={{
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '48px',
        height: '48px',
        border: '3px solid rgba(255,255,255,0.3)',
        borderTop: '3px solid white',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 1rem auto'
      }}></div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>
        🚨 Emergency Boot
      </h1>
      <p style={{ margin: 0, opacity: 0.8 }}>
        Démarrage forcé en cours...
      </p>
    </div>
    <style dangerouslySetInnerHTML={{
      __html: '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }'
    }} />
  </div>
);

// 🚀 APP EMERGENCY PRINCIPAL
const App = () => {
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState('/dashboard');

  useEffect(() => {
    console.log('🚨 EMERGENCY APP - Démarrage forcé...');
    
    // Simuler un chargement puis démarrer
    const timer = setTimeout(() => {
      setLoading(false);
      console.log('✅ EMERGENCY APP - Démarré avec succès !');
    }, 2000);

    // Écouter les changements de route
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  if (loading) {
    return <EmergencyLoading />;
  }

  const renderPage = () => {
    switch (currentPath) {
      case '/tasks':
        return <EmergencyTasks />;
      case '/projects':
        return <EmergencyProjects />;
      case '/analytics':
        return <EmergencyAnalytics />;
      default:
        return <EmergencyDashboard />;
    }
  };

  return (
    <Router>
      <EmergencyLayout>
        {renderPage()}
      </EmergencyLayout>
    </Router>
  );
};

export default App;

console.log('🚨 EMERGENCY MODE ACTIVÉ - Bypass total Firebase, authStore et tous les services !');
console.log('🎯 Si cette version fonctionne, le problème vient des imports/services complexes');
