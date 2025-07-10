// ==========================================
// 📁 react-app/src/App.jsx
// RESTAURATION COMPLÈTE - TOUTES LES VRAIES PAGES
// ==========================================

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 🎯 Imports de base
import { useAuthStore } from './shared/stores/authStore.js';
import Layout from './components/layout/Layout.jsx';
import Login from './pages/Login.jsx';

// 📄 TOUTES LES VRAIES PAGES PRINCIPALES
import Dashboard from './pages/Dashboard.jsx';
import TasksPage from './pages/TasksPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';

// 🎮 VRAIES PAGES GAMIFICATION
import GamificationPage from './pages/GamificationPage.jsx';
import BadgesPage from './pages/BadgesPage.jsx';
import RewardsPage from './pages/RewardsPage.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import ShopPage from './pages/ShopPage.jsx';

// 👥 VRAIES PAGES ÉQUIPE
import TeamPage from './pages/TeamPage.jsx';
import UsersPage from './pages/UsersPage.jsx';

// ⚙️ VRAIES PAGES UTILISATEUR
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import TimeTrackPage from './pages/TimeTrackPage.jsx';

// 📚 PAGE ONBOARDING CORRIGÉE
import OnboardingPage from './pages/OnboardingPage.jsx';

// 🛡️ VRAIES PAGES ADMIN
import AdminTaskValidationPage from './pages/AdminTaskValidationPage.jsx';
import CompleteAdminTestPage from './pages/CompleteAdminTestPage.jsx';

// 🎨 SYSTÈME TOAST
import { ToastProvider } from './shared/components/ui/Toast.jsx';

// Composant de chargement stable
const LoadingScreen = ({ message }) => (
  <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
    <div className="text-center text-white">
      <div className="text-4xl mb-4">🚀</div>
      <h1 className="text-2xl font-bold mb-2">Synergia</h1>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
      <p className="text-sm opacity-80">{message || 'Chargement...'}</p>
      <p className="text-xs opacity-60 mt-2">v3.5.3 - Mode Stable</p>
    </div>
  </div>
);

// 🆕 Pages du système de progression (nouvelles fonctionnalités)
const RoleProgressionPage = () => (
  <div className="min-h-screen bg-gray-50 p-6">
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
          <span className="text-yellow-400">👑</span>
          Progression par Rôles
        </h1>
        <p className="text-gray-600">Développez votre expertise dans vos domaines de spécialisation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <span className="text-4xl mb-4 block">📈</span>
          <h3 className="font-semibold text-gray-900 mb-2">Vue d'ensemble</h3>
          <p className="text-gray-600 text-sm">Dashboard de progression complet</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 text-center">
          <span className="text-4xl mb-4 block">🎯</span>
          <h3 className="font-semibold text-gray-900 mb-2">Tâches Spécialisées</h3>
          <p className="text-gray-600 text-sm">Tâches débloquées par niveau</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 text-center">
          <span className="text-4xl mb-4 block">🏆</span>
          <h3 className="font-semibold text-gray-900 mb-2">Badges Exclusifs</h3>
          <p className="text-gray-600 text-sm">Collection de badges par rôle</p>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">🚀 Fonctionnalités à venir :</h3>
        <ul className="text-blue-800 space-y-2">
          <li>• Dashboard de progression en temps réel</li>
          <li>• Tâches spécialisées par rôle et niveau</li>
          <li>• Système de badges exclusifs</li>
          <li>• Déverrouillages progressifs</li>
          <li>• Recommandations personnalisées</li>
        </ul>
      </div>
    </div>
  </div>
);

const RoleTasksPage = () => (
  <div className="min-h-screen bg-gray-50 p-6">
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">🎯 Tâches Spécialisées</h1>
      <p className="text-gray-600 mb-8">Tâches spécialisées débloquées selon votre progression</p>
      
      <div className="bg-white rounded-lg shadow p-8">
        <div className="w-16 h-16 bg-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-white text-2xl">🎯</span>
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">Tâches par Rôle</h3>
        <p className="text-gray-600">Système de tâches spécialisées en développement</p>
      </div>
    </div>
  </div>
);

