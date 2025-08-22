// ==========================================
// 📁 react-app/src/App.jsx
// VERSION DIAGNOSTIC MINIMALE POUR ISOLER LE PROBLÈME
// ==========================================

import React from 'react';

/**
 * 🚨 VERSION DIAGNOSTIC ULTRA-MINIMALE
 * Pour identifier où se produit l'erreur "n is not a function"
 */
const App = () => {
  console.log('🚀 App component rendu - début');

  try {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{
          textAlign: 'center',
          color: 'white',
          maxWidth: '600px',
          padding: '2rem'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
          
          <h1 style={{ 
            fontSize: '2.5rem', 
            marginBottom: '1rem',
            fontWeight: 'bold'
          }}>
            Synergia v3.5
          </h1>
          
          <p style={{ 
            fontSize: '1.2rem', 
            marginBottom: '2rem',
            opacity: 0.9
          }}>
            Application démarrée avec succès !
          </p>

          <div style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#a7f3d0' }}>
              🔧 Mode Diagnostic
            </h3>
            <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
              Cette version minimale teste que React fonctionne correctement.
              Si vous voyez ce message, le problème vient des imports complexes.
            </p>
          </div>

          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => {
                console.log('✅ Bouton test cliqué');
                alert('✅ React fonctionne parfaitement !');
              }}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '2px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.3)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.2)';
              }}
            >
              🧪 Test React
            </button>

            <button
              onClick={() => {
                console.log('🔄 Rechargement page...');
                window.location.reload();
              }}
              style={{
                background: 'rgba(34, 197, 94, 0.2)',
                border: '2px solid rgba(34, 197, 94, 0.4)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(34, 197, 94, 0.3)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(34, 197, 94, 0.2)';
              }}
            >
              🔄 Recharger
            </button>
          </div>

          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '6px',
            fontSize: '0.8rem',
            opacity: 0.7
          }}>
            <strong>Étapes suivantes :</strong><br/>
            1. Si cette page s'affiche → Le problème vient des imports complexes<br/>
            2. Si l'erreur persiste → Le problème vient de React/Vite lui-même<br/>
            3. Une fois confirmé → Restaurer progressivement les fonctionnalités
          </div>
        </div>
      </div>
    );

  } catch (error) {
    console.error('❌ Erreur dans App component:', error);
    
    return (
      <div style={{
        minHeight: '100vh',
        background: '#dc2626',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💥</div>
          <h1>Erreur dans App Component</h1>
          <p>{error.message}</p>
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

console.log('🚀 App component défini avec succès');

export default App;
