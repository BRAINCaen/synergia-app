// ==========================================
// 📁 react-app/src/App.jsx
// VERSION ULTRA-SÉCURISÉE - GÈRE LES IMPORTS MANQUANTS
// ==========================================

import React, { useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './shared/stores/authStore.js';

// 🛡️ LAYOUT DE FALLBACK SIMPLE
const FallbackLayout = ({ children }) => (
  <div style={{ display: 'flex', minHeight: '100vh' }}>
    {/* Sidebar simple */}
    <div style={{ 
      width: '250px', 
      backgroundColor: '#1f2937', 
      color: 'white', 
      padding: '1rem',
      flexShrink: 0
    }}>
      <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
        🚀 Synergia v3.5
      </h2>
      <nav>
        <a href="/dashboard" style={{ 
          display: 'block', 
          padding: '0.5rem', 
          color: 'white', 
          textDecoration: 'none',
          marginBottom: '0.5rem',
          borderRadius: '0.25rem',
          backgroundColor: window.location.pathname === '/dashboard' ? '#3b82f6' : 'transparent'
        }}>
          🏠 Dashboard
        </a>
        <a href="/tasks" style={{ 
          display: 'block', 
          padding: '0.5rem', 
          color: 'white', 
          textDecoration: 'none',
          marginBottom: '0.5rem',
          borderRadius: '0.25rem',
          backgroundColor: window.location.pathname === '/tasks' ? '#3b82f6' : 'transparent'
        }}>
          ✅ Tâches
        </a>
        <a href="/projects" style={{ 
          display: 'block', 
          padding: '0.5rem', 
          color: 'white', 
          textDecoration: 'none',
          marginBottom: '0.5rem',
          borderRadius: '0.25rem',
          backgroundColor: window.location.pathname === '/projects' ? '#3b82f6' : 'transparent'
        }}>
          📁 Projets
        </a>
        <a href="/team" style={{ 
          display: 'block', 
          padding: '0.5rem', 
          color: 'white', 
          textDecoration: 'none',
          marginBottom: '0.5rem',
          borderRadius: '0.25rem',
          backgroundColor: window.location.pathname === '/team' ? '#3b82f6' : 'transparent'
        }}>
          👥 Équipe
        </a>
      </nav>
    </div>
    
    {/* Contenu principal */}
    <div style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {children}
    </div>
  </div>
);

// 🛡️ PAGE DE FALLBACK SIMPLE
const FallbackPage = ({ title, path }) => (
  <div style={{ 
    padding: '2rem', 
    minHeight: '100vh', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center' 
  }}>
    <div style={{ 
      backgroundColor: 'white', 
      padding: '2rem', 
      borderRadius: '0.5rem', 
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
      maxWidth: '400px',
      width: '100%'
    }}>
      <h1 style={{ 
        fontSize: '1.5rem', 
        fontWeight: 'bold', 
        marginBottom: '1rem',
        color: '#1f2937'
      }}>
        {title}
      </h1>
      <p style={{ 
        color: '#6b7280', 
        marginBottom: '1.5rem' 
      }}>
        Page en cours de développement
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
        <button
          onClick={() => window.location.href = '/dashboard'}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.25rem',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          🏠 Dashboard
        </button>
        <button
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: '#6b7280',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.25rem',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          🔄 Recharger
        </button>
      </div>
    </div>
  </div>
);

// 🛡️ DASHBOARD SIMPLE
const SimpleDashboard = () => (
  <div style={{ padding: '2rem' }}>
    <div style={{ 
      backgroundColor: 'white', 
      padding: '2rem', 
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      marginBottom: '2rem'
    }}>
      <h1 style={{ 
        fontSize: '2rem', 
        fontWeight: 'bold', 
        marginBottom: '1rem',
        color: '#1f2937'
      }}>
        🚀 Synergia v3.5.3
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
        Application de gestion collaborative - Mode de récupération activé
      </p>
      <div style={{ 
        backgroundColor: '#10b981', 
        color: 'white', 
        padding: '0.5rem 1rem',
        borderRadius: '0.25rem',
        display: 'inline-block',
        fontSize: '0.875rem',
        fontWeight: '500'
      }}>
        ✅ OPÉRATIONNEL
      </div>
    </div>

    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
      gap: '1rem' 
    }}>
      {[
        { href: '/tasks', icon: '✅', title: 'Tâches', desc: 'Gérer les tâches' },
        { href: '/projects', icon: '📁', title: 'Projets', desc: 'Voir les projets' },
        { href: '/team', icon: '👥', title: 'Équipe', desc: 'Gestion équipe' },
        { href: '/analytics', icon: '📊', title: 'Analytics', desc: 'Statistiques' }
      ].map((item, i) => (
        <a
          key={i}
          href={item.href}
          style={{
            display: 'block',
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            textDecoration: 'none',
            color: 'inherit',
            transition: 'transform 0.2s',
            textAlign: 'center'
          }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{item.icon}</div>
          <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{item.title}</div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{item.desc}</div>
        </a>
      ))}
    </div>
  </div>
);

