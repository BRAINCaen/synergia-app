// ==========================================
// 📁 react-app/src/App.jsx
// VERSION COMPLÈTE AVEC INTÉGRATION SYSTÈME DE BADGES V3.5
// ==========================================

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout principal
import Layout from './components/layout/Layout.jsx';

// Store d'authentification (utilisé dans le projet)
import { useAuthStore, initializeAuthStore } from './shared/stores/authStore.js';

// 🏆 INTÉGRATION SYSTÈME DE BADGES V3.5
import { BadgeNotificationManager } from './components/gamification/BadgeNotification.jsx';

// ==========================================
// 📄 PAGES PRINCIPALES
// ==========================================
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import TasksPage from './pages/TasksPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import GamificationPage from './pages/GamificationPage.jsx';
import TeamPage from './pages/TeamPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import RewardsPage from './pages/RewardsPage.jsx';
import BadgesPage from './pages/BadgesPage.jsx'; // 🏆 PAGE BADGES REFAITE
import TimeTrackPage from './pages/TimeTrackPage.jsx';
import RoleProgressionPage from './pages/RoleProgressionPage.jsx';

// ==========================================
// 🛡️ PAGES ADMIN
// ==========================================
import AdminTaskValidationPage from './pages/AdminTaskValidationPage.jsx';
import CompleteAdminTestPage from './pages/CompleteAdminTestPage.jsx';
import AdminRolePermissionsPage from './pages/AdminRolePermissionsPage.jsx';
import AdminUsersPage from './pages/AdminUsersPage.jsx';
import AdminRewardsPage from './pages/AdminRewardsPage.jsx';
import AdminBadgesPage from './pages/AdminBadgesPage.jsx';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage.jsx';
import AdminSettingsPage from './pages/AdminSettingsPage.jsx';
// import AdminDemoCleanerPage from './pages/AdminDemoCleanerPage.jsx'; // ❌ FICHIER MANQUANT
import AdminObjectiveValidationPage from './pages/AdminObjectiveValidationPage.jsx';

// ==========================================
// 🛡️ COMPOSANT DE PROTECTION DES ROUTES
// ==========================================
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement de Synergia...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// ==========================================
// 🛡️ COMPOSANT DE PROTECTION ADMIN
// ==========================================
const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// ==========================================
// 🎯 COMPOSANT PRINCIPAL APP
// ==========================================
function App() {
  const { initializeAuth } = useAuthStore();

  // 🚀 INITIALISATION DE L'APPLICATION
  useEffect(() => {
    console.log('🚀 Initialisation Synergia v3.5...');
    
    // Initialiser l'authentification
    initializeAuth();
    
    // Initialiser le store d'authentification
    initializeAuthStore();
    
    console.log('✅ Synergia v3.5 initialisé avec système de badges avancé');
  }, [initializeAuth]);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* ==========================================
              🔐 ROUTE DE CONNEXION (NON PROTÉGÉE)
              ========================================== */}
          <Route path="/login" element={<Login />} />

          {/* ==========================================
              🏠 ROUTES PRINCIPALES (PROTÉGÉES)
              ========================================== */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Redirection par défaut */}
            <Route index element={<Navigate to="/dashboard" replace />} />

            {/* Pages principales */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="team" element={<TeamPage />} />
            <Route path="users" element={<UsersPage />} />

            {/* ==========================================
                🎮 PAGES GAMIFICATION & PROGRESSION
                ========================================== */}
            <Route path="gamification" element={<GamificationPage />} />
            <Route path="rewards" element={<RewardsPage />} />
            <Route path="badges" element={<BadgesPage />} /> {/* 🏆 PAGE BADGES REFAITE */}
            <Route path="progression" element={<RoleProgressionPage />} />

            {/* ==========================================
                👤 PAGES PERSONNELLES
                ========================================== */}
            <Route path="onboarding" element={<OnboardingPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="timetrack" element={<TimeTrackPage />} />

            {/* ==========================================
                🛡️ ROUTES ADMIN (PROTÉGÉES)
                ========================================== */}
            <Route
              path="admin/task-validation"
              element={
                <AdminRoute>
                  <AdminTaskValidationPage />
                </AdminRoute>
              }
            />
            <Route
              path="admin/objective-validation"
              element={
                <AdminRoute>
                  <AdminObjectiveValidationPage />
                </AdminRoute>
              }
            />
            <Route
              path="admin/complete-test"
              element={
                <AdminRoute>
                  <CompleteAdminTestPage />
                </AdminRoute>
              }
            />
            <Route
              path="admin/role-permissions"
              element={
                <AdminRoute>
                  <AdminRolePermissionsPage />
                </AdminRoute>
              }
            />
            <Route
              path="admin/users"
              element={
                <AdminRoute>
                  <AdminUsersPage />
                </AdminRoute>
              }
            />
            <Route
              path="admin/rewards"
              element={
                <AdminRoute>
                  <AdminRewardsPage />
                </AdminRoute>
              }
            />
            <Route
              path="admin/badges"
              element={
                <AdminRoute>
                  <AdminBadgesPage />
                </AdminRoute>
              }
            />
            <Route
              path="admin/analytics"
              element={
                <AdminRoute>
                  <AdminAnalyticsPage />
                </AdminRoute>
              }
            />
            <Route
              path="admin/settings"
              element={
                <AdminRoute>
                  <AdminSettingsPage />
                </AdminRoute>
              }
            />
            {/* TEMPORAIREMENT DÉSACTIVÉ - Fichier manquant */}
            {/* 
            <Route
              path="admin/demo-cleaner"
              element={
                <AdminRoute>
                  <AdminDemoCleanerPage />
                </AdminRoute>
              }
            />
            */}

            {/* ==========================================
                🚫 ROUTE 404 - PAGE NON TROUVÉE
                ========================================== */}
            <Route
              path="*"
              element={
                <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🤖</div>
                    <h1 className="text-4xl font-bold text-white mb-4">404 - Page Non Trouvée</h1>
                    <p className="text-gray-300 mb-8">
                      La page que vous recherchez n'existe pas dans Synergia.
                    </p>
                    <button
                      onClick={() => window.history.back()}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Retour
                    </button>
                  </div>
                </div>
              }
            />
          </Route>
        </Routes>

        {/* ==========================================
            🏆 GESTIONNAIRE DE NOTIFICATIONS DE BADGES
            NOUVEAU - Système de notifications premium
            ========================================== */}
        <BadgeNotificationManager />

        {/* ==========================================
            🎊 GESTIONNAIRE D'ÉVÉNEMENTS GLOBAUX
            Pour les effets spéciaux et célébrations
            ========================================== */}
        <GlobalEventManager />
      </div>
    </Router>
  );
}

