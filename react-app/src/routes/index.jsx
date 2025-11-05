// ==========================================
// 📁 react-app/src/routes/index.jsx
// ROUTES AVEC CHEMINS CORRECTS
// ==========================================

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Pages principales - CHEMINS CORRECTS
import DashboardPage from '../pages/Dashboard.jsx';
import TasksPage from '../pages/TasksPage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import LeaderboardPage from '../pages/LeaderboardPage.jsx';
import BadgesPage from '../pages/BadgesPage.jsx';
import AdminPage from '../pages/AdminPage.jsx';
import LoginPage from '../pages/Login.jsx';

// Protection des routes
import ProtectedRoute from './ProtectedRoute.jsx';
import AdminRoute from './AdminRoute.jsx';

/**
 * 🛣️ CONFIGURATION DES ROUTES DE L'APPLICATION
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Route publique - Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Routes protégées - Nécessitent une authentification */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/badges" element={<BadgesPage />} />
      </Route>

      {/* Routes admin - Nécessitent authentification + rôle admin */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/*" element={<AdminPage />} />
      </Route>

      {/* Redirection par défaut */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Route 404 - Page non trouvée */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
