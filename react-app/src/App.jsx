// ==========================================
// 📁 react-app/src/App.jsx
// ROUTER PROGRESSIF AVEC IMPORTS FIXES
// ==========================================

import React, { useEffect, useState, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';

// Import des corrections
import './utils/xpRewardSafety.js';
import './utils/productionErrorSuppression.js';

console.log('🔄 [PROGRESSIVE] App.jsx progressif chargé');

// ==========================================
// 🛠️ INTERFACE DEBUG (FALLBACK PERMANENT)
// ==========================================

const DebugInterface = () => {
  const [debugInfo, setDebugInfo] = useState({
    corrections: {
      xpSafety: typeof window.getXPRewardSafely === 'function',
      motion: typeof window.motion === 'object',
      progressService: typeof window.updateUserProgress === 'function',
      animatePresence: typeof window.AnimatePresence === 'function'
    },
    stores: {
      auth: false,
      authUser: null
    }
  });

  useEffect(() => {
    // Test des stores
    if (useAuthStore) {
      try {
        const state = useAuthStore.getState();
        setDebugInfo(prev => ({
          ...prev,
          stores: {
            auth: true,
            authUser: state.user
          }
        }));
      } catch (error) {
        console.log('❌ [DEBUG] Erreur test AuthStore:', error);
      }
    }
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1a1a2e',
      color: 'white',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', margin: '0 0 1rem 0' }}>
            🚀 Synergia v3.5.3 - Mode Progressif
          </h1>
          <p style={{ color: '#8892b0' }}>
            Interface de debug avec router progressif
          </p>
        </div>

        {/* Status Cards Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          
          {/* État Application */}
          <div style={{
            backgroundColor: '#16213e',
            padding: '1.5rem',
            borderRadius: '10px',
            border: '1px solid #0f4c75'
          }}>
            <h3 style={{ marginTop: 0, color: '#64ffda' }}>📊 État Application</h3>
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <div>✅ React: 18.3.1</div>
              <div>✅ Mode: {import.meta.env.MODE}</div>
              <div>✅ Router: Progressif</div>
              <div>✅ URL: {window.location.pathname}</div>
            </div>
          </div>

          {/* Corrections */}
          <div style={{
            backgroundColor: '#16213e',
            padding: '1.5rem',
            borderRadius: '10px',
            border: '1px solid #0f4c75'
          }}>
            <h3 style={{ marginTop: 0, color: '#64ffda' }}>🛡️ Corrections</h3>
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <div>{debugInfo.corrections.xpSafety ? '✅' : '❌'} XP Safety</div>
              <div>{debugInfo.corrections.motion ? '✅' : '❌'} Framer Motion</div>
              <div>{debugInfo.corrections.progressService ? '✅' : '❌'} Progress Service</div>
              <div>{debugInfo.corrections.animatePresence ? '✅' : '❌'} AnimatePresence</div>
            </div>
          </div>

          {/* Authentification */}
          <div style={{
            backgroundColor: '#16213e',
            padding: '1.5rem',
            borderRadius: '10px',
            border: '1px solid #0f4c75'
          }}>
            <h3 style={{ marginTop: 0, color: '#64ffda' }}>🔐 Authentification</h3>
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <div>Store: {debugInfo.stores.auth ? '✅ Actif' : '❌ Indisponible'}</div>
              <div>User: {debugInfo.stores.authUser ? '✅ Connecté' : '❌ Non connecté'}</div>
              {debugInfo.stores.authUser && (
                <div style={{ color: '#8892b0', fontSize: '12px', marginTop: '5px' }}>
                  Email: {debugInfo.stores.authUser.email}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{
          backgroundColor: '#16213e',
          padding: '1.5rem',
          borderRadius: '10px',
          border: '1px solid #0f4c75',
          marginBottom: '2rem'
        }}>
          <h3 style={{ marginTop: 0, color: '#64ffda' }}>⚡ Actions Debug</h3>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '1rem', 
            marginTop: '1rem' 
          }}>
            <button
              onClick={() => {
                console.log('🧪 [DEBUG] Test complet des corrections');
                if (window.testCorrections) window.testCorrections();
                if (window.getXPRewardSafely) {
                  const test = window.getXPRewardSafely(null, 99);
                  console.log('🛡️ [DEBUG] XP Safety test:', test);
                }
              }}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#0f4c75', 
                color: 'white', 
                border: 'none', 
                borderRadius: '5px', 
                cursor: 'pointer' 
              }}
            >
              🧪 Test Corrections
            </button>
            
            <button
              onClick={() => {
                console.log('🔄 [DEBUG] Tentative de redirection vers login');
                window.location.href = '/login';
              }}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#2d8a2f', 
                color: 'white', 
                border: 'none', 
                borderRadius: '5px', 
                cursor: 'pointer' 
              }}
            >
              🔐 Aller au Login
            </button>
            
            <button
              onClick={() => {
                console.log('📊 [DEBUG] Tentative de redirection vers dashboard');
                window.location.href = '/dashboard';
              }}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#6b46c1', 
                color: 'white', 
                border: 'none', 
                borderRadius: '5px', 
                cursor: 'pointer' 
              }}
            >
              🏠 Aller au Dashboard
            </button>
            
            <button
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
              }}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#b33939', 
                color: 'white', 
                border: 'none', 
                borderRadius: '5px', 
                cursor: 'pointer' 
              }}
            >
              🧹 Reset Complet
            </button>
          </div>
        </div>

        {/* Navigation Manuelle */}
        <div style={{
          backgroundColor: '#16213e',
          padding: '1.5rem',
          borderRadius: '10px',
          border: '1px solid #0f4c75'
        }}>
          <h3 style={{ marginTop: 0, color: '#64ffda' }}>🧭 Navigation Test</h3>
          <p style={{ fontSize: '14px', color: '#8892b0', margin: '0 0 1rem 0' }}>
            Testez les différentes routes manuellement :
          </p>
          <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
            <div><strong>/</strong> - Page d'accueil (redirection)</div>
            <div><strong>/login</strong> - Page de connexion</div>
            <div><strong>/dashboard</strong> - Tableau de bord</div>
            <div><strong>/debug</strong> - Cette page (fallback)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 🔐 PAGES ESSENTIELLES PROGRESSIVES
