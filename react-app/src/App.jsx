// ==========================================
// 📁 react-app/src/App.jsx
// ÉTAPE 2: AJOUT DES STORES (AUTH + THEME)
// ==========================================

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';

// ==========================================
// 🏪 IMPORT DES STORES - TEST PROGRESSIF
// ==========================================
import { useAuthStore } from './shared/stores/authStore.js';
import { useThemeStore } from './shared/stores/themeStore.js';

/**
 * 🔐 PAGE DE LOGIN SIMPLE
 */
const LoginPage = () => {
  const { login } = useAuthStore();
  const [email, setEmail] = useState('demo@synergia.com');
  const [password, setPassword] = useState('demo123');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulation de connexion
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await login(email, password);
      console.log('✅ Connexion simulée réussie');
      
    } catch (error) {
      console.error('❌ Erreur connexion:', error);
      alert('Erreur de connexion: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
          <h1 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>Synergia v3.5</h1>
          <p style={{ color: '#6b7280' }}>Connectez-vous à votre espace</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: '#374151', marginBottom: '0.5rem' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', color: '#374151', marginBottom: '0.5rem' }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#9ca3af' : '#3b82f6',
              color: 'white',
              padding: '0.75rem',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Connexion...
              </>
            ) : (
              '🔑 Se connecter'
            )}
          </button>
        </form>

        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: '#f3f4f6',
          borderRadius: '6px',
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          <strong>Démo :</strong><br/>
          Email: demo@synergia.com<br/>
          Mot de passe: demo123
        </div>
      </div>
    </div>
  );
};

/**
 * 📄 DASHBOARD AVEC STORES
 */
