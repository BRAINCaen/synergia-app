// ==========================================
// 📁 react-app/src/components/routing/AppRouter.jsx
// ROUTER PRINCIPAL CORRIGÉ - Routes directes avec Layout wrapper
// ==========================================

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../layout/Layout.jsx';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { isAdmin } from '../../core/services/adminService.js';

// Import des pages existantes
import LoginPage from '../../pages/LoginPage.jsx';
import DashboardPage from '../../pages/DashboardPage.jsx';
import TasksPage from '../../pages/TasksPage.jsx';
import ProjectsPage from '../../pages/ProjectsPage.jsx';
import AnalyticsPage from '../../pages/AnalyticsPage.jsx';
import LeaderboardPage from '../../pages/LeaderboardPage.jsx';
import BadgesPage from '../../pages/BadgesPage.jsx';
import GamificationPage from '../../pages/GamificationPage.jsx';
import RewardsPage from '../../pages/RewardsPage.jsx';
import TeamPage from '../../pages/TeamPage.jsx';
import UsersPage from '../../pages/UsersPage.jsx';
import ProfilePage from '../../pages/ProfilePage.jsx';
import SettingsPage from '../../pages/SettingsPage.jsx';
import OnboardingPage from '../../pages/OnboardingPage.jsx';
import TimeTrackPage from '../../pages/TimeTrackPage.jsx';

// Import des pages admin
import AdminTaskValidationPage from '../../pages/admin/AdminTaskValidationPage.jsx';
import AdminProfileTestPage from '../../pages/admin/AdminProfileTestPage.jsx';
import AdminCompleteTestPage from '../../pages/admin/AdminCompleteTestPage.jsx';

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

// ✅ WRAPPER pour encapsuler chaque page dans Layout
const LayoutWrapper = ({ children }) => (
  <ProtectedRoute>
    <Layout>
      {children}
    </Layout>
  </ProtectedRoute>
);

const AppRouter = () => {
  const { user } = useAuthStore();
  
  return (
    <Routes>
      {/* Route de connexion - SANS Layout */}
      <Route 
        path="/login" 
        element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
      />
      
      {/* ✅ ROUTES DIRECTES - Chaque page wrappée dans Layout */}
      
      {/* Pages principales */}
      <Route path="/dashboard" element={
        <LayoutWrapper>
          <DashboardPage />
        </LayoutWrapper>
      } />
      
      <Route path="/tasks" element={
        <LayoutWrapper>
          <TasksPage />
        </LayoutWrapper>
      } />
      
      <Route path="/projects" element={
        <LayoutWrapper>
          <ProjectsPage />
        </LayoutWrapper>
      } />
      
      <Route path="/analytics" element={
        <LayoutWrapper>
          <AnalyticsPage />
        </LayoutWrapper>
      } />
      
      {/* Gamification */}
      <Route path="/leaderboard" element={
        <LayoutWrapper>
          <LeaderboardPage />
        </LayoutWrapper>
      } />
      
      <Route path="/badges" element={
        <LayoutWrapper>
          <BadgesPage />
        </LayoutWrapper>
      } />
      
      <Route path="/gamification" element={
        <LayoutWrapper>
          <GamificationPage />
        </LayoutWrapper>
      } />
      
      <Route path="/rewards" element={
        <LayoutWrapper>
          <RewardsPage />
        </LayoutWrapper>
      } />
      
      {/* Équipe & Social */}
      <Route path="/team" element={
        <LayoutWrapper>
          <TeamPage />
        </LayoutWrapper>
      } />
      
      <Route path="/users" element={
        <LayoutWrapper>
          <UsersPage />
        </LayoutWrapper>
      } />
      
      {/* Personnel */}
      <Route path="/profile" element={
        <LayoutWrapper>
          <ProfilePage />
        </LayoutWrapper>
      } />
      
      <Route path="/settings" element={
        <LayoutWrapper>
          <SettingsPage />
        </LayoutWrapper>
      } />
      
      <Route path="/onboarding" element={
        <LayoutWrapper>
          <OnboardingPage />
        </LayoutWrapper>
      } />
      
      <Route path="/timetrack" element={
        <LayoutWrapper>
          <TimeTrackPage />
        </LayoutWrapper>
      } />
      
      {/* Routes admin protégées */}
      <Route path="/admin/task-validation" element={
        <LayoutWrapper>
          <AdminRoute>
            <AdminTaskValidationPage />
          </AdminRoute>
        </LayoutWrapper>
      } />
      
      <Route path="/admin/profile-test" element={
        <LayoutWrapper>
          <AdminRoute>
            <AdminProfileTestPage />
          </AdminRoute>
        </LayoutWrapper>
      } />
      
      <Route path="/admin/complete-test" element={
        <LayoutWrapper>
          <AdminRoute>
            <AdminCompleteTestPage />
          </AdminRoute>
        </LayoutWrapper>
      } />
      
      {/* Routes de redirection */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRouter;