// ==========================================

// Page de connexion simple
const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [authStore, setAuthStore] = useState(null);
  
  console.log('🔐 [PROGRESSIVE] LoginPage rendue');

  // Import dynamique de l'AuthStore
  useEffect(() => {
    const loadAuthStore = async () => {
      try {
        const module = await import('./shared/stores/authStore.js');
        setAuthStore(module.useAuthStore);
        console.log('✅ [LOGIN] AuthStore chargé dynamiquement');
      } catch (error) {
        console.warn('⚠️ [LOGIN] Impossible de charger AuthStore:', error.message);
      }
    };
    
    loadAuthStore();
  }, []);

  const handleLogin = async () => {
    if (!authStore) {
      alert('❌ Store d\'authentification en cours de chargement...');
      return;
    }

    try {
      setLoading(true);
      const { signInWithGoogle } = authStore.getState();
      const result = await signInWithGoogle();
      
      if (result.success) {
        console.log('✅ [LOGIN] Connexion réussie');
        window.location.href = '/dashboard';
      } else {
        alert('❌ Erreur de connexion: ' + result.error);
      }
    } catch (error) {
      console.error('❌ [LOGIN] Erreur:', error);
      alert('❌ Erreur de connexion: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f0f23',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#1a1a2e',
        padding: '2rem',
        borderRadius: '10px',
        border: '1px solid #0f4c75',
        textAlign: 'center',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h1 style={{ color: 'white', marginBottom: '1rem' }}>🔐 Connexion Synergia</h1>
        <p style={{ color: '#8892b0', marginBottom: '2rem' }}>
          Connectez-vous pour accéder à l'application
        </p>
        
        <button
          onClick={handleLogin}
          disabled={loading || !authStore}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: loading || !authStore ? '#666' : '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: loading || !authStore ? 'not-allowed' : 'pointer',
            marginBottom: '1rem'
          }}
        >
          {loading ? '🔄 Connexion...' : 
           !authStore ? '⏳ Chargement...' : 
           '🚀 Se connecter avec Google'}
        </button>

        <button
          onClick={() => window.location.href = '/debug'}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: 'transparent',
            color: '#64ffda',
            border: '1px solid #64ffda',
            borderRadius: '5px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          🛠️ Mode Debug
        </button>
      </div>
    </div>
  );
};

