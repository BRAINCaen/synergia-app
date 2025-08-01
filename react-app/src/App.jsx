// ==========================================
// 📁 react-app/src/App.jsx
// REACT AVEC AUTHENTIFICATION - ÉTAPE 3
// ==========================================

import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';

// ==========================================
// 🔐 CONTEXTE D'AUTHENTIFICATION SIMPLE
// ==========================================
const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si un utilisateur est déjà connecté (localStorage)
    const savedUser = localStorage.getItem('synergia_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Erreur parsing user:', error);
        localStorage.removeItem('synergia_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    
    // Simulation d'authentification
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Utilisateurs de test
    const testUsers = {
      'admin@synergia.com': {
        id: '1',
        email: 'admin@synergia.com',
        name: 'Admin Synergia',
        role: 'admin',
        avatar: '👑'
      },
      'user@synergia.com': {
        id: '2', 
        email: 'user@synergia.com',
        name: 'Utilisateur Test',
        role: 'user',
        avatar: '👤'
      },
      'manager@synergia.com': {
        id: '3',
        email: 'manager@synergia.com', 
        name: 'Manager Test',
        role: 'manager',
        avatar: '🧑‍💼'
      }
    };

    const foundUser = testUsers[email];
    if (foundUser && password === 'test123') {
      setUser(foundUser);
      localStorage.setItem('synergia_user', JSON.stringify(foundUser));
      setLoading(false);
      return { success: true, user: foundUser };
    } else {
      setLoading(false);
      return { success: false, error: 'Email ou mot de passe incorrect' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('synergia_user');
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook pour utiliser l'authentification
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// ==========================================
// 🔐 PAGE DE CONNEXION
// ==========================================
function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      console.log('✅ Connexion réussie:', result.user);
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

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
      padding: '40px',
      width: '100%',
      maxWidth: '400px',
      color: 'white'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    input: {
      padding: '15px',
      borderRadius: '10px',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      fontSize: '1rem'
    },
    button: {
      background: 'linear-gradient(45deg, #3b82f6, #6366f1)',
      border: 'none',
      padding: '15px',
      borderRadius: '10px',
      color: 'white',
      fontSize: '1.1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'transform 0.2s'
    },
    testAccounts: {
      marginTop: '30px',
      padding: '20px',
      background: 'rgba(0, 0, 0, 0.2)',
      borderRadius: '10px',
      fontSize: '0.9rem'
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🔐 Connexion</h1>
          <p style={{ opacity: 0.8 }}>Synergia v3.5.3</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />

          {error && (
            <div style={{ 
              color: '#ff6b6b', 
              textAlign: 'center', 
              padding: '10px',
              background: 'rgba(255, 107, 107, 0.1)',
              borderRadius: '5px'
            }}>
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '🔄 Connexion...' : '🚀 Se connecter'}
          </button>
        </form>

        {/* Comptes de test */}
        <div style={styles.testAccounts}>
          <h3 style={{ marginBottom: '15px', color: '#22c55e' }}>🧪 Comptes de test</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              type="button"
              onClick={() => { setEmail('admin@synergia.com'); setPassword('test123'); }}
              style={{ ...styles.button, padding: '8px', fontSize: '0.9rem' }}
            >
              👑 Admin (admin@synergia.com)
            </button>
            <button
              type="button"
              onClick={() => { setEmail('manager@synergia.com'); setPassword('test123'); }}
              style={{ ...styles.button, padding: '8px', fontSize: '0.9rem' }}
            >
              🧑‍💼 Manager (manager@synergia.com)
            </button>
            <button
              type="button"
              onClick={() => { setEmail('user@synergia.com'); setPassword('test123'); }}
              style={{ ...styles.button, padding: '8px', fontSize: '0.9rem' }}
            >
              👤 User (user@synergia.com)
            </button>
          </div>
          <p style={{ marginTop: '15px', fontSize: '0.8rem', opacity: 0.7 }}>
            Mot de passe pour tous : <strong>test123</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 🛡️ PROTECTION DES ROUTES
// ==========================================
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

// ==========================================
// 🏠 HEADER AVEC UTILISATEUR
// ==========================================
function Header() {
  const { user, logout } = useAuth();
  
  const styles = {
    header: {
      background: 'rgba(0, 0, 0, 0.2)',
      padding: '15px 30px',
      borderRadius: '15px',
      marginBottom: '30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: 'white'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px'
    },
    avatar: {
      fontSize: '2rem'
    },
    button: {
      background: 'linear-gradient(45deg, #ef4444, #dc2626)',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '8px',
      color: 'white',
      fontSize: '0.9rem',
      fontWeight: 'bold',
      cursor: 'pointer'
    }
  };

  return (
    <div style={styles.header}>
      <div style={styles.userInfo}>
        <span style={styles.avatar}>{user.avatar}</span>
        <div>
          <div style={{ fontWeight: 'bold' }}>{user.name}</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
            {user.role === 'admin' ? '👑 Administrateur' : 
             user.role === 'manager' ? '🧑‍💼 Manager' : '👤 Utilisateur'}
          </div>
        </div>
      </div>
      
      <button onClick={logout} style={styles.button}>
        🚪 Déconnexion
      </button>
    </div>
  );
}

// ==========================================
// 🏠 DASHBOARD AVEC AUTHENTIFICATION
// ==========================================
function Dashboard() {
  const [currentTime, setCurrentTime] = useState('');
  const { user } = useAuth();

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
    title: {
      fontSize: '3rem',
      fontWeight: 'bold',
      marginBottom: '10px',
      textAlign: 'center'
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
        <Header />
        
        <h1 style={styles.title}>🏠 Dashboard</h1>
        <p style={{ textAlign: 'center', fontSize: '1.2rem', opacity: 0.9, marginBottom: '40px' }}>
          Bienvenue {user.name} ! Application complète avec authentification.
        </p>

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
            <h3>👤 Utilisateur Connecté</h3>
            <p style={{ fontSize: '1.2rem', color: '#60a5fa', marginTop: '10px' }}>
              {user.avatar} {user.name}
            </p>
            <p style={{ fontSize: '1rem', opacity: 0.8 }}>
              {user.role === 'admin' ? '👑 Administrateur' : 
               user.role === 'manager' ? '🧑‍💼 Manager' : '👤 Utilisateur'}
            </p>
          </div>

          <div style={styles.card}>
            <h3>🔐 Authentification</h3>
            <p style={{ fontSize: '1.2rem', color: '#22c55e', marginTop: '10px' }}>
              ✅ Fonctionnelle
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 📄 PAGES AVEC AUTHENTIFICATION
// ==========================================
function PageTemplate({ title, emoji, description, content }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const styles = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    },
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '20px',
      padding: '40px',
      color: 'white'
    },
    content: {
      textAlign: 'center',
      marginTop: '30px'
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
        <Header />
        
        <div style={styles.content}>
          <span style={styles.emoji}>{emoji}</span>
          <h1 style={styles.title}>{title}</h1>
          <p style={{ fontSize: '1.3rem', marginBottom: '20px', opacity: 0.9 }}>
            {description}
          </p>
          <p style={{ fontSize: '1.1rem', marginBottom: '20px', opacity: 0.7 }}>
            {content}
          </p>
          <p style={{ fontSize: '1rem', marginBottom: '40px', color: '#60a5fa' }}>
            Connecté en tant que : {user.avatar} {user.name} ({user.role})
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
          </div>
        </div>
      </div>
    </div>
  );
}

// Pages individuelles
function TasksPage() {
  return (
    <PageTemplate 
      title="✅ Tâches" 
      emoji="✅"
      description="Gestion des tâches et projets"
      content="Interface de gestion des tâches avec authentification"
    />
  );
}

function ProjectsPage() {
  return (
    <PageTemplate 
      title="📁 Projets" 
      emoji="📁"
      description="Suivi des projets en cours"
      content="Dashboard des projets avec gestion des rôles"
    />
  );
}

function TeamPage() {
  return (
    <PageTemplate 
      title="👥 Équipe" 
      emoji="👥"
      description="Gestion de l'équipe et collaborateurs"
      content="Interface équipe avec authentification et rôles"
    />
  );
}

function GamificationPage() {
  return (
    <PageTemplate 
      title="🎮 Gamification" 
      emoji="🎮"
      description="Système de points et récompenses"
      content="Module gamification avec profil utilisateur"
    />
  );
}

function AnalyticsPage() {
  return (
    <PageTemplate 
      title="📊 Analytics" 
      emoji="📊"
      description="Statistiques et analyses"
      content="Dashboard analytics avec données utilisateur"
    />
  );
}

// ==========================================
// 🚀 COMPOSANT PRINCIPAL APP
// ==========================================
function App() {
  useEffect(() => {
    console.log('🚀 App avec authentification chargé !');
    console.log('🔐 3 comptes de test disponibles');
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/tasks" element={
            <ProtectedRoute>
              <TasksPage />
            </ProtectedRoute>
          } />
          
          <Route path="/projects" element={
            <ProtectedRoute>
              <ProjectsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/team" element={
            <ProtectedRoute>
              <TeamPage />
            </ProtectedRoute>
          } />
          
          <Route path="/gamification" element={
            <ProtectedRoute>
              <GamificationPage />
            </ProtectedRoute>
          } />
          
          <Route path="/analytics" element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          } />
          
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
    </AuthProvider>
  );
}

export default App;
