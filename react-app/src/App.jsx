// ==========================================
// 📁 react-app/src/App.jsx  
// VERSION MINIMAL DEBUG - Pour identifier le problème exact
// ==========================================

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './shared/stores/authStore.js';

console.log('🔬 App.jsx - Version Debug chargée');

/**
 * 🔬 COMPOSANT DEBUG MINIMAL
 */
function DebugApp() {
  const { initializeAuth, isAuthenticated, user, loading } = useAuthStore();
  const [debugInfo, setDebugInfo] = useState('Initialisation...');

  useEffect(() => {
    console.log('🔄 Initialisation Auth Debug...');
    setDebugInfo('Initialisation Auth...');
    
    try {
      initializeAuth();
      setDebugInfo('Auth initialisée');
    } catch (error) {
      console.error('❌ Erreur Auth:', error);
      setDebugInfo(`Erreur Auth: ${error.message}`);
    }
  }, [initializeAuth]);

  useEffect(() => {
    const info = {
      loading,
      isAuthenticated,
      hasUser: !!user,
      userEmail: user?.email
    };
    console.log('📊 État Auth:', info);
    setDebugInfo(`Auth: ${JSON.stringify(info, null, 2)}`);
  }, [loading, isAuthenticated, user]);

  // Affichage pendant loading
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1f2937',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid #374151',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <h2>🔬 Synergia Debug</h2>
          <p>Initialisation en cours...</p>
          <pre style={{ 
            backgroundColor: '#374151', 
            padding: '10px', 
            borderRadius: '5px',
            fontSize: '12px',
            textAlign: 'left'
          }}>
            {debugInfo}
          </pre>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Si pas d'utilisateur -> Login simple
  if (!user || !isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1f2937',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ 
          textAlign: 'center',
          backgroundColor: '#374151',
          padding: '40px',
          borderRadius: '10px',
          maxWidth: '400px'
        }}>
          <h1>🚀 Synergia v3.5</h1>
          <h2>Mode Debug</h2>
          <p>État: Non connecté</p>
          <div style={{ 
            backgroundColor: '#1f2937', 
            padding: '15px', 
            borderRadius: '5px',
            fontSize: '12px',
            textAlign: 'left',
            marginTop: '20px'
          }}>
            <pre>{debugInfo}</pre>
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Recharger
          </button>
        </div>
      </div>
    );
  }

  // Si utilisateur connecté -> Dashboard simple
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header simple */}
      <header style={{
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        padding: '15px 20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ margin: 0, color: '#1f2937' }}>
            🚀 Synergia v3.5 - Debug Mode
          </h1>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
            <span style={{ color: '#6b7280' }}>
              {user.email}
            </span>
            <button
              onClick={() => {
                const { signOut } = useAuthStore.getState();
                signOut();
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main style={{ padding: '40px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: '#1f2937', marginTop: 0 }}>
              ✅ Application Debug Fonctionnelle !
            </h2>
            
            <div style={{
              backgroundColor: '#f3f4f6',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <h3>📊 Informations Utilisateur :</h3>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Nom:</strong> {user.displayName || 'Non défini'}</p>
              <p><strong>UID:</strong> {user.uid}</p>
              <p><strong>État Auth:</strong> ✅ Connecté</p>
            </div>

            <div style={{
              backgroundColor: '#dcfce7',
              border: '1px solid #bbf7d0',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <h3 style={{ color: '#166534', margin: '0 0 10px 0' }}>
                🎉 Diagnostic de Réparation
              </h3>
              <p style={{ color: '#166534', margin: 0 }}>
                Si tu vois cette page, cela signifie que les corrections de routing ont fonctionné ! 
                L'app peut maintenant se charger correctement.
              </p>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
              marginTop: '30px'
            }}>
              <button
                onClick={() => window.location.href = '/dashboard'}
                style={{
                  padding: '15px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                🏠 Aller au Dashboard
              </button>
              
              <button
                onClick={() => window.location.href = '/tasks'}
                style={{
                  padding: '15px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                ✅ Voir les Tâches
              </button>
              
              <button
                onClick={() => window.location.href = '/projects'}
                style={{
                  padding: '15px',
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                📁 Voir les Projets
              </button>
              
              <button
                onClick={() => window.location.href = '/gamification'}
                style={{
                  padding: '15px',
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                🎮 Gamification
              </button>
            </div>

            <div style={{
              marginTop: '30px',
              padding: '15px',
              backgroundColor: '#fef3c7',
              border: '1px solid #fcd34d',
              borderRadius: '8px'
            }}>
              <h3 style={{ color: '#92400e', margin: '0 0 10px 0' }}>
                🔧 Prochaines Étapes
              </h3>
              <p style={{ color: '#92400e', margin: 0 }}>
                Une fois que cette version debug fonctionne, on pourra restaurer 
                progressivement la navigation complète et toutes les fonctionnalités avancées.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * 🚀 APP PRINCIPALE AVEC ROUTER
 */
function App() {
  return (
    <Router>
      <Routes>
        <Route path="*" element={<DebugApp />} />
      </Routes>
    </Router>
  );
}

console.log('✅ App Debug exportée');
export default App;
