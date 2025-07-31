// ==========================================
// 📁 react-app/src/App.jsx
// VERSION DEBUG D'URGENCE - BYPASS TOTAL AUTH
// ==========================================

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

console.log('🚨 DEBUG URGENCE - App.jsx chargé');

// ==========================================
// 🔧 COMPOSANT DEBUG DIRECT (SANS IMPORTS EXTERNES)
// ==========================================
const EmergencyDebugPage = () => {
  const [debugInfo, setDebugInfo] = useState({
    timestamp: new Date().toLocaleTimeString(),
    userAgent: navigator.userAgent.substring(0, 50),
    url: window.location.href,
    errors: []
  });

  useEffect(() => {
    console.log('🔍 Page de debug chargée');
    
    // Capturer les erreurs
    const errorHandler = (error) => {
      console.error('💥 Erreur capturée:', error);
      setDebugInfo(prev => ({
        ...prev,
        errors: [...prev.errors, error.message || error.toString()]
      }));
    };

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', (event) => {
      errorHandler(event.reason);
    });

    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', errorHandler);
    };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: '30px',
        borderRadius: '10px',
        backdropFilter: 'blur(10px)'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          🚨 DEBUG D'URGENCE - SYNERGIA
        </h1>
        
        <div style={{
          backgroundColor: 'rgba(0,255,0,0.1)',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid rgba(0,255,0,0.3)'
        }}>
          <h2 style={{ color: '#4ade80', marginBottom: '10px' }}>
            ✅ SUCCÈS - Build et Déploiement
          </h2>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>✅ Build Netlify réussi</li>
            <li>✅ Application déployée</li>
            <li>✅ React Router fonctionne</li>
            <li>✅ JavaScript s'exécute</li>
          </ul>
        </div>

        <div style={{
          backgroundColor: 'rgba(255,255,0,0.1)',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid rgba(255,255,0,0.3)'
        }}>
          <h2 style={{ color: '#facc15', marginBottom: '10px' }}>
            🔍 INFORMATIONS DE DEBUG
          </h2>
          <p><strong>Heure:</strong> {debugInfo.timestamp}</p>
          <p><strong>URL:</strong> {debugInfo.url}</p>
          <p><strong>Navigateur:</strong> {debugInfo.userAgent}...</p>
          <p><strong>Erreurs détectées:</strong> {debugInfo.errors.length}</p>
        </div>

        {debugInfo.errors.length > 0 && (
          <div style={{
            backgroundColor: 'rgba(255,0,0,0.1)',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid rgba(255,0,0,0.3)'
          }}>
            <h2 style={{ color: '#ef4444', marginBottom: '10px' }}>
              ❌ ERREURS CAPTURÉES
            </h2>
            {debugInfo.errors.map((error, index) => (
              <p key={index} style={{ 
                backgroundColor: 'rgba(0,0,0,0.2)', 
                padding: '8px', 
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '12px'
              }}>
                {error}
              </p>
            ))}
          </div>
        )}

        <div style={{
          backgroundColor: 'rgba(0,0,255,0.1)',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid rgba(0,0,255,0.3)'
        }}>
          <h2 style={{ color: '#3b82f6', marginBottom: '10px' }}>
            🎯 PLAN D'ACTION
          </h2>
          <ol style={{ margin: 0, paddingLeft: '20px' }}>
            <li>Cette page prouve que React fonctionne</li>
            <li>Le problème est dans les imports ou contexts</li>
            <li>Nous allons identifier le composant coupable</li>
            <li>Puis réactiver progressivement les fonctionnalités</li>
          </ol>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginTop: '30px'
        }}>
          <button 
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🔄 Recharger
          </button>
          
          <button 
            onClick={() => console.log('Test console log')}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🧪 Test Console
          </button>
          
          <button 
            onClick={() => alert('JavaScript fonctionne !')}
            style={{
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ⚡ Test JavaScript
          </button>
          
          <button 
            onClick={() => {
              const info = {
                localStorage: typeof localStorage !== 'undefined',
                sessionStorage: typeof sessionStorage !== 'undefined',
                fetch: typeof fetch !== 'undefined',
                Promise: typeof Promise !== 'undefined'
              };
              console.log('🔍 APIs disponibles:', info);
              alert('Voir console pour détails APIs');
            }}
            style={{
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🔧 Test APIs
          </button>
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: '30px',
          padding: '20px',
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: '8px'
        }}>
          <h3 style={{ color: '#4ade80' }}>🎉 BONNE NOUVELLE</h3>
          <p>Si vous voyez cette page, le build est 100% réussi !</p>
          <p>Il reste juste à identifier pourquoi l'auth bloque.</p>
          <p style={{ fontSize: '12px', opacity: 0.8, marginTop: '15px' }}>
            Version: Synergia v3.5.3 - Debug d'urgence
          </p>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 🧩 COMPOSANT APP ULTRA-SIMPLE
// ==========================================
function App() {
  const [appLoaded, setAppLoaded] = useState(false);

  useEffect(() => {
    console.log('🚨 App.jsx - Version debug d\'urgence');
    console.log('⏱️ Chargement immédiat sans auth...');
    
    // Chargement immédiat sans délai
    setAppLoaded(true);
    
    // Debug des erreurs globales
    window.addEventListener('error', (e) => {
      console.error('💥 Erreur globale:', e.error);
    });
    
    window.addEventListener('unhandledrejection', (e) => {
      console.error('💥 Promise rejetée:', e.reason);
    });
    
  }, []);

  if (!appLoaded) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#1a1a2e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div>Chargement debug...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/*" element={<EmergencyDebugPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

// ==========================================
// 📋 LOGS CRITIQUES
// ==========================================
console.log('🚨 APP DEBUG D\'URGENCE CHARGÉ');
console.log('🎯 Cette version bypass complètement l\'auth');
console.log('✅ Si cette page s\'affiche → React fonctionne');
console.log('❌ Si blocage persiste → Problème plus profond');
console.log('🔍 Ouvrir F12 Console pour plus d\'infos');