const DashboardPage = () => {
  const { user, signOut } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ color: '#1f2937', marginBottom: '1rem' }}>
          🏠 Dashboard
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
          Bienvenue {user?.email || 'Utilisateur'} !
        </p>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <button
            onClick={toggleTheme}
            style={{
              background: '#8b5cf6',
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            🎨 Thème: {theme}
          </button>

          <button
            onClick={signOut}
            style={{
              background: '#ef4444',
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            🚪 Déconnexion
          </button>
        </div>

        <div style={{
          background: '#f9fafb',
          padding: '1rem',
          borderRadius: '6px',
          fontSize: '0.875rem'
        }}>
          <strong>Informations utilisateur :</strong><br/>
          Email: {user?.email || 'Non connecté'}<br/>
          UID: {user?.uid || 'N/A'}<br/>
          Thème: {theme}<br/>
          Connecté: {user ? '✅' : '❌'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {[
          { title: 'Tâches', value: '12', icon: '✅', color: '#3b82f6' },
          { title: 'Badges', value: '8', icon: '🏆', color: '#10b981' },
          { title: 'Projets', value: '3', icon: '📁', color: '#f59e0b' },
          { title: 'XP', value: '2,450', icon: '⚡', color: '#8b5cf6' }
        ].map(stat => (
          <div key={stat.title} style={{
            background: 'white',
            borderRadius: '8px',
            padding: '1.5rem',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: stat.color, marginBottom: '0.25rem' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{stat.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * 🏆 PAGE BADGES MISE À JOUR
 */
const BadgesPage = () => {
  const { user } = useAuthStore();

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ color: '#1f2937', marginBottom: '1rem' }}>🏆 Mes Badges</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
        Badges gagnés par {user?.email || 'l\'utilisateur'}
      </p>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem'
      }}>
        {[
          { emoji: '🎯', name: 'Premier pas', description: 'Première connexion', rarity: 'common' },
          { emoji: '⚡', name: 'Rapide', description: 'Tâche en moins de 5min', rarity: 'uncommon' },
          { emoji: '🎓', name: 'Apprenant', description: '10 badges gagnés', rarity: 'rare' },
          { emoji: '🔥', name: 'Motivé', description: '7 jours consécutifs', rarity: 'epic' }
        ].map(badge => (
          <div key={badge.name} style={{
            background: 'white',
            border: `2px solid ${
              badge.rarity === 'epic' ? '#8b5cf6' :
              badge.rarity === 'rare' ? '#3b82f6' :
              badge.rarity === 'uncommon' ? '#10b981' : '#6b7280'
            }`,
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{badge.emoji}</div>
            <h3 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>{badge.name}</h3>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              {badge.description}
            </p>
            <span style={{
              fontSize: '0.75rem',
              padding: '4px 8px',
              borderRadius: '12px',
              background: badge.rarity === 'epic' ? '#ede9fe' :
                         badge.rarity === 'rare' ? '#dbeafe' :
                         badge.rarity === 'uncommon' ? '#d1fae5' : '#f3f4f6',
              color: badge.rarity === 'epic' ? '#7c3aed' :
                     badge.rarity === 'rare' ? '#2563eb' :
                     badge.rarity === 'uncommon' ? '#059669' : '#4b5563'
            }}>
              {badge.rarity}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * 👤 PAGE PROFIL MISE À JOUR
 */
const ProfilePage = () => {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ color: '#1f2937', marginBottom: '2rem' }}>👤 Mon Profil</h1>
      
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '500px',
        margin: '0 auto',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👨‍💻</div>
          <h2 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>
            {user?.displayName || user?.email || 'Utilisateur'}
          </h2>
          <p style={{ color: '#6b7280' }}>Niveau 5 • 2,450 XP</p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: '#1f2937', marginBottom: '1rem' }}>📊 Statistiques</h3>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>8</div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Badges</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>42</div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Tâches</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>12</div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Projets</div>
            </div>
          </div>
        </div>

        <div style={{
          background: '#f9fafb',
          padding: '1rem',
          borderRadius: '8px',
          fontSize: '0.875rem'
        }}>
          <h4 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>🔧 Informations techniques</h4>
          <div style={{ color: '#6b7280' }}>
            Email: {user?.email || 'Non connecté'}<br/>
            UID: {user?.uid || 'N/A'}<br/>
            Thème: {theme}<br/>
            Dernière connexion: {new Date().toLocaleDateString('fr-FR')}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 🧭 NAVIGATION AVEC STORES
 */
const Navigation = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  
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
        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1f2937' }}>
          Synergia v3.5
        </span>
        {user && (
          <span style={{ fontSize: '0.875rem', color: '#6b7280', marginLeft: '1rem' }}>
            • {user.email}
          </span>
        )}
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
 * 🛡️ PROTECTION DE ROUTES
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#6b7280' }}>Chargement...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

/**
 * 🎯 COMPOSANT PRINCIPAL - ÉTAPE 2
 */
const App = () => {
  const [debugInfo, setDebugInfo] = useState({
    authStoreLoaded: false,
    themeStoreLoaded: false,
    userChecked: false
  });

  const { checkAuthState, loading: authLoading, user } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    console.log('🚀 App étape 2 - Stores importés');
    setDebugInfo(prev => ({ 
      ...prev, 
      authStoreLoaded: true,
      themeStoreLoaded: true 
    }));

    // Vérifier l'état d'authentification
    const initAuth = async () => {
      try {
        await checkAuthState();
        setDebugInfo(prev => ({ ...prev, userChecked: true }));
        console.log('✅ État auth vérifié');
      } catch (error) {
        console.error('❌ Erreur vérification auth:', error);
      }
    };

    initAuth();
  }, [checkAuthState]);

  // Ajouter les styles pour les animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  try {
    return (
      <Router>
        <div style={{ 
          minHeight: '100vh', 
          background: '#f9fafb',
          ...(theme === 'dark' ? { background: '#1f2937', color: 'white' } : {})
        }}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={
              <ProtectedRoute>
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
              </ProtectedRoute>
            } />
          </Routes>

          {/* Debug panel étendu */}
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
            ✅ Étape 2: Stores<br/>
            Auth: {debugInfo.authStoreLoaded ? '✅' : '❌'} • 
            Theme: {debugInfo.themeStoreLoaded ? '✅' : '❌'}<br/>
            User: {user ? '✅' : '❌'} • 
            Checked: {debugInfo.userChecked ? '✅' : '❌'}
          </div>
        </div>
      </Router>
    );

  } catch (error) {
    console.error('❌ Erreur étape 2:', error);
    
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
          <h1>❌ Erreur Étape 2 - Stores</h1>
          <p>Les stores d'authentification ou de thème ont échoué</p>
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

console.log('🚀 App étape 2 défini avec succès - Stores ajoutés');

export default App;
