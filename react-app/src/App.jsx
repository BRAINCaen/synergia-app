// ==========================================
// 📁 react-app/src/App.jsx
// App principal avec routage CORRIGÉ - Navigation complète
// ==========================================

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './shared/stores/authStore';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TeamPage from './pages/TeamPage';
import Analytics from './pages/Analytics';
import NotFound from './pages/NotFound';

// Modules
import ProjectDashboard from './modules/projects/ProjectDashboard';
import ProjectDetailView from './modules/projects/ProjectDetailView';
import TaskList from './modules/tasks/TaskList';
import Profile from './modules/profile/components/Profile';
import GamificationDashboard from './modules/gamification/GamificationDashboard';

// Composants de gamification
import Leaderboard from './components/gamification/Leaderboard';
import TeamDashboard from './components/TeamDashboard';

// ✅ Composant de protection des routes
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// ✅ Route publique (redirect si connecté)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white">Chargement...</p>
        </div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    console.log('🚀 Initialisation de Synergia App...');
    initializeAuth();
  }, [initializeAuth]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900">
        <Routes>
          {/* ✅ Route publique - Login */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />

          {/* ✅ Routes protégées avec MainLayout */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard par défaut */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            {/* ✅ Pages principales */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="team" element={<TeamPage />} />
            <Route path="analytics" element={<Analytics />} />
            
            {/* ✅ Modules Projets */}
            <Route path="projects" element={<ProjectDashboard />} />
            <Route path="projects/:id" element={<ProjectDetailView />} />
            
            {/* ✅ Modules Tâches */}
            <Route path="tasks" element={<TaskList />} />
            
            {/* ✅ Gamification */}
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="gamification" element={<GamificationDashboard />} />
            
            {/* ✅ Profil */}
            <Route path="profile" element={<Profile />} />
            
            {/* ✅ Team Dashboard */}
            <Route path="team-dashboard" element={<TeamDashboard />} />
          </Route>

          {/* ✅ Route 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
