// ==========================================
// 📁 react-app/src/routes/index.jsx
// ROUTER COMPLET AVEC TOUTES LES PAGES
// ==========================================

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../shared/stores/authStore.js';

// ==========================================
// 🔐 PAGES PUBLIQUES
// ==========================================
import Login from '../pages/Login.jsx';
import NotFound from '../pages/NotFound.jsx';

// ==========================================
// 🏠 PAGES PRINCIPALES
// ==========================================
import Dashboard from '../pages/Dashboard.jsx';
import TasksPage from '../pages/TasksPage.jsx';
import ProjectsPage from '../pages/ProjectsPage.jsx';
import Analytics from '../pages/Analytics.jsx';

// ==========================================
// 🎮 PAGES GAMIFICATION
// ==========================================
import GamificationPage from '../pages/GamificationPage.jsx';
import BadgesPage from '../pages/BadgesPage.jsx';
import RewardsPage from '../pages/RewardsPage.jsx';

// ==========================================
// 👥 PAGES ÉQUIPE
// ==========================================
import TeamPage from '../pages/TeamPage.jsx';
import UsersPage from '../pages/UsersPage.jsx';

// ==========================================
// 🛠️ PAGES OUTILS
// ==========================================
import OnboardingPage from '../pages/OnboardingPage.jsx';
import TimeTrackPage from '../pages/TimeTrackPage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import SettingsPage from '../pages/SettingsPage.jsx';

// ==========================================
// 🛡️ PAGES ADMIN
// ==========================================
import AdminTaskValidationPage from '../pages/AdminTaskValidationPage.jsx';
import CompleteAdminTestPage from '../pages/CompleteAdminTestPage.jsx';

