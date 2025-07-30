// ==========================================
// 📁 react-app/src/App.jsx
// VERSION FINALE AVEC LAYOUT FONCTIONNEL
// ==========================================

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';

// 🛡️ IMPORT DU CORRECTIF SÉCURISÉ EN PREMIER
import './utils/secureImportFix.js';

// Stores
import { useAuthStore } from './shared/stores/authStore.js';

// Pages principales - Imports originaux conservés
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import TasksPage from './pages/TasksPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import ProjectDetailPage from './pages/ProjectDetailPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import GamificationPage from './pages/GamificationPage.jsx';
import TeamPage from './pages/TeamPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import RewardsPage from './pages/RewardsPage.jsx';
import BadgesPage from './pages/BadgesPage.jsx';
import TimeTrackPage from './pages/TimeTrackPage.jsx';

// Pages nouvellement créées
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import RoleProgressionPage from './pages/RoleProgressionPage.jsx';
import RoleTasksPage from './pages/RoleTasksPage.jsx';
import RoleBadgesPage from './pages/RoleBadgesPage.jsx';
import EscapeProgressionPage from './pages/EscapeProgressionPage.jsx';

// Pages admin
import AdminTaskValidationPage from './pages/AdminTaskValidationPage.jsx';
import CompleteAdminTestPage from './pages/CompleteAdminTestPage.jsx';
import AdminDashboardTuteurPage from './pages/AdminDashboardTuteurPage.jsx';
import AdminRolePermissionsPage from './pages/AdminRolePermissionsPage.jsx';
import AdminRewardsPage from './pages/AdminRewardsPage.jsx';
import AdminBadgesPage from './pages/AdminBadgesPage.jsx';
import AdminUsersPage from './pages/AdminUsersPage.jsx';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage.jsx';
import AdminSettingsPage from './pages/AdminSettingsPage.jsx';

// Import du correctif d'erreurs
import './utils/safeFix.js';

// 🎨 LAYOUT FONCTIONNEL INTÉGRÉ
const WorkingLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
    }
  };

  // Navigation complète - TOUTES TES PAGES
  const navigationSections = {
    principal: {
      title: 'PRINCIPAL',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
        { path: '/tasks', label: 'Tâches', icon: '✅' },
        { path: '/projects', label: 'Projets', icon: '📁' },
        { path: '/analytics', label: 'Analytics', icon: '📊' }
      ]
    },
    gamification: {
      title: 'GAMIFICATION',
      items: [
        { path: '/gamification', label: 'Gamification', icon: '🎮' },
        { path: '/badges', label: 'Badges', icon: '🏆' },
        { path: '/leaderboard', label: 'Classement', icon: '👑' },
        { path: '/rewards', label: 'Récompenses', icon: '🎁' }
      ]
    },
    progression: {
      title: 'PROGRESSION',
      items: [
        { path: '/role-progression', label: 'Progression Rôles', icon: '🎯' },
        { path: '/role-tasks', label: 'Tâches par Rôle', icon: '📋' },
        { path: '/role-badges', label: 'Badges Rôles', icon: '🏅' },
        { path: '/escape-progression', label: 'Escape Progression', icon: '🚀' }
      ]
    },
    equipe: {
      title: 'ÉQUIPE & SOCIAL',
      items: [
        { path: '/team', label: 'Équipe', icon: '👥' },
        { path: '/users', label: 'Utilisateurs', icon: '👤' }
      ]
    },
    outils: {
      title: 'OUTILS',
      items: [
        { path: '/onboarding', label: 'Onboarding', icon: '📖' },
        { path: '/timetrack', label: 'Pointeuse', icon: '⏰' },
        { path: '/profile', label: 'Profil', icon: '👨‍💼' },
        { path: '/settings', label: 'Paramètres', icon: '⚙️' }
      ]
    },
    admin: {
      title: 'ADMINISTRATION',
      items: [
        { path: '/admin/dashboard-tuteur', label: 'Dashboard Tuteur', icon: '👨‍🏫' },
        { path: '/admin/task-validation', label: 'Validation Tâches', icon: '🛡️' },
        { path: '/admin/complete-test', label: 'Test Complet', icon: '🧪' },
        { path: '/admin/role-permissions', label: 'Permissions Rôles', icon: '🔐' },
        { path: '/admin/rewards', label: 'Gestion Récompenses', icon: '🎁' },
        { path: '/admin/badges', label: 'Gestion Badges', icon: '🏆' },
        { path: '/admin/users', label: 'Gestion Utilisateurs', icon: '👥' },
        { path: '/admin/analytics', label: 'Analytics Admin', icon: '📈' },
        { path: '/admin/settings', label: 'Paramètres Admin', icon: '⚙️' }
      ]
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '256px' : '256px',
        backgroundColor: '#1f2937',
        color: '#ffffff',
        display: window.innerWidth < 1024 && !sidebarOpen ? 'none' : 'block',
        position: window.innerWidth < 1024 ? 'fixed' : 'relative',
        height: '100vh',
        overflowY: 'auto',
        zIndex: 50
      }}>
        {/* Header sidebar */}
        <div style={{ padding: '16px', backgroundColor: '#111827', borderBottom: '1px solid #374151' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#3b82f6',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              S
            </div>
            <span style={{ fontWeight: '600', fontSize: '18px' }}>Synergia</span>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ padding: '8px' }}>
          {Object.entries(navigationSections).map(([key, section]) => (
            <div key={key} style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#9ca3af',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                margin: '0 0 8px 12px'
              }}>
                {section.title}
              </h3>
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '8px 12px',
                      margin: '2px 0',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      color: isActive ? '#ffffff' : '#d1d5db',
                      backgroundColor: isActive ? '#374151' : 'transparent',
                      borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.target.style.backgroundColor = '#374151';
                        e.target.style.color = '#ffffff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = '#d1d5db';
                      }
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>{item.icon}</span>
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* User info */}
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          padding: '16px',
          backgroundColor: '#111827',
          borderTop: '1px solid #374151'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#6b7280',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              👤
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: '#ffffff' }}>
                {user?.displayName || user?.email?.split('@')[0] || 'Utilisateur'}
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '8px 12px',
              backgroundColor: '#374151',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              justifyContent: 'center'
            }}
          >
            🚪 Déconnexion
          </button>
        </div>
      </div>

      {/* Overlay mobile */}
      {sidebarOpen && window.innerWidth < 1024 && (
        <div
          style={{
            position: 'fixed',
            inset: '0',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 40
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Contenu principal */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header mobile */}
        {window.innerWidth < 1024 && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                padding: '8px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '20px'
              }}
            >
              ☰
            </button>
            <span style={{ fontWeight: '600', color: '#1f2937' }}>Synergia</span>
            <div style={{ width: '36px' }}></div>
          </div>
        )}

        {/* Zone de contenu - CRITIQUE */}
        <main style={{
          flex: 1,
          backgroundColor: '#ffffff',
          overflow: 'auto',
          minHeight: '100vh'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
};

// 🔐 Composant de protection
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#1f2937',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #3b82f6',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p>Chargement de Synergia...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <WorkingLayout>{children}</WorkingLayout>;
};

