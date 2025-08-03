// ==========================================
// 📁 react-app/src/App.jsx
// SYNERGIA v3.5 COMPLET - TOUTES FONCTIONNALITÉS RESTAURÉES
// ==========================================

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 🔧 Layout sophistiqué avec sidebar
import Layout from './components/layout/Layout.jsx';

// Stores (corrigé)
import { useAuthStore } from './shared/stores/authStore.js';

// Import des correctifs
import './utils/safeFix.js';

// ==========================================
// 📄 PAGES PRINCIPALES
// ==========================================
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

// ==========================================
// 🎮 PAGES GAMIFICATION
// ==========================================
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import RoleProgressionPage from './pages/RoleProgressionPage.jsx';
import RoleTasksPage from './pages/RoleTasksPage.jsx';
import RoleBadgesPage from './pages/RoleBadgesPage.jsx';
import EscapeProgressionPage from './pages/EscapeProgressionPage.jsx';

// ==========================================
// 🛡️ PAGES ADMIN
// ==========================================
import AdminTaskValidationPage from './pages/AdminTaskValidationPage.jsx';
import CompleteAdminTestPage from './pages/CompleteAdminTestPage.jsx';
import AdminDashboardTuteurPage from './pages/AdminDashboardTuteurPage.jsx';
import AdminRolePermissionsPage from './pages/AdminRolePermissionsPage.jsx';
import AdminRewardsPage from './pages/AdminRewardsPage.jsx';
import AdminBadgesPage from './pages/AdminBadgesPage.jsx';
import AdminUsersPage from './pages/AdminUsersPage.jsx';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage.jsx';
import AdminSettingsPage from './pages/AdminSettingsPage.jsx';

console.log('🚀 Synergia v3.5 COMPLET - Toutes fonctionnalités restaurées');

/**
 * 🎯 APPLICATION COMPLÈTE SYNERGIA v3.5
 */
const App = () => {
  const { user, loading: authLoading, checkAuthState } = useAuthStore();

  // Vérifier l'état d'authentification au montage
  useEffect(() => {
    console.log('🔐 Initialisation complète Synergia...');
    checkAuthState();
  }, [checkAuthState]);

  // Écran de chargement premium
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          {/* Logo animé */}
          <div className="relative mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              <span className="text-3xl">⚡</span>
            </div>
            <div className="animate-spin rounded-full h-24 w-24 border-4 border-blue-500 border-t-transparent absolute -top-2 -left-2"></div>
          </div>
          
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Synergia v3.5
          </h1>
          <p className="text-gray-400 mb-4">Chargement de votre espace collaboratif...</p>
          
          {/* Barre de progression */}
          <div className="w-64 bg-gray-700 rounded-full h-2 mx-auto">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
          </div>
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
                    <Route path="/team" element={<TeamPage />} />
                    <Route path="/users" element={<UsersPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/onboarding" element={<OnboardingPage />} />
                    <Route path="/time-track" element={<TimeTrackPage />} />

                    {/* ==========================================
                        🎮 PAGES GAMIFICATION
                        ========================================== */}
                    <Route path="/gamification" element={<GamificationPage />} />
                    <Route path="/rewards" element={<RewardsPage />} />
                    <Route path="/badges" element={<BadgesPage />} />
                    <Route path="/leaderboard" element={<LeaderboardPage />} />

                    {/* ==========================================
                        🎭 PAGES PROGRESSION RÔLES
                        ========================================== */}
                    <Route path="/role-progression" element={<RoleProgressionPage />} />
                    <Route path="/role-tasks" element={<RoleTasksPage />} />
                    <Route path="/role-badges" element={<RoleBadgesPage />} />
                    <Route path="/escape-progression" element={<EscapeProgressionPage />} />

                    {/* ==========================================
                        🛡️ PAGES ADMINISTRATION
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
// 📋 LOGS DE CONFIRMATION COMPLETS
// ==========================================
console.log('🎉 SYNERGIA v3.5 COMPLET RESTAURÉ');
console.log('📊 Pages principales: Dashboard, Tasks, Projects, Analytics');
console.log('🎮 Gamification: Rewards, Badges, Leaderboard, Role System');
console.log('🛡️ Administration: Validation, Permissions, Gestion');
console.log('👥 Social: Team, Users, Profile');
console.log('⚙️ Outils: Settings, Onboarding, TimeTrack');
console.log('🚀 TOUTES LES FONCTIONNALITÉS DISPONIBLES !');