const RoleBadgesPage = () => (
  <div className="min-h-screen bg-gray-50 p-6">
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">🏆 Badges Exclusifs</h1>
      <p className="text-gray-600 mb-8">Collection de badges spéciaux par rôle</p>
      
      <div className="bg-white rounded-lg shadow p-8">
        <div className="w-16 h-16 bg-yellow-600 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-white text-2xl">🏆</span>
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">Badges Exclusifs</h3>
        <p className="text-gray-600">Collection spéciale de badges en développement</p>
      </div>
    </div>
  </div>
);

const App = () => {
  const { user, checkAuth, isLoading } = useAuthStore();
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      try {
        console.log('🚀 Initialisation App complète...');
        
        // Vérifier l'authentification avec timeout
        const authPromise = checkAuth();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 3000)
        );
        
        try {
          await Promise.race([authPromise, timeoutPromise]);
        } catch (error) {
          console.warn('Authentification timeout, continuation');
        }
        
        setAppReady(true);
        console.log('✅ App complète prête');
      } catch (err) {
        console.error('❌ Erreur init:', err);
        setAppReady(true); // Continue même en cas d'erreur
      }
    };

    initApp();
  }, [checkAuth]);

  // Force ready après 3 secondes
  useEffect(() => {
    const forceReady = setTimeout(() => setAppReady(true), 3000);
    return () => clearTimeout(forceReady);
  }, []);

  if (!appReady) {
    return <LoadingScreen message="Chargement de toutes les fonctionnalités..." />;
  }

  console.log('🎯 App complète - User:', !!user, 'Loading:', isLoading, 'Ready:', appReady);

  return (
    <ToastProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Route de connexion */}
            <Route 
              path="/login" 
              element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
            />

            {/* Routes principales protégées */}
            <Route path="/" element={
              user ? <Layout /> : <Navigate to="/login" replace />
            }>
              {/* 🏠 Pages principales */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />

              {/* 🎮 Pages gamification */}
              <Route path="gamification" element={<GamificationPage />} />
              <Route path="badges" element={<BadgesPage />} />
              <Route path="rewards" element={<RewardsPage />} />
              <Route path="leaderboard" element={<LeaderboardPage />} />
              <Route path="shop" element={<ShopPage />} />

              {/* 🆕 Nouvelles pages du système de progression */}
              <Route path="role-progression" element={<RoleProgressionPage />} />
              <Route path="role-tasks" element={<RoleTasksPage />} />
              <Route path="role-badges" element={<RoleBadgesPage />} />

              {/* 👥 Pages équipe */}
              <Route path="team" element={<TeamPage />} />
              <Route path="users" element={<UsersPage />} />

              {/* ⚙️ Pages utilisateur */}
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="onboarding" element={<OnboardingPage />} />
              <Route path="timetrack" element={<TimeTrackPage />} />

              {/* 🛡️ Pages admin */}
              <Route path="admin/task-validation" element={<AdminTaskValidationPage />} />
              <Route path="admin/complete-test" element={<CompleteAdminTestPage />} />
            </Route>

            {/* 🚫 Page 404 */}
            <Route path="*" element={
              <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-400 mb-4">404</h1>
                  <p className="text-gray-600 mb-6">Page non trouvée</p>
                  <button 
                    onClick={() => window.location.href = '/dashboard'}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Retour au Dashboard
                  </button>
                </div>
              </div>
            } />
          </Routes>

          {/* 🎨 Effets visuels globaux */}
          <div id="confetti-container" className="pointer-events-none fixed inset-0 z-50" />
          <div id="epic-effects-container" className="pointer-events-none fixed inset-0 z-40" />
        </div>
      </Router>
    </ToastProvider>
  );
};

export default App;

console.log('✅ App COMPLÈTE restaurée - Toutes les pages reconnectées !');
