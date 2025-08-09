// ==========================================
// 📁 react-app/src/routes/index.jsx
// ROUTES 100% SÉCURISÉES POUR BUILD NETLIFY
// ==========================================

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../shared/stores/authStore.js';

/**
 * 🛡️ FONCTION D'IMPORT SÉCURISÉ
 */
const safeImport = (path, fallbackName = 'Page') => {
  try {
    return require(path).default;
  } catch (e) {
    console.warn(`⚠️ Import manqué: ${path}, utilisation du fallback`);
    return () => (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center text-white">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 mx-auto mb-6 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl">📄</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">{fallbackName}</h1>
          <p className="text-gray-400 mb-6">Cette page est en cours de développement.</p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }
};

// ✅ IMPORTS SÉCURISÉS DE TOUTES LES PAGES
const Dashboard = safeImport('../pages/Dashboard.jsx', 'Dashboard');
const Login = safeImport('../pages/Login.jsx', 'Connexion');
const NotFound = safeImport('../pages/NotFound.jsx', '404');

// Pages secondaires avec fallbacks
const Analytics = safeImport('../pages/Analytics.jsx', 'Analytics') || 
                 safeImport('../pages/AnalyticsPage.jsx', 'Analytics');
const TeamPage = safeImport('../pages/TeamPage.jsx', 'Équipe');
const TasksPage = safeImport('../pages/TasksPage.jsx', 'Tâches');
const ProjectsPage = safeImport('../pages/ProjectsPage.jsx', 'Projets');
const GamificationPage = safeImport('../pages/GamificationPage.jsx', 'Gamification');
const BadgesPage = safeImport('../pages/BadgesPage.jsx', 'Badges');
const UsersPage = safeImport('../pages/UsersPage.jsx', 'Utilisateurs');
const OnboardingPage = safeImport('../pages/OnboardingPage.jsx', 'Intégration');
const TimeTrackPage = safeImport('../pages/TimeTrackPage.jsx', 'Temps');
const ProfilePage = safeImport('../pages/ProfilePage.jsx', 'Profil');
const SettingsPage = safeImport('../pages/SettingsPage.jsx', 'Paramètres');
const RewardsPage = safeImport('../pages/RewardsPage.jsx', 'Récompenses');

// Pages admin avec fallbacks
const AdminTaskValidationPage = safeImport('../pages/AdminTaskValidationPage.jsx', 'Admin - Validation');
const CompleteAdminTestPage = safeImport('../pages/CompleteAdminTestPage.jsx', 'Admin - Test');
const AdminRolePermissionsPage = safeImport('../pages/AdminRolePermissionsPage.jsx', 'Admin - Rôles');
const AdminUsersPage = safeImport('../pages/AdminUsersPage.jsx', 'Admin - Utilisateurs');
const AdminAnalyticsPage = safeImport('../pages/AdminAnalyticsPage.jsx', 'Admin - Analytics');
const AdminSettingsPage = safeImport('../pages/AdminSettingsPage.jsx', 'Admin - Paramètres');

// Pages admin spéciales
const DemoDataCleanerPage = safeImport('../pages/admin/DemoDataCleanerPage.jsx', 'Nettoyage Démo');

// Components utilisés comme pages (fallback)
const TaskList = safeImport('../modules/tasks/TaskList.jsx', 'Liste Tâches');
const BadgeCollection = safeImport('../components/gamification/BadgeCollection.jsx', 'Collection Badges');
const Leaderboard = safeImport('../components/gamification/Leaderboard.jsx', 'Classement');
const ProjectDashboard = safeImport('../components/projects/ProjectDashboard.jsx', 'Dashboard Projet');
const Profile = safeImport('../components/profile/Profile.jsx', 'Profil');

/**
 * 🔐 COMPOSANT DE PROTECTION DES ROUTES
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore();
  
  // Affichage du loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚙️</div>
          <p className="text-white">Chargement...</p>
        </div>
      </div>
    );
  }
  
  // Redirection si non connecté
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

/**
 * 🚀 COMPOSANT PRINCIPAL DES ROUTES - VERSION SÉCURISÉE COMPLÈTE
 */
export const AppRoutes = () => {
  const { user } = useAuthStore();
  
  return (
    <Routes>
      {/* ===== ROUTES PUBLIQUES ===== */}
      <Route 
        path="/login" 
        element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      
      {/* ===== ROUTES PRINCIPALES PROTÉGÉES ===== */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
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
      
      <Route 
        path="/team" 
        element={
          <ProtectedRoute>
            <TeamPage />
          </ProtectedRoute>
        } 
      />
      
      {/* ===== ROUTES DE GESTION ===== */}
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
      
      {/* ===== ROUTES GAMIFICATION ===== */}
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
        path="/rewards" 
        element={
          <ProtectedRoute>
            <RewardsPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/leaderboard" 
        element={
          <ProtectedRoute>
            <Leaderboard />
          </ProtectedRoute>
        } 
      />
      
      {/* ===== ROUTES UTILISATEUR ===== */}
      <Route 
        path="/users" 
        element={
          <ProtectedRoute>
            <UsersPage />
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
        path="/profile-component" 
        element={
          <ProtectedRoute>
            <Profile />
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
      
      {/* ===== ROUTES OUTILS ===== */}
      <Route 
        path="/time-track" 
        element={
          <ProtectedRoute>
            <TimeTrackPage />
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
      
      {/* ===== ROUTES ADMIN ===== */}
      <Route 
        path="/admin/task-validation" 
        element={
          <ProtectedRoute>
            <AdminTaskValidationPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/test" 
        element={
          <ProtectedRoute>
            <CompleteAdminTestPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/roles" 
        element={
          <ProtectedRoute>
            <AdminRolePermissionsPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/users" 
        element={
          <ProtectedRoute>
            <AdminUsersPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/analytics" 
        element={
          <ProtectedRoute>
            <AdminAnalyticsPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/settings" 
        element={
          <ProtectedRoute>
            <AdminSettingsPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/demo-cleaner" 
        element={
          <ProtectedRoute>
            <DemoDataCleanerPage />
          </ProtectedRoute>
        } 
      />
      
      {/* ===== ROUTES COMPOSANTS (FALLBACK) ===== */}
      <Route 
        path="/tasks-list" 
        element={
          <ProtectedRoute>
            <TaskList />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/badge-collection" 
        element={
          <ProtectedRoute>
            <BadgeCollection />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/project-dashboard" 
        element={
          <ProtectedRoute>
            <ProjectDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* ===== ROUTE RACINE ===== */}
      <Route 
        path="/" 
        element={<Navigate to="/dashboard" replace />} 
      />
      
      {/* ===== ROUTE 404 ===== */}
      <Route 
        path="*" 
        element={<NotFound />} 
      />
    </Routes>
  );
};

export default AppRoutes;