// Dashboard simple
const DashboardPage = () => {
  const [userState, setUserState] = useState({ user: null, loading: true });
  const [authStore, setAuthStore] = useState(null);

  console.log('🏠 [PROGRESSIVE] DashboardPage rendue');

  // Import dynamique de l'AuthStore
  useEffect(() => {
    const loadAuthStore = async () => {
      try {
        const module = await import('./shared/stores/authStore.js');
        const store = module.useAuthStore;
        setAuthStore(store);
        
        // Récupérer l'état initial
        const state = store.getState();
        setUserState({ user: state.user, loading: state.loading });
        
        // S'abonner aux changements
        const unsubscribe = store.subscribe((newState) => {
          setUserState({ user: newState.user, loading: newState.loading });
        });
        
        console.log('✅ [DASHBOARD] AuthStore chargé dynamiquement');
        return unsubscribe;
      } catch (error) {
        console.error('❌ [DASHBOARD] Erreur chargement AuthStore:', error);
        setUserState({ user: null, loading: false });
      }
    };
    
    loadAuthStore();
  }, []);

  const handleLogout = async () => {
    if (!authStore) {
      window.location.href = '/login';
      return;
    }

    try {
      const { signOut } = authStore.getState();
      await signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error('❌ [DASHBOARD] Erreur déconnexion:', error);
      window.location.href = '/login';
    }
  };

  if (userState.loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0f0f23',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div>🔄 Chargement...</div>
      </div>
    );
  }

  if (!userState.user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f0f23',
      color: 'white'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#1a1a2e',
        padding: '1rem 2rem',
        borderBottom: '1px solid #0f4c75',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1>🏠 Dashboard Synergia</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>👋 {userState.user.displayName || userState.user.email}</span>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#b33939',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            🚪 Déconnexion
          </button>
        </div>
      </header>

      {/* Contenu */}
      <main style={{ padding: '2rem' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '1.5rem' 
        }}>
          
          {/* Bienvenue */}
          <div style={{
            backgroundColor: '#16213e',
            padding: '1.5rem',
            borderRadius: '10px',
            border: '1px solid #0f4c75'
          }}>
            <h2 style={{ margin: '0 0 1rem 0', color: '#64ffda' }}>👋 Bienvenue !</h2>
            <p style={{ color: '#8892b0', margin: 0 }}>
              Dashboard progressif fonctionnel. Toutes les corrections sont actives.
            </p>
          </div>

          {/* Navigation */}
          <div style={{
            backgroundColor: '#16213e',
            padding: '1.5rem',
            borderRadius: '10px',
            border: '1px solid #0f4c75'
          }}>
            <h2 style={{ margin: '0 0 1rem 0', color: '#64ffda' }}>🧭 Navigation</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                onClick={() => window.location.href = '/debug'}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#0f4c75',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                🛠️ Mode Debug
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// ==========================================
// 🚀 ROUTER PROGRESSIF PRINCIPAL
// ==========================================

const ProgressiveRouter = () => {
  console.log('🔄 [PROGRESSIVE] ProgressiveRouter initialisé');
  
  return (
    <Routes>
      {/* Route Debug (fallback permanent) */}
      <Route path="/debug" element={<DebugInterface />} />
      
      {/* Route Login */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Route Dashboard */}
      <Route path="/dashboard" element={<DashboardPage />} />
      
      {/* Redirection par défaut */}
      <Route path="/" element={<Navigate to="/debug" replace />} />
      
      {/* 404 - Redirection vers debug */}
      <Route path="*" element={<Navigate to="/debug" replace />} />
    </Routes>
  );
};

// ==========================================
// 🚀 APP PRINCIPAL
// ==========================================

function App() {
  console.log('🚀 [PROGRESSIVE] App principale exécutée');
  
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    console.log('🚀 [PROGRESSIVE] App useEffect');
    setMounted(true);
    
    // Initialiser l'auth store dynamiquement
    const initializeAuth = async () => {
      try {
        const module = await import('./shared/stores/authStore.js');
        const { useAuthStore } = module;
        const { initializeAuth } = useAuthStore.getState();
        
        if (typeof initializeAuth === 'function') {
          initializeAuth();
          console.log('✅ [PROGRESSIVE] AuthStore initialisé dynamiquement');
        }
      } catch (error) {
        console.warn('⚠️ [PROGRESSIVE] Erreur initialisation AuthStore:', error.message);
      }
    };
    
    initializeAuth();
  }, []);

  if (!mounted) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0f0f23',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        🔄 Initialisation...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Router>
        <Suspense fallback={
          <div style={{
            minHeight: '100vh',
            backgroundColor: '#0f0f23',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            🔄 Chargement...
          </div>
        }>
          <ProgressiveRouter />
        </Suspense>
      </Router>
    </div>
  );
}

export default App;

// Logs de confirmation
console.log('🎉 [PROGRESSIVE] App progressif complètement chargé !');
console.log('🎯 [PROGRESSIVE] Routes: /debug, /login, /dashboard, /');
console.log('🛡️ [PROGRESSIVE] Fallback debug toujours disponible sur /debug');
