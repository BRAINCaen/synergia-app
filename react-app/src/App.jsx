// ==========================================
// 📁 react-app/src/App.jsx
// VERSION 100% VÉRIFIÉE - TOUS IMPORTS CONFIRMÉS EXISTANTS
// ==========================================

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 🛡️ IMPORTS DE SÉCURITÉ CONFIRMÉS
import './utils/secureImportFix.js';
import './utils/safeFix.js';

// 🔧 STORE CONFIRMÉ EXISTANT
import { useAuthStore } from './shared/stores/authStore.js';

// 🛡️ COMPOSANT ROUTE PROTÉGÉE CONFIRMÉ
import ProtectedRoute from './routes/ProtectedRoute.jsx';

// ✅ PAGES DE BASE - TOUS CONFIRMÉS EXISTANTS
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import TasksPage from './pages/TasksPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';

// ✅ PAGES GAMIFICATION - TOUS CONFIRMÉS EXISTANTS
import GamificationPage from './pages/GamificationPage.jsx';
import BadgesPage from './pages/BadgesPage.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import RewardsPage from './pages/RewardsPage.jsx';

// ✅ PAGES PROGRESSION - TOUS CONFIRMÉS EXISTANTS
import RoleProgressionPage from './pages/RoleProgressionPage.jsx';
import RoleTasksPage from './pages/RoleTasksPage.jsx';
import RoleBadgesPage from './pages/RoleBadgesPage.jsx';
import EscapeProgressionPage from './pages/EscapeProgressionPage.jsx';

// ✅ PAGES ÉQUIPE - TOUS CONFIRMÉS EXISTANTS
import TeamPage from './pages/TeamPage.jsx';
import UsersPage from './pages/UsersPage.jsx';

// ✅ PAGES OUTILS - TOUS CONFIRMÉS EXISTANTS
import OnboardingPage from './pages/OnboardingPage.jsx';
import TimeTrackPage from './pages/TimeTrackPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

// ✅ PAGES ADMIN - TOUS CONFIRMÉS EXISTANTS
import AdminDashboardTuteurPage from './pages/AdminDashboardTuteurPage.jsx';
import AdminTaskValidationPage from './pages/AdminTaskValidationPage.jsx';
import CompleteAdminTestPage from './pages/CompleteAdminTestPage.jsx';
import AdminRolePermissionsPage from './pages/AdminRolePermissionsPage.jsx';
import AdminRewardsPage from './pages/AdminRewardsPage.jsx';
import AdminBadgesPage from './pages/AdminBadgesPage.jsx';
import AdminUsersPage from './pages/AdminUsersPage.jsx';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage.jsx';
import AdminSettingsPage from './pages/AdminSettingsPage.jsx';

/**
 * 🚀 APPLICATION PRINCIPALE - VERSION 100% VÉRIFIÉE
 * Tous les imports ont été vérifiés et confirmés existants
 */
function App() {
  const { user } = useAuthStore();

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* 🔓 Route publique */}
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
          />
          
          {/* 📊 Routes principales */}
          <Route 
            path="/dashboard" 
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
          />
          <Route 
            path="/tasks" 
            element={<ProtectedRoute><TasksPage /></ProtectedRoute>} 
          />
          <Route 
            path="/projects" 
            element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} 
          />
          <Route 
            path="/analytics" 
            element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} 
          />
          
          {/* 🎮 Routes gamification */}
          <Route 
            path="/gamification" 
            element={<ProtectedRoute><GamificationPage /></ProtectedRoute>} 
          />
          <Route 
            path="/badges" 
            element={<ProtectedRoute><BadgesPage /></ProtectedRoute>} 
          />
          <Route 
            path="/leaderboard" 
            element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} 
          />
          <Route 
            path="/rewards" 
            element={<ProtectedRoute><RewardsPage /></ProtectedRoute>} 
          />
          
          {/* 🎯 Routes progression de rôle */}
          <Route 
            path="/role/progression" 
            element={<ProtectedRoute><RoleProgressionPage /></ProtectedRoute>} 
          />
          <Route 
            path="/role/tasks" 
            element={<ProtectedRoute><RoleTasksPage /></ProtectedRoute>} 
          />
          <Route 
            path="/role/badges" 
            element={<ProtectedRoute><RoleBadgesPage /></ProtectedRoute>} 
          />
          <Route 
            path="/escape-progression" 
            element={<ProtectedRoute><EscapeProgressionPage /></ProtectedRoute>} 
          />
          
          {/* 👥 Routes équipe */}
          <Route 
            path="/team" 
            element={<ProtectedRoute><TeamPage /></ProtectedRoute>} 
          />
          <Route 
            path="/users" 
            element={<ProtectedRoute><UsersPage /></ProtectedRoute>} 
          />
          
          {/* 🛠️ Routes outils */}
          <Route 
            path="/onboarding" 
            element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} 
          />
          <Route 
            path="/timetrack" 
            element={<ProtectedRoute><TimeTrackPage /></ProtectedRoute>} 
          />
          <Route 
            path="/profile" 
            element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} 
          />
          <Route 
            path="/settings" 
            element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} 
          />
          
          {/* 🛡️ Routes admin */}
          <Route 
            path="/admin/dashboard-tuteur" 
            element={<ProtectedRoute><AdminDashboardTuteurPage /></ProtectedRoute>} 
          />
          <Route 
            path="/admin/task-validation" 
            element={<ProtectedRoute><AdminTaskValidationPage /></ProtectedRoute>} 
          />
          <Route 
            path="/admin/complete-test" 
            element={<ProtectedRoute><CompleteAdminTestPage /></ProtectedRoute>} 
          />
          <Route 
            path="/admin/role-permissions" 
            element={<ProtectedRoute><AdminRolePermissionsPage /></ProtectedRoute>} 
          />
          <Route 
            path="/admin/rewards" 
            element={<ProtectedRoute><AdminRewardsPage /></ProtectedRoute>} 
          />
          <Route 
            path="/admin/badges" 
            element={<ProtectedRoute><AdminBadgesPage /></ProtectedRoute>} 
          />
          <Route 
            path="/admin/users" 
            element={<ProtectedRoute><AdminUsersPage /></ProtectedRoute>} 
          />
          <Route 
            path="/admin/analytics" 
            element={<ProtectedRoute><AdminAnalyticsPage /></ProtectedRoute>} 
          />
          <Route 
            path="/admin/settings" 
            element={<ProtectedRoute><AdminSettingsPage /></ProtectedRoute>} 
          />
          
          {/* 🔄 Redirections */}
          <Route 
            path="/" 
            element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="*" 
            element={<Navigate to="/dashboard" replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
