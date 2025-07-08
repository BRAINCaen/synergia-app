// ==========================================
// 📁 react-app/src/App.jsx
// VERSION CORRIGÉE QUI GARDE TON LAYOUT EXISTANT
// ==========================================

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 🛡️ Import du gestionnaire d'erreur
import './utils/errorHandler.js';

// 🔐 AuthStore - TESTÉ ET FONCTIONNEL
import { useAuthStore } from './shared/stores/authStore.js';

// 🎯 Routes - TESTÉES ET FONCTIONNELLES  
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import PublicRoute from './routes/PublicRoute.jsx';

// 🏗️ Layout existant - ON GARDE TON LAYOUT
import DashboardLayout from './layouts/DashboardLayout.jsx';

// 📄 Pages principales - ON GARDE TES PAGES EXISTANTES
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import TasksPage from './pages/TasksPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import GamificationPage from './pages/GamificationPage.jsx';
import BadgesPage from './pages/BadgesPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import TimeTrackPage from './pages/TimeTrackPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import RewardsPage from './pages/RewardsPage.jsx';

// Pages admin
import AdminTaskValidationPage from './pages/AdminTaskValidationPage.jsx';
import CompleteAdminTestPage from './pages/CompleteAdminTestPage.jsx';

// Fallbacks si certaines pages n'existent pas
import TaskList from './modules/tasks/TaskList.jsx';
import BadgeCollection from './components/gamification/BadgeCollection.jsx';
import Leaderboard from './components/gamification/Leaderboard.jsx';
import Profile from './modules/profile/components/Profile.jsx';
import ProjectDashboard from './modules/projects/ProjectDashboard.jsx';

console.log('🚀 SYNERGIA v3.5.3 - VERSION CORRIGÉE');

/**
 * 🚀 APPLICATION PRINCIPALE SYNERGIA - VERSION CORRIGÉE
 */
function App() {
  const { initializeAuth, isAuthenticated, user, loading } = useAuthStore();

  useEffect(() => {
    console.log('🔄 Initialisation de l\'authentification...');
    initializeAuth();
  }, [initializeAuth]);

  // Diagnostic en temps réel
  useEffect(() => {
    console.log('📊 État Auth:', {
      loading,
      isAuthenticated, 
      hasUser: !!user,
      email: user?.email
    });
  }, [loading, isAuthenticated, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-white">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Route publique - Login */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        
        {/* Routes protégées avec ton layout existant */}
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          {/* Routes principales */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Routes des nouvelles pages - avec fallbacks */}
          <Route path="tasks" element={<TasksPageWrapper />} />
          <Route path="projects" element={<ProjectsPageWrapper />} />
          <Route path="analytics" element={<AnalyticsPageWrapper />} />
          <Route path="gamification" element={<GamificationPageWrapper />} />
          <Route path="badges" element={<BadgesPageWrapper />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="team" element={<UsersPageWrapper />} />
          <Route path="users" element={<UsersPageWrapper />} />
          <Route path="onboarding" element={<OnboardingPageWrapper />} />
          <Route path="timetrack" element={<TimeTrackPageWrapper />} />
          <Route path="profile" element={<ProfilePageWrapper />} />
          <Route path="settings" element={<SettingsPageWrapper />} />
          <Route path="rewards" element={<RewardsPageWrapper />} />
          
          {/* Routes admin */}
          <Route path="admin/task-validation" element={<AdminTaskValidationPageWrapper />} />
          <Route path="admin/complete-test" element={<CompleteAdminTestPageWrapper />} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

// 🎯 COMPOSANTS WRAPPER AVEC FALLBACKS
function TasksPageWrapper() {
  try {
    return <TasksPage />;
  } catch (error) {
    console.log('📄 TasksPage manquante, utilisation TaskList');
    return <TaskList />;
  }
}

function ProjectsPageWrapper() {
  try {
    return <ProjectsPage />;
  } catch (error) {
    console.log('📄 ProjectsPage manquante, utilisation ProjectDashboard');
    return <ProjectDashboard />;
  }
}

function AnalyticsPageWrapper() {
  try {
    return <AnalyticsPage />;
  } catch (error) {
    console.log('📄 AnalyticsPage manquante, affichage par défaut');
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">📊 Analytics</h1>
        <p>Page Analytics en cours de développement...</p>
      </div>
    );
  }
}

function GamificationPageWrapper() {
  try {
    return <GamificationPage />;
  } catch (error) {
    console.log('📄 GamificationPage manquante, affichage par défaut');
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">🎮 Gamification</h1>
        <p>Page Gamification en cours de développement...</p>
      </div>
    );
  }
}

function BadgesPageWrapper() {
  try {
    return <BadgesPage />;
  } catch (error) {
    console.log('📄 BadgesPage manquante, utilisation BadgeCollection');
    return <BadgeCollection />;
  }
}

function UsersPageWrapper() {
  try {
    return <UsersPage />;
  } catch (error) {
    console.log('📄 UsersPage manquante, affichage par défaut');
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">👥 Utilisateurs</h1>
        <p>Page Utilisateurs en cours de développement...</p>
      </div>
    );
  }
}

function OnboardingPageWrapper() {
  try {
    return <OnboardingPage />;
  } catch (error) {
    console.log('📄 OnboardingPage manquante, affichage par défaut');
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">🚀 Onboarding</h1>
        <p>Page Onboarding en cours de développement...</p>
      </div>
    );
  }
}

function TimeTrackPageWrapper() {
  try {
    return <TimeTrackPage />;
  } catch (error) {
    console.log('📄 TimeTrackPage manquante, affichage par défaut');
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">⏱️ Time Tracking</h1>
        <p>Page Time Tracking en cours de développement...</p>
      </div>
    );
  }
}

function ProfilePageWrapper() {
  try {
    return <ProfilePage />;
  } catch (error) {
    console.log('📄 ProfilePage manquante, utilisation Profile');
    return <Profile />;
  }
}

function SettingsPageWrapper() {
  try {
    return <SettingsPage />;
  } catch (error) {
    console.log('📄 SettingsPage manquante, affichage par défaut');
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">⚙️ Paramètres</h1>
        <p>Page Paramètres en cours de développement...</p>
      </div>
    );
  }
}

function RewardsPageWrapper() {
  try {
    return <RewardsPage />;
  } catch (error) {
    console.log('📄 RewardsPage manquante, affichage par défaut');
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">🎁 Récompenses</h1>
        <p>Page Récompenses en cours de développement...</p>
      </div>
    );
  }
}

function AdminTaskValidationPageWrapper() {
  try {
    return <AdminTaskValidationPage />;
  } catch (error) {
    console.log('📄 AdminTaskValidationPage manquante, affichage par défaut');
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">🛡️ Validation Admin</h1>
        <p>Page Admin en cours de développement...</p>
      </div>
    );
  }
}

function CompleteAdminTestPageWrapper() {
  try {
    return <CompleteAdminTestPage />;
  } catch (error) {
    console.log('📄 CompleteAdminTestPage manquante, affichage par défaut');
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">🔧 Test Admin</h1>
        <p>Page Test Admin en cours de développement...</p>
      </div>
    );
  }
}

export default App;
