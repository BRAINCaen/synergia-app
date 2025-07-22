// ==========================================
// 📁 react-app/src/App.jsx
// APP DEBUG D'URGENCE - DIAGNOSTIC COMPLET
// ==========================================

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

// Logs immédiats pour vérifier l'exécution
console.log('🚨 [EMERGENCY] App.jsx chargé !');
console.log('🔍 [EMERGENCY] React version:', React.version);
console.log('🔍 [EMERGENCY] Window location:', window.location.href);

// Test simple d'abord
const EmergencyTest = () => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    console.log('🚨 [EMERGENCY] EmergencyTest monté !');
    setMounted(true);
    
    // Test toutes les 2 secondes
    const interval = setInterval(() => {
      console.log('💗 [EMERGENCY] App est vivant !', new Date().toISOString());
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1a1a2e',
      color: 'white',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '2rem' }}>
          🚨 EMERGENCY DEBUG MODE
        </h1>
        
        <div style={{
          backgroundColor: '#16213e',
          padding: '2rem',
          borderRadius: '10px',
          marginBottom: '2rem',
          border: '2px solid #0f4c75'
        }}>
          <h2>État de l'Application</h2>
          <div style={{ textAlign: 'left', marginTop: '1rem' }}>
            <div>✅ React chargé: {React.version}</div>
            <div>✅ App.jsx exécuté: {mounted ? 'OUI' : 'NON'}</div>
            <div>✅ URL actuelle: {window.location.href}</div>
            <div>✅ Environnement: {import.meta.env.MODE}</div>
            <div>✅ Timestamp: {new Date().toLocaleString()}</div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#16213e',
          padding: '2rem',
          borderRadius: '10px',
          marginBottom: '2rem',
          border: '2px solid #0f4c75'
        }}>
          <h2>Tests des Corrections</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div>
              <strong>XP Safety:</strong><br />
              {typeof window.getXPRewardSafely === 'function' ? '✅ ACTIF' : '❌ MANQUANT'}
            </div>
            <div>
              <strong>Motion:</strong><br />
              {typeof window.motion === 'object' ? '✅ ACTIF' : '❌ MANQUANT'}
            </div>
            <div>
              <strong>Progress Service:</strong><br />
              {typeof window.updateUserProgress === 'function' ? '✅ ACTIF' : '❌ MANQUANT'}
            </div>
            <div>
              <strong>Error Boundary:</strong><br />
              ✅ ACTIF (vous voyez cette page)
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#16213e',
          padding: '2rem',
          borderRadius: '10px',
          marginBottom: '2rem',
          border: '2px solid #0f4c75'
        }}>
          <h2>Actions de Debug</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
            <button
              onClick={() => {
                console.log('🧪 Test corrections démarré');
                if (window.testCorrections) {
                  window.testCorrections();
                } else {
                  console.log('❌ testCorrections non trouvée');
                }
              }}
              style={{
                backgroundColor: '#0f4c75',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              🧪 Test Corrections
            </button>
            
            <button
              onClick={() => {
                console.log('🧹 Nettoyage localStorage');
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
              }}
              style={{
                backgroundColor: '#b33939',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              🧹 Reset Complet
            </button>
            
            <button
              onClick={() => {
                console.log('📊 État des stores');
                if (window.useAuthStore) {
                  const state = window.useAuthStore.getState();
                  console.log('AuthStore:', state);
                } else {
                  console.log('❌ AuthStore non disponible');
                }
              }}
              style={{
                backgroundColor: '#2d8a2f',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              📊 Debug Stores
            </button>
            
            <button
              onClick={() => {
                console.log('🔄 Force reload');
                window.location.reload();
              }}
              style={{
                backgroundColor: '#6b46c1',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              🔄 Recharger
            </button>
          </div>
        </div>

        <div style={{
          backgroundColor: '#16213e',
          padding: '2rem',
          borderRadius: '10px',
          border: '2px solid #0f4c75'
        }}>
          <h2>Diagnostic Complet</h2>
          <div style={{ textAlign: 'left', fontSize: '14px', marginTop: '1rem' }}>
            <div><strong>URL:</strong> {window.location.pathname}</div>
            <div><strong>User Agent:</strong> {navigator.userAgent}</div>
            <div><strong>Cookies:</strong> {document.cookie ? 'Présents' : 'Aucun'}</div>
            <div><strong>Local Storage:</strong> {Object.keys(localStorage).length} entrées</div>
            <div><strong>Session Storage:</strong> {Object.keys(sessionStorage).length} entrées</div>
            <div><strong>Console logs:</strong> Vérifiez la console pour plus de détails</div>
          </div>
        </div>

        <div style={{ marginTop: '2rem', fontSize: '14px', opacity: 0.7 }}>
          Synergia v3.5.3 - Mode Debug d'Urgence<br />
          Si vous voyez cette page, React fonctionne correctement
        </div>
      </div>
    </div>
  );
};

// Import des corrections en mode debug
try {
  console.log('🔍 [EMERGENCY] Import des corrections...');
  
  // XP Safety
  import('./utils/xpRewardSafety.js')
    .then(() => console.log('✅ [EMERGENCY] XP Safety importé'))
    .catch(err => console.log('❌ [EMERGENCY] XP Safety échoué:', err));
  
  // Production Error Suppression
  import('./utils/productionErrorSuppression.js')
    .then(() => console.log('✅ [EMERGENCY] Error Suppression importé'))
    .catch(err => console.log('❌ [EMERGENCY] Error Suppression échoué:', err));
  
} catch (error) {
  console.log('❌ [EMERGENCY] Erreur import corrections:', error);
}

// Fonction App principale
function App() {
  console.log('🚨 [EMERGENCY] Fonction App() exécutée !');
  
  const [debugInfo, setDebugInfo] = useState({
    mounted: false,
    errors: [],
    stores: {}
  });

  useEffect(() => {
    console.log('🚨 [EMERGENCY] App useEffect exécuté !');
    
    setDebugInfo(prev => ({ ...prev, mounted: true }));
    
    // Test des stores
    setTimeout(() => {
      try {
        if (window.useAuthStore) {
          const authState = window.useAuthStore.getState();
          console.log('📊 [EMERGENCY] AuthStore état:', authState);
          setDebugInfo(prev => ({ 
            ...prev, 
            stores: { ...prev.stores, auth: authState } 
          }));
        }
      } catch (error) {
        console.log('❌ [EMERGENCY] Erreur test stores:', error);
        setDebugInfo(prev => ({ 
          ...prev, 
          errors: [...prev.errors, error.message] 
        }));
      }
    }, 1000);
    
  }, []);

  // Rendu conditionnel pour debug
  return (
    <div id="synergia-app-root">
      <EmergencyTest />
      
      {/* Informations de debug en overlay */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        backgroundColor: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        maxWidth: '300px',
        zIndex: 9999
      }}>
        <div><strong>DEBUG INFO:</strong></div>
        <div>Mounted: {debugInfo.mounted ? '✅' : '❌'}</div>
        <div>Errors: {debugInfo.errors.length}</div>
        <div>Stores: {Object.keys(debugInfo.stores).length}</div>
        <div>Mode: {import.meta.env.MODE}</div>
      </div>
    </div>
  );
}

export default App;

// Logs de confirmation
console.log('🚨 [EMERGENCY] App.jsx complètement chargé et exporté !');
