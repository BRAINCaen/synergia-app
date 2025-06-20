// src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './shared/stores/authStore.js';
import { useGameStore } from './shared/stores/gameStore.js';

// Layouts
import { MainLayout } from './layouts/MainLayout.jsx';

// Modules
import { LoginPage } from './modules/auth/LoginPage.jsx';
import { RegisterPage } from './modules/auth/RegisterPage.jsx';
import { Dashboard } from './modules/dashboard/Dashboard.jsx';
import { TaskList } from './modules/tasks/TaskList.jsx';
import { ProjectDashboard } from './modules/projects/ProjectDashboard.jsx';
import { GameProgressPage } from './modules/gamification/GameProgressPage.jsx';

// Route protégée
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

// Route publique (redirection si connecté)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }
  
  return user ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  const { initializeAuth } = useAuthStore();
  const { loadUserData } = useGameStore();
  const user = useAuthStore(state => state.user);

  // Initialiser l'authentification au montage
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Charger les données utilisateur quand connecté
  useEffect(() => {
    if (user?.uid) {
      loadUserData(user.uid);
    }
  }, [user?.uid, loadUserData]);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Routes publiques */}
          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          
          <Route path="/register" element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } />

          {/* Routes protégées avec layout */}
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            {/* Dashboard principal */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Nouvelles routes pour les tâches et projets */}
            <Route path="tasks" element={<TaskList />} />
            <Route path="projects" element={<ProjectDashboard />} />
            
            {/* Gamification */}
            <Route path="progress" element={<GameProgressPage />} />
            
            {/* Route par défaut */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
