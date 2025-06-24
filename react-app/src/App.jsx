// ==========================================
// 📁 react-app/src/App.jsx
// App principal avec routage CORRIGÉ - Plus de duplication
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

// Modules (SANS Layout imbriqué)
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

  // ✅ Initialiser Firebase Auth au démarrage
  useEffect(() => {
    const unsubscribe = initializeAuth();
    
    // Nettoyer l'abonnement au démontage
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [initializeAuth]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900 transition-colors duration-200">
        <Routes>
          {/* ✅ Route publique */}
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
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/tasks" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <TaskList />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/projects" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ProjectDashboard />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/projects/:projectId" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ProjectDetailView />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/gamification" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <GamificationDashboard />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/leaderboard" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Leaderboard />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/team" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <TeamDashboard />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Analytics />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Profile />
                </MainLayout>
              </ProtectedRoute>
            } 
          />

          {/* ✅ Redirections */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
