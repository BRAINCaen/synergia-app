// ==========================================
// 📁 react-app/src/App.jsx
// APP NORMAL RESTAURÉ - AVEC AUTHSTORE CORRIGÉ
// ==========================================

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 🔧 Import du Layout sophistiqué avec sidebar
import Layout from './components/layout/Layout.jsx';

// Stores (maintenant corrigé)
import { useAuthStore } from './shared/stores/authStore.js';

// ✅ Import du correctif d'erreurs simplifié
import './utils/safeFix.js';

// Pages principales
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

// Pages admin existantes
import AdminTaskValidationPage from './pages/AdminTaskValidationPage.jsx';
import CompleteAdminTestPage from './pages/CompleteAdminTestPage.jsx';

// Pages admin nouvellement créées
import AdminDashboardTuteurPage from './pages/AdminDashboardTuteurPage.jsx';
import AdminRolePermissionsPage from './pages/AdminRolePermissionsPage.jsx';
import AdminRewardsPage from './pages/AdminRewardsPage.jsx';
import AdminBadgesPage from './pages/AdminBadgesPage.jsx';
import AdminUsersPage from './pages/AdminUsersPage.jsx';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage.jsx';
import AdminSettingsPage from './pages/AdminSettingsPage.jsx';

console.log('🚀 App.jsx chargé - Synergia v3.5');

/**
 * 🎯 COMPOSANT PRINCIPAL SÉCURISÉ
 */
const App = () => {
  const { user, loading: authLoading, checkAuthState } = useAuthStore();

  // Vérifier l'état d'authentification au montage
  useEffect(() => {
    console.log('🔐 Vérification état auth...');
    checkAuthState();
  }, [checkAuthState]);

  // Écran de chargement
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement de Synergia...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Routes>
          {/* ==========================================
              🔐 ROUTES PUBLIQUES (Non connecté)
              ========================================== */}
          {!user ? (
            <>
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          ) : (
            /* ==========================================
               🔒 ROUTES PROTÉGÉES (Connecté)
               ========================================== */
            <Route
              path="/*"
              element={
                <Layout>
                  <Routes>
                    {/* ==========================================
                        📊 PAGES PRINCIPALES
                        ========================================== */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/tasks" element={<TasksPage />} />
                    <Route path="/projects" element={<ProjectsPage />} />
                    <Route path="/projects/:id" element={<ProjectDetailPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/gamification" element={<GamificationPage />} />
                    <Route path="/team" element={<TeamPage />} />
                    <Route path="/users" element={<UsersPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/onboarding" element={<OnboardingPage />} />
                    <Route path="/time-track" element={<TimeTrackPage />} />

                    {/* ==========================================
                        🎮 PAGES GAMIFICATION
                        ========================================== */}
                    <Route path="/rewards" element={<RewardsPage />} />
                    <Route path="/badges" element={<BadgesPage />} />
                    <Route path="/leaderboard" element={<LeaderboardPage />} />

                    {/* ==========================================
                        🎭 PAGES GESTION DES RÔLES
                        ========================================== */}
                    <Route path="/role-progression" element={<RoleProgressionPage />} />
                    <Route path="/role-tasks" element={<RoleTasksPage />} />
                    <Route path="/role-badges" element={<RoleBadgesPage />} />
                    <Route path="/escape-progression" element={<EscapeProgressionPage />} />

                    {/* ==========================================
                        🛡️ PAGES ADMIN
                        ========================================== */}
                    <Route path="/admin/dashboard-tuteur" element={<AdminDashboardTuteurPage />} />
                    <Route path="/admin/task-validation" element={<AdminTaskValidationPage />} />
                    <Route path="/admin/role-permissions" element={<AdminRolePermissionsPage />} />
                    <Route path="/admin/rewards" element={<AdminRewardsPage />} />
                    <Route path="/admin/badges" element={<AdminBadgesPage />} />
                    <Route path="/admin/users" element={<AdminUsersPage />} />
                    <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
                    <Route path="/admin/settings" element={<AdminSettingsPage />} />
                    <Route path="/admin/test" element={<CompleteAdminTestPage />} />

                    {/* Route par défaut pour les chemins inconnus */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Layout>
              }
            />
          )}
        </Routes>
      </div>
    </Router>
  );
};

export default App;

// ==========================================
// 📋 LOGS DE CONFIRMATION
// ==========================================
console.log('✅ App.jsx restauré avec AuthStore corrigé');
console.log('🔧 Toutes les routes et fonctionnalités disponibles');
console.log('🛡️ Version stable avec Layout complet');
console.log('🚀 Synergia v3.5 - Mode Production');
