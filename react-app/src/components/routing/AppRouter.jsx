// ==========================================
// 📁 react-app/src/components/routing/AppRouter.jsx
// ROUTER PRINCIPAL AVEC ROUTE LEADERBOARD CORRIGÉE
// ==========================================

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../layout/Layout.jsx';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { isAdmin } from '../../core/services/adminService.js';

// ✅ IMPORTS CORRIGÉS - Noms exacts des fichiers
import Login from '../../pages/Login.jsx';
import Dashboard from '../../pages/Dashboard.jsx';
import TasksPage from '../../pages/TasksPage.jsx';
import ProjectsPage from '../../pages/ProjectsPage.jsx';
import AnalyticsPage from '../../pages/AnalyticsPage.jsx';
import BadgesPage from '../../pages/BadgesPage.jsx';
import GamificationPage from '../../pages/GamificationPage.jsx';
import RewardsPage from '../../pages/RewardsPage.jsx';
import TeamPage from '../../pages/TeamPage.jsx';
import UsersPage from '../../pages/UsersPage.jsx';
import ProfilePage from '../../pages/ProfilePage.jsx';
import SettingsPage from '../../pages/SettingsPage.jsx';
import OnboardingPage from '../../pages/OnboardingPage.jsx';
import TimeTrackPage from '../../pages/TimeTrackPage.jsx';

// 🎯 IMPORTS PAGES DE PROGRESSION - AJOUTÉES
import RoleProgressionPage from '../../pages/RoleProgressionPage.jsx';
import RoleTasksPage from '../../pages/RoleTasksPage.jsx';
import RoleBadgesPage from '../../pages/RoleBadgesPage.jsx';

// 🚀 NOUVELLE PAGE ESCAPE PROGRESSION
import EscapeProgressionPage from '../../pages/EscapeProgressionPage.jsx';

// ✅ IMPORTS ADMIN CORRIGÉS
import AdminTaskValidationPage from '../../pages/AdminTaskValidationPage.jsx';
import CompleteAdminTestPage from '../../pages/CompleteAdminTestPage.jsx';

// 🔧 CORRECTION: Importer LeaderboardPage au lieu de Leaderboard
import LeaderboardPage from '../../pages/LeaderboardPage.jsx';

// Composant de protection des routes
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuthStore();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Composant de protection des routes admin
const AdminRoute = ({ children }) => {
  const { user } = useAuthStore();
  
  if (!isAdmin(user)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Accès Refusé</h1>
          <p className="text-gray-300">Vous n'avez pas les permissions d'administrateur.</p>
        </div>
      </div>
    );
  }
  
  return children;
};

const AppRouter = () => {
  const { user } = useAuthStore();
  
  return (
    <Routes>
      {/* Route de connexion */}
      <Route 
        path="/login" 
        element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      
      {/* Routes protégées avec layout */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        {/* Redirection par défaut */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* Pages principales */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        
        {/* 🔧 CORRECTION: Utiliser LeaderboardPage au lieu de Leaderboard */}
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="badges" element={<BadgesPage />} />
        <Route path="gamification" element={<GamificationPage />} />
        <Route path="rewards" element={<RewardsPage />} />
        
        {/* 🎯 ROUTES DE PROGRESSION - NOUVELLES ROUTES AJOUTÉES */}
        <Route path="role/progression" element={<RoleProgressionPage />} />
        <Route path="role/tasks" element={<RoleTasksPage />} />
        <Route path="role/badges" element={<RoleBadgesPage />} />
        
        {/* 🚀 NOUVELLE ROUTE ESCAPE PROGRESSION */}
        <Route path="escape-progression" element={<EscapeProgressionPage />} />
        
        {/* Équipe & Social */}
        <Route path="team" element={<TeamPage />} />
        <Route path="users" element={<UsersPage />} />
        
        {/* Personnel */}
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="onboarding" element={<OnboardingPage />} />
        <Route path="timetrack" element={<TimeTrackPage />} />
        
        {/* Routes admin protégées */}
        <Route path="admin/task-validation" element={
          <AdminRoute>
            <AdminTaskValidationPage />
          </AdminRoute>
        } />
        <Route path="admin/complete-test" element={
          <AdminRoute>
            <CompleteAdminTestPage />
          </AdminRoute>
        } />
      </Route>
      
      {/* Route de fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRouter;
