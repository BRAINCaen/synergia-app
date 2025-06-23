import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { useTeamStore } from './stores/teamStore';

// Layout
import MainLayout from './components/MainLayout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import ProjectsPage from './pages/ProjectsPage';
import TeamPage from './pages/TeamPage';
import AnalyticsPage from './pages/AnalyticsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import AdminPage from './pages/AdminPage';
import SettingsPage from './pages/SettingsPage';

// Auth Guard Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white">Chargement de Synergia...</p>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

// Admin Guard Component
const AdminRoute = ({ children }) => {
  const { user } = useAuthStore();
  
  const isAdmin = user?.role === 'admin' || user?.permissions?.includes('admin');
  
  return isAdmin ? children : <Navigate to="/dashboard" replace />;
};

function App() {
  const { checkAuthState } = useAuthStore();
  const { cleanup: cleanupTeam } = useTeamStore();

  useEffect(() => {
    // Vérifier l'état d'authentification au démarrage
    checkAuthState();

    // Nettoyer les listeners au démontage
    return () => {
      cleanupTeam();
    };
  }, [checkAuthState, cleanupTeam]);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Route publique - Login */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Redirection racine vers dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Routes protégées avec layout */}
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            {/* Dashboard personnel */}
            <Route path="/dashboard" element={<DashboardPage />} />
            
            {/* Gestion des tâches personnelles */}
            <Route path="/tasks" element={<TasksPage />} />
            
            {/* Projets collaboratifs */}
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectsPage />} />
            
            {/* 🎉 NOUVEAU : Dashboard équipe collaboratif */}
            <Route path="/team" element={<TeamPage />} />
            
            {/* Analytics et métriques */}
            <Route path="/analytics" element={<AnalyticsPage />} />
            
            {/* Classement gamification */}
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            
            {/* Paramètres utilisateur */}
            <Route path="/settings" element={<SettingsPage />} />
            
            {/* Routes admin uniquement */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            } />
            
            {/* Route fallback - redirection vers dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
