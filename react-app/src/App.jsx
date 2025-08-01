// ==========================================
// 📁 react-app/src/App.jsx
// VERSION HELLO WORLD - RIEN D'AUTRE
// ==========================================

import React from 'react';

console.log('🔥 HELLO WORLD VERSION CHARGÉE');

function App() {
  console.log('🎯 App component rendu');
  
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div>
        <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>
          🎉 ÇA MARCHE !
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
          Synergia v3.5.3 - Version Hello World
        </p>
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.1)',
          padding: '20px',
          borderRadius: '10px',
          marginTop: '20px'
        }}>
          <h2>✅ SUCCÈS CONFIRMÉ</h2>
          <p>• Build Netlify : OK</p>
          <p>• Déploiement : OK</p>
          <p>• React : OK</p>
          <p>• App.jsx : OK</p>
        </div>
        <button 
          onClick={() => {
            console.log('🧪 Test click bouton');
            alert('JavaScript fonctionne parfaitement !');
          }}
          style={{
            backgroundColor: '#4CAF50',
            border: 'none',
            color: 'white',
            padding: '15px 32px',
            textAlign: 'center',
            fontSize: '16px',
            margin: '20px',
            cursor: 'pointer',
            borderRadius: '5px'
          }}
        >
          🧪 Test JavaScript
        </button>
      </div>
    </div>
  );
}

export default App;
