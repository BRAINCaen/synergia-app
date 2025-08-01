// ==========================================
// 📁 react-app/src/App.jsx
// REACT ULTRA-MINIMAL SANS IMPORTS EXTERNES
// ==========================================

import React, { useState, useEffect } from 'react';

function App() {
  const [currentTime, setCurrentTime] = useState('');
  const [counter, setCounter] = useState(0);
  const [message, setMessage] = useState('Application React chargée !');

  useEffect(() => {
    console.log('🚀 React App chargé avec succès !');
    
    // Mettre à jour l'heure
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleString());
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const styles = {
    app: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      color: 'white',
      padding: '20px'
    },
    container: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '20px',
      padding: '40px',
      textAlign: 'center',
      maxWidth: '600px',
      width: '100%'
    },
    title: {
      fontSize: '3rem',
      fontWeight: 'bold',
      marginBottom: '20px',
      background: 'linear-gradient(45deg, #fff, #e0e7ff)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    successBadge: {
      background: 'linear-gradient(45deg, #10b981, #34d399)',
      padding: '10px 20px',
      borderRadius: '25px',
      fontSize: '1rem',
      fontWeight: 'bold',
      marginBottom: '30px',
      display: 'inline-block'
    },
    button: {
      background: 'linear-gradient(45deg, #3b82f6, #6366f1)',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '10px',
      color: 'white',
      fontSize: '1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      margin: '10px',
      transition: 'transform 0.2s',
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginTop: '30px'
    },
    infoCard: {
      background: 'rgba(255, 255, 255, 0.1)',
      padding: '20px',
      borderRadius: '15px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }
  };

  const handleButtonClick = (action) => {
    console.log(`🔧 Action: ${action}`);
    
    switch (action) {
      case 'counter':
        setCounter(prev => prev + 1);
        setMessage(`Compteur cliqué ${counter + 1} fois !`);
        break;
      case 'test':
        alert('✅ React fonctionne parfaitement !');
        break;
      case 'console':
        console.log('🧪 Test console depuis React');
        console.log('📊 État actuel:', { counter, currentTime, message });
        setMessage('Test console exécuté - vérifiez les DevTools');
        break;
      case 'reload':
        window.location.reload();
        break;
      default:
        setMessage('Action inconnue');
    }
  };

  return (
    <div style={styles.app}>
      <div style={styles.container}>
        {/* Titre principal */}
        <h1 style={styles.title}>🚀 Synergia React</h1>
        
        {/* Badge de succès */}
        <div style={styles.successBadge}>
          ✅ REACT FONCTIONNE PARFAITEMENT !
        </div>
        
        {/* Message dynamique */}
        <p style={{ fontSize: '1.2rem', marginBottom: '20px' }}>
          {message}
        </p>

        {/* Heure en temps réel */}
        <div style={{ ...styles.infoCard, marginBottom: '20px' }}>
          <strong>⏰ Heure actuelle:</strong><br/>
          {currentTime}
        </div>

        {/* Compteur interactif */}
        <div style={{ ...styles.infoCard, marginBottom: '20px' }}>
          <strong>🔢 Compteur React:</strong><br/>
          <span style={{ fontSize: '2rem', color: '#22c55e' }}>{counter}</span>
        </div>

        {/* Grille d'informations */}
        <div style={styles.infoGrid}>
          <div style={styles.infoCard}>
            <strong>⚛️ React</strong><br/>
            Fonctionnel
          </div>
          <div style={styles.infoCard}>
            <strong>🔄 State</strong><br/>
            Réactif
          </div>
          <div style={styles.infoCard}>
            <strong>🎣 Hooks</strong><br/>
            OK
          </div>
          <div style={styles.infoCard}>
            <strong>🎨 CSS-in-JS</strong><br/>
            Actif
          </div>
        </div>

        {/* Boutons de test */}
        <div style={{ marginTop: '30px' }}>
          <button 
            style={styles.button}
            onClick={() => handleButtonClick('counter')}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            🔢 Compteur: {counter}
          </button>
          
          <button 
            style={styles.button}
            onClick={() => handleButtonClick('test')}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            🧪 Test Alert
          </button>
          
          <button 
            style={styles.button}
            onClick={() => handleButtonClick('console')}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            🔧 Test Console
          </button>
          
          <button 
            style={styles.button}
            onClick={() => handleButtonClick('reload')}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            🔄 Recharger
          </button>
        </div>

        {/* Message de réussite */}
        <div style={{ 
          marginTop: '30px', 
          padding: '15px', 
          background: 'rgba(34, 197, 94, 0.2)', 
          borderRadius: '10px',
          border: '2px solid rgba(34, 197, 94, 0.5)'
        }}>
          <strong style={{ color: '#22c55e' }}>🎉 SUCCÈS TOTAL !</strong><br/>
          React fonctionne parfaitement sur Netlify.<br/>
          Tous les hooks, état et interactions marchent.<br/>
          <strong>Prêt à ajouter les fonctionnalités avancées !</strong>
        </div>
      </div>
    </div>
  );
}

export default App;
