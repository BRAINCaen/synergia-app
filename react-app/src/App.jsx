// ==========================================
// 📁 react-app/src/App.jsx
// REACT AVEC ROUTER - ÉTAPE 2
// ==========================================

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';

// ==========================================
// 🏠 PAGE DASHBOARD
// ==========================================
function Dashboard() {
  const [currentTime, setCurrentTime] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const updateTime = () => setCurrentTime(new Date().toLocaleString());
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const styles = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '20px',
      padding: '40px',
      color: 'white'
    },
    header: {
      textAlign: 'center',
      marginBottom: '40px'
    },
    title: {
      fontSize: '3rem',
      fontWeight: 'bold',
      marginBottom: '10px'
    },
    nav: {
      display: 'flex',
      justifyContent: 'center',
      gap: '20px',
      marginBottom: '40px',
      flexWrap: 'wrap'
    },
    navButton: {
      background: 'linear-gradient(45deg, #3b82f6, #6366f1)',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '10px',
      color: 'white',
      fontSize: '1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      textDecoration: 'none',
      display: 'inline-block',
      transition: 'transform 0.2s'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px',
      marginTop: '30px'
    },
    card: {
      background: 'rgba(255, 255, 255, 0.1)',
      padding: '30px',
      borderRadius: '15px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      textAlign: 'center'
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>🏠 Dashboard Synergia</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
            Application React complète avec navigation
          </p>
        </div>

        {/* Navigation */}
        <nav style={styles.nav}>
          <Link to="/tasks" style={styles.navButton}>✅ Tâches</Link>
          <Link to="/projects" style={styles.navButton}>📁 Projets</Link>
          <Link to="/team" style={styles.navButton}>👥 Équipe</Link>
          <Link to="/gamification" style={styles.navButton}>🎮 Gamification</Link>
          <Link to="/analytics" style={styles.navButton}>📊 Analytics</Link>
        </nav>

        {/* Cartes d'information */}
        <div style={styles.grid}>
          <div style={styles.card}>
            <h3>⏰ Heure Actuelle</h3>
            <p style={{ fontSize: '1.5rem', color: '#22c55e', marginTop: '10px' }}>
              {currentTime}
            </p>
          </div>

          <div style={styles.card}>
            <h3>⚛️ React Status</h3>
            <p style={{ fontSize: '1.2rem', color: '#22c55e', marginTop: '10px' }}>
              ✅ Fonctionnel avec Router
            </p>
          </div>

          <div style={styles.card}>
            <h3>🧭 Navigation</h3>
            <p style={{ fontSize: '1.2rem', color: '#60a5fa', marginTop: '10px' }}>
              5 pages disponibles
            </p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button
            style={styles.navButton}
            onClick={() => {
              console.log('🔧 Dashboard: Test console OK');
              alert('✅ Dashboard React fonctionne parfaitement !');
            }}
          >
            🧪 Tester Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 📄 PAGES SIMPLES
// ==========================================
function TasksPage() {
  return (
    <PageTemplate 
      title="✅ Tâches" 
      emoji="✅"
      description="Gestion des tâches et projets"
      content="Interface de gestion des tâches à développer"
    />
  );
}

function ProjectsPage() {
  return (
    <PageTemplate 
      title="📁 Projets" 
      emoji="📁"
      description="Suivi des projets en cours"
      content="Dashboard des projets à développer"
    />
  );
}

function TeamPage() {
  return (
    <PageTemplate 
      title="👥 Équipe" 
      emoji="👥"
      description="Gestion de l'équipe et collaborateurs"
      content="Interface équipe à développer"
    />
  );
}

function GamificationPage() {
  return (
    <PageTemplate 
      title="🎮 Gamification" 
      emoji="🎮"
      description="Système de points et récompenses"
      content="Module gamification à développer"
    />
  );
}

function AnalyticsPage() {
  return (
    <PageTemplate 
      title="📊 Analytics" 
      emoji="📊"
      description="Statistiques et analyses"
      content="Dashboard analytics à développer"
    />
  );
}

// ==========================================
// 🎨 TEMPLATE DE PAGE RÉUTILISABLE
// ==========================================
function PageTemplate({ title, emoji, description, content }) {
  const navigate = useNavigate();
  
  const styles = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    },
    container: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '20px',
      padding: '60px',
      textAlign: 'center',
      color: 'white',
      maxWidth: '600px',
      width: '100%'
    },
    emoji: {
      fontSize: '6rem',
      marginBottom: '20px',
      display: 'block'
    },
    title: {
      fontSize: '3rem',
      fontWeight: 'bold',
      marginBottom: '20px'
    },
    button: {
      background: 'linear-gradient(45deg, #3b82f6, #6366f1)',
      border: 'none',
      padding: '15px 30px',
      borderRadius: '10px',
      color: 'white',
      fontSize: '1.1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      margin: '10px',
      transition: 'transform 0.2s'
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <span style={styles.emoji}>{emoji}</span>
        <h1 style={styles.title}>{title}</h1>
        <p style={{ fontSize: '1.3rem', marginBottom: '20px', opacity: 0.9 }}>
          {description}
        </p>
        <p style={{ fontSize: '1.1rem', marginBottom: '40px', opacity: 0.7 }}>
          {content}
        </p>
        
        <div>
          <button
            style={styles.button}
            onClick={() => navigate('/dashboard')}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            🏠 Retour Dashboard
          </button>
          
          <button
            style={styles.button}
            onClick={() => {
              console.log(`🔧 ${title}: Test console OK`);
              alert(`✅ ${title} fonctionne !`);
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            🧪 Tester Page
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 🚀 COMPOSANT PRINCIPAL APP
// ==========================================
function App() {
  useEffect(() => {
    console.log('🚀 App avec React Router chargé !');
    console.log('🧭 5 pages disponibles via navigation');
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/gamification" element={<GamificationPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        
        {/* Page 404 */}
        <Route path="*" element={
          <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #dc2626, #7f1d1d)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            textAlign: 'center',
            fontFamily: 'Arial, sans-serif'
          }}>
            <div>
              <h1 style={{ fontSize: '6rem', marginBottom: '20px' }}>404</h1>
              <p style={{ fontSize: '1.5rem', marginBottom: '30px' }}>Page non trouvée</p>
              <Link 
                to="/dashboard" 
                style={{
                  background: 'linear-gradient(45deg, #3b82f6, #6366f1)',
                  padding: '15px 30px',
                  borderRadius: '10px',
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}
              >
                🏠 Retour Dashboard
              </Link>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