function App() {
  const { user, loading, initialize } = useAuthStore();

  useEffect(() => {
    console.log('🚀 App - Version finale avec Layout fonctionnel');
    try {
      initialize();
    } catch (error) {
      console.error('❌ Erreur initialisation auth:', error);
    }
  }, [initialize]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#1f2937',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #3b82f6',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p>Chargement de Synergia...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {/* CSS pour l'animation */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        
        <Routes>
          {/* Route de connexion */}
          <Route path="/login" element={<Login />} />
          
          {/* Routes principales avec Layout fonctionnel */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
          <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
          
          {/* Routes gamification */}
          <Route path="/gamification" element={<ProtectedRoute><GamificationPage /></ProtectedRoute>} />
          <Route path="/badges" element={<ProtectedRoute><BadgesPage /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
          <Route path="/rewards" element={<ProtectedRoute><RewardsPage /></ProtectedRoute>} />
          
          {/* Routes progression */}
          <Route path="/role-progression" element={<ProtectedRoute><RoleProgressionPage /></ProtectedRoute>} />
          <Route path="/role-tasks" element={<ProtectedRoute><RoleTasksPage /></ProtectedRoute>} />
          <Route path="/role-badges" element={<ProtectedRoute><RoleBadgesPage /></ProtectedRoute>} />
          <Route path="/escape-progression" element={<ProtectedRoute><EscapeProgressionPage /></ProtectedRoute>} />
          
          {/* Routes équipe */}
          <Route path="/team" element={<ProtectedRoute><TeamPage /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
          
          {/* Routes outils */}
          <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
          <Route path="/timetrack" element={<ProtectedRoute><TimeTrackPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          
          {/* Routes admin */}
          <Route path="/admin/dashboard-tuteur" element={<ProtectedRoute><AdminDashboardTuteurPage /></ProtectedRoute>} />
          <Route path="/admin/task-validation" element={<ProtectedRoute><AdminTaskValidationPage /></ProtectedRoute>} />
          <Route path="/admin/complete-test" element={<ProtectedRoute><CompleteAdminTestPage /></ProtectedRoute>} />
          <Route path="/admin/role-permissions" element={<ProtectedRoute><AdminRolePermissionsPage /></ProtectedRoute>} />
          <Route path="/admin/rewards" element={<ProtectedRoute><AdminRewardsPage /></ProtectedRoute>} />
          <Route path="/admin/badges" element={<ProtectedRoute><AdminBadgesPage /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute><AdminUsersPage /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute><AdminAnalyticsPage /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute><AdminSettingsPage /></ProtectedRoute>} />
          
          {/* Redirections */}
          <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
