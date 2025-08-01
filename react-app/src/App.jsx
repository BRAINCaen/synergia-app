// ==========================================
// 📁 react-app/src/App.jsx
// APP PRINCIPAL - SANS DOUBLE LAYOUT
// ==========================================

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// LAYOUTS - SEULEMENT DashboardLayout
import DashboardLayout from './layouts/DashboardLayout.jsx';

// PAGES
import Dashboard from './pages/Dashboard.jsx';
import TasksPage from './pages/TasksPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import GamificationPage from './pages/GamificationPage.jsx';
import BadgesPage from './pages/BadgesPage.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import RewardsPage from './pages/RewardsPage.jsx';
import TeamPage from './pages/TeamPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import TimeTrackPage from './pages/TimeTrackPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

// PAGES ADMIN
import TaskValidationPage from './pages/admin/TaskValidationPage.jsx';
import ProfileTestPage from './pages/admin/ProfileTestPage.jsx';
import CompleteTestPage from './pages/admin/CompleteTestPage.jsx';

// AUTH
import Login from './pages/Login.jsx';
import { useAuthStore } from './shared/stores/authStore.js';

// AUTH GUARD SIMPLE
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
};

// ==========================================
// 🚀 APP PRINCIPAL - UN SEUL LAYOUT
// ==========================================
const App = () => {
  console.log('🚀 [APP] Synergia v3.5 - Initialisation...');
  
  return (
    <Router>
      <Routes>
        {/* LOGIN - SANS LAYOUT */}
        <Route path="/login" element={<Login />} />
        
        {/* TOUTES LES PAGES - AVEC DASHBOARDLAYOUT SEULEMENT */}
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
              <AnalyticsPage />
            </ProtectedRoute>
          } 
        />
        
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
              <LeaderboardPage />
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

        {/* ROUTES ADMIN */}
        <Route 
          path="/admin/task-validation" 
          element={
            <ProtectedRoute>
              <TaskValidationPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/profile-test" 
          element={
            <ProtectedRoute>
              <ProfileTestPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/complete-test" 
          element={
            <ProtectedRoute>
              <CompleteTestPage />
            </ProtectedRoute>
          } 
        />

        {/* REDIRECTIONS */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* 404 */}
        <Route 
          path="*" 
          element={
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-white mb-4">404</h1>
                <p className="text-gray-400 mb-8">Page non trouvée</p>
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  🏠 Retour au Dashboard
                </button>
              </div>
            </div>
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;