// ==========================================
// 🎊 GESTIONNAIRE D'ÉVÉNEMENTS GLOBAUX
// ==========================================
const GlobalEventManager = () => {
  useEffect(() => {
    // Écouter les événements spéciaux
    const handleLegendaryBadge = (event) => {
      const { badge } = event.detail;
      
      if (badge.rarity === 'legendary') {
        // Effet spécial pour badges légendaires
        createLegendaryEffect();
      }
    };

    const handleLevelUp = (event) => {
      const { newLevel } = event.detail;
      
      if (newLevel && newLevel >= 10) {
        // Célébration pour niveaux élevés
        createLevelUpEffect();
      }
    };

    // Enregistrer les listeners
    window.addEventListener('badgeUnlocked', handleLegendaryBadge);
    window.addEventListener('levelUp', handleLevelUp);

    return () => {
      window.removeEventListener('badgeUnlocked', handleLegendaryBadge);
      window.removeEventListener('levelUp', handleLevelUp);
    };
  }, []);

  // Effet spécial pour badges légendaires
  const createLegendaryEffect = () => {
    try {
      // Créer des confettis
      if (window.confetti) {
        window.confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FFA500', '#FF6347']
        });
      }
      
      // Son spécial si disponible
      const audio = new Audio('/sounds/legendary-unlock.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Ignore les erreurs audio
      });
      
      // Flash d'écran
      document.body.style.background = 'radial-gradient(circle, rgba(255,215,0,0.3) 0%, rgba(255,215,0,0) 70%)';
      setTimeout(() => {
        document.body.style.background = '';
      }, 1000);
      
    } catch (error) {
      console.log('Effet légendaire non disponible');
    }
  };

  // Effet pour montée de niveau
  const createLevelUpEffect = () => {
    try {
      if (window.confetti) {
        window.confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.8 },
          colors: ['#3B82F6', '#8B5CF6', '#06D6A0']
        });
      }
    } catch (error) {
      console.log('Effet level up non disponible');
    }
  };

  return null; // Composant invisible
};

// ==========================================
// 🎯 EXPORT PRINCIPAL
// ==========================================
export default App;
