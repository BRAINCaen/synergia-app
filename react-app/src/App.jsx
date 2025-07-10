// ==========================================
// 📁 react-app/src/App.jsx
// VERSION PROGRESSIVE - Test étape par étape
// ==========================================

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

console.log('🔍 MODE PROGRESSIF - Test étape par étape');

// 🎯 ÉTAPE 1 : Tester DashboardLayout (commenté pour l'instant)
// import DashboardLayout from './layouts/DashboardLayout.jsx';

// 🎯 ÉTAPE 2 : Tester les pages une par une (commentées pour l'instant)
// import Dashboard from './pages/Dashboard.jsx';
// import TasksPage from './pages/TasksPage.jsx';
// import Login from './pages/Login.jsx';

// 🎯 ÉTAPE 3 : Tester authStore (commenté pour l'instant)
// import { useAuthStore } from './shared/stores/authStore.js';

// ✅ LAYOUT SIMPLE TEMPORAIRE
const SimpleLayout = ({ children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Sidebar */}
      <div style={{
        width: '250px',
        backgroundColor: '#1f2937',
        color: 'white',
        padding: '1rem'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>
            🔍 Synergia Debug
          </h1>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>
            Mode progressif
          </p>
        </div>

        <nav>
          {[
            { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
            { name: 'Tasks', href: '/tasks', icon: '✅' },
            { name: 'Projects', href: '/projects', icon: '📁' }
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
                color: window.location.pathname === item.href ? '#ffffff' : '#d1d5db',
                backgroundColor: window.location.pathname === item.href ? '#3b82f6' : 'transparent',
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
      </div>

      {/* Contenu */}
      <div style={{ flex: 1, padding: '2rem' }}>
        {children}
      </div>
    </div>
  );
};

// ✅ PAGES SIMPLES PROGRESSIVES
const ProgressiveDashboard = () => {
  const [testStep, setTestStep] = useState(1);
  const [testResults, setTestResults] = useState({});

  const runTest = async (step, name, testFn) => {
    try {
      console.log(`🧪 Test ${step}: ${name}...`);
      const result = await testFn();
      setTestResults(prev => ({ ...prev, [step]: { success: true, name, result } }));
      console.log(`✅ Test ${step} réussi: ${name}`);
      return true;
    } catch (error) {
      console.error(`❌ Test ${step} échoué: ${name}`, error);
      setTestResults(prev => ({ ...prev, [step]: { success: false, name, error: error.message } }));
      return false;
    }
  };

  const nextTest = async () => {
    let success = false;
    
    switch (testStep) {
      case 1:
        success = await runTest(1, 'Import Firebase Config', async () => {
          const firebase = await import('../../core/firebase.js');
          return `Firebase config: ${firebase.isFirebaseConfigured ? 'OK' : 'Manquant'}`;
        });
        break;
        
      case 2:
        success = await runTest(2, 'Import authService', async () => {
          const firebase = await import('../../core/firebase.js');
          return `authService: ${firebase.authService ? 'OK' : 'Manquant'}`;
        });
        break;
        
      case 3:
        success = await runTest(3, 'Import authStore', async () => {
          const store = await import('../../shared/stores/authStore.js');
          return `authStore: ${store.useAuthStore ? 'OK' : 'Manquant'}`;
        });
        break;
        
      case 4:
        success = await runTest(4, 'Import DashboardLayout', async () => {
          const layout = await import('../../layouts/DashboardLayout.jsx');
          return `DashboardLayout: ${layout.default ? 'OK' : 'Manquant'}`;
        });
        break;
        
      case 5:
        success = await runTest(5, 'Import Dashboard Page', async () => {
          const page = await import('../../pages/Dashboard.jsx');
          return `Dashboard page: ${page.default ? 'OK' : 'Manquant'}`;
        });
        break;
        
      default:
        console.log('🏁 Tous les tests terminés !');
        return;
    }
    
    if (success) {
      setTestStep(prev => prev + 1);
    }
  };

  useEffect(() => {
    // Auto-start premier test
    if (testStep === 1 && Object.keys(testResults).length === 0) {
      nextTest();
    }
  }, [testStep]);

  return (
    <div>
      <div style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
        color: 'white',
        padding: '2rem',
        borderRadius: '12px',
        marginBottom: '2rem'
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 1rem 0' }}>
          🔍 Debug Progressif
        </h1>
        <p style={{ margin: 0, opacity: 0.9 }}>
          Test étape par étape pour identifier le problème exact
        </p>
      </div>

      {/* Tests en cours */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '1rem'
      }}>
        <h2 style={{ margin: '0 0 1rem 0' }}>📋 Tests d'imports</h2>
        
        <div style={{ marginBottom: '1rem' }}>
          <strong>Étape actuelle : {testStep}</strong>
          <button
            onClick={nextTest}
            style={{
              marginLeft: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            ▶️ Test suivant
          </button>
        </div>

        {Object.entries(testResults).map(([step, result]) => (
          <div
            key={step}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.75rem',
              margin: '0.5rem 0',
              borderRadius: '8px',
              backgroundColor: result.success ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${result.success ? '#22c55e' : '#ef4444'}`
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>
              {result.success ? '✅' : '❌'}
            </span>
            <div style={{ flex: 1 }}>
              <strong>Test {step}: {result.name}</strong>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                {result.success ? result.result : result.error}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div style={{
        backgroundColor: '#fef3c7',
        border: '1px solid #f59e0b',
        padding: '1rem',
        borderRadius: '8px'
      }}>
        <div style={{ fontWeight: 'bold', color: '#92400e', marginBottom: '0.5rem' }}>
          📋 Instructions :
        </div>
        <div style={{ fontSize: '0.875rem', color: '#92400e' }}>
          1. Clique sur "Test suivant" pour tester chaque import<br/>
          2. Si un test échoue, on saura exactement quel fichier pose problème<br/>
          3. Les erreurs s'afficheront dans la console et ici
        </div>
      </div>
    </div>
  );
};

const ProgressiveTasks = () => (
  <div>
    <h1>📋 Tasks (Mode Progressif)</h1>
    <p>Cette page testera progressivement les imports liés aux tâches.</p>
  </div>
);

const ProgressiveProjects = () => (
  <div>
    <h1>📁 Projects (Mode Progressif)</h1>
    <p>Cette page testera progressivement les imports liés aux projets.</p>
  </div>
);

// 🚀 APP PROGRESSIF
const App = () => {
  const [currentPath, setCurrentPath] = useState('/dashboard');

  useEffect(() => {
    console.log('🔍 APP PROGRESSIF - Démarrage des tests...');
    
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    setCurrentPath(window.location.pathname);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const renderPage = () => {
    switch (currentPath) {
      case '/tasks':
        return <ProgressiveTasks />;
      case '/projects':
        return <ProgressiveProjects />;
      default:
        return <ProgressiveDashboard />;
    }
  };

  return (
    <Router>
      <SimpleLayout>
        {renderPage()}
      </SimpleLayout>
    </Router>
  );
};

export default App;

console.log('🔍 MODE PROGRESSIF - Prêt à tester les imports un par un !');