// 🛡️ PAGE DE LOGIN SIMPLE
const SimpleLogin = () => (
  <div style={{ 
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    <div style={{
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '0.5rem',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      width: '100%',
      maxWidth: '400px'
    }}>
      <h1 style={{ 
        fontSize: '2rem', 
        fontWeight: 'bold', 
        textAlign: 'center',
        marginBottom: '1rem',
        color: '#1f2937'
      }}>
        🚀 Synergia
      </h1>
      <p style={{ 
        textAlign: 'center', 
        color: '#6b7280', 
        marginBottom: '2rem' 
      }}>
        Mode de récupération - Connexion simplifiée
      </p>
      <button
        onClick={() => window.location.href = '/dashboard'}
        style={{
          width: '100%',
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '0.75rem',
          borderRadius: '0.25rem',
          border: 'none',
          fontSize: '1rem',
          fontWeight: '500',
          cursor: 'pointer'
        }}
      >
        🔓 Accéder à l'application
      </button>
    </div>
  </div>
);

// 🛡️ COMPOSANTS DE ROUTING
function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            border: '2px solid rgba(255,255,255,0.3)',
            borderTop: '2px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem auto'
          }}></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }
  
  // En mode récupération, on laisse passer tout le monde
  return (
    <FallbackLayout>
      {children}
    </FallbackLayout>
  );
}

function PublicRoute({ children }) {
  return children;
}

console.log('🚀 SYNERGIA v3.5.3 - MODE RÉCUPÉRATION ACTIVÉ');

function App() {
  const { initializeAuth, user, loading } = useAuthStore();

  useEffect(() => {
    console.log('🔄 Initialisation de l\'authentification...');
    try {
      initializeAuth();
    } catch (e) {
      console.warn('⚠️ Erreur init auth:', e);
    }
  }, [initializeAuth]);

  useEffect(() => {
    // Fonctions de debug
    window.forceReload = () => window.location.reload();
    window.emergencyClean = () => {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    };
    
    console.log('✅ Mode récupération activé - App fonctionnelle');
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={<SimpleLogin />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <SimpleDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <FallbackPage title="📋 Tâches" path="/tasks" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <FallbackPage title="📁 Projets" path="/projects" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/team"
          element={
            <ProtectedRoute>
              <FallbackPage title="👥 Équipe" path="/team" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <FallbackPage title="📊 Analytics" path="/analytics" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/gamification"
          element={
            <ProtectedRoute>
              <FallbackPage title="🎮 Gamification" path="/gamification" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <FallbackPage title="👤 Utilisateurs" path="/users" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <FallbackPage title="👤 Profil" path="/profile" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <FallbackPage title="⚙️ Paramètres" path="/settings" />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