// ==========================================
// 🔒 COMPOSANT DE PROTECTION DES ROUTES
// ==========================================
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAuthenticated, loading } = useAuthStore();

  console.log('🔒 [PROTECTED-ROUTE] État:', { 
    isAuthenticated, 
    loading, 
    userUID: user?.uid,
    adminOnly 
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    console.log('🚫 [PROTECTED-ROUTE] Redirection vers login');
    return <Navigate to="/login" replace />;
  }

  // Vérification admin pour les routes admin
  if (adminOnly) {
    const isAdmin = user?.role === 'admin' || 
                   user?.profile?.role === 'admin' || 
                   user?.isAdmin === true ||
                   user?.email === 'alan.boehme61@gmail.com'; // Admin par défaut

    if (!isAdmin) {
      console.log('🚫 [PROTECTED-ROUTE] Accès admin refusé');
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

// ==========================================
// 📄 COMPOSANT PAGE TEMPORAIRE
// ==========================================
const TemporaryPage = ({ title, description, icon, backTo = "/dashboard" }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 text-center">
        <div className="text-6xl mb-4">{icon}</div>
        <h1 className="text-3xl font-bold text-white mb-4">{title}</h1>
        <p className="text-gray-400 mb-8">{description}</p>
        <p className="text-sm text-gray-500 mb-6">Cette page sera développée prochainement</p>
        <button
          onClick={() => window.location.href = backTo}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          ← Retour
        </button>
      </div>
    </div>
  </div>
);

// ==========================================
// 🚀 ROUTER PRINCIPAL COMPLET
// ==========================================
const AppRouter = () => {
  console.log('🚀 [ROUTER] Router complet initialisé avec toutes les pages');

  return (
    <Routes>
      {/* ==========================================
          🔐 ROUTES PUBLIQUES
          ========================================== */}
      <Route path="/login" element={<Login />} />

      {/* ==========================================
          🏠 ROUTES PRINCIPALES
          ========================================== */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/tasks" 
        element={
          <ProtectedRoute>
            <TasksPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/projects" 
        element={
          <ProtectedRoute>
            <ProjectsPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/analytics" 
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        } 
      />

      {/* ==========================================
          🎮 ROUTES GAMIFICATION
          ========================================== */}
      <Route 
        path="/gamification" 
        element={
          <ProtectedRoute>
            <GamificationPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/badges" 
        element={
          <ProtectedRoute>
            <BadgesPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/leaderboard" 
        element={
          <ProtectedRoute>
            <TemporaryPage 
              title="Classement"
              description="Découvrez le classement de votre équipe et comparez vos performances"
              icon="🥇"
            />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/rewards" 
        element={
          <ProtectedRoute>
            <RewardsPage />
          </ProtectedRoute>
        } 
      />

      {/* ==========================================
          👥 ROUTES ÉQUIPE
          ========================================== */}
      <Route 
        path="/team" 
        element={
          <ProtectedRoute>
            <TeamPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/users" 
        element={
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        } 
      />

      {/* ==========================================
          🛠️ ROUTES OUTILS
          ========================================== */}
      <Route 
        path="/onboarding" 
        element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/timetrack" 
        element={
          <ProtectedRoute>
            <TimeTrackPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } 
      />

      {/* ==========================================
          🛡️ ROUTES ADMIN
          ========================================== */}
      <Route 
        path="/admin/dashboard-tuteur" 
        element={
          <ProtectedRoute adminOnly>
            <TemporaryPage 
              title="Dashboard Tuteur"
              description="Interface dédiée aux tuteurs pour le suivi des équipes"
              icon="👨‍🏫"
            />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/task-validation" 
        element={
          <ProtectedRoute adminOnly>
            <AdminTaskValidationPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/complete-test" 
        element={
          <ProtectedRoute adminOnly>
            <CompleteAdminTestPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/role-permissions" 
        element={
          <ProtectedRoute adminOnly>
            <TemporaryPage 
              title="Permissions des Rôles"
              description="Gérez les permissions et accès de chaque rôle"
              icon="🔐"
              backTo="/admin/complete-test"
            />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/rewards" 
        element={
          <ProtectedRoute adminOnly>
            <TemporaryPage 
              title="Gestion des Récompenses"
              description="Configurez et gérez le système de récompenses"
              icon="🎁"
              backTo="/admin/complete-test"
            />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/badges" 
        element={
          <ProtectedRoute adminOnly>
            <TemporaryPage 
              title="Gestion des Badges"
              description="Créez et gérez les badges de l'application"
              icon="🏆"
              backTo="/admin/complete-test"
            />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/users" 
        element={
          <ProtectedRoute adminOnly>
            <TemporaryPage 
              title="Gestion des Utilisateurs"
              description="Administrez les comptes utilisateurs"
              icon="👥"
              backTo="/admin/complete-test"
            />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/analytics" 
        element={
          <ProtectedRoute adminOnly>
            <TemporaryPage 
              title="Analytics Admin"
              description="Statistiques détaillées pour les administrateurs"
              icon="📈"
              backTo="/admin/complete-test"
            />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/settings" 
        element={
          <ProtectedRoute adminOnly>
            <TemporaryPage 
              title="Paramètres Admin"
              description="Configuration avancée de l'application"
              icon="⚙️"
              backTo="/admin/complete-test"
            />
          </ProtectedRoute>
        } 
      />

      {/* ==========================================
          🔄 REDIRECTIONS ET 404
          ========================================== */}
      
      {/* Redirection racine vers dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Page 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;

// ==========================================
// 📋 LOGS DE CONFIRMATION
// ==========================================
console.log('✅ [ROUTER] Router complet initialisé');
console.log('🎯 [ROUTER] Pages activées:');
console.log('  🏠 Principales: Dashboard, Tasks, Projects, Analytics');
console.log('  🎮 Gamification: Gamification, Badges, Rewards, Leaderboard');
console.log('  👥 Équipe: Team, Users');
console.log('  🛠️ Outils: Onboarding, Timetrack, Profile, Settings');
console.log('  🛡️ Admin: 9 pages admin avec protection');
console.log('🔒 [ROUTER] Protection: Routes publiques/privées/admin');
console.log('📄 [ROUTER] Fallback: Pages temporaires pour fonctionnalités futures');
